/**
 * End-to-end tests for "Oturumumu bu cihazda açık tut" (setup: see tests/e2e/auth-flows.cjs).
 *   npm run test:e2e:remember
 */
const { chromium } = require('playwright');
const B = process.env.BASE_URL || 'http://localhost:3124';
const MOCK = process.env.MOCK_URL || 'http://localhost:54321';
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${name}${extra ? '  → ' + extra : ''}`); };
const authCookies = async (ctx) => (await ctx.cookies()).filter((c) => /^sb-.*-auth-token/.test(c.name));
const days = (c) => (c.expires === -1 ? 'oturum çerezi' : `${Math.round((c.expires - Date.now() / 1000) / 86400)} gün`);

async function login(b, { remember, redirect = '' }) {
  const ctx = await b.newContext({ bypassCSP: true, viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('engelsizforum_cookie_consent_v2', JSON.stringify({ necessary: true })));
  const p = await ctx.newPage();
  await p.goto(`${B}/login${redirect}`, { waitUntil: 'networkidle' });
  await p.locator('#login-email, input[type=email]').first().fill('uye@ornek.test');
  await p.locator('input[type=password]').first().fill('eskiSifre1');
  if (!remember) await p.getByLabel('Oturumumu bu cihazda açık tut').uncheck();
  await p.locator('main form button[type=submit], form:has(input[type=password]) button[type=submit]').first().click();
  await p.waitForTimeout(2500);
  return { ctx, p };
}

(async () => {
  const b = await chromium.launch();
  await fetch(`${(process.env.MOCK_URL || 'http://localhost:54321')}/__reset`);
  await fetch(`${MOCK}/__ttl?s=3600`);

  { const { ctx } = await login(b, { remember: true });
    const c = await authCookies(ctx);
    check('1. İşaretli (varsayılan): giriş çerezi kalıcı', c.length > 0 && c.every((x) => x.expires > Date.now() / 1000 + 300 * 86400), c.map(days).join(', '));
    await ctx.close(); }

  { const { ctx } = await login(b, { remember: false });
    const c = await authCookies(ctx); const flag = (await ctx.cookies()).find((x) => x.name === 'ef_remember');
    check('2. İşaretsiz: giriş çerezi tarayıcı kapanınca silinen oturum çerezi', c.length > 0 && c.every((x) => x.expires === -1), c.map(days).join(', '));
    check('   tercih çerezi kaydedildi (ef_remember=0)', flag?.value === '0');
    await ctx.close(); }

  { await fetch(`${MOCK}/__ttl?s=20`);
    const { ctx, p } = await login(b, { remember: false });
    const before = (await (await fetch(`${MOCK}/__log`)).json()).filter((x) => x.entry.includes('grant_type=refresh_token')).length;
    await p.goto(`${B}/profile`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    await p.goto(`${B}/discussions`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    const after = (await (await fetch(`${MOCK}/__log`)).json()).filter((x) => x.entry.includes('grant_type=refresh_token')).length;
    const c = await authCookies(ctx);
    check('3. Token yenilendikten sonra da oturum çerezi olarak kaldı', after > before && c.length > 0 && c.every((x) => x.expires === -1), `${after - before} yenileme, ${c.map(days).join(', ')}`);
    await fetch(`${MOCK}/__ttl?s=3600`);
    await ctx.close(); }

  for (const remember of [false, true]) {
    await fetch(`${MOCK}/__ttl?s=5`);
    const { ctx } = await login(b, { remember });
    await new Promise((r) => setTimeout(r, 7000));
    const res = await ctx.request.get(`${B}/discussions`, { maxRedirects: 0 });
    const setCookies = res.headersArray().filter((h) => h.name.toLowerCase() === 'set-cookie' && /sb-.*-auth-token/.test(h.value)).map((h) => h.value);
    const persistent = setCookies.filter((v) => /max-age=\d{3,}|expires=/i.test(v));
    check(`3b. Sunucu (middleware) token yeniledi, ${remember ? 'işaretli → kalıcı' : 'işaretsiz → oturum çerezi'}`,
      setCookies.length > 0 && (remember ? persistent.length === setCookies.length : persistent.length === 0),
      `${setCookies.length} çerez yazıldı, ${persistent.length} kalıcı`);
    await fetch(`${MOCK}/__ttl?s=3600`);
    await ctx.close();
  }

  { const ctx = await b.newContext({ bypassCSP: true });
    const { ctx: c1 } = await login(b, { remember: false });
    const state = await c1.storageState(); await c1.close();
    const reopened = await b.newContext({ bypassCSP: true, storageState: { ...state, cookies: state.cookies.filter((x) => x.expires !== -1) } });
    const p = await reopened.newPage(); await p.goto(`${B}/profile`, { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
    const signedIn = await p.getByRole('region', { name: 'Şifre Değiştir' }).count();
    check('4. Tarayıcı kapatılıp açılınca (oturum çerezleri silinir) çıkış yapılmış', signedIn === 0);
    await reopened.close(); await ctx.close(); }

  { const { ctx, p } = await login(b, { remember: true, redirect: '?redirect=' + encodeURIComponent('https://evil.com') });
    check('5. Girişten sonra dış siteye yönlendirme engellendi', p.url().startsWith(B), p.url().slice(0, 40));
    await ctx.close(); }

  { const { ctx, p } = await login(b, { remember: false });
    await p.goto(`${B}/profile`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    await p.locator('header').getByRole('button', { name: /uye|Hesap/i }).first().click();
    await p.getByRole('button', { name: /Çıkış/ }).first().click(); await p.waitForTimeout(2000);
    const c = await authCookies(ctx);
    check('6. İşaretsizken de "Çıkış Yap" çerezleri siliyor', c.length === 0, `${c.length} çerez kaldı`);
    await ctx.close(); }

  console.log(`\n${pass} geçti, ${fail} kaldı`); await b.close(); process.exit(fail ? 1 : 0);
})();
