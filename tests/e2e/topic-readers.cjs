/**
 * End-to-end tests for "Bu konuyu şu an okuyanlar" (setup: see tests/e2e/auth-flows.cjs; the dev
 * server also needs SUPABASE_SERVICE_ROLE_KEY=test so the topic page can load).
 *   npm run test:e2e:readers
 * Supabase Realtime is faked here with Playwright's WebSocket routing (Phoenix protocol vsn 2.0.0,
 * presence only), shared by every browser context in the test.
 */
const { chromium } = require('playwright');
const B = process.env.BASE_URL || 'http://localhost:3124';
const MOCK = process.env.MOCK_URL || 'http://localhost:54321';
const TOPIC_URL = `${B}/discussions/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee`;
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${name}${extra ? '  → ' + extra : ''}`); };

const topics = new Map();
const sent = [];
function broadcast(topic) {
  const members = topics.get(topic) || new Map();
  const state = {};
  for (const [key, entries] of members) state[key] = { metas: entries.map((e, i) => ({ phx_ref: `${key}-${i}`, ...e.meta })) };
  for (const [, entries] of members) for (const e of entries) e.ws.send(JSON.stringify([null, null, topic, 'presence_state', state]));
  for (const ws of watchers.get(topic) || []) if (![...members.values()].flat().some((e) => e.ws === ws)) ws.send(JSON.stringify([null, null, topic, 'presence_state', state]));
}
const watchers = new Map();
function drop(ws) {
  for (const [topic, members] of topics) {
    let changed = false;
    for (const [key, entries] of members) { const left = entries.filter((e) => e.ws !== ws); if (left.length !== entries.length) { changed = true; left.length ? members.set(key, left) : members.delete(key); } }
    if (changed) broadcast(topic);
  }
  for (const set of watchers.values()) set.delete(ws);
}
async function fakeRealtime(ctx) {
  await ctx.routeWebSocket(/\/realtime\/v1\/websocket/, (ws) => {
    const keys = new Map();
    ws.onMessage((raw) => {
      if (typeof raw !== 'string') return;
      const [joinRef, ref, topic, event, payload] = JSON.parse(raw);
      const reply = (response = {}) => ws.send(JSON.stringify([joinRef, ref, topic, 'phx_reply', { status: 'ok', response }]));
      if (event === 'phx_join') {
        keys.set(topic, payload?.config?.presence?.key || '');
        if (!watchers.has(topic)) watchers.set(topic, new Set());
        watchers.get(topic).add(ws);
        reply({ postgres_changes: (payload?.config?.postgres_changes || []).map((c, i) => ({ ...c, id: i + 1 })) });
        if (topic.includes('presence:topic')) broadcast(topic);
      } else if (event === 'presence') {
        sent.push(payload.payload);
        const members = topics.get(topic) || new Map(); topics.set(topic, members);
        const key = keys.get(topic);
        const others = (members.get(key) || []).filter((e) => e.ws !== ws);
        if (payload.event === 'track') members.set(key, [...others, { ws, meta: payload.payload }]);
        else others.length ? members.set(key, others) : members.delete(key);
        reply(); broadcast(topic);
      } else if (event === 'phx_leave') { reply(); drop(ws); }
      else reply();
    });
    ws.onClose(() => drop(ws));
  });
}
async function open(b, { member = false, hidden = false } = {}) {
  const ctx = await b.newContext({ bypassCSP: true, viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((h) => { localStorage.setItem('engelsizforum_cookie_consent_v2', JSON.stringify({ necessary: true })); if (h) localStorage.setItem('engelsiz_a11y_prefs', JSON.stringify({ showReadingPresence: false })); }, hidden);
  await fakeRealtime(ctx);
  const p = await ctx.newPage();
  if (member) await p.goto(`${B}/auth/confirm?token_hash=good&type=signup&next=/discussions`, { waitUntil: 'networkidle' });
  await p.goto(TOPIC_URL, { waitUntil: 'networkidle' });
  return { ctx, p };
}
const box = (p) => p.getByRole('region', { name: /Bu konuyu şu an okuyanlar/ });
const read = async (p) => { await p.waitForTimeout(1200); return (await box(p).innerText().catch(() => '')).replace(/\s+/g, ' ').trim(); };

(async () => {
  await fetch(`${MOCK}/__reset`);
  const b = await chromium.launch();

  const guest1 = await open(b);
  let t = await read(guest1.p);
  check('1. Misafir konuyu açınca kutu görünüyor: "1 misafir"', /\(1\)/.test(t) && /1 misafir/.test(t), t);

  const member = await open(b, { member: true });
  t = await read(guest1.p);
  check('2. Üye girince misafir de görüyor: "uye ve 1 misafir"', /\(2\)/.test(t) && /uye ve 1 misafir/.test(t), t);
  check('   üye adı profiline bağlantı', await box(guest1.p).getByRole('link', { name: 'uye' }).getAttribute('href') === '/profile/11111111-2222-3333-4444-555555555555');

  const secondTab = await guest1.ctx.newPage(); await secondTab.goto(TOPIC_URL, { waitUntil: 'networkidle' });
  t = await read(member.p);
  check('3. Aynı misafirin ikinci sekmesi ayrı sayılmıyor', /\(2\)/.test(t) && /1 misafir/.test(t), t);
  await secondTab.close();

  const guest2 = await open(b);
  t = await read(member.p);
  check('4. İkinci misafir: "uye ve 2 misafir"', /\(3\)/.test(t) && /uye ve 2 misafir/.test(t), t);
  await guest2.ctx.close();
  t = await read(member.p);
  check('5. Misafir sayfayı kapatınca listeden düşüyor', /\(2\)/.test(t) && /1 misafir/.test(t), t);

  await member.ctx.close();
  sent.length = 0;
  const hidden = await open(b, { member: true, hidden: true });
  t = await read(guest1.p);
  check('6. Adını gizleyen üye "1 gizli üye" olarak görünüyor', /1 gizli üye ve 1 misafir/.test(t) && !/uye\b(?! )/.test(t.replace('gizli üye', '')), t);
  const tracked = sent.filter(Boolean);
  const uid = '11111111-2222-3333-4444-555555555555';
  const presenceKeys = [...(topics.values())].flatMap((m) => [...m.keys()]);
  check('   gizli üyenin adı ve kullanıcı kimliği ağa hiç gönderilmiyor', tracked.some((m) => m.hidden) && tracked.every((m) => !('username' in m) && !JSON.stringify(m).includes(uid)) && presenceKeys.every((k) => !k.includes(uid)),
    `${JSON.stringify(tracked.find((m) => m.hidden))}, anahtarlar: ${presenceKeys.map((k) => k.slice(0, 8)).join(',')}`);
  check('   sayfada ekran okuyucu için anlaşılır metin', (await box(guest1.p).locator('p').getAttribute('aria-label')) === '1 gizli üye ve 1 misafir');

  await hidden.ctx.close(); await guest1.ctx.close();
  console.log(`\n${pass} geçti, ${fail} kaldı`); await b.close(); process.exit(fail ? 1 : 0);
})();
