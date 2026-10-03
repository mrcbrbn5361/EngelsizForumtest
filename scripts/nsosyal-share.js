/**
 * NSosyal (nsosyal.com) Otomatik Gönderi Paylaşım Scripti
 * 
 * Bu script, GitHub Actions Ubuntu ortamında Stealth eklentisi (playwright-extra + puppeteer-extra-plugin-stealth),
 * xvfb sanal ekranı ve akıllı Cloudflare Turnstile çözücü ile korumaları aşarak 
 * NSosyal hesabına giriş yapar ve ~500 karakterlik güncelleme duyurusunu yayınlar.
 */

const fs = require('fs');
const path = require('path');

// Stealth desteği ile Playwright'ı yükle
let chromium;
try {
  const { chromium: extraChromium } = require('playwright-extra');
  const stealthPlugin = require('puppeteer-extra-plugin-stealth')();
  extraChromium.use(stealthPlugin);
  chromium = extraChromium;
  console.log('🛡️ playwright-extra + stealth koruma kalkanı devrede.');
} catch {
  chromium = require('playwright').chromium;
  console.log('ℹ️ Standart playwright motoru devrede.');
}

// =============================================================================
// KONFİGÜRASYON VE SEÇİCİLER (DOM Selectors)
// =============================================================================
const CONFIG = {
  baseUrl: 'https://nsosyal.com',
  loginUrl: 'https://nsosyal.com/login',
  
  navigationTimeout: 90000,
  actionTimeout: 35000,
  typingDelayMin: 30,
  typingDelayMax: 65,
  
  selectors: {
    // 1. Giriş Bağlantısı (Ana Sayfa / Keşfet)
    exploreLoginLink: 'a[href="/login"], a:has-text("Giriş Yap"), a.bg-blue-6',
    
    // 2. Giriş Sayfası Form Elemanları
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

    // 3. Post / Gönderi Editörü Elemanları
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
 * Cloudflare Turnstile ve Güvenlik Testlerini Tespit Edip Tıklayan Fonksiyon
 */
async function solveTurnstileChallenges(page) {
  let clicked = false;

  // 1. YÖNTEM: Sayfadaki tüm frame'leri (iframe) gez
  try {
    for (const frame of page.frames()) {
      const frameUrl = frame.url();
      if (frameUrl.includes('cloudflare.com') || frameUrl.includes('turnstile') || frameUrl.includes('challenge')) {
        const checkbox = frame.locator('input[type="checkbox"], .ctp-checkbox-label, .mark, label, #challenge-stage').first();
        if (await checkbox.isVisible({ timeout: 1500 }).catch(() => false)) {
          console.log(`🎯 Turnstile iframe'inde onay kutucuğu bulundu (${frameUrl}), tıklanıyor...`);
          await checkbox.click({ force: true }).catch(() => {});
          clicked = true;
          break;
        }
      }
    }
  } catch {}

  // 2. YÖNTEM: Ana sayfadaki #challenge-stage veya Turnstile div'inin koordinatına tıkla
  if (!clicked) {
    try {
      const stage = page.locator('#challenge-stage, #turnstile-wrapper, .cf-turnstile, [data-sitekey]').first();
      if (await stage.isVisible({ timeout: 1500 }).catch(() => false)) {
        const box = await stage.boundingBox();
        if (box && box.width > 0) {
          const clickX = Math.round(box.x + Math.min(30, box.width / 4));
          const clickY = Math.round(box.y + box.height / 2);
          console.log(`🎯 Ana sayfadaki Turnstile alanı koordinatına (${clickX}, ${clickY}) tıklanıyor...`);
          await page.mouse.move(clickX, clickY, { steps: 5 });
          await sleep(200);
          await page.mouse.click(clickX, clickY);
          clicked = true;
        }
      }
    } catch {}
  }

  return clicked;
}

/**
 * Cloudflare Doğrulama Ekranının ("Bir dakika lütfen...") Aşılmasını Bekleyen Döngü
 */
async function waitForCloudflareClearance(page, maxWaitMs = 40000) {
  const startTime = Date.now();
  let checkCount = 0;

  while (Date.now() - startTime < maxWaitMs) {
    checkCount++;
    const title = (await page.title().catch(() => '')).trim();

    const isChallenge = 
      title.includes('Bir dakika lütfen') || 
      title.includes('Just a moment') || 
      title.includes('Attention Required') || 
      title.includes('Cloudflare');

    if (isChallenge) {
      console.log(`⏳ [${checkCount}] Cloudflare doğrulama ekranı tespit edildi ("${title}"). Aşılması bekleniyor...`);
      
      // Turnstile kutucuğunu tıkla
      await solveTurnstileChallenges(page);

      // Rastgele fare hareketi
      await page.mouse.move(getRandomInt(200, 600), getRandomInt(150, 450), { steps: 5 }).catch(() => {});
      await sleep(2500);
    } else {
      console.log(`🎉 Cloudflare aşımı tamamlandı! Başlık: "${title}" | URL: ${page.url()}`);
      return true;
    }
  }

  console.warn('⚠️ Cloudflare bekleme süresi doldu, mevcut sayfa ile devam ediliyor...');
  return false;
}

/**
 * Verilen listedeki seçicilerden ilk görünür olanı bulur
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
      } catch {}
    }
    // Turnstile belirirse tıkla
    await solveTurnstileChallenges(page);
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

  if (!sessionCookie && (!username || !password)) {
    console.error('❌ HATA: Giriş için NSOSYAL_SESSION_COOKIE veya (NSOSYAL_EMAIL + NSOSYAL_PASSWORD) tanımlanmalıdır!');
    process.exit(1);
  }

  const postContent = customMessage || generateAnnouncementText(deployUrl);

  console.log('🌐 NSosyal Otomasyonu başlatılıyor...');
  console.log(`📊 Metin Karakter Sayısı: ${postContent.length} karakter`);

  // Automation bayrağı kaldırılmış tarayıcı başlatma
  let browser;
  const browserOptions = {
    headless: false,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1366,768'
    ]
  };

  try {
    browser = await chromium.launch({ ...browserOptions, channel: 'chrome' });
    console.log('🚀 Sistemdeki resmi Google Chrome tarayıcısı başlatıldı.');
  } catch {
    browser = await chromium.launch(browserOptions);
    console.log('🚀 Standart Chromium tarayıcısı başlatıldı.');
  }

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul'
  });

  // navigator.webdriver temizleme
  await context.addInitScript(() => {
    delete Object.getPrototypeOf(navigator).webdriver;
  });

  // Eğer secret olarak session cookie veya localStorage JSON tanımlıysa doğrudan enjekte et
  if (sessionCookie) {
    // 1. Durum: LocalStorage JSON dump verilmişse (copy(JSON.stringify(localStorage)))
    if (sessionCookie.trim().startsWith('{') && sessionCookie.trim().endsWith('}')) {
      try {
        const storageItems = JSON.parse(sessionCookie);
        const keys = Object.keys(storageItems);
        console.log(`📦 ${keys.length} adet LocalStorage anahtarı tespit edildi (${keys.slice(0, 5).join(', ')}...), oturuma enjekte ediliyor...`);
        await context.addInitScript((items) => {
          for (const [key, val] of Object.entries(items)) {
            try {
              window.localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
            } catch (err) {}
          }
        }, storageItems);
        console.log('✅ LocalStorage anahtarları tarayıcı oturumuna başarıyla bağlandı.');
      } catch (jsonErr) {
        console.warn('LocalStorage JSON ayrıştırma uyarısı:', jsonErr.message);
      }
    } else {
      // 2. Durum: Çerez (Cookie) formatı
      try {
        console.log('🍪 Tanımlı NSosyal oturum çerezi enjekte ediliyor...');
        const cookieList = [];
        let rawCookies = sessionCookie.trim();
        if (rawCookies.toLowerCase().startsWith('cookie:')) {
          rawCookies = rawCookies.substring(7).trim();
        }

        let detectedAccessToken = null;

        if (rawCookies.includes('=')) {
          // "name1=val1; name2=val2" formatı (Request Header Cookie kopyası)
          const pairs = rawCookies.split(';');
          for (const pair of pairs) {
            const [k, ...v] = pair.trim().split('=');
            if (k && v.length > 0) {
              const name = k.trim();
              const val = v.join('=').trim();
              if (name === 'access_token') {
                detectedAccessToken = val;
              }
              cookieList.push({
                name,
                value: val,
                domain: '.nsosyal.com',
                path: '/'
              });
            }
          }
        } else {
          // Tekil değer verilmişse yaygın oturum çerez adlarının tümüne ekle
          detectedAccessToken = rawCookies.trim();
          ['access_token', 'token', '_session_id', 'session', 'auth_token', 'next-auth.session-token', 'remember_user_token'].forEach(cookieName => {
            cookieList.push({
              name: cookieName,
              value: rawCookies.trim(),
              domain: '.nsosyal.com',
              path: '/'
            });
          });
        }
        await context.addCookies(cookieList);
        console.log(`✅ ${cookieList.length} adet oturum çerezi (.nsosyal.com) tarayıcıya başarıyla eklendi.`);

        if (detectedAccessToken) {
          await context.addInitScript((token) => {
            try {
              window.localStorage.setItem('access_token', token);
              window.localStorage.setItem('token', token);
            } catch (err) {}
          }, detectedAccessToken);
          console.log('🔑 access_token ayrıca localStorage içine de bağlandı.');
        }
      } catch (cookieErr) {
        console.warn('Çerez uyarısı:', cookieErr.message);
      }
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

    await sleep(2500);
    await waitForCloudflareClearance(page);

    console.log(`📍 Mevcut URL: ${page.url()} | Başlık: "${await page.title()}"`);

    // Oturum zaten açık mı kontrol et
    let isAlreadyLoggedIn = false;
    const existingEditor = await findFirstVisibleElement(page, CONFIG.selectors.postEditorList, 3000);
    if (existingEditor) {
      console.log('✨ Zaten oturum açık, doğrudan gönderi oluşturuluyor!');
      isAlreadyLoggedIn = true;
    }

    if (!isAlreadyLoggedIn) {
      // 2. ADIM: Sayfadaki "Giriş Yap" Butonunu Bul ve Tıkla
      console.log('🔍 "Giriş Yap" butonu aranıyor...');
      const loginLinkMatch = await findFirstVisibleElement(page, [CONFIG.selectors.exploreLoginLink], 6000);

      if (loginLinkMatch) {
        console.log('👆 "Giriş Yap" butonuna tıklandı, giriş formu bekleniyor...');
        await loginLinkMatch.locator.click();
        await sleep(2000);
        await waitForCloudflareClearance(page);
      } else {
        console.log(`🔗 Doğrudan giriş rotasına gidiliyor: ${CONFIG.loginUrl}`);
        await page.goto(CONFIG.loginUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout: CONFIG.navigationTimeout,
          referer: CONFIG.baseUrl
        });
        await sleep(2000);
        await waitForCloudflareClearance(page);
      }

      console.log(`📍 Form Ekranı URL: ${page.url()}`);

      // 3. ADIM: Kullanıcı Adı ve Şifre Alanlarını Doldur
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

      // 4. ADIM: Giriş Butonuna Tıkla
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
        await sleep(3000);
        await waitForCloudflareClearance(page);
      }
    }

    console.log(`📍 Gönderi Öncesi URL: ${page.url()}`);

    // 5. ADIM: Post / Lexical Editörünü Bul
    console.log('✍️ Gönderi paylaşım editörü aranıyor...');
    const editorMatch = await findFirstVisibleElement(page, CONFIG.selectors.postEditorList, 30000);

    if (!editorMatch) {
      throw new Error('Gönderi paylaşım editörü sayfada bulunamadı.');
    }

    console.log(`✅ Editör alanı bulundu (Seçici: ${editorMatch.selector})`);
    await editorMatch.locator.click();
    await sleep(getRandomInt(1000, 1800));

    // 6. ADIM: Güncelleme Metnini Yaz
    console.log('📝 Güncelleme metni editöre yazılıyor...');
    await page.keyboard.type(postContent, { delay: getRandomInt(15, 30) });

    await sleep(getRandomInt(2500, 3500));

    // 7. ADIM: Paylaşım Butonuna Tıkla
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
