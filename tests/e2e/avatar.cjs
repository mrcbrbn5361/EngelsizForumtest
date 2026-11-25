/**
 * End-to-end tests for profile picture upload (setup: see tests/e2e/auth-flows.cjs).
 *   npm run test:e2e:avatar
 * Needs Python 3 with Pillow to create the test photos and inspect the uploaded file.
 */
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const B = process.env.BASE_URL || 'http://localhost:3124';
const MOCK = process.env.MOCK_URL || 'http://localhost:54321';
const UID = '11111111-2222-3333-4444-555555555555';
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${name}${extra ? '  → ' + extra : ''}`); };
const get = async (p) => (await fetch(MOCK + p)).json();

const py = (code, ...args) => execFileSync('python3', ['-I', '-c', code, ...args]);
const photo = (w, h, color) => py(`
import io, sys
from PIL import Image
img = Image.new('RGB', (int(sys.argv[1]), int(sys.argv[2])), sys.argv[3])
exif = Image.Exif(); exif[0x010E] = 'GPS-SECRET-41.0082N-28.9784E'
buf = io.BytesIO(); img.save(buf, 'JPEG', exif=exif.tobytes()); sys.stdout.buffer.write(buf.getvalue())`, String(w), String(h), color);
const inspect = (b64) => JSON.parse(py(`
import io, sys, base64, json
from PIL import Image
raw = base64.b64decode(sys.argv[1]); im = Image.open(io.BytesIO(raw))
print(json.dumps({'format': im.format, 'size': im.size, 'secret': b'GPS-SECRET' in raw, 'exif': bool(im.getexif())}))`, b64).toString());

(async () => {
  await fetch(`${MOCK}/__reset`);
  const b = await chromium.launch();
  const ctx = await b.newContext({ bypassCSP: true, viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('engelsizforum_cookie_consent_v2', JSON.stringify({ necessary: true })));
  const p = await ctx.newPage();
  const external = []; p.on('request', (r) => { if (/dicebear/.test(r.url())) external.push(r.url()); });
  await p.goto(`${B}/auth/confirm?token_hash=good&type=signup&next=/profile`, { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);

  const upload = p.getByRole('button', { name: 'Fotoğraf yükle' });
  check('1. Profilde "Fotoğraf yükle" butonu var, URL kutusu yok', await upload.count() === 1 && await p.getByLabel(/Avatar URL/).count() === 0);
  check('   resim yokken baş harfler gösteriliyor, dış servise (DiceBear) istek yok', external.length === 0 && await p.getByRole('img', { name: 'Örnek Üye profil resmi' }).first().innerText() === 'ÖÜ', `${external.length} istek`);

  const fileInput = p.locator('input[type=file]');
  await fileInput.setInputFiles({ name: 'tatil.jpg', mimeType: 'image/jpeg', buffer: photo(1600, 900, '#c0392b') });
  await p.getByRole('status').filter({ hasText: 'güncellendi' }).waitFor({ timeout: 15000 }).catch(() => {});
  let files = await get('/__storage');
  const first = files[0];
  check('2. Fotoğraf yüklendi', files.length === 1 && first.key.startsWith(`${UID}/avatar-`), files.map((f) => f.key).join(','));
  if (first) {
    const info = inspect(first.b64);
    check('   256×256 kare olarak küçültüldü', info.size[0] === 256 && info.size[1] === 256, `${info.format} ${info.size.join('×')}, ${first.size} bayt`);
    check('   gizli bilgiler (EXIF / konum) silindi', !info.secret && !info.exif);
    check('   WebP biçiminde', first.type === 'image/webp' && info.format === 'WEBP', first.type);
  }
  let profile = await get('/__profile');
  check('   profile kaydedildi ve sayfada gösteriliyor', profile.avatar_url?.endsWith(first?.key) && await p.locator(`img[src="${profile.avatar_url}"]`).count() > 0);

  await p.getByRole('button', { name: 'Fotoğrafı değiştir' }).waitFor();
  await fileInput.setInputFiles({ name: 'yeni.jpg', mimeType: 'image/jpeg', buffer: photo(600, 1200, '#2980b9') });
  await p.waitForTimeout(400); await p.getByRole('status').filter({ hasText: 'güncellendi' }).waitFor({ timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(800);
  files = await get('/__storage'); profile = await get('/__profile');
  check('3. Yeni fotoğraf yüklenince eskisi silindi', files.length === 1 && files[0].key !== first?.key && profile.avatar_url.endsWith(files[0].key), files.map((f) => f.key.split('/')[1]).join(','));

  const before = (await get('/__storage')).length;
  await fileInput.setInputFiles({ name: 'belge.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
  await p.waitForTimeout(500);
  check('4. PDF reddedildi, yüklenmedi', await p.getByRole('alert').filter({ hasText: 'resim dosyası' }).count() === 1 && (await get('/__storage')).length === before);
  await fileInput.setInputFiles({ name: 'cizim.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>') });
  await p.waitForTimeout(500);
  check('   SVG reddedildi (betik içerebilir)', await p.getByRole('alert').filter({ hasText: 'desteklenmiyor' }).count() === 1);
  await fileInput.setInputFiles({ name: 'dev.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(11 * 1024 * 1024) });
  await p.waitForTimeout(500);
  check('   10 MB üstü reddedildi', await p.getByRole('alert').filter({ hasText: '10 MB' }).count() === 1);

  await p.getByRole('button', { name: 'Kaldır' }).click();
  await p.getByRole('status').filter({ hasText: 'kaldırıldı' }).waitFor({ timeout: 10000 }).catch(() => {});
  await p.waitForTimeout(600);
  files = await get('/__storage'); profile = await get('/__profile');
  check('5. "Kaldır": profil resmi silindi, depoda dosya kalmadı', profile.avatar_url === null && files.length === 0, `${files.length} dosya`);

  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('engelsiz_a11y_prefs') || '{}'); localStorage.setItem('engelsiz_a11y_prefs', JSON.stringify({ ...s, theme: 'sepia', readingFont: 'lexend' })); });
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await p.getByLabel('Biyografi', { exact: false }).fill('Merhaba!');
  await p.getByRole('button', { name: 'Değişiklikleri Kaydet' }).click(); await p.waitForTimeout(1500);
  profile = await get('/__profile');
  check('6. Profili kaydetmek tema ve okuma fontu tercihini silmiyor', profile.accessibility_prefs?.theme === 'sepia' && profile.accessibility_prefs?.readingFont === 'lexend', JSON.stringify(profile.accessibility_prefs || {}).slice(0, 80));

  console.log(`\n${pass} geçti, ${fail} kaldı`); await b.close(); process.exit(fail ? 1 : 0);
})();
