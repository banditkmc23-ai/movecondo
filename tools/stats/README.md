# MoveCondo visitor stats

Counts **people** today; ready to count **AI assistants and bots** once the site has its own domain.

| Piece | Where | Status |
|---|---|---|
| Tracker (people) | `assets/stats.js`, loaded on every public page | live |
| Database | Supabase project `movecondo-stats` (ref `cypxbfueevkaytqqeynd`, Singapore `ap-southeast-1`, Free plan) | live |
| Owner dashboard | `/movecondo/admin/` (noindex, not linked, not in sitemap/llms files) | live |
| Edge counter (AI/bots) | `tools/stats/cloudflare-worker.js` | **not deployed** – needs custom domain on Cloudflare |

## Privacy (PDPA)
The tracker sends only: page path, TH/EN, the referring site's hostname (first page only), mobile/desktop,
and a random id that changes every day (localStorage `mc-vid`). No cookies, no IP, no names, no fingerprinting.
It skips `navigator.webdriver`, bot-like user agents, and any browser where the dashboard set `mc-nostats=1`.

## Security model
* `public.visits` has RLS. `anon` may only INSERT selected columns, and only rows with
  `visitor_kind='human'`, `source='js'`, `agent_name is null`. `anon` cannot SELECT/UPDATE/DELETE.
* Reading is limited to signed-in users whose email is in `private.stats_admins`
  (checked by `private.is_stats_admin()`); the dashboard calls RPC `public.stats_summary(days)`
  which returns aggregates only.
* Only the publishable key is in the repo. The service-role key is never committed.

## Add the owner (one line, Supabase SQL editor or MCP `execute_sql`)
```sql
insert into private.stats_admins(email) values ('owner@example.com');
```
Then give the owner a login: either create the user in Supabase dashboard → Authentication → Users →
"Add user" (email + password, auto-confirm), or let us create it. Remove access:
`delete from private.stats_admins where email = '...';`

## Turning on AI / bot counting later
1. Move the site to a custom domain whose DNS is on Cloudflare (proxied, orange cloud).
2. `cp wrangler.toml.example wrangler.toml`, set the route to the real domain.
3. `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY` (from Supabase → Project Settings → API keys).
4. `npx wrangler deploy`.
5. Update `SITE` in `admin/index.html` and the paths if the site no longer lives under `/movecondo/`.

The worker logs only non-human user agents (GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot,
ClaudeBot, Google-Extended, Googlebot, Bingbot, …) as `source='edge'`, so people are never double-counted.
The dashboard's "AI ที่เข้าเว็บ" card switches on automatically when the first edge row appears.

## Free-plan limits (Supabase)
500 MB database (≈ several million visit rows), 5 GB uncached egress / month, 50,000 auth users.
Free projects pause after ~7 days with too little database activity; normal site traffic keeps it awake.
A paused project can be resumed from the Supabase dashboard within 90 days (data kept).

Schema: `tools/stats/schema.sql`.
