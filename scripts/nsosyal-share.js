/**
 * NSosyal (nsosyal.com) Otomatik Gönderi Paylaşım Scripti
 * 
 * Bu script, GitHub Actions Ubuntu ortamında Google Chrome / Chromium ve xvfb sanal ekranını
 * kullanarak Cloudflare Turnstile korumalarını akıllıca aşar, NSosyal hesabına giriş yapar 
 * ve Lexical editörde ~500 karakterlik güncelleme duyurusunu yayınlar.
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
  
  navigationTimeout: 90000,
  actionTimeout: 35000,
  typingDelayMin: 25,
  typingDelayMax: 60,
  
  selectors: {
    // 1. Giriş Bağlantısı (Ana Sayfa veya Explore)
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
 * Turnstile Iframe Tespiti ve Koordinat Tıklaması
 */
async function clickTurnstileIfPresent(page) {
  try {
    const frames = page.locator('iframe[src*="cloudflare"], iframe[src*="turnstile"], iframe[src*="challenge"], iframe[title*="Cloudflare"], iframe[title*="challenge"]');
    const count = await frames.count();

    for (let i = 0; i < count; i++) {
      const frameLocator = frames.nth(i);
      const isVisible = await frameLocator.isVisible().catch(() => false);
      if (isVisible) {
        const box = await frameLocator.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          console.log(`🎯 Cloudflare Turnstile tespit edildi (${box.width}x${box.height}), onay kutucuğuna tıklanıyor...`);
          // Gerçek fare hareketi ve sol tıklama
          const targetX = Math.round(box.x + Math.min(28, box.width / 4));
          const targetY = Math.round(box.y + box.height / 2);
          await page.mouse.move(box.x, box.y, { steps: 5 });
          await sleep(200);
          await page.mouse.move(targetX, targetY, { steps: 7 });
          await sleep(300);
          await page.mouse.click(targetX, targetY);
          console.log('✅ Turnstile onay kutucuğu tıklandı.');
          return true;
        }
      }
    }
  } catch {
    // Hata durumunda devam et
  }
  return false;
}

/**
 * Cloudflare "Bir dakika lütfen..." Doğrulamasını Bekleme ve Çözme
 */
async function waitForCloudflareClearance(page, maxWaitMs = 45000) {
  const startTime = Date.now();
  let attempt = 0;

  while (Date.now() - startTime < maxWaitMs) {
    attempt++;
    const title = (await page.title().catch(() => '')).trim();

    const isChallenge = 
      title.includes('Bir dakika lütfen') || 
      title.includes('Just a moment') || 
      title.includes('Attention Required') || 
      title.includes('Cloudflare');

    if (isChallenge) {
      console.log(`⏳ [${attempt}] Cloudflare doğrulama ekranı bekleniyor ("${title}")...`);
      
      // Turnstile iframe'ini tara ve tıkla
      await clickTurnstileIfPresent(page);

      // Rastgele insansı fare gezintisi
      await page.mouse.move(getRandomInt(200, 700), getRandomInt(150, 450), { steps: 6 }).catch(() => {});
      await sleep(2500);
    } else {
      console.log(`🎉 Cloudflare aşımı başarılı! Sayfa Başlığı: "${title}" | URL: ${page.url()}`);
      return true;
    }
  }

  console.warn('⚠️ Cloudflare bekleme süresi doldu, mevcut sayfa ile devam ediliyor...');
  return false;
}

/**
 * Liste İçerisinden İlk Görünür Elemanı Bulan Yardımcı
 */
async function findFirstVisibleElement(page, selectorList, timeout = 25000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    for (const selector of selectorList) {
      try {
        const locator = page.locator(selector).first();
        const isVisible = await locator.isVisible({ timeout: 800 }).catch(() => false);
        if (isVisible) {
          return { locator, selector };
        }
      } catch {
        // Sıradaki seçiciye geç
      }
    }
    // Turnstile kutucuğu açılmışsa tıkla
    await clickTurnstileIfPresent(page);
    await sleep(600);
  }
  return null;
}

async function main() {
  const username = process.env.NSOSYAL_EMAIL || process.env.NSOSYAL_USERNAME;
  const password = process.env.NSOSYAL_PASSWORD;
  const sessionCookie = process.env.NSOSYAL_SESSION_COOKIE;
  const customMessage = process.env.POST_MESSAGE;
  const deployUrl = process.env.DEPLOYMENT_URL || 'https://engelsizforum.com';

  if (!username || !password) {
    console.error('❌ HATA: NSOSYAL_EMAIL veya NSOSYAL_PASSWORD tanımlanmamış!');
    process.exit(1);
  }

  const postContent = customMessage || generateAnnouncementText(deployUrl);

  console.log('🌐 NSosyal Otomasyonu başlatılıyor...');
  console.log(`📊 Metin Karakter Sayısı: ${postContent.length} karakter`);

  // Google Chrome veya Chromium başlatma
  let browser;
  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    '--start-maximized',
    '--window-size=1366,768'
  ];

  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: false,
      args: launchArgs
    });
    console.log('🚀 Sistemdeki resmi Google Chrome tarayıcısı başlatıldı.');
  } catch {
    browser = await chromium.launch({
      headless: false,
      args: launchArgs
    });
    console.log('🚀 Standart Chromium tarayıcısı başlatıldı.');
  }

  // Gerçek tarayıcı kimliğini bozmamak için native user-agent kullanılır
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul'
  });

  // navigator.webdriver gizleme
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  // Eğer secret olarak session cookie tanımlıysa doğrudan enjekte et
  if (sessionCookie) {
    try {
      console.log('🍪 Tanımlı NSosyal oturum çerezi enjekte ediliyor...');
      await context.addCookies([
        {
          name: '_session_id',
          value: sessionCookie,
          domain: '.nsosyal.com',
          path: '/'
        }
      ]);
    } catch (cookieErr) {
      console.warn('Çerez ekleme uyarısı:', cookieErr.message);
    }
  }

  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.actionTimeout);

  try {
    // 1. ADIM: Doğrudan /login yerine önce ana sayfaya (Warm Session) git
    console.log(`🔗 NSosyal ana sayfası ziyaret ediliyor: ${CONFIG.baseUrl}`);
    await page.goto(CONFIG.baseUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: CONFIG.navigationTimeout 
    });

    await sleep(getRandomInt(2500, 3500));
    await waitForCloudflareClearance(page);

    console.log(`📍 Mevcut URL: ${page.url()} | Başlık: "${await page.title()}"`);

    // 2. ADIM: Ana Sayfadaki "Giriş Yap" Butonunu Bul ve Tıkla
    let isAlreadyLoggedIn = false;

    // Önce post editörü zaten var mı (oturum açık mı) kontrol et
    const existingEditor = await findFirstVisibleElement(page, CONFIG.selectors.postEditorList, 3000);
    if (existingEditor) {
      console.log('✨ Zaten oturum açılmış durumda, doğrudan gönderi adımına geçiliyor!');
      isAlreadyLoggedIn = true;
    }

    if (!isAlreadyLoggedIn) {
      console.log('🔍 "Giriş Yap" butonu aranıyor...');
      const loginLinkMatch = await findFirstVisibleElement(page, [CONFIG.selectors.exploreLoginLink], 8000);

      if (loginLinkMatch) {
        console.log('👆 "Giriş Yap" butonuna tıklandı, yönlendiriliyor...');
        await loginLinkMatch.locator.click();
        await sleep(getRandomInt(2000, 3000));
        await waitForCloudflareClearance(page);
      } else {
        console.log(`🔗 Doğrudan giriş sayfasına yönlendiriliyor: ${CONFIG.loginUrl}`);
        await page.goto(CONFIG.loginUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout: CONFIG.navigationTimeout,
          referer: CONFIG.baseUrl
        });
        await sleep(2000);
        await waitForCloudflareClearance(page);
      }

      console.log(`📍 Giriş Sayfası URL: ${page.url()}`);

      // 3. ADIM: Form Alanlarını Doldur
      console.log('🔑 Kullanıcı adı / E-posta alanı aranıyor...');
      const usernameMatch = await findFirstVisibleElement(page, CONFIG.selectors.usernameInputList, 30000);

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

      await sleep(getRandomInt(600, 1000));

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

      await sleep(getRandomInt(1000, 1600));

      // 4. ADIM: Giriş Yap Butonuna Tıkla
      console.log('🚀 "Hesabına Giriş Yap" butonuna tıklanıyor...');
      const loginButtonMatch = await findFirstVisibleElement(page, CONFIG.selectors.loginSubmitButtonList, 10000);

      if (!loginButtonMatch) {
        throw new Error('Giriş onay butonu bulunamadı.');
      }

      await loginButtonMatch.locator.click();

      console.log('⏳ Oturum açılması ve akışın yüklenmesi bekleniyor...');
      await sleep(getRandomInt(5000, 7000));
      await waitForCloudflareClearance(page);

      if (page.url().includes('/login')) {
        console.log('🔄 Ana akışa yönlendiriliyor...');
        await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.navigationTimeout });
        await sleep(getRandomInt(3000, 4500));
        await waitForCloudflareClearance(page);
      }
    }

    console.log(`📍 Gönderi Öncesi Güncel URL: ${page.url()}`);

    // 5. ADIM: Post / Lexical Editörünü Bul
    console.log('✍️ Gönderi paylaşım editörü aranıyor...');
    const editorMatch = await findFirstVisibleElement(page, CONFIG.selectors.postEditorList, 30000);

    if (!editorMatch) {
      throw new Error('Gönderi paylaşım editörü sayfada bulunamadı.');
    }

    console.log(`✅ Editör alanı bulundu (Seçici: ${editorMatch.selector})`);
    await editorMatch.locator.click();
    await sleep(getRandomInt(1000, 1800));

    // 6. ADIM: Metni Yaz ve Yayınla
    console.log('📝 Güncelleme metni editöre yazılıyor...');
    await page.keyboard.type(postContent, { delay: getRandomInt(15, 30) });

    await sleep(getRandomInt(2500, 3500));

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
