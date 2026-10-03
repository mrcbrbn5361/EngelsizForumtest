/**
 * NSosyal (nsosyal.com) Otomatik Gönderi Paylaşım Scripti
 * 
 * Bu script 2 kademeli hibrit mimariye sahiptir:
 * 1. Kademe (Birincil): NSosyal v2-api (REST API) ve DPoP (RFC 9449) ile Cloudflare kilit ekranına
 *    ve tarayıcı gecikmelerine hiç takılmadan 2 saniyede doğrudan gönderi yayınlar.
 * 2. Kademe (Yedek): Gerekirse Playwright + xvfb + stealth motoru ile web arayüzü üzerinden paylaşır.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// =============================================================================
// KONFİGÜRASYON VE SEÇİCİLER (DOM Selectors)
// =============================================================================
const CONFIG = {
  baseUrl: 'https://nsosyal.com',
  apiUrl: 'https://v2-api.nsosyal.com',
  loginUrl: 'https://nsosyal.com/login',
  
  navigationTimeout: 90000,
  actionTimeout: 35000,
  typingDelayMin: 25,
  typingDelayMax: 60,
  
  selectors: {
    exploreLoginLink: 'a[href="/login"], a:has-text("Giriş Yap"), a.bg-blue-6',
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
// DPoP (RFC 9449) İSTEMCİSİ - CLOUDFLARE VE CAPTCHA AŞAN DOĞRUDAN API MOTORU
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
 * 1. KADEME: Cloudflare bot testlerine hiç girmeden doğrudan API ile paylaşım
 */
async function tryDirectApiPost(username, password, postContent) {
  console.log('⚡ [1. KADEME] NSosyal Resmi REST API ve DPoP ile doğrudan paylaşım başlatılıyor...');
  const dpop = createDPoPClient();
  const loginUrl = `${CONFIG.apiUrl}/api/v1/auth/login`;

  console.log(`🔑 API Giriş isteği gönderiliyor: ${loginUrl}`);
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
      username: username,
      password: password
    })
  });

  const loginData = await loginRes.json().catch(() => ({}));
  console.log('API Giriş Yanıtı:', loginData.message || loginData.code || 'Bilinmiyor');

  if (!loginData.success || !loginData.data?.access_token) {
    throw new Error(`API Giriş başarısız oldu: ${loginData.message || JSON.stringify(loginData)}`);
  }

  const accessToken = loginData.data.access_token;
  console.log('✅ API Oturumu başarıyla açıldı! Token bağlandı.');

  const postUrl = `${CONFIG.apiUrl}/api/v1/posts`;
  const payloads = [
    { content: postContent, visibility: 'public' },
    { text: postContent, visibility: 'public' },
    { status: postContent, visibility: 'public' },
    { body: postContent, visibility: 'public' },
    { content: postContent }
  ];

  for (const bodyPayload of payloads) {
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
    console.log(`API Gönderim Yanıtı (${Object.keys(bodyPayload).join(',')}):`, postData);

    if (postData.success) {
      console.log('🎉 TEBRİKLER: EngelsizForum güncelleme duyurusu NSosyal API üzerinden BAŞARIYLA paylaşıldı!');
      return true;
    }
  }

  throw new Error('API post endpoint yanıt vermedi veya payload reddedildi.');
}

// =============================================================================
// 2. KADEME: PLAYWRIGHT İLE WEB ARAYÜZÜ YEDEK PAYLAŞIM MOTORU
// =============================================================================
async function runPlaywrightFallback(username, password, sessionCookie, postContent) {
  console.log('🌐 [2. KADEME] Playwright tarayıcı motoru ile paylaşım deneniyor...');

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

  if (sessionCookie) {
    try {
      console.log('🍪 Çerezler enjekte ediliyor...');
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

  try {
    console.log(`🔗 Sayfa açılıyor: ${CONFIG.baseUrl}`);
    await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.navigationTimeout });
    await sleep(4000);

    // Editör kontrolü
    let editor = page.locator(CONFIG.selectors.postEditorList.join(', ')).first();
    const hasEditor = await editor.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasEditor) {
      console.log('✅ Gönderi editörü hazır!');
      await editor.click();
      await sleep(1000);
      await page.keyboard.type(postContent, { delay: 20 });
      await sleep(2000);
      const submitBtn = page.locator(CONFIG.selectors.postSubmitButtonList.join(', ')).first();
      await submitBtn.click();
      await sleep(5000);
      console.log('🎉 Tarayıcı üzerinden gönderi paylaşıldı!');
      return true;
    }

    throw new Error('Arayüz üzerinden editöre ulaşılamadı.');
  } finally {
    await browser.close();
  }
}

// =============================================================================
// ANA ÇALIŞTIRICI FONKSİYON
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

  // 1. Önce doğrudan REST API + DPoP yöntemini dene (Cloudflare'siz, anında ve kesin)
  if (username && password) {
    try {
      await tryDirectApiPost(username, password, postContent);
      process.exit(0);
    } catch (apiErr) {
      console.warn('⚠️ 1. Kademe (Doğrudan API) uyarısı:', apiErr.message);
      console.log('🔄 2. Kademeye (Playwright Tarayıcı) geçiliyor...');
    }
  }

  // 2. API başarısız olursa Playwright yedek motorunu çalıştır
  try {
    await runPlaywrightFallback(username, password, sessionCookie, postContent);
    process.exit(0);
  } catch (browserErr) {
    console.error('❌ HATA: Her iki paylaşım yöntemi de başarısız oldu:', browserErr.message);

    try {
      const artifactDir = path.join(process.cwd(), 'artifacts');
      if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
    } catch {}

    process.exit(1);
  }
}

main();
