-- MoveCondo stats v2 (migrations visit_stats_v2_events + visit_stats_v2_fix_room_views).
-- Engagement time, search words, matcher choices, LINE clicks, photo swipes.
alter table public.visits add column pv_id text check (pv_id ~ '^[A-Za-z0-9]{6,24}$'),
  add column session_id text check (session_id ~ '^[A-Za-z0-9]{6,24}$');
grant insert (pv_id, session_id) on public.visits to anon, authenticated;

create table public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  day date not null default ((now() at time zone 'Asia/Bangkok')::date),
  name text not null check (name in ('engage','search','match','line_click','photo_swipe')),
  path text not null check (char_length(path) between 1 and 200),
  visitor_hash text check (visitor_hash ~ '^[A-Za-z0-9_-]{8,40}$'),
  session_id text check (session_id ~ '^[A-Za-z0-9]{6,24}$'),
  pv_id text check (pv_id ~ '^[A-Za-z0-9]{6,24}$'),
  props jsonb not null default '{}'::jsonb check (jsonb_typeof(props) = 'object' and char_length(props::text) <= 500),
  source text not null default 'js' check (source in ('js','edge'))
);
create index events_day_name_idx on public.events (day, name);
alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
grant insert (name, path, visitor_hash, session_id, pv_id, props) on public.events to anon, authenticated;

-- Strict per-event checks. No '@' anywhere, no digit runs of 8+, search words: lowercase,
-- trimmed, <= 60 chars, no digit runs of 6+ (phone numbers).
create or replace function private.event_props_ok(n text, p jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select p::text !~ '@' and p::text !~ '[0-9]{8,}' and case n
    when 'engage' then jsonb_typeof(p->'ms') = 'number' and (p->>'ms')::numeric between 0 and 1800000
      and (select count(*) from jsonb_object_keys(p)) = 1
    when 'search' then jsonb_typeof(p->'q') = 'string' and char_length(p->>'q') between 1 and 60
      and (p->>'q') !~ '[0-9]{6,}' and (p->>'q') = lower(btrim(p->>'q'))
      and (p->'n' is null or (jsonb_typeof(p->'n') = 'number' and (p->>'n')::numeric between 0 and 999))
      and (p->'via' is null or p->>'via' in ('submit','area','all','suggest'))
    when 'match' then (p->'areas' is null or jsonb_typeof(p->'areas') = 'array')
      and (p->'must' is null or jsonb_typeof(p->'must') = 'array')
      and (p->'bmin' is null or (jsonb_typeof(p->'bmin') = 'number' and (p->>'bmin')::numeric between 0 and 1000000))
      and (p->'bmax' is null or (jsonb_typeof(p->'bmax') = 'number' and (p->>'bmax')::numeric between 0 and 1000000))
    when 'line_click' then (p->'room' is null or (p->>'room') ~ '^MC-[0-9]{3}$')
      and (p->'place' is null or char_length(p->>'place') <= 30)
    when 'photo_swipe' then (p->>'room') ~ '^MC-[0-9]{3}$'
      and jsonb_typeof(p->'n') = 'number' and (p->>'n')::numeric between 1 and 200
    else false end;
$$;
grant usage on schema private to anon;
revoke all on function private.event_props_ok(text, jsonb) from public;
grant execute on function private.event_props_ok(text, jsonb) to anon, authenticated;

create policy "anon js events insert only" on public.events
  for insert to anon, authenticated
  with check (source = 'js' and path like '/%' and private.event_props_ok(name, props));

grant select on public.events to authenticated;
create policy "stats admins can read events" on public.events
  for select to authenticated using ((select private.is_stats_admin()));

CREATE OR REPLACE FUNCTION public.stats_insights(days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
declare
  d int := least(greatest(coalesce(days, 30), 1), 365);
  today date := (now() at time zone 'Asia/Bangkok')::date;
  since date := today - (d - 1);
  result jsonb;
begin
  if not private.is_stats_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  with v as (
    select * from public.visits where day >= since and visitor_kind = 'human' and source = 'js'
  ), e as (
    select * from public.events where day >= since and source = 'js'
  ), eng as (
    select pv_id, session_id, path, sum((props->>'ms')::numeric) ms from e where name = 'engage' and pv_id is not null group by 1, 2, 3
  ), sess as (
    select s.sid, coalesce(sum(eng.ms), 0) ms, max(s.pages) pages from (
      select coalesce(session_id, visitor_hash || day::text) sid, count(*) pages from v group by 1
    ) s left join eng on eng.session_id = s.sid group by s.sid
  ), srch as (
    select props->>'q' q, (props->>'n')::int n, visitor_hash, day from e where name = 'search'
  ), m as (
    select props from e where name = 'match'
  )
  select jsonb_build_object(
    'sessions', (select count(*) from sess),
    'avg_session_ms', (select coalesce(round(avg(ms)), 0) from sess),
    'median_session_ms', (select coalesce(percentile_cont(0.5) within group (order by ms), 0) from sess),
    'avg_pages_per_session', (select coalesce(round(avg(pages)::numeric, 2), 0) from sess),
    'avg_page_ms', (select coalesce(round(avg(ms)), 0) from eng),
    'session_buckets', jsonb_build_object(
      'lt10', (select count(*) from sess where ms < 10000),
      's10_30', (select count(*) from sess where ms >= 10000 and ms < 30000),
      's30_120', (select count(*) from sess where ms >= 30000 and ms < 120000),
      'm2_5', (select count(*) from sess where ms >= 120000 and ms < 300000),
      'gt5m', (select count(*) from sess where ms >= 300000)),
    'page_time', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'avg_ms', a, 'views', c) order by c desc)
       from (select path, round(avg(ms)) a, count(*) c from eng group by path order by count(*) desc limit 20) t), '[]'::jsonb),
    'room_views', coalesce((select jsonb_agg(jsonb_build_object('room', r.room, 'visitors', r.vis, 'views', r.vw,
         'avg_ms', (select round(avg(eng.ms)) from eng where upper(substring(eng.path from '/rooms/(mc-[0-9]{3})')) = r.room)) order by r.vis desc, r.vw desc)
       from (select upper(substring(path from '/rooms/(mc-[0-9]{3})')) room, count(distinct (day, visitor_hash)) vis, count(*) vw
             from v where path ~ '/rooms/mc-[0-9]{3}' group by 1) r), '[]'::jsonb),
    'area_page_views', coalesce((select jsonb_agg(jsonb_build_object('slug', slug, 'visitors', vis, 'views', vw) order by vis desc)
       from (select substring(path from '/areas/([a-z0-9-]+)') slug, count(distinct (day, visitor_hash)) vis, count(*) vw
             from v where path ~ '/areas/[a-z0-9-]+' group by 1) t), '[]'::jsonb),
    'searches_total', (select count(*) from srch),
    'search_terms', coalesce((select jsonb_agg(jsonb_build_object('q', q, 'count', c, 'people', p, 'results', r) order by c desc)
       from (select q, count(*) c, count(distinct (day, visitor_hash)) p, max(n) r from srch group by q order by count(*) desc limit 25) t), '[]'::jsonb),
    'search_no_results', coalesce((select jsonb_agg(jsonb_build_object('q', q, 'count', c) order by c desc)
       from (select q, count(*) c from srch where n = 0 group by q order by count(*) desc limit 20) t), '[]'::jsonb),
    'match_total', (select count(*) from m),
    'match_areas', coalesce((select jsonb_object_agg(a, c) from (select a, count(*) c from m, jsonb_array_elements_text(coalesce(m.props->'areas','[]')) a group by a) t), '{}'::jsonb),
    'match_types', coalesce((select jsonb_object_agg(t, c) from (select coalesce(props->>'type','any') t, count(*) c from m group by 1) x), '{}'::jsonb),
    'match_must', coalesce((select jsonb_object_agg(a, c) from (select a, count(*) c from m, jsonb_array_elements_text(coalesce(m.props->'must','[]')) a group by a) t), '{}'::jsonb),
    'match_budgets', coalesce((select jsonb_agg(jsonb_build_object('min', bmin, 'max', bmax, 'count', c) order by c desc)
       from (select (props->>'bmin')::int bmin, (props->>'bmax')::int bmax, count(*) c from m where props ? 'bmax' group by 1, 2 order by 3 desc limit 15) t), '[]'::jsonb),
    'line_total', (select count(*) from e where name = 'line_click'),
    'line_people', (select count(distinct (day, visitor_hash)) from e where name = 'line_click'),
    'line_by', coalesce((select jsonb_agg(jsonb_build_object('room', room, 'path', path, 'place', place, 'count', c) order by c desc)
       from (select props->>'room' room, path, props->>'place' place, count(*) c from e where name = 'line_click' group by 1, 2, 3 order by 4 desc limit 25) t), '[]'::jsonb),
    'swipes', coalesce((select jsonb_agg(jsonb_build_object('room', room, 'swipes', s, 'people', p) order by s desc)
       from (select props->>'room' room, sum((props->>'n')::int) s, count(distinct (day, visitor_hash)) p from e where name = 'photo_swipe' group by 1 order by 2 desc limit 25) t), '[]'::jsonb),
    'people', (select count(distinct (day, visitor_hash)) from v)
  ) into result;
  return result;
end;
$function$
;
revoke all on function public.stats_insights(int) from public, anon;
grant execute on function public.stats_insights(int) to authenticated;
