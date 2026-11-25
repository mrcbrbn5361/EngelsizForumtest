/**
 * End-to-end tests for /tercihler (notification, privacy and cookie preferences).
 * Setup: see tests/e2e/auth-flows.cjs; the dev server also needs SUPABASE_SERVICE_ROLE_KEY=test.
 *   npm run test:e2e:prefs
 */
const { chromium } = require('playwright');
const B = process.env.BASE_URL || 'http://localhost:3124';
const MOCK = process.env.MOCK_URL || 'http://localhost:54321';
const OTHER = '22222222-3333-4444-5555-666666666666';
const TOPIC = `${B}/discussions/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee`;
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${name}${extra ? '  → ' + extra : ''}`); };
const get = async (p) => (await fetch(MOCK + p)).json();
const notifs = async () => (await get('/__log')).filter((x) => x.entry === 'POST /rest/v1/notifications');

async function context(b, { member = false, consent = true } = {}) {
  const ctx = await b.newContext({ bypassCSP: true, viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((c) => { if (c && !localStorage.getItem('engelsizforum_cookie_consent_v2')) localStorage.setItem('engelsizforum_cookie_consent_v2', JSON.stringify({ necessary: true, analytics: false, marketing: false })); }, consent);
  await ctx.routeWebSocket(/realtime/, (ws) => ws.onMessage((raw) => { if (typeof raw !== 'string') return; const [j, r, t, , p] = JSON.parse(raw); ws.send(JSON.stringify([j, r, t, 'phx_reply', { status: 'ok', response: { postgres_changes: (p?.config?.postgres_changes || []).map((c, i) => ({ ...c, id: i + 1 })) } }])); }));
  const p = await ctx.newPage();
  if (member) await p.goto(`${B}/auth/confirm?token_hash=good&type=signup&next=/discussions`, { waitUntil: 'networkidle' });
  return { ctx, p };
}

(async () => {
  await fetch(`${MOCK}/__reset`);
  const b = await chromium.launch();

  { const { ctx, p } = await context(b);
    await p.goto(`${B}/tercihler`, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
    check('1. Misafir: giriş daveti + yalnızca çerez bölümü', await p.getByRole('link', { name: /Giriş yap/ }).count() === 1 && await p.getByRole('region', { name: 'Bildirimler' }).count() === 0 && await p.getByRole('region', { name: 'Çerezler' }).count() === 1);
    const analytics = p.getByRole('switch', { name: 'Analitik çerezler' });
    check('   analitik çerez varsayılan kapalı', await analytics.getAttribute('aria-checked') === 'false');
    await analytics.click(); await p.waitForTimeout(300);
    const stored = await p.evaluate(() => JSON.parse(localStorage.getItem('engelsizforum_cookie_consent_v2')));
    const consent = await p.evaluate(() => (window.dataLayer || []).filter((e) => e && e[0] === 'consent' && e[1] === 'update').map((e) => e[2]).pop());
    check('   açınca kaydedildi ve Google onay moduna iletildi', stored.analytics === true && stored.marketing === false && consent?.analytics_storage === 'granted' && consent?.ad_storage === 'denied', JSON.stringify(consent));
    await ctx.close(); }

  { const { ctx, p } = await context(b, { consent: false });
    await p.goto(`${B}/about`, { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: /Özelleştir/ }).first().click();
    check('2. Çerez bandında analitik önceden işaretli değil (KVKK: açık rıza)', !(await p.locator('#consent-analytics').isChecked()));
    await ctx.close(); }

  { const { ctx, p } = await context(b, { member: true });
    await p.locator('header').getByRole('button', { name: /uye|Hesap/i }).first().click();
    await p.getByRole('link', { name: 'Tercihler' }).click(); await p.waitForURL('**/tercihler'); await p.waitForTimeout(1500);
    check('3. Menüdeki "Tercihler" ayrı sayfayı açıyor', p.url().endsWith('/tercihler'));
    const switches = p.getByRole('region', { name: 'Bildirimler' }).getByRole('switch');
    check('   4 bildirim türü, hepsi açık', await switches.count() === 4 && (await switches.evaluateAll((els) => els.every((e) => e.getAttribute('aria-checked') === 'true'))));
    await p.getByRole('switch', { name: 'Konum beğenildiğinde' }).click();
    await p.getByRole('status').filter({ hasText: 'kaydedildi' }).waitFor({ timeout: 8000 }).catch(() => {});
    let prof = await get('/__profile');
    check('   "beğeni" kapatıldı ve hesaba kaydedildi', prof.notification_prefs?.types?.like === false && prof.notification_prefs?.types?.comment === true, JSON.stringify(prof.notification_prefs));
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    check('   sayfa yenilenince de kapalı', await p.getByRole('switch', { name: 'Konum beğenildiğinde' }).getAttribute('aria-checked') === 'false');
    await p.getByRole('radio', { name: /Yalnızca üyeler/ }).click(); await p.waitForTimeout(1200);
    prof = await get('/__profile');
    check('4. Profil görünürlüğü "Yalnızca üyeler" kaydedildi', prof.privacy_prefs?.profileVisibility === 'members' && await p.getByRole('radio', { name: /Yalnızca üyeler/ }).getAttribute('aria-checked') === 'true');
    await p.goto('/profile'.replace(/^/, B), { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
    check('   profil sayfasında tercih kartları yok, Tercihler bağlantısı var', await p.getByText('Bildirim Tercihleri').count() === 0 && await p.getByRole('link', { name: /Tercihlere git/ }).count() === 1);

    await fetch(`${MOCK}/__other?set=${encodeURIComponent(JSON.stringify({ notification_prefs: {} }))}`);
    await p.goto(TOPIC, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
    const before = (await notifs()).length;
    await p.getByRole('button', { name: /^Beğen/ }).click(); await p.waitForTimeout(1500);
    const liked = (await notifs()).slice(before);
    check('5. Yazar beğeni bildirimine izin veriyorsa bildirim oluşuyor', liked.length === 1 && liked[0].body.user_id === OTHER && liked[0].body.type === 'like', liked.map((n) => n.body.content).join(' | '));
    check('   bildirim metni ve bağlantısı sunucuda üretiliyor', liked[0]?.body.data?.link === '/discussions/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' && /"Engelli raporu yenileme" konunuzu beğendi/.test(liked[0]?.body.content || ''));
    await p.getByRole('button', { name: /^Beğen/ }).click(); await p.waitForTimeout(800);
    await fetch(`${MOCK}/__other?set=${encodeURIComponent(JSON.stringify({ notification_prefs: { types: { like: false } } }))}`);
    const before2 = (await notifs()).length;
    await p.getByRole('button', { name: /^Beğen/ }).click(); await p.waitForTimeout(1500);
    check('   yazar beğeni bildirimini kapattıysa bildirim oluşmuyor', (await notifs()).length === before2);
    await ctx.close(); }

  { await fetch(`${MOCK}/__other?set=${encodeURIComponent(JSON.stringify({ privacy_prefs: { profileVisibility: 'members' } }))}`);
    const guest = await context(b);
    await guest.p.goto(`${B}/profile/${OTHER}`, { waitUntil: 'networkidle' });
    const html = await guest.p.content();
    check('6. "Yalnızca üyeler" profili misafire kapalı', /yalnızca Engelsiz Forum üyelerine açtı/.test(html) && !html.includes('Yazarın biyografisi'));
    await guest.ctx.close();
    const member = await context(b, { member: true });
    await member.p.goto(`${B}/profile/${OTHER}`, { waitUntil: 'networkidle' });
    check('   üyeye açık', (await member.p.content()).includes('Yazarın biyografisi'));
    await member.ctx.close();
    await fetch(`${MOCK}/__other?set=${encodeURIComponent(JSON.stringify({ privacy_prefs: { profileVisibility: 'everyone' } }))}`);
    const g2 = await context(b);
    await g2.p.goto(`${B}/profile/${OTHER}`, { waitUntil: 'networkidle' });
    const h2 = await g2.p.content();
    check('7. Herkese açık profilde biyografi var, tercih sütunları sayfaya gönderilmiyor', h2.includes('Yazarın biyografisi') && !h2.includes('notification_prefs') && !h2.includes('privacy_prefs'));
    await g2.ctx.close(); }

  console.log(`\n${pass} geçti, ${fail} kaldı`); await b.close(); process.exit(fail ? 1 : 0);
})();
