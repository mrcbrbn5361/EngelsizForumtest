/**
 * End-to-end tests for the password flows (reset link, expired link, open redirect,
 * cross-device fallback, change password in profile, sign-up password policy).
 *
 * 1. node tests/e2e/mock-supabase.cjs
 * 2. NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=test npx next dev -p 3124
 * 3. npm run test:e2e:auth
 */
const { chromium } = require('playwright');
const B = process.env.BASE_URL || 'http://localhost:3124';
const authLog = async () => (await (await fetch((process.env.MOCK_URL || 'http://localhost:54321') + '/__log')).json()).map(x => x.entry);
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${name}${extra ? '  → ' + extra : ''}`); };
(async () => {
  const b = await chromium.launch();
  await fetch(`${(process.env.MOCK_URL || 'http://localhost:54321')}/__reset`);
  const fresh = () => b.newContext({ bypassCSP: true, viewport: { width: 1280, height: 900 } });

  { const ctx = await fresh(); const p = await ctx.newPage();
    await p.goto(`${B}/auth/confirm?token_hash=good&type=recovery`); await p.waitForLoadState('networkidle');
    check('1. Geçerli sıfırlama bağlantısı (başka cihaz) → şifre belirleme sayfası', p.url().endsWith('/auth/reset-password'), p.url().replace(B, ''));
    const cookies = (await ctx.cookies()).filter(c => c.name.includes('auth-token'));
    check('   oturum çerezi sunucuda kuruldu', cookies.length > 0);
    await p.waitForTimeout(1500);
    const pw = p.locator('input[type=password]');
    check('   yeni şifre formu görünüyor', await pw.count() === 2, `${await pw.count()} alan`);
    await pw.nth(0).fill('yeniSifre2026'); await pw.nth(1).fill('yeniSifre2026');
    await p.getByRole('button', { name: 'ŞİFREYİ KAYDET VE GİRİŞ YAP' }).click(); await p.waitForURL('**/login**', { timeout: 10000 }).catch(() => {});
    const log = await authLog();
    check('   şifre güncellendi ve giriş sayfasına dönüldü', log.some(e => e.startsWith('PUT /auth/v1/user')) && p.url().includes('/login'), p.url().replace(B, '').slice(0, 40));
    await ctx.close(); }

  { const ctx = await fresh(); const p = await ctx.newPage();
    await p.goto(`${B}/auth/confirm?token_hash=bad&type=recovery`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(800);
    const alert = await p.getByText(/süresi dolmuş/).count();
    check('2. Süresi dolmuş bağlantı → şifremi unuttum sayfası + açık hata mesajı', p.url().includes('/auth/forgot-password') && alert > 0, p.url().replace(B, '').slice(0, 40));
    await ctx.close(); }

  { const ctx = await fresh(); const p = await ctx.newPage();
    for (const evil of ['//evil.com', '/\\evil.com', 'https://evil.com']) {
      await p.goto(`${B}/auth/confirm?token_hash=good&type=recovery&next=${encodeURIComponent(evil)}`); await p.waitForLoadState('domcontentloaded');
      check(`3. Açık yönlendirme engeli next=${evil}`, p.url().startsWith(B + '/auth/reset-password'), p.url().slice(0, 45)); }
    await ctx.close(); }

  { const ctx = await fresh(); const p = await ctx.newPage();
    await p.goto(`${B}/auth/callback?type=recovery&code=abc123`); await p.waitForURL('**/forgot-password**', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(800);
    check('4. Eski bağlantı başka tarayıcıda açıldı → anlaşılır hata', p.url().includes('/auth/forgot-password') && await p.getByText(/sıfırlamayı istediğiniz tarayıcıda/).count() > 0, p.url().replace(B, '').slice(0, 40));
    await ctx.close(); }

  { const ctx = await fresh(); const p = await ctx.newPage();
    await p.goto(`${B}/auth/confirm?token_hash=good&type=signup&next=/profile`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(2500);
    check('5. Kayıt doğrulama bağlantısı → profile giriş yapılmış olarak', p.url().endsWith('/profile'));
    const card = p.getByRole('region', { name: 'Şifre Değiştir' });
    check('   profilde "Şifre Değiştir" bölümü var', await card.count() === 1);
    await card.getByLabel('Mevcut şifre').fill('yanlisSifre1'); await card.getByLabel('Yeni şifre', { exact: true }).fill('dahaYeni2027'); await card.getByLabel('Yeni şifre (tekrar)').fill('dahaYeni2027');
    await card.getByRole('button', { name: 'Şifreyi Değiştir' }).click(); await p.waitForTimeout(1200);
    check('   yanlış mevcut şifre reddedildi', await card.getByRole('alert').filter({ hasText: 'Mevcut şifreniz doğru değil' }).count() === 1);
    await card.getByLabel('Mevcut şifre').fill('yeniSifre2026'); await card.getByLabel('Yeni şifre', { exact: true }).fill('kisa'); await card.getByLabel('Yeni şifre (tekrar)').fill('kisa');
    const before = (await authLog()).length; await card.getByRole('button', { name: 'Şifreyi Değiştir' }).click(); await p.waitForTimeout(600);
    check('   kurala uymayan yeni şifre sunucuya gönderilmeden reddedildi', (await authLog()).length === before && await card.getByRole('alert').count() === 1);
    await card.getByLabel('Yeni şifre', { exact: true }).fill('dahaYeni2027'); await card.getByLabel('Yeni şifre (tekrar)').fill('dahaYeni2027');
    await card.getByRole('button', { name: 'Şifreyi Değiştir' }).click(); await p.waitForTimeout(1500);
    const log = await authLog();
    check('   doğru mevcut şifre ile şifre değişti', await card.getByRole('status').filter({ hasText: 'Şifreniz değiştirildi' }).count() === 1);
    check('   diğer cihazlardaki oturumlar kapatıldı (logout scope=others)', log.some(e => e.includes('/auth/v1/logout') && e.includes('scope=others')), log.filter(e => e.includes('logout')).join(','));
    await ctx.close(); }

  { const ctx = await fresh(); const p = await ctx.newPage();
    await p.goto(`${B}/register`); await p.waitForLoadState('networkidle');
    await p.locator('#reg-username').fill('yeniuye'); await p.locator('#reg-email').fill('yeni@ornek.test');
    await p.locator('#reg-password').fill('sadeceharf'); await p.locator('#terms').check();
    const before = (await authLog()).filter(e => e.includes('signup')).length;
    await p.locator('#reg-password').locator('xpath=ancestor::form').locator('button[type=submit]').click(); await p.waitForTimeout(1200);
    const after = (await authLog()).filter(e => e.includes('signup')).length;
    check('6. Kayıtta yalnızca harften oluşan şifre engellendi', before === after && await p.getByText(/en az bir rakam veya özel karakter içermelidir/).count() > 0);
    await p.locator('#reg-password').fill('gecerli2026');
    await p.locator('#reg-password').locator('xpath=ancestor::form').locator('button[type=submit]').click(); await p.waitForTimeout(1500);
    check('   kurala uyan şifreyle kayıt isteği gönderildi', (await authLog()).filter(e => e.includes('signup')).length === after + 1);
    await ctx.close(); }

  console.log(`\n${pass} geçti, ${fail} kaldı`); await b.close();
})();
