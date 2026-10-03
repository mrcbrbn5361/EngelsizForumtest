/**
 * NSosyal (nsosyal.com) Otomatik Gönderi Paylaşım Scripti
 * 
 * Bu script, Playwright kullanarak NSosyal hesabına giriş yapar ve 
 * Vercel başarılı deployment sonrasında ~500 karakterlik optimize edilmiş 
 * güncelleme duyurusunu yayınlar.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// =============================================================================
// KONFİGÜRASYON VE SEÇİCİLER (DOM Selectors)
// NSosyal arayüzü güncellendiğinde buradaki seçicileri kolayca değiştirebilirsiniz.
// =============================================================================
const CONFIG = {
  baseUrl: 'https://nsosyal.com',
  loginUrl: 'https://nsosyal.com/login',
  
  // Zaman aşımları (milisaniye)
  navigationTimeout: 45000,
  actionTimeout: 15000,
  
  // CSS & Text Seçicileri
  selectors: {
    // Giriş Sayfası Elemanları
    emailInput: 'input[name="email"], input[type="email"], input[name="username"], input[placeholder*="E-posta" i], input[placeholder*="eposta" i]',
    passwordInput: 'input[name="password"], input[type="password"], input[placeholder*="Şifre" i], input[placeholder*="sifre" i]',
    loginSubmitButton: 'button[type="submit"], button:has-text("Giriş Yap"), button:has-text("Giriş"), form button',

    // Ana Sayfa & Gönderi Oluşturma Elemanları
    postTextarea: 'textarea[placeholder*="düşünüyorsun" i], textarea[placeholder*="Neler oluyor" i], textarea, div[contenteditable="true"][role="textbox"]',
    postSubmitButton: 'button:has-text("Paylaş"), button:has-text("Gönder"), button[type="submit"]',
  }
};

/**
 * ~500 Karakterlik İdeal Duyuru Metni Oluşturucu
 */
function generateAnnouncementText(deployUrl) {
  const dateStr = new Date().toLocaleString('tr-TR', { 
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `🚀 EngelsizForum Güncellendi! (Canlıda)

Türkiye'nin %100 erişilebilir engelli topluluğu ve mevzuat portalında yeni geliştirmeler yayında:

✨ 2026 Balthazard & ÖTV hesaplama robotları
✨ Ekran okuyucu (WCAG AAA) & biyonik okuma uyumu
✨ 81 il ve 973 ilçe engelli hakları ağı
✨ Açık kaynak & bağımsız topluluk ekosistemi

🔗 Hemen keşfedin: ${deployUrl}
🕒 ${dateStr}

#EngelsizForum #Erişilebilirlik #TEKNOFEST #AçıkKaynak #Mevzuat`;
}

async function main() {
  const email = process.env.NSOSYAL_EMAIL;
  const password = process.env.NSOSYAL_PASSWORD;
  const customMessage = process.env.POST_MESSAGE;
  const deployUrl = process.env.DEPLOYMENT_URL || 'https://engelsizforum.com';

  if (!email || !password) {
    console.error('❌ HATA: NSOSYAL_EMAIL veya NSOSYAL_PASSWORD çevre değişkeni (Secret) bulunamadı!');
    process.exit(1);
  }

  // İdeal ~500 karakterlik metin
  const postContent = customMessage || generateAnnouncementText(deployUrl);

  console.log('🌐 NSosyal Otomasyonu başlatılıyor...');
  console.log(`📊 Metin Karakter Sayısı: ${postContent.length} karakter`);
  console.log(`📝 Paylaşılacak Mesaj:\n---\n${postContent}\n---`);

  // Headless tarayıcıyı başlat
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'tr-TR'
  });

  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.actionTimeout);

  try {
    // 1. ADIM: Giriş sayfasına git
    console.log(`🔗 Giriş sayfasına gidiliyor: ${CONFIG.loginUrl}`);
    await page.goto(CONFIG.loginUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: CONFIG.navigationTimeout 
    });

    await page.waitForTimeout(2000);

    // E-posta ve şifre doldur
    console.log('🔑 Giriş bilgileri dolduruluyor...');
    const emailField = page.locator(CONFIG.selectors.emailInput).first();
    await emailField.waitFor({ state: 'visible', timeout: CONFIG.actionTimeout });
    await emailField.fill(email);

    const passwordField = page.locator(CONFIG.selectors.passwordInput).first();
    await passwordField.waitFor({ state: 'visible', timeout: CONFIG.actionTimeout });
    await passwordField.fill(password);

    // Giriş butonuna tıkla
    console.log('🚀 Giriş yapılıyor...');
    const loginButton = page.locator(CONFIG.selectors.loginSubmitButton).first();
    await loginButton.click();

    await page.waitForTimeout(3000);

    // Giriş sonrası ana sayfaya yönel
    if (page.url().includes('/login')) {
      await page.goto(CONFIG.baseUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: CONFIG.navigationTimeout 
      });
      await page.waitForTimeout(2000);
    }

    // 2. ADIM: Gönderi alanına metni yaz
    console.log('✍️ Gönderi paylaşım alanı aranıyor...');
    const postTextarea = page.locator(CONFIG.selectors.postTextarea).first();
    await postTextarea.waitFor({ state: 'visible', timeout: CONFIG.actionTimeout });
    await postTextarea.click();
    await postTextarea.fill(postContent);

    await page.waitForTimeout(1000);

    // 3. ADIM: Paylaş butonuna tıkla
    console.log('📤 Gönderi yayınlanıyor...');
    const submitBtn = page.locator(CONFIG.selectors.postSubmitButton).first();
    await submitBtn.waitFor({ state: 'visible', timeout: CONFIG.actionTimeout });
    await submitBtn.click();

    await page.waitForTimeout(4000);

    console.log('🎉 TEBRİKLER: EngelsizForum güncelleme duyurusu (~500 karakter) NSosyal üzerinde başarıyla paylaşıldı!');
  } catch (error) {
    console.error('❌ HATA: NSosyal paylaşımı sırasında bir sorun oluştu:', error.message);

    try {
      const artifactDir = path.join(process.cwd(), 'artifacts');
      if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
      }
      const screenshotPath = path.join(artifactDir, 'nsosyal-error.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Hata anı ekran görüntüsü kaydedildi: ${screenshotPath}`);
    } catch (ssErr) {
      console.error('Ekran görüntüsü alınamadı:', ssErr.message);
    }

    process.exit(1);
  } finally {
    await browser.close();
    console.log('🔒 Tarayıcı kapatıldı.');
  }
}

main();
