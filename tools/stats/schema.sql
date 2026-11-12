-- MoveCondo visitor stats schema (Supabase project movecondo-stats, applied as migration visit_stats_v1).
-- Apply once on a fresh project. Owner allowlist: insert into private.stats_admins(email) values ('owner@example.com');
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.visits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  day date not null default ((now() at time zone 'Asia/Bangkok')::date),
  path text not null check (char_length(path) between 1 and 200),
  lang text check (lang in ('th','en')),
  referrer_host text check (char_length(referrer_host) <= 120),
  device text check (device in ('mobile','desktop')),
  visitor_kind text not null default 'human' check (visitor_kind in ('human','ai_bot','search_bot','other_bot')),
  agent_name text check (char_length(agent_name) <= 60),
  visitor_hash text check (char_length(visitor_hash) <= 40),
  source text not null default 'js' check (source in ('js','edge'))
);
create index visits_day_idx on public.visits (day);
create index visits_kind_day_idx on public.visits (visitor_kind, day);

alter table public.visits enable row level security;
revoke all on public.visits from anon, authenticated;
grant insert (path, lang, referrer_host, device, visitor_kind, visitor_hash, source) on public.visits to anon, authenticated;

create policy "anon js human inserts only" on public.visits
  for insert to anon, authenticated
  with check (
    visitor_kind = 'human' and source = 'js' and agent_name is null
    and path like '/%'
    and (visitor_hash is null or visitor_hash ~ '^[A-Za-z0-9_-]{8,40}$')
    and created_at > now() - interval '1 minute'
  );

create table private.stats_admins (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);

CREATE OR REPLACE FUNCTION private.is_stats_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from private.stats_admins a
    where a.email = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
  and coalesce(((select auth.jwt()) ->> 'role'), '') = 'authenticated';
$function$;
revoke all on function private.is_stats_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_stats_admin() to authenticated;

grant select on public.visits to authenticated;
create policy "stats admins can read" on public.visits
  for select to authenticated
  using ((select private.is_stats_admin()));

CREATE OR REPLACE FUNCTION public.stats_summary(days integer DEFAULT 30)
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

  with h as (
    select * from public.visits
    where day >= since and visitor_kind = 'human' and source = 'js'
  ), b as (
    select * from public.visits
    where day >= since and visitor_kind <> 'human'
  )
  select jsonb_build_object(
    'today', today,
    'since', since,
    'days', d,
    'today_visitors', (select count(distinct visitor_hash) from h where day = today),
    'today_pageviews', (select count(*) from h where day = today),
    'total_visitors', (select count(distinct (day, visitor_hash)) from h),
    'total_pageviews', (select count(*) from h),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', g.day, 'visitors', coalesce(x.v,0), 'pageviews', coalesce(x.p,0)) order by g.day)
      from (select generate_series(since, today, interval '1 day')::date as day) g
      left join (select day, count(distinct visitor_hash) v, count(*) p from h group by day) x on x.day = g.day
    ), '[]'::jsonb),
    'top_pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'pageviews', p, 'visitors', v) order by p desc)
      from (select path, count(*) p, count(distinct (day, visitor_hash)) v from h group by path order by count(*) desc limit 25) t
    ), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('host', host, 'visitors', v) order by v desc)
      from (select coalesce(referrer_host, '') host, count(distinct (day, visitor_hash)) v from h group by 1 order by 2 desc limit 15) t
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_object_agg(coalesce(device,'unknown'), v)
      from (select device, count(distinct (day, visitor_hash)) v from h group by device) t
    ), '{}'::jsonb),
    'langs', coalesce((
      select jsonb_object_agg(coalesce(lang,'unknown'), v)
      from (select lang, count(distinct (day, visitor_hash)) v from h group by lang) t
    ), '{}'::jsonb),
    'bots_by_kind', coalesce((
      select jsonb_object_agg(visitor_kind, n)
      from (select visitor_kind, count(*) n from b group by visitor_kind) t
    ), '{}'::jsonb),
    'bots_by_agent', coalesce((
      select jsonb_agg(jsonb_build_object('agent', agent_name, 'kind', visitor_kind, 'hits', n, 'today', nt) order by n desc)
      from (select coalesce(agent_name,'unknown') agent_name, visitor_kind, count(*) n, count(*) filter (where day = today) nt
            from b group by 1, 2 order by 3 desc limit 30) t
    ), '[]'::jsonb),
    'bots_daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', day, 'ai', ai, 'search', se, 'other', ot) order by day)
      from (select day, count(*) filter (where visitor_kind='ai_bot') ai, count(*) filter (where visitor_kind='search_bot') se,
                   count(*) filter (where visitor_kind='other_bot') ot from b group by day) t
    ), '[]'::jsonb),
    'edge_enabled', exists (select 1 from public.visits where source = 'edge')
  ) into result;
  return result;
end;
$function$;
revoke all on function public.stats_summary(int) from public, anon;
grant execute on function public.stats_summary(int) to authenticated;
