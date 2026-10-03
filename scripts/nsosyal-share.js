/**
 * NSosyal (nsosyal.com) Otomatik Gönderi Paylaşım Scripti
 * 
 * Bu script, Playwright ve xvfb (X Virtual Framebuffer) kullanarak Cloudflare Turnstile 
 * ve "Bir dakika lütfen..." doğrulama ekranlarını otomatik aşar, NSosyal hesabına giriş yapar 
 * ve Lexical editörde ~500 karakterlik güncelleme duyurusunu paylaşır.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// =============================================================================
// KONFİGÜRASYON VE SEÇİCİLER (DOM Selectors)
// =============================================================================
const CONFIG = {
  baseUrl: 'https://nsosyal.com',
  trendingUrl: 'https://nsosyal.com/explore/trending',
  loginUrl: 'https://nsosyal.com/login',
  
  // Zaman aşımları ve bekleme aralıkları (ms)
  navigationTimeout: 90000,
  actionTimeout: 30000,
  typingDelayMin: 35,
  typingDelayMax: 70,
  
  selectors: {
    // 1. Giriş Yönlendirmesi
    exploreLoginLink: 'a[href="/login"], a:has-text("Giriş Yap"), a.bg-blue-6',
    
    // 2. Giriş Sayfası Elemanları
    usernameInputList: [
      'input[name="username"]',
      'input[placeholder*="Kullanıcı adı" i]',
      'input[placeholder*="e-posta" i]',
      'input[placeholder*="eposta" i]',
      'input[type="username"]',
      'input[type="email"]',
      'input[type="text"]',
      'input:not([type="password"]):not([type="hidden"]):not([type="checkbox"])'
    ],
    passwordInputList: [
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder="••••••"]',
      'input[placeholder*="Şifre" i]',
      'input[placeholder*="sifre" i]'
    ],
    loginSubmitButtonList: [
      'button[type="submit"]:has-text("Hesabına Giriş Yap")',
      'button:has-text("Hesabına Giriş Yap")',
      'button[type="submit"]:has-text("Giriş")',
      'button:has-text("Giriş Yap")',
      'button[type="submit"]',
      'form button'
    ],

    // 3. Post Editörü Elemanları
    postEditorList: [
      'div[contenteditable="true"][id="main-post-editor"]',
      'div[contenteditable="true"][data-lexical-editor="true"]',
      'div[data-text-editor-input="main-post-editor"]',
      'div[role="textbox"][contenteditable="true"]',
      '#main-post-editor [contenteditable="true"]',
      'div[contenteditable="true"]',
      'textarea[placeholder*="düşünüyorsun" i]',
      'textarea'
    ],

    // 4. Paylaşım Butonu
    postSubmitButtonList: [
      'button:has-text("Gönder")',
      'button:has(span:text-is("Gönder"))',
      'button[type="button"]:has(span:has-text("Gönder"))',
      'button[type="submit"]:has-text("Gönder")',
      'button:has-text("Paylaş")'
    ]
  }
};

/**
 * Yardımcı Bekleme Fonksiyonu
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

/**
 * Cloudflare / DDoS-Guard "Bir dakika lütfen..." Doğrulama Ekranını Bekleme ve Aşma
 */
async function handleCloudflareChallenge(page, maxWaitMs = 35000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    const title = (await page.title().catch(() => '')).trim();
    const url = page.url();

    const isChallenge = 
      title.includes('Bir dakika lütfen') || 
      title.includes('Just a moment') || 
      title.includes('Attention Required') || 
      title.includes('Cloudflare');

    if (isChallenge) {
      console.log(`🛡️ Cloudflare/Turnstile doğrulaması algılandı ("${title}"). Aşılması bekleniyor...`);
      
      // Fare hareketi simüle et
      await page.mouse.move(getRandomInt(100, 500), getRandomInt(100, 400)).catch(() => {});
      
      // Turnstile iframe veya checkbox'ı varsa tıkla
      try {
        const cfFrames = page.frames();
        for (const frame of cfFrames) {
          const frameUrl = frame.url();
          if (frameUrl.includes('cloudflare') || frameUrl.includes('turnstile') || frameUrl.includes('challenges')) {
            const checkbox = frame.locator('input[type="checkbox"], .ctp-checkbox-label, #challenge-stage').first();
            if (await checkbox.isVisible({ timeout: 1500 }).catch(() => false)) {
              console.log('👆 Cloudflare Turnstile kutucuğuna tıklandı...');
              await checkbox.click({ force: true }).catch(() => {});
            }
          }
        }
      } catch {}

      await sleep(2500);
    } else {
      console.log(`✅ Doğrulama geçildi! Güncel Sayfa Başlığı: "${title}" | URL: ${url}`);
      return true;
    }
  }

  console.warn('⚠️ Cloudflare bekleme süresi doldu, sayfa akışına devam ediliyor...');
  return false;
}

/**
 * Birden fazla seçici arasından ilk görünür olanı bulan yardımcı fonksiyon
 */
async function findFirstVisibleElement(page, selectorList, timeout = 20000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    for (const selector of selectorList) {
      try {
        const locator = page.locator(selector).first();
        const isVisible = await locator.isVisible({ timeout: 1000 }).catch(() => false);
        if (isVisible) {
          return { locator, selector };
        }
      } catch {
        // Sıradaki seçiciyi dene
      }
    }
    await sleep(600);
  }
  return null;
}

async function main() {
  const username = process.env.NSOSYAL_EMAIL || process.env.NSOSYAL_USERNAME;
  const password = process.env.NSOSYAL_PASSWORD;
  const customMessage = process.env.POST_MESSAGE;
  const deployUrl = process.env.DEPLOYMENT_URL || 'https://engelsizforum.com';

  if (!username || !password) {
    console.error('❌ HATA: NSOSYAL_EMAIL veya NSOSYAL_PASSWORD Secret tanımı bulunamadı!');
    process.exit(1);
  }

  const postContent = customMessage || generateAnnouncementText(deployUrl);

  console.log('🌐 NSosyal Otomasyonu başlatılıyor...');
  console.log(`📊 Metin Karakter Sayısı: ${postContent.length} karakter`);
  console.log(`📝 Paylaşılacak Mesaj:\n---\n${postContent}\n---`);

  // Xvfb sanal ekranı altında gerçek ekranlı (headless: false) tarayıcı başlatılır
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--start-maximized',
      '--window-size=1366,768'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
    extraHTTPHeaders: {
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    }
  });

  // navigator.webdriver gizleme
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
  });

  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.actionTimeout);

  try {
    // 1. ADIM: NSosyal Giriş Sayfasına Git
    console.log(`🔗 NSosyal giriş sayfasına gidiliyor: ${CONFIG.loginUrl}`);
    await page.goto(CONFIG.loginUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: CONFIG.navigationTimeout 
    });

    await sleep(2000);

    // Cloudflare doğrulamasını kontrol et ve geçmesini bekle
    await handleCloudflareChallenge(page);

    console.log(`📍 Doğrulama Sonrası URL: ${page.url()}`);

    // Eğer /login harici bir sayfaya düşerse Giriş Yap linkini ara
    if (!page.url().includes('/login')) {
      console.log('🔍 /login harici sayfada bulunuldu, "Giriş Yap" butonu aranıyor...');
      const loginLink = page.locator(CONFIG.selectors.exploreLoginLink).first();
      const hasLoginLink = await loginLink.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasLoginLink) {
        console.log('👆 "Giriş Yap" bağlantısına tıklandı.');
        await loginLink.click();
        await sleep(getRandomInt(2000, 3500));
        await handleCloudflareChallenge(page);
      } else {
        console.log('🔗 Doğrudan /login rotasına yönlendiriliyor...');
        await page.goto(CONFIG.loginUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.navigationTimeout });
        await handleCloudflareChallenge(page);
      }
    }

    // 2. ADIM: Form Alanlarını Doldur
    console.log('🔑 Kullanıcı adı / E-posta alanı aranıyor...');
    const usernameMatch = await findFirstVisibleElement(page, CONFIG.selectors.usernameInputList, 25000);
    
    if (!usernameMatch) {
      throw new Error(`Kullanıcı adı alanı bulunamadı. Sayfa Başlığı: "${await page.title()}" | URL: ${page.url()}`);
    }

    console.log(`✅ Kullanıcı adı alanı bulundu (Seçici: ${usernameMatch.selector})`);
    await usernameMatch.locator.click();
    await sleep(getRandomInt(400, 700));
    await usernameMatch.locator.fill('');
    await usernameMatch.locator.pressSequentially(username, { 
      delay: getRandomInt(CONFIG.typingDelayMin, CONFIG.typingDelayMax) 
    });

    await sleep(getRandomInt(700, 1200));

    console.log('🔑 Şifre alanı aranıyor...');
    const passwordMatch = await findFirstVisibleElement(page, CONFIG.selectors.passwordInputList, 15000);
    
    if (!passwordMatch) {
      throw new Error('Şifre alanı bulunamadı.');
    }

    console.log(`✅ Şifre alanı bulundu (Seçici: ${passwordMatch.selector})`);
    await passwordMatch.locator.click();
    await sleep(getRandomInt(400, 700));
    await passwordMatch.locator.fill('');
    await passwordMatch.locator.pressSequentially(password, { 
      delay: getRandomInt(CONFIG.typingDelayMin, CONFIG.typingDelayMax) 
    });

    await sleep(getRandomInt(1000, 1800));

    // 3. ADIM: Giriş Butonuna Tıkla
    console.log('🚀 "Hesabına Giriş Yap" butonuna tıklanıyor...');
    const loginButtonMatch = await findFirstVisibleElement(page, CONFIG.selectors.loginSubmitButtonList, 10000);
    
    if (!loginButtonMatch) {
      throw new Error('Giriş onay butonu bulunamadı.');
    }

    await loginButtonMatch.locator.click();

    console.log('⏳ Oturum açılması ve akışın yüklenmesi bekleniyor...');
    await sleep(getRandomInt(5000, 7000));
    await handleCloudflareChallenge(page);

    if (page.url().includes('/login')) {
      console.log('🔄 Ana sayfaya geçiliyor...');
      await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.navigationTimeout });
      await sleep(getRandomInt(3000, 5000));
      await handleCloudflareChallenge(page);
    }

    console.log(`📍 Oturum Açma Sonrası Güncel URL: ${page.url()}`);

    // 4. ADIM: Gönderi / Lexical Editörünü Bul
    console.log('✍️ Gönderi oluşturma editörü aranıyor...');
    const editorMatch = await findFirstVisibleElement(page, CONFIG.selectors.postEditorList, 25000);

    if (!editorMatch) {
      throw new Error('Gönderi paylaşım editörü sayfada bulunamadı.');
    }

    console.log(`✅ Editör alanı bulundu (Seçici: ${editorMatch.selector})`);
    await editorMatch.locator.click();
    await sleep(getRandomInt(800, 1500));

    // 5. ADIM: Güncelleme Metnini Yaz
    console.log('📝 Güncelleme metni editöre yazılıyor...');
    await page.keyboard.type(postContent, { delay: getRandomInt(15, 30) });

    await sleep(getRandomInt(2500, 3500));

    // 6. ADIM: "Gönder" Butonunu Bul ve Tıkla
    console.log('📤 "Gönder" butonu aranıyor...');
    const submitBtnMatch = await findFirstVisibleElement(page, CONFIG.selectors.postSubmitButtonList, 15000);

    if (!submitBtnMatch) {
      throw new Error('"Gönder" butonu bulunamadı.');
    }

    console.log(`🚀 Gönderi yayınlanıyor (Seçici: ${submitBtnMatch.selector})...`);
    await submitBtnMatch.locator.click();

    await sleep(getRandomInt(5000, 7000));

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
