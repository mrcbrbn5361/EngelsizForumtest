/**
 * Minimal fake of the Supabase Auth + REST API for end-to-end tests without a live project.
 * Valid email-link token_hash: "good"; starting password: "eskiSifre1". GET /__log lists auth calls,
 * GET /__ttl?s=30 makes new tokens expire after 30 s (forces refreshes); GET /__autoconfirm?on=1 makes
 * sign-up return a session (email confirmation disabled). dogrulanmamis@ornek.test is an unconfirmed account.
 * GET /__reset restores the initial state; every e2e suite calls it first.
 * One sample topic (id aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee) written by a second user 'yazar'
 * (22222222-3333-4444-5555-666666666666); GET /__other?set={json} changes that user's row.
 * Storage: 'avatars' bucket upload/list/delete/public read; GET /__storage and /__profile for inspection.
 *
 * Run:  node tests/e2e/mock-supabase.cjs   (listens on MOCK_PORT, default 54321)
 */
const http = require('http');
const log = [];
const USER = { id: '11111111-2222-3333-4444-555555555555', aud: 'authenticated', role: 'authenticated', email: 'uye@ornek.test', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, identities: [{ provider: 'email', id: 'x', user_id: '1' }], created_at: '2026-01-01T00:00:00Z' };
let password = 'eskiSifre1';
let ttl = 3600;
let autoConfirm = false;
const storage = new Map();
let profileRow = null;
const OTHER_ID = '22222222-3333-4444-5555-666666666666';
const freshOther = () => ({ id: OTHER_ID, username: 'yazar', full_name: 'Konu Yazarı', role: 'user', avatar_url: null, bio: 'Yazarın biyografisi', notification_prefs: {}, privacy_prefs: {} });
let otherRow = freshOther();
const TOPIC = { id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', slug: 'test-konusu', title: 'Engelli raporu yenileme', content: 'Raporumu nasıl yenilerim?', created_at: '2026-11-01T10:00:00Z', updated_at: '2026-11-01T10:00:00Z', author_id: OTHER_ID, category_id: null, is_pinned: false, is_locked: false, is_solved: false, views_count: 3, likes_count: 0, category: { id: 'c1', name: 'Genel', slug: 'genel' }, author: { id: OTHER_ID, username: 'yazar', full_name: 'Konu Yazarı', avatar_url: null, role: 'user', level: 1, xp: 10 } };
const freshProfile = () => ({ id: USER.id, username: 'uye', full_name: 'Örnek Üye', role: 'user', avatar_url: null, bio: '' });
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = () => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER.id, email: USER.email, role: 'authenticated', aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + ttl, session_id: 's1' })}.sig`;
const session = () => ({ access_token: jwt(), token_type: 'bearer', expires_in: ttl, expires_at: Math.floor(Date.now() / 1000) + ttl, refresh_token: 'r1', user: USER });
const fileFromUpload = (req, buf) => {
  const m = /boundary=(.+)$/.exec(req.headers['content-type'] || '');
  if (!m) return { type: req.headers['content-type'], bytes: buf };
  const sep = Buffer.from('--' + m[1]);
  let start = buf.indexOf(sep);
  while (start !== -1) {
    const next = buf.indexOf(sep, start + sep.length);
    if (next === -1) break;
    const part = buf.subarray(start + sep.length + 2, next - 2);
    const headEnd = part.indexOf('\r\n\r\n');
    const head = part.subarray(0, headEnd).toString();
    if (/filename=/.test(head)) return { type: (/content-type:\s*([^\r\n]+)/i.exec(head) || [])[1], bytes: Buffer.from(part.subarray(headEnd + 4)) };
    start = next;
  }
  return { type: 'application/octet-stream', bytes: buf };
};
const send = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }); res.end(body === undefined ? '' : JSON.stringify(body)); };
http.createServer((req, res) => {
  const chunks = []; req.on('data', (c) => chunks.push(c)); req.on('end', () => {
    const buf = Buffer.concat(chunks); const raw = buf.toString('utf8');
    const url = new URL(req.url, 'http://x'); let body = {}; try { body = raw ? JSON.parse(raw) : {}; } catch {}
    if (req.method === 'OPTIONS') return send(res, 204);
    const entry = `${req.method} ${url.pathname}${url.search}`; if (url.pathname.startsWith('/auth') || url.pathname.startsWith('/storage') || (url.pathname.startsWith('/rest/v1/profiles') && req.method !== 'GET')) log.push({ entry, body: url.pathname.startsWith('/storage/v1/object/avatars') && req.method === 'POST' ? { bytes: buf.length } : body });
    if (url.pathname === '/__log') return send(res, 200, log);
    if (url.pathname === '/__reset') { password = 'eskiSifre1'; ttl = 3600; autoConfirm = false; log.length = 0; storage.clear(); profileRow = freshProfile(); otherRow = freshOther(); return send(res, 200, { reset: true }); }
    if (url.pathname === '/__autoconfirm') { autoConfirm = url.searchParams.get('on') === '1'; return send(res, 200, { autoConfirm }); }
    if (url.pathname === '/__ttl') { ttl = Number(url.searchParams.get('s')) || 3600; return send(res, 200, { ttl }); }
    if (url.pathname === '/auth/v1/verify' && req.method === 'POST') return body.token_hash === 'good' ? send(res, 200, session()) : send(res, 403, { code: 403, error_code: 'otp_expired', msg: 'Email link is invalid or has expired' });
    if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'password' && body.email === 'dogrulanmamis@ornek.test') return send(res, 400, { code: 400, error_code: 'email_not_confirmed', msg: 'Email not confirmed' });
    if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'password') return body.password === password ? send(res, 200, session()) : send(res, 400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
    if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'refresh_token') return send(res, 200, session());
    if (url.pathname === '/auth/v1/user' && req.method === 'GET') return send(res, 200, USER);
    if (url.pathname === '/auth/v1/user' && req.method === 'PUT') { if (body.password) password = body.password; return send(res, 200, USER); }
    if (url.pathname === '/auth/v1/logout') return send(res, 204);
    if (url.pathname === '/auth/v1/recover') return send(res, 200, {});
    if (url.pathname === '/auth/v1/signup') return send(res, 200, autoConfirm ? session() : { ...USER, email: body.email, identities: [] });
    if (url.pathname === '/auth/v1/resend') return send(res, 200, {});
    if (url.pathname === '/__storage') return send(res, 200, [...storage.entries()].map(([k, v]) => ({ key: k, type: v.type, size: v.bytes.length, b64: v.bytes.toString('base64') })));
    if (url.pathname === '/__profile') return send(res, 200, profileRow);
    if (url.pathname === '/__other') { if (url.searchParams.get('set')) Object.assign(otherRow, JSON.parse(url.searchParams.get('set'))); return send(res, 200, otherRow); }
    if (url.pathname === '/rest/v1/notifications' && req.method === 'POST') { log.push({ entry: `POST /rest/v1/notifications`, body }); return send(res, 201, []); }
    if (url.pathname.startsWith('/storage/v1/object/list/avatars')) { const prefix = (body.prefix || '').replace(/\/$/, '') + '/'; return send(res, 200, [...storage.keys()].filter((k) => k.startsWith(prefix)).map((k) => ({ name: k.slice(prefix.length), id: k }))); }
    if (url.pathname.startsWith('/storage/v1/object/public/avatars/')) { const v = storage.get(decodeURIComponent(url.pathname.slice('/storage/v1/object/public/avatars/'.length))); if (!v) return send(res, 404, {}); res.writeHead(200, { 'content-type': v.type, 'access-control-allow-origin': '*' }); return res.end(v.bytes); }
    if (url.pathname === '/storage/v1/object/avatars' && req.method === 'DELETE') { (body.prefixes || []).forEach((k) => storage.delete(k)); return send(res, 200, (body.prefixes || []).map((name) => ({ name }))); }
    if (url.pathname.startsWith('/storage/v1/object/avatars/') && req.method === 'POST') { const key = decodeURIComponent(url.pathname.slice('/storage/v1/object/avatars/'.length)); storage.set(key, fileFromUpload(req, buf)); return send(res, 200, { Key: 'avatars/' + key, Id: key }); }
    if (url.pathname.startsWith('/rest/v1/profiles') && req.method === 'PATCH') { Object.assign(profileRow, body); return send(res, 204); }
    if (url.pathname.startsWith('/rest/v1/topics') && req.method === 'GET') { const one = (req.headers.accept || '').includes('vnd.pgrst.object'); return send(res, 200, one ? TOPIC : [TOPIC]); }
    if (url.pathname.startsWith('/rest/v1/profiles')) { const one = (req.headers.accept || '').includes('vnd.pgrst.object'); const wanted = (url.searchParams.get('id') || url.searchParams.get('username') || '').replace(/^eq\./, ''); const p = wanted === OTHER_ID || wanted === 'yazar' ? otherRow : (profileRow || (profileRow = freshProfile())); return send(res, 200, one ? p : [p]); }
    if (url.pathname.startsWith('/rest/v1/')) { const one = (req.headers.accept || '').includes('vnd.pgrst.object'); return one ? send(res, 406, { code: 'PGRST116', message: 'no rows' }) : send(res, 200, []); }
    if (url.pathname.startsWith('/realtime')) return send(res, 404, {});
    send(res, 404, { msg: 'not mocked ' + entry });
  });
}).listen(Number(process.env.MOCK_PORT || 54321), () => console.log('mock supabase on', process.env.MOCK_PORT || 54321));
