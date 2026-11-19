/**
 * Minimal fake of the Supabase Auth + REST API for end-to-end tests without a live project.
 * Valid email-link token_hash: "good"; starting password: "eskiSifre1". GET /__log lists auth calls,
 * GET /__ttl?s=30 makes new tokens expire after 30 s (forces refreshes).
 *
 * Run:  node tests/e2e/mock-supabase.cjs   (listens on MOCK_PORT, default 54321)
 */
const http = require('http');
const log = [];
const USER = { id: '11111111-2222-3333-4444-555555555555', aud: 'authenticated', role: 'authenticated', email: 'uye@ornek.test', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, identities: [{ provider: 'email', id: 'x', user_id: '1' }], created_at: '2026-01-01T00:00:00Z' };
let password = 'eskiSifre1';
let ttl = 3600;
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = () => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER.id, email: USER.email, role: 'authenticated', aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + ttl, session_id: 's1' })}.sig`;
const session = () => ({ access_token: jwt(), token_type: 'bearer', expires_in: ttl, expires_at: Math.floor(Date.now() / 1000) + ttl, refresh_token: 'r1', user: USER });
const send = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }); res.end(body === undefined ? '' : JSON.stringify(body)); };
http.createServer((req, res) => {
  let raw = ''; req.on('data', (c) => (raw += c)); req.on('end', () => {
    const url = new URL(req.url, 'http://x'); let body = {}; try { body = raw ? JSON.parse(raw) : {}; } catch {}
    if (req.method === 'OPTIONS') return send(res, 204);
    const entry = `${req.method} ${url.pathname}${url.search}`; if (url.pathname.startsWith('/auth')) log.push({ entry, body });
    if (url.pathname === '/__log') return send(res, 200, log);
    if (url.pathname === '/__ttl') { ttl = Number(url.searchParams.get('s')) || 3600; return send(res, 200, { ttl }); }
    if (url.pathname === '/auth/v1/verify' && req.method === 'POST') return body.token_hash === 'good' ? send(res, 200, session()) : send(res, 403, { code: 403, error_code: 'otp_expired', msg: 'Email link is invalid or has expired' });
    if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'password') return body.password === password ? send(res, 200, session()) : send(res, 400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
    if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'refresh_token') return send(res, 200, session());
    if (url.pathname === '/auth/v1/user' && req.method === 'GET') return send(res, 200, USER);
    if (url.pathname === '/auth/v1/user' && req.method === 'PUT') { if (body.password) password = body.password; return send(res, 200, USER); }
    if (url.pathname === '/auth/v1/logout') return send(res, 204);
    if (url.pathname === '/auth/v1/recover') return send(res, 200, {});
    if (url.pathname === '/auth/v1/signup') return send(res, 200, { ...USER, identities: [] });
    if (url.pathname.startsWith('/rest/v1/profiles')) { const one = (req.headers.accept || '').includes('vnd.pgrst.object'); const p = { id: USER.id, username: 'uye', full_name: 'Örnek Üye', role: 'user', avatar_url: '', bio: '' }; return send(res, 200, one ? p : [p]); }
    if (url.pathname.startsWith('/rest/v1/')) { const one = (req.headers.accept || '').includes('vnd.pgrst.object'); return one ? send(res, 406, { code: 'PGRST116', message: 'no rows' }) : send(res, 200, []); }
    if (url.pathname.startsWith('/realtime')) return send(res, 404, {});
    send(res, 404, { msg: 'not mocked ' + entry });
  });
}).listen(Number(process.env.MOCK_PORT || 54321), () => console.log('mock supabase on', process.env.MOCK_PORT || 54321));
