/**
 * NSosyal (nsosyal.com) Otomatik Gönderi Paylaşım Scripti
 * 
 * Bu script, Playwright kullanarak NSosyal hesabına (nsosyal.com) güvenli ve
 * bot korumalarına takılmayacak insan benzeri (human-like) bekleme süreleriyle giriş yapar,
 * Lexical tabanlı editörde ~500 karakterlik güncelleme duyurusunu yazar ve yayınlar.
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
  trendingUrl: 'https://nsosyal.com/explore/trending',
  loginUrl: 'https://nsosyal.com/login',
  
  // Zaman aşımları ve bekleme aralıkları (ms)
  navigationTimeout: 60000,
  actionTimeout: 20000,
  typingDelayMin: 25,
  typingDelayMax: 50,
  
  // DOM Seçicileri (Kullanıcı tarafından sağlanan HTML yapısıyla birebir uyumlu)
  selectors: {
    // 1. Giriş Yönlendirmesi (Trending / Explore / Ana Sayfa)
    exploreLoginLink: 'a[href="/login"], a:has-text("Giriş Yap"), a.bg-blue-6',
    
    // 2. Giriş Sayfası Elemanları (/login)
    usernameInput: 'input[name="username"], input[type="username"], input[placeholder*="Kullanıcı adı veya e-posta" i], input[type="email"], input[name="email"]',
    passwordInput: 'input[name="password"], input[type="password"], input[placeholder="••••••"]',
    loginSubmitButton: 'button[type="submit"]:has-text("Hesabına Giriş Yap"), button[type="submit"], button:has-text("Hesabına Giriş Yap"), button:has-text("Giriş")',

    // 3. Ana Akış & Lexical Post Editörü
    postEditorContainer: '#main-post-editor, [data-text-editor-input="main-post-editor"], div[contenteditable="true"]',
    lexicalContentEditable: 'div[contenteditable="true"][id="main-post-editor"], div[contenteditable="true"][data-lexical-editor="true"], div[role="textbox"][contenteditable="true"]',
    postPlaceholder: 'span:has-text("Gönderi oluşturmak için..."), div:has-text("Gönderi oluşturmak için...")',

    // 4. Paylaşım Butonu
    postSubmitButton: 'button:has-text("Gönder"), button:has(span:text-is("Gönder")), button[type="button"]:has(span:has-text("Gönder")), button[type="submit"]',
  }
};

/**
 * Rastgele İnsan Benzeri Bekleme Süresi (Anti-Bot Koruması)
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * ~500 Karakterlik İdeal Duyuru Metni
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

  return `🚀 EngelsizForum Başarıyla Güncellendi!

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
  const username = process.env.NSOSYAL_EMAIL || process.env.NSOSYAL_USERNAME;
  const password = process.env.NSOSYAL_PASSWORD;
  const customMessage = process.env.POST_MESSAGE;
  const deployUrl = process.env.DEPLOYMENT_URL || 'https://engelsizforum.com';

  if (!username || !password) {
    console.error('❌ HATA: NSOSYAL_EMAIL/NSOSYAL_USERNAME veya NSOSYAL_PASSWORD çevre değişkeni bulunamadı!');
    process.exit(1);
  }

  const postContent = customMessage || generateAnnouncementText(deployUrl);

  console.log('🌐 NSosyal Otomasyonu başlatılıyor...');
  console.log(`📊 Metin Karakter Sayısı: ${postContent.length} karakter`);
  console.log(`📝 Paylaşılacak Mesaj:\n---\n${postContent}\n---`);

  // Headless tarayıcıyı başlat
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul'
  });

  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.actionTimeout);

  try {
    // 1. ADIM: NSosyal'e Giriş Yap
    console.log(`🔗 NSosyal ana sayfası ziyaret ediliyor: ${CONFIG.baseUrl}`);
    await page.goto(CONFIG.baseUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: CONFIG.navigationTimeout 
    });

    await sleep(getRandomInt(2500, 3500));

    // Eğer login sayfasında değilsek doğrudan veya link ile login'e geç
    if (!page.url().includes('/login')) {
      const loginLink = page.locator(CONFIG.selectors.exploreLoginLink).first();
      const hasLoginLink = await loginLink.isVisible({ timeout: 4000 }).catch(() => false);

      if (hasLoginLink) {
        console.log('👆 "Giriş Yap" butonuna tıklanıyor...');
        await loginLink.click();
        await sleep(getRandomInt(2000, 3000));
      } else {
        console.log(`🔗 Doğrudan giriş sayfasına yönlendiriliyor: ${CONFIG.loginUrl}`);
        await page.goto(CONFIG.loginUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.navigationTimeout });
        await sleep(getRandomInt(2000, 3000));
      }
    }

    console.log('🔑 Giriş formu dolduruluyor...');
    
    // Kullanıcı adı / E-posta alanı
    const usernameField = page.locator(CONFIG.selectors.usernameInput).first();
    await usernameField.waitFor({ state: 'visible', timeout: CONFIG.actionTimeout });
    await usernameField.click();
    await sleep(getRandomInt(400, 800));
    await usernameField.pressSequentially(username, { delay: getRandomInt(CONFIG.typingDelayMin, CONFIG.typingDelayMax) });

    await sleep(getRandomInt(800, 1400));

    // Şifre alanı
    const passwordField = page.locator(CONFIG.selectors.passwordInput).first();
    await passwordField.waitFor({ state: 'visible', timeout: CONFIG.actionTimeout });
    await passwordField.click();
    await sleep(getRandomInt(400, 800));
    await passwordField.pressSequentially(password, { delay: getRandomInt(CONFIG.typingDelayMin, CONFIG.typingDelayMax) });

    await sleep(getRandomInt(1200, 2000));

    // "Hesabına Giriş Yap" butonuna tıkla
    console.log('🚀 "Hesabına Giriş Yap" butonuna tıklanıyor...');
    const loginButton = page.locator(CONFIG.selectors.loginSubmitButton).first();
    await loginButton.click();

    // Giriş sonrası yönlendirme için bekle
    console.log('⏳ Oturum açılması ve akışın yüklenmesi bekleniyor...');
    await sleep(getRandomInt(4000, 6000));

    // Eğer hala login sayfasındaysa veya explore'daysa ana sayfaya geç
    if (page.url().includes('/login')) {
      console.log('🔄 Ana sayfaya geçiliyor...');
      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle', timeout: CONFIG.navigationTimeout }).catch(async () => {
        await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded' });
      });
      await sleep(getRandomInt(3000, 4500));
    }

    // 2. ADIM: Post / Gönderi Editörünü Bul ve Odaklan
    console.log('✍️ Gönderi oluşturma editörü aranıyor...');
    const editor = page.locator(CONFIG.selectors.lexicalContentEditable).first();
    
    await editor.waitFor({ state: 'visible', timeout: CONFIG.actionTimeout });
    await sleep(getRandomInt(1000, 1800));
    await editor.click();
    await sleep(getRandomInt(600, 1000));

    // 3. ADIM: Metni İnsan Benzeri Hızla Yaz
    console.log('📝 Güncelleme metni editöre yazılıyor...');
    // Lexical editör için keyboard type veya pressSequentially
    await page.keyboard.type(postContent, { delay: getRandomInt(15, 30) });

    await sleep(getRandomInt(2500, 3500));

    // 4. ADIM: "Gönder" Butonunu Bul ve Tıkla
    console.log('📤 "Gönder" butonu aranıyor...');
    const submitBtn = page.locator(CONFIG.selectors.postSubmitButton).first();
    await submitBtn.waitFor({ state: 'visible', timeout: CONFIG.actionTimeout });

    // Butonun aktif olmasını bekle (disabled kalksın)
    await sleep(getRandomInt(1500, 2500));
    
    console.log('🚀 Gönderi yayınlanıyor...');
    await submitBtn.click();

    // Gönderinin iletilmesi ve veritabanına yazılması için bekle
    await sleep(getRandomInt(4500, 6000));

    console.log('🎉 TEBRİKLER: EngelsizForum güncelleme duyurusu NSosyal üzerinde başarıyla paylaşıldı!');
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
