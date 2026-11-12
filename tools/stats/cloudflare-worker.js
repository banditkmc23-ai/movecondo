/**
 * MoveCondo edge counter — NOT DEPLOYED YET.
 * Deploy only after the site moves to its own domain behind Cloudflare.
 *
 * What it does: passes every request through to the site unchanged, and in the
 * background logs visits from AI assistants, AI crawlers, search bots and other
 * bots into Supabase table public.visits (source = 'edge'). People are NOT
 * logged here — assets/stats.js already counts them — so nothing is counted twice.
 * Nothing personal is stored: no IP, no full user-agent, no cookies.
 *
 * Secrets (set with `wrangler secret put`, never in the repo):
 *   SUPABASE_URL               https://cypxbfueevkaytqqeynd.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  Supabase dashboard → Project Settings → API keys (secret / service_role)
 * Optional var:
 *   ORIGIN  where the site really lives, e.g. https://banditkmc23-ai.github.io
 *           (leave empty if Cloudflare already proxies the custom domain to GitHub Pages)
 */

// Order matters: first match wins. [regex, agent_name, visitor_kind]
const AGENTS = [
  // AI assistants fetching a page because a person asked them right now
  [/ChatGPT-User/i, "ChatGPT-User", "ai_bot"],
  [/OAI-SearchBot/i, "OAI-SearchBot", "ai_bot"],
  [/GPTBot/i, "GPTBot", "ai_bot"],
  [/Perplexity-User/i, "Perplexity-User", "ai_bot"],
  [/PerplexityBot/i, "PerplexityBot", "ai_bot"],
  [/Claude-User/i, "Claude-User", "ai_bot"],
  [/Claude-SearchBot/i, "Claude-SearchBot", "ai_bot"],
  [/ClaudeBot|anthropic-ai/i, "ClaudeBot", "ai_bot"],
  [/Google-Extended/i, "Google-Extended", "ai_bot"],
  [/Gemini|Google-CloudVertexBot/i, "Gemini", "ai_bot"],
  [/meta-externalagent|meta-externalfetcher/i, "Meta AI", "ai_bot"],
  [/Applebot-Extended/i, "Applebot-Extended", "ai_bot"],
  [/MistralAI-User/i, "MistralAI-User", "ai_bot"],
  [/DeepSeek/i, "DeepSeek", "ai_bot"],
  [/Bytespider/i, "Bytespider", "ai_bot"],
  [/CCBot/i, "CCBot", "ai_bot"],
  [/cohere-ai/i, "Cohere", "ai_bot"],
  [/YouBot/i, "YouBot", "ai_bot"],
  [/DuckAssistBot/i, "DuckAssistBot", "ai_bot"],
  [/Amazonbot/i, "Amazonbot", "ai_bot"],
  // classic search engines
  [/Googlebot|Google-InspectionTool|GoogleOther/i, "Googlebot", "search_bot"],
  [/bingbot|BingPreview/i, "Bingbot", "search_bot"],
  [/Applebot/i, "Applebot", "search_bot"],
  [/DuckDuckBot/i, "DuckDuckBot", "search_bot"],
  [/YandexBot/i, "YandexBot", "search_bot"],
  [/Baiduspider/i, "Baiduspider", "search_bot"],
  [/Naver|Yeti\//i, "Naver", "search_bot"],
  // link previews and everything else that admits to being a bot
  [/facebookexternalhit|Facebot/i, "Facebook preview", "other_bot"],
  [/Line\/|LineBot/i, "LINE preview", "other_bot"],
  [/Twitterbot/i, "X preview", "other_bot"],
  [/Slackbot|Discordbot|TelegramBot|WhatsApp/i, "Chat preview", "other_bot"],
  [/bot|crawl|spider|slurp|fetch|python-requests|curl|wget|Go-http-client|HeadlessChrome/i, "Other bot", "other_bot"],
];

export function classify(ua) {
  if (!ua) return { kind: "other_bot", name: "No user-agent" };
  for (const [re, name, kind] of AGENTS) if (re.test(ua)) return { kind, name };
  return null; // looks like a person → counted by assets/stats.js instead
}

// Only pages and the files AI agents read; skip images, CSS, JS, fonts.
function worthLogging(url) {
  const p = url.pathname;
  return p.endsWith("/") || /\.(html|txt|json|xml)$/.test(p);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let upstream = request;
    if (env.ORIGIN) upstream = new Request(env.ORIGIN + url.pathname + url.search, request);
    const response = await fetch(upstream);

    try {
      const ua = request.headers.get("user-agent") || "";
      const hit = request.method === "GET" && worthLogging(url) ? classify(ua) : null;
      if (hit && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
        const ref = request.headers.get("referer");
        let refHost = null;
        try { refHost = ref ? new URL(ref).hostname.slice(0, 120) : null; } catch (_) {}
        const row = {
          path: url.pathname.slice(0, 200),
          lang: url.searchParams.get("lang") === "en" ? "en" : "th",
          referrer_host: refHost,
          device: null,
          visitor_kind: hit.kind,
          agent_name: hit.name.slice(0, 60),
          visitor_hash: null,
          source: "edge",
        };
        ctx.waitUntil(fetch(env.SUPABASE_URL + "/rest/v1/visits", {
          method: "POST",
          headers: {
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(row),
        }).catch(() => {}));
      }
    } catch (_) { /* never break the site because of stats */ }

    return response;
  },
};
