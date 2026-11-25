/**
 * alsaer QCF proxy worker
 *
 * Deploys on Cloudflare Workers. Holds the Quran Foundation client credentials
 * as Worker secrets (QCF_CLIENT_ID, QCF_CLIENT_SECRET), exchanges them for an
 * OAuth2 access token (Client Credentials grant), and proxies Content API v4
 * requests so the Android app never sees the secret.
 *
 * Token flow (per api-docs.quran.foundation):
 *   POST https://oauth2.quran.foundation/oauth2/token
 *   headers: x-auth-token: <client_secret>, x-client-id: <client_id>
 *   body:    grant_type=client_credentials&scope=content
 *   -> { access_token, token_type, expires_in, scope }
 * The client_secret is one-time (shown at app creation); rotating it requires
 * a new app/secret in the QCF console. It never leaves this worker.
 *
 * IMPORTANT: the prelive/sandbox Content API only serves surahs 1-2. Real
 * Mushaf sync needs the "Alsaer" QCF app approved for production Content
 * scopes; until then this worker must point at the PRELIVE hosts below and
 * the app will only be able to test with surahs 1-2.
 */

// Deployed via Cloudflare Workers Builds from this repo (branch exp/drive-account-recovery).
const PRELIVE = {
  oauth: 'https://prelive-oauth2.quran.foundation/oauth2/token',
  api:   'https://apis-prelive.quran.foundation/content/api/v4',
};
const PROD = {
  oauth: 'https://oauth2.quran.foundation/oauth2/token',
  api:   'https://apis.quran.foundation/content/api/v4',
};

// In-memory token cache (per worker isolate; safe, tokens are short-lived).
let cachedToken = null; // { value, expiresAt }

async function getToken(env, hosts) {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) return cachedToken.value;

  const res = await fetch(hosts.oauth, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-auth-token': env.QCF_CLIENT_SECRET,
      'x-client-id': env.QCF_CLIENT_ID,
    },
    body: 'grant_type=client_credentials&scope=content',
  });
  if (!res.ok) {
    throw new Error(`QCF token request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: now + (data.expires_in || 3600) * 1000,
  };
  return cachedToken.value;
}

function cors(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extra,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors() });
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, service: 'alsaer-qcf-proxy' }), {
        headers: cors({ 'Content-Type': 'application/json' }),
      });
    }

    // Everything else is a passthrough to the Content API v4.
    // Example from the app: GET /v4/quran/verses/uthmani?chapter_number=2
    if (!url.pathname.startsWith('/v4/')) {
      return new Response(JSON.stringify({ error: 'not_found' }), {
        status: 404, headers: cors({ 'Content-Type': 'application/json' }),
      });
    }

    // Flip to PROD once the QCF app has approved production Content scopes.
    const hosts = (env.QCF_ENV === 'production') ? PROD : PRELIVE;

    if (!env.QCF_CLIENT_ID || !env.QCF_CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: 'worker_not_configured' }), {
        status: 500, headers: cors({ 'Content-Type': 'application/json' }),
      });
    }

    // Cache GET responses at the edge for 24h; Mushaf data is static.
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let cached = await cache.match(cacheKey);
    if (cached) return cached;

    let token;
    try {
      token = await getToken(env, hosts);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'auth_failed', detail: String(e) }), {
        status: 502, headers: cors({ 'Content-Type': 'application/json' }),
      });
    }

    const upstream = hosts.api + url.pathname.slice(3) + url.search;
    const res = await fetch(upstream, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-client-id': env.QCF_CLIENT_ID,
        'Accept': 'application/json',
      },
    });

    const body = await res.text();
    const out = new Response(body, {
      status: res.status,
      headers: cors({
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
        'Cache-Control': res.ok ? 'public, max-age=86400' : 'no-store',
      }),
    });
    if (res.ok) await cache.put(cacheKey, out.clone());
    return out;
  },
};
