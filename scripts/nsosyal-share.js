/**
 * NSosyal (nsosyal.com) Otomatik Gönderi Paylaşım Scripti
 * 
 * Bu script 2 kademeli hibrit mimariyle çalışır:
 * 1. Kademe: NSosyal REST API (DPoP RFC 9449) ile doğrudan paylaşım.
 * 2. Kademe: Playwright tarayıcı motoru ile /home üzerindeki Lexical editörüne bağlanarak paylaşım.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// =============================================================================
// KONFİGÜRASYON VE SEÇİCİLER
// =============================================================================
const CONFIG = {
  baseUrl: 'https://nsosyal.com',
  homeUrl: 'https://nsosyal.com/home',
  loginUrl: 'https://nsosyal.com/login',
  apiUrl: 'https://v2-api.nsosyal.com',
  
  navigationTimeout: 90000,
  actionTimeout: 35000,
  typingDelayMin: 20,
  typingDelayMax: 50,
  
  selectors: {
    // 1. Giriş Sayfası Elemanları
    exploreLoginLink: 'a[href="/login"], a:has-text("Giriş Yap"), a.bg-blue-6',
    usernameInputList: [
      'input[name="username"]',
      'input[placeholder*="Kullanıcı adı" i]',
      'input[placeholder*="e-posta" i]',
      'input[type="username"]',
      'input[type="email"]',
      'input[type="text"]'
    ],
    passwordInputList: [
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder="••••••"]'
    ],
    loginSubmitButtonList: [
      'button[type="submit"]:has-text("Hesabına Giriş Yap")',
      'button:has-text("Hesabına Giriş Yap")',
      'button[type="submit"]',
      'form button'
    ],

    // 2. Ana Sayfa Editör Tetikleyicisi (Kapalıyken)
    editorTriggerList: [
      'span:has-text("Gönderi oluşturmak için...")',
      'div:has-text("Gönderi oluşturmak için...")',
      '#main-post-editor',
      '[data-text-editor-input="main-post-editor"]'
    ],

    // 3. Açık Lexical Editör (Yazım Alanı)
    lexicalInputList: [
      'div[contenteditable="true"][data-lexical-editor="true"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]#main-post-editor',
      '#main-post-editor [contenteditable="true"]',
      'div[contenteditable="true"]',
      'textarea'
    ],

    // 4. Gönder Butonu
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

// =============================================================================
// DPoP (RFC 9449) MOTORU
// =============================================================================
function createDPoPClient() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jwk = publicKey.export({ format: 'jwk' });
  const cleanJwk = { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y };

  function b64url(input) {
    return Buffer.from(input).toString('base64url');
  }

  function signProof(method, url) {
    const cleanUrl = url.split('?')[0];
    const header = { typ: 'dpop+jwt', alg: 'ES256', jwk: cleanJwk };
    const payload = {
      jti: crypto.randomUUID(),
      htm: method.toUpperCase(),
      htu: cleanUrl,
      iat: Math.floor(Date.now() / 1000)
    };
    const tokenInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
    const sign = crypto.createSign('SHA256');
    sign.update(tokenInput);
    const sig = sign.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' }, 'base64url');
    return `${tokenInput}.${sig}`;
  }

  return { signProof };
}

/**
 * 1. KADEME: Doğrudan REST API + DPoP ile Paylaşım
 */
async function tryDirectApiPost(username, password, postContent) {
  console.log('⚡ [1. KADEME] NSosyal REST API (DPoP) üzerinden doğrudan paylaşım deneniyor...');
  const dpop = createDPoPClient();
  const loginUrl = `${CONFIG.apiUrl}/api/v1/auth/login`;

  // Username veya email varyasyonlarını dene
  const userCandidates = [username];
  if (username.includes('@')) {
    userCandidates.push(username.split('@')[0]);
  }

  let accessToken = null;

  for (const userCandidate of userCandidates) {
    try {
      console.log(`🔑 Giriş deneniyor (${userCandidate})...`);
      const loginRes = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'https://nsosyal.com',
          'referer': 'https://nsosyal.com/',
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'dpop': dpop.signProof('POST', loginUrl)
        },
        body: JSON.stringify({
          username: userCandidate,
          password: password
        })
      });

      const loginData = await loginRes.json().catch(() => ({}));
      if (loginData.success && loginData.data?.access_token) {
        accessToken = loginData.data.access_token;
        console.log(`✅ API Girişi başarılı! Kullanıcı: ${loginData.data.account?.username || userCandidate}`);
        break;
      }
    } catch {}
  }

  if (!accessToken) {
    throw new Error('API Giriş doğrulaması tamamlanamadı.');
  }

  const postUrl = `${CONFIG.apiUrl}/api/v1/posts`;
  const payloads = [
    { content: postContent, visibility: 'public' },
    { text: postContent, visibility: 'public' },
    { status: postContent, visibility: 'public' },
    { body: postContent, visibility: 'public' },
    { content: postContent }
  ];

  for (const bodyPayload of payloads) {
    try {
      const postRes = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'https://nsosyal.com',
          'referer': 'https://nsosyal.com/',
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'authorization': `Bearer ${accessToken}`,
          'dpop': dpop.signProof('POST', postUrl)
        },
        body: JSON.stringify(bodyPayload)
      });

      const postData = await postRes.json().catch(() => ({}));
      if (postData.success) {
        console.log('🎉 TEBRİKLER: EngelsizForum güncelleme duyurusu NSosyal API üzerinden BAŞARIYLA paylaşıldı!');
        return true;
      }
    } catch {}
  }

  throw new Error('API gönderi isteği kabul edilmedi.');
}

/**
 * 2. KADEME: Playwright Tarayıcı ile Web Arayüzünden Paylaşım
 */
async function runPlaywrightFallback(username, password, sessionCookie, postContent) {
  console.log('🌐 [2. KADEME] Playwright tarayıcı motoru başlatılıyor...');

  let chromium;
  try {
    const { chromium: extraChromium } = require('playwright-extra');
    const stealthPlugin = require('puppeteer-extra-plugin-stealth')();
    extraChromium.use(stealthPlugin);
    chromium = extraChromium;
    console.log('🛡️ Stealth koruması devrede.');
  } catch {
    chromium = require('playwright').chromium;
  }

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

  let browser;
  try {
    browser = await chromium.launch({ ...browserOptions, channel: 'chrome' });
    console.log('🚀 Resmi Google Chrome tarayıcısı başlatıldı.');
  } catch {
    browser = await chromium.launch(browserOptions);
    console.log('🚀 Standart Chromium başlatıldı.');
  }

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul'
  });

  await context.addInitScript(() => {
    delete Object.getPrototypeOf(navigator).webdriver;
  });

  // Çerez enjeksiyonu
  if (sessionCookie) {
    try {
      console.log('🍪 Tanımlı oturum çerezleri (.nsosyal.com) tarayıcıya ekleniyor...');
      const cookieList = [];
      let rawCookies = sessionCookie.trim();
      if (rawCookies.toLowerCase().startsWith('cookie:')) {
        rawCookies = rawCookies.substring(7).trim();
      }

      let detectedAccessToken = null;
      if (rawCookies.includes('=')) {
        const pairs = rawCookies.split(';');
        for (const pair of pairs) {
          const [k, ...v] = pair.trim().split('=');
          if (k && v.length > 0) {
            const name = k.trim();
            const val = v.join('=').trim();
            if (name === 'access_token') detectedAccessToken = val;
            cookieList.push({ name, value: val, domain: '.nsosyal.com', path: '/' });
          }
        }
      }
      await context.addCookies(cookieList);
      console.log(`✅ ${cookieList.length} adet çerez yüklendi.`);

      if (detectedAccessToken) {
        await context.addInitScript((tok) => {
          try {
            window.localStorage.setItem('access_token', tok);
            window.localStorage.setItem('token', tok);
          } catch (e) {}
        }, detectedAccessToken);
      }
    } catch (e) {
      console.warn('Çerez uyarısı:', e.message);
    }
  }

  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.actionTimeout);

  const artifactDir = path.join(process.cwd(), 'artifacts');
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  try {
    // Doğrudan ana akışa (/home) git
    console.log(`🔗 NSosyal ana akışına gidiliyor: ${CONFIG.homeUrl}`);
    await page.goto(CONFIG.homeUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.navigationTimeout });
    await sleep(4000);

    console.log(`📍 Mevcut URL: ${page.url()} | Başlık: "${await page.title()}"`);
    await page.screenshot({ path: path.join(artifactDir, 'step1-initial.png') }).catch(() => {});

    // Eğer /login sayfasına yönlenmişse giriş formunu doldur
    if (page.url().includes('/login')) {
      console.log('🔑 Giriş sayfasına yönlenildi, form dolduruluyor...');
      const userField = page.locator(CONFIG.selectors.usernameInputList.join(', ')).first();
      await userField.waitFor({ state: 'visible', timeout: 15000 });
      await userField.click();
      await userField.pressSequentially(username, { delay: 30 });
      await sleep(500);

      const passField = page.locator(CONFIG.selectors.passwordInputList.join(', ')).first();
      await passField.click();
      await passField.pressSequentially(password, { delay: 30 });
      await sleep(1000);

      const submitBtn = page.locator(CONFIG.selectors.loginSubmitButtonList.join(', ')).first();
      await submitBtn.click();
      console.log('🚀 Giriş butonuna tıklandı, yönlendirme bekleniyor...');
      await sleep(6000);

      if (page.url().includes('/login') || page.url().includes('/explore')) {
        await page.goto(CONFIG.homeUrl, { waitUntil: 'domcontentloaded' });
        await sleep(3000);
      }
    }

    // Eğer /explore sayfasına düşmüşse tekrar /home'a geç
    if (page.url().includes('/explore')) {
      console.log('🔄 /explore rotasından /home akışına geçiliyor...');
      await page.goto(CONFIG.homeUrl, { waitUntil: 'domcontentloaded' });
      await sleep(3000);
    }

    await page.screenshot({ path: path.join(artifactDir, 'step2-before-editor.png') }).catch(() => {});

    // 1. Adım: Editör alanını veya "Gönderi oluşturmak için..." tetikleyicisini tıkla
    console.log('✍️ Gönderi paylaşım editörü aranıyor...');
    const trigger = page.locator(CONFIG.selectors.editorTriggerList.join(', ')).first();
    const hasTrigger = await trigger.isVisible({ timeout: 6000 }).catch(() => false);

    if (hasTrigger) {
      console.log('👆 Editör tetikleyicisine tıklandı (Genişletiliyor)...');
      await trigger.click();
      await sleep(1500);
    }

    // 2. Adım: Aktif Lexical contenteditable yazım alanını bul
    const lexicalBox = page.locator(CONFIG.selectors.lexicalInputList.join(', ')).first();
    await lexicalBox.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Lexical metin editörü bulundu ve odaklanılıyor...');
    await lexicalBox.click();
    await sleep(800);

    // 3. Adım: Metni yaz
    console.log('📝 Güncelleme duyurusu editöre yazılıyor...');
    await page.keyboard.type(postContent, { delay: getRandomInt(CONFIG.typingDelayMin, CONFIG.typingDelayMax) });
    await sleep(2500);

    await page.screenshot({ path: path.join(artifactDir, 'step3-text-typed.png') }).catch(() => {});

    // 4. Adım: "Gönder" butonuna tıkla
    console.log('📤 "Gönder" butonu aranıyor...');
    const sendBtn = page.locator(CONFIG.selectors.postSubmitButtonList.join(', ')).first();
    await sendBtn.waitFor({ state: 'visible', timeout: 10000 });
    
    // Butonun disabled durumunun kalkmasını bekle
    await sleep(1500);
    console.log('🚀 Gönderi yayınlanıyor...');
    await sendBtn.click();

    // Gönderinin veritabanına kaydedilmesi için bekle
    await sleep(6000);

    await page.screenshot({ path: path.join(artifactDir, 'step4-published.png') }).catch(() => {});
    console.log('🎉 TEBRİKLER: EngelsizForum güncelleme duyurusu NSosyal web arayüzü üzerinden başarıyla paylaşıldı!');
    return true;
  } catch (err) {
    await page.screenshot({ path: path.join(artifactDir, 'nsosyal-error.png') }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
}

// =============================================================================
// ANA ÇALIŞTIRICI
// =============================================================================
async function main() {
  const username = process.env.NSOSYAL_EMAIL || process.env.NSOSYAL_USERNAME;
  const password = process.env.NSOSYAL_PASSWORD;
  const sessionCookie = process.env.NSOSYAL_SESSION_COOKIE;
  const customMessage = process.env.POST_MESSAGE;
  const deployUrl = process.env.DEPLOYMENT_URL || 'https://engelsizforum.com';

  const postContent = customMessage || generateAnnouncementText(deployUrl);

  console.log('====================================================');
  console.log('🚀 NSosyal Otomatik Güncelleme Paylaşım Modülü');
  console.log(`📊 Karakter Sayısı: ${postContent.length}`);
  console.log('====================================================');

  // 1. Kademe: Doğrudan API
  if (username && password) {
    try {
      await tryDirectApiPost(username, password, postContent);
      process.exit(0);
    } catch (apiErr) {
      console.warn('⚠️ 1. Kademe (API) uyarısı:', apiErr.message);
      console.log('🔄 2. Kademeye (Playwright Arayüz) geçiliyor...');
    }
  }

  // 2. Kademe: Playwright Arayüz
  try {
    await runPlaywrightFallback(username, password, sessionCookie, postContent);
    process.exit(0);
  } catch (browserErr) {
    console.error('❌ HATA: Her iki paylaşım yöntemi de başarısız oldu:', browserErr.message);
    process.exit(1);
  }
}

main();
