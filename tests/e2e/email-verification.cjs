/**
 * End-to-end tests for email verification after sign-up (setup: see tests/e2e/auth-flows.cjs).
 *   npm run test:e2e:verify
 */
const { chromium } = require('playwright');
const B = process.env.BASE_URL || 'http://localhost:3124';
const MOCK = process.env.MOCK_URL || 'http://localhost:54321';
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${name}${extra ? '  → ' + extra : ''}`); };
const calls = async (part) => (await (await fetch(`${MOCK}/__log`)).json()).filter((x) => x.entry.includes(part));

async function page(b) {
  const ctx = await b.newContext({ bypassCSP: true, viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('engelsizforum_cookie_consent_v2', JSON.stringify({ necessary: true })));
  return { ctx, p: await ctx.newPage() };
}

async function register(p, email) {
  await p.goto(`${B}/register`, { waitUntil: 'networkidle' });
  await p.locator('#reg-username').fill('yeniuye');
  await p.locator('#reg-email').fill(email);
  await p.locator('#reg-password').fill('gecerli2026');
  await p.locator('#terms').check();
  await p.locator('#reg-password').locator('xpath=ancestor::form').locator('button[type=submit]').click();
  await p.waitForTimeout(1500);
}

(async () => {
  const b = await chromium.launch();
  await fetch(`${(process.env.MOCK_URL || 'http://localhost:54321')}/__reset`);
  await fetch(`${MOCK}/__autoconfirm?on=0`);

  { const { ctx, p } = await page(b);
    await register(p, 'yeni@ornek.test');
    const notice = p.getByRole('region', { name: 'E-posta adresini doğrula' });
    check('1. Kayıttan sonra "E-posta adresini doğrula" ekranı (yanıltıcı "giriş yapabilirsiniz" yok)', await notice.count() === 1 && p.url().includes('/register') && await p.getByText('Şimdi giriş yapabilirsiniz').count() === 0);
    check('   e-posta adresi ekranda gösteriliyor', await notice.getByText('yeni@ornek.test').count() === 1);
    const signup = (await calls('/auth/v1/signup')).pop();
    check('   doğrulama bağlantısı siteye dönüyor (emailRedirectTo)', /redirect_to=.*auth%2Fcallback/.test(signup.entry), signup.entry.slice(0, 90));
    const btn = notice.getByRole('button');
    check('   tekrar gönder butonu 60 sn bekleme ile başlıyor', await btn.isDisabled() && /sn bekle/.test(await btn.innerText()), await btn.innerText());
    await ctx.close(); }

  { const { ctx, p } = await page(b);
    await p.goto(`${B}/login`, { waitUntil: 'networkidle' });
    await p.locator('input[type=email]').first().fill('dogrulanmamis@ornek.test');
    await p.locator('input[type=password]').first().fill('herhangi1');
    await p.locator('form:has(input[type=password]) button[type=submit]').first().click(); await p.waitForTimeout(1500);
    const notice = p.getByRole('region', { name: 'E-posta adresini doğrula' });
    check('2. Doğrulanmamış hesapla giriş → açıklama + tekrar gönder (İngilizce hata yok)', await notice.count() === 1 && await p.getByText(/Email not confirmed/).count() === 0);
    const btn = notice.getByRole('button', { name: 'Doğrulama e-postasını tekrar gönder' });
    check('   tekrar gönder butonu hemen kullanılabilir', await btn.isEnabled());
    const before = (await calls('/auth/v1/resend')).length;
    await btn.click(); await p.waitForTimeout(1200);
    const resend = (await calls('/auth/v1/resend')).slice(before);
    check('   tıklayınca doğrulama e-postası yeniden istendi', resend.length === 1 && resend[0].body.email === 'dogrulanmamis@ornek.test' && resend[0].body.type === 'signup');
    check('   başarı mesajı ve yeni bekleme süresi', await notice.getByRole('status').filter({ hasText: 'gönderildi' }).count() === 1 && await notice.getByRole('button').isDisabled());
    await ctx.close(); }

  { const { ctx, p } = await page(b);
    await p.goto(`${B}/login`, { waitUntil: 'networkidle' });
    await p.locator('input[type=email]').first().fill('uye@ornek.test');
    await p.locator('input[type=password]').first().fill('yanlisSifre9');
    await p.locator('form:has(input[type=password]) button[type=submit]').first().click(); await p.waitForTimeout(1200);
    const toast = await p.locator('[data-sonner-toast]').first().innerText().catch(() => '');
    check('3. Yanlış şifre hatası Türkçe', /hatalı/.test(toast) && !/Invalid login/.test(toast), toast.replace(/\s+/g, ' ').slice(0, 80));
    await ctx.close(); }

  { await fetch(`${MOCK}/__autoconfirm?on=1`);
    const { ctx, p } = await page(b);
    await register(p, 'otomatik@ornek.test'); await p.waitForURL('**/discussions', { timeout: 20000 }).catch(() => {});
    check('4. E-posta doğrulaması kapalıysa doğrudan giriş yapılmış olarak tartışmalara', p.url().endsWith('/discussions'), p.url().replace(B, ''));
    await fetch(`${MOCK}/__autoconfirm?on=0`);
    await ctx.close(); }

  { const { ctx, p } = await page(b);
    await p.goto(`${B}/auth/confirm?token_hash=good&type=signup&next=/discussions`, { waitUntil: 'networkidle' });
    check('5. Doğrulama bağlantısı (yeni şablon) → giriş yapılmış, tartışmalar', p.url().endsWith('/discussions') && (await ctx.cookies()).some((c) => /auth-token/.test(c.name)));
    await ctx.close(); }

  console.log(`\n${pass} geçti, ${fail} kaldı`); await b.close(); process.exit(fail ? 1 : 0);
})();
