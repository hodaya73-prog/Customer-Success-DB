import { defineConfig, loadEnv } from 'vite';

// Server-side proxy to Airtable.
//
// AIRTABLE_TOKEN / AIRTABLE_BASE_ID / AIRTABLE_TABLE are read from .env here, in Node, and are NEVER sent to the browser.
// (Vite only exposes variables that start with VITE_ to the browser bundle. Do not rename these with a VITE_ prefix:
// anything with that prefix is copied into the public JavaScript file for everyone to read.)
//
// The page calls /api/customers on its own origin. This middleware checks the request, adds the token and forwards it
// to Airtable. It runs under `npm run dev` and `npm run preview`.
function airtableProxy(env) {
  const token = env.AIRTABLE_TOKEN;
  const baseId = env.AIRTABLE_BASE_ID;
  const table = env.AIRTABLE_TABLE || 'Customers';
  const apiUrl = env.AIRTABLE_API_URL || 'https://api.airtable.com';   // overridable for tests
  const configured = Boolean(token && baseId);

  const send = (res, status, body) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
  };
  const readBody = (req) => new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 1_000_000) { reject(new Error('Request too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

  async function handler(req, res, next) {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/api/status') return send(res, 200, { configured });

    // Only the customers table, and only the operations the dashboard needs.
    const m = /^\/api\/customers(?:\/(rec[A-Za-z0-9]{14}))?$/.exec(url.pathname);
    if (!m) return next();
    if (!configured) return send(res, 503, { error: { message: 'Airtable is not configured on the server (.env)' } });

    const recordId = m[1];
    const allowed = recordId ? ['DELETE'] : ['GET', 'POST', 'PATCH'];
    if (!allowed.includes(req.method)) return send(res, 405, { error: { message: 'Method not allowed' } });

    let query = '';
    if (req.method === 'GET') {
      const q = new URLSearchParams();
      for (const key of ['pageSize', 'offset']) if (url.searchParams.has(key)) q.set(key, url.searchParams.get(key));
      query = q.toString() ? `?${q}` : '';
    }

    try {
      const body = (req.method === 'POST' || req.method === 'PATCH') ? await readBody(req) : undefined;
      const upstream = await fetch(
        `${apiUrl}/v0/${baseId}/${encodeURIComponent(table)}${recordId ? `/${recordId}` : ''}${query}`,
        { method: req.method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body }
      );
      const text = await upstream.text();
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(text);
    } catch (e) {
      send(res, 502, { error: { message: 'Could not reach Airtable' } });
    }
  }

  return {
    name: 'airtable-proxy',
    configureServer(server) { server.middlewares.use(handler); },
    configurePreviewServer(server) { server.middlewares.use(handler); },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');   // '' = read every variable, for use in this file only
  return {
    base: './',                                   // relative paths, so the build also works under /Customer-Success-DB/ on GitHub Pages
    plugins: [airtableProxy(env)],
  };
});
