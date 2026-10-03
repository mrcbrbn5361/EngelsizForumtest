/**
 * NSosyal (nsosyal.com) Otomatik Gönderi Paylaşım Scripti
 * 
 * 1. Kademe: NSosyal Resmi REST API (DPoP RFC 9449) ile doğrudan paylaşım.
 *    - Cloudflare / DDoS korumalarına takılmaz (v2-api.nsosyal.com doğrudan açıktır).
 *    - RFC 9449 DPoP anahtarı (ES256 + P-256) oluşturur ve 'ath' hesaplar.
 *    - Hem NSOSYAL_EMAIL/NSOSYAL_PASSWORD hem de doğrudan NSOSYAL_ACCESS_TOKEN / COOKIE destekler.
 * 
 * 2. Kademe: Playwright (Desktop 1920x1080) ile web arayüzünden Lexical editörüne bağlanarak paylaşım.
 *    - Cloudflare Turnstile / sanal ekran (xvfb) bypass mekanizması.
 *    - Doğru oturum tespiti ve insan benzeri yazım hızı.
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
  typingDelayMax: 45,
  
  selectors: {
    loginLinks: 'a[href="/login"], a:has-text("Giriş Yap"), a.bg-blue-6',
    usernameInputs: 'input[name="username"], input[placeholder*="Kullanıcı adı" i], input[placeholder*="e-posta" i], input[type="username"], input[type="text"]',
    passwordInputs: 'input[name="password"], input[type="password"], input[placeholder="••••••"]',
    loginSubmitBtns: 'button[type="submit"]:has-text("Hesabına Giriş Yap"), button[type="submit"], button:has-text("Giriş Yap")',
    
    // Gönderi editörü tetikleyicileri (Editörü açmak için tıklanabilecek alanlar)
    composerTriggers: [
      '#main-post-editor',
      '[data-text-editor-input="main-post-editor"]',
      'div[contenteditable="true"]',
      'div[data-lexical-editor="true"]',
      'button:has-text("Gönderi")',
      'button:has-text("Paylaş")',
      'button:has-text("Yaz")',
      'textarea',
      '[placeholder*="Neler" i]',
      '[placeholder*="düşün" i]',
      '[placeholder*="yaz" i]',
      '[placeholder*="Gönderi" i]'
    ],
    
    // Editör ve yazım alanı seçicileri
    editorElements: [
      'div[contenteditable="true"]',
      'div[data-lexical-editor="true"]',
      'div[role="textbox"]',
      '#main-post-editor [contenteditable="true"]',
      '[data-text-editor-input="main-post-editor"]',
      'textarea'
    ],
    
    // Gönder butonu
    sendButtons: [
      'button:has-text("Gönder")',
      'button:has(span:text-is("Gönder"))',
      'button[type="button"]:has(span:has-text("Gönder"))',
      'button[type="submit"]:has-text("Gönder")',
      'button:has-text("Paylaş")',
      'button[type="submit"]'
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
// DPoP (RFC 9449) İSTEMCİSİ
// =============================================================================
function createDPoPClient() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jwk = publicKey.export({ format: 'jwk' });
  const cleanJwk = { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y };

  function b64url(input) {
    return Buffer.from(input).toString('base64url');
  }

  function signProof(method, url, accessToken = null) {
    const cleanUrl = url.split('?')[0];
    const header = { typ: 'dpop+jwt', alg: 'ES256', jwk: cleanJwk };
    const payload = {
      jti: crypto.randomUUID(),
      htm: method.toUpperCase(),
      htu: cleanUrl,
      iat: Math.floor(Date.now() / 1000)
    };

    if (accessToken) {
      const hash = crypto.createHash('sha256').update(accessToken).digest();
      payload.ath = b64url(hash);
    }

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
async function tryDirectApiPost(username, password, explicitToken, postContent) {
  console.log('⚡ [1. KADEME] NSosyal REST API (DPoP) üzerinden doğrudan paylaşım deneniyor...');
  const dpop = createDPoPClient();
  let accessToken = explicitToken || null;

  // Eğer doğrudan bir token yoksa, API login uç noktasıyla oturum aç
  if (!accessToken && username && password) {
    const loginUrl = `${CONFIG.apiUrl}/api/v1/auth/login`;
    const userCandidates = [];
    const trimmedUser = username.trim();
    userCandidates.push(trimmedUser);
    if (trimmedUser.includes('@')) {
      userCandidates.push(trimmedUser.split('@')[0].trim());
      userCandidates.push(trimmedUser.toLowerCase());
    }
    userCandidates.push('miracbirben');

    const uniqueCandidates = [...new Set(userCandidates)];

    for (const userCandidate of uniqueCandidates) {
      try {
        console.log(`🔑 API Girişi deneniyor (Kullanıcı: ${userCandidate})...`);
        const loginProof = dpop.signProof('POST', loginUrl);
        const loginRes = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'origin': 'https://nsosyal.com',
            'referer': 'https://nsosyal.com/',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'dpop': loginProof
          },
          body: JSON.stringify({
            username: userCandidate,
            password: password.trim()
          })
        });

        const loginData = await loginRes.json().catch(() => ({}));
        console.log(`API Giriş Yanıtı (${userCandidate}):`, JSON.stringify(loginData));

        if (loginData.success && (loginData.data?.access_token || loginData.access_token || loginData.data?.token || loginData.token)) {
          accessToken = loginData.data?.access_token || loginData.access_token || loginData.data?.token || loginData.token;
          console.log(`✅ API Oturumu başarıyla açıldı!`);
          break;
        }

        // Cookie başlığından kontrol et
        const rawSetCookie = loginRes.headers.get('set-cookie') || '';
        const match = rawSetCookie.match(/access_token=([^;]+)/);
        if (match && match[1]) {
          accessToken = match[1];
          console.log(`✅ API Oturumu Set-Cookie üzerinden alındı!`);
          break;
        }
      } catch (e) {
        console.warn(`API giriş deneme hatası (${userCandidate}):`, e.message);
      }
    }
  }

  // Token geçerliliğini ve profil bilgilerini doğrula
  if (accessToken) {
    try {
      const meRes = await fetch(`${CONFIG.apiUrl}/api/v1/accounts/me`, {
        headers: {
          'authorization': `Bearer ${accessToken}`,
          'origin': 'https://nsosyal.com',
          'referer': 'https://nsosyal.com/'
        }
      });
      const meData = await meRes.json().catch(() => ({}));
      if (meData.success && meData.data) {
        console.log(`👤 Oturum Doğrulandı: @${meData.data.username || meData.data.display_name} (${meData.data.display_name || ''})`);
      }
    } catch (e) {
      console.warn('Hesap bilgisi sorgulama uyarısı:', e.message);
    }
  } else {
    throw new Error('Geçerli bir API access_token elde edilemedi.');
  }

  // Gönderiyi paylaş
  const postUrl = `${CONFIG.apiUrl}/api/v1/posts`;
  const payloads = [
    { content: postContent },
    { content: postContent, visibility: 'public' },
    { text: postContent },
    { status: postContent },
    { body: postContent }
  ];

  for (const bodyPayload of payloads) {
    try {
      const dpopProof = dpop.signProof('POST', postUrl, accessToken);
      const postRes = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'https://nsosyal.com',
          'referer': 'https://nsosyal.com/',
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'authorization': `Bearer ${accessToken}`,
          'dpop': dpopProof
        },
        body: JSON.stringify(bodyPayload)
      });

      const postData = await postRes.json().catch(() => ({}));
      console.log(`API Gönderim Yanıtı (${Object.keys(bodyPayload).join(',')}):`, JSON.stringify(postData));

      if (postData.success || postRes.status === 200 || postRes.status === 201) {
        console.log('🎉 TEBRİKLER: EngelsizForum güncelleme duyurusu NSosyal API üzerinden BAŞARIYLA paylaşıldı!');
        return true;
      }
    } catch (e) {
      console.warn('Post API deneme hatası:', e.message);
    }
  }

  throw new Error('API üzerinden gönderi oluşturulamadı.');
}

/**
 * 2. KADEME: Playwright Tarayıcı ile Web Arayüzünden Paylaşım
 */
async function runPlaywrightFallback(username, password, rawCookieStr, postContent) {
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
      '--window-size=1920,1080'
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
    viewport: { width: 1920, height: 1080 },
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul'
  });

  await context.addInitScript(() => {
    delete Object.getPrototypeOf(navigator).webdriver;
  });

  // Çerez ve Token Enjeksiyonu
  if (rawCookieStr) {
    try {
      console.log('🍪 Tanımlı oturum çerezleri (.nsosyal.com) tarayıcıya ekleniyor...');
      const cookieList = [];
      let cleaned = rawCookieStr.trim();
      if (cleaned.toLowerCase().startsWith('cookie:')) {
        cleaned = cleaned.substring(7).trim();
      }

      let detectedAccessToken = null;
      if (cleaned.includes('=')) {
        const pairs = cleaned.split(';');
        for (const pair of pairs) {
          const [k, ...v] = pair.trim().split('=');
          if (k && v.length > 0) {
            const name = k.trim();
            const val = v.join('=').trim();
            if (name === 'access_token') detectedAccessToken = val;
            
            // Hem ana alan adına hem API alt alan adına çerezleri tanımla
            cookieList.push({
              name,
              value: val,
              domain: '.nsosyal.com',
              path: '/',
              secure: true
            });
          }
        }
      } else if (cleaned.startsWith('ey')) {
        // Doğrudan JWT verilmiş
        detectedAccessToken = cleaned;
        cookieList.push({
          name: 'access_token',
          value: cleaned,
          domain: '.nsosyal.com',
          path: '/',
          secure: true
        });
      }

      if (cookieList.length > 0) {
        await context.addCookies(cookieList);
        console.log(`✅ ${cookieList.length} adet çerez yüklendi.`);
      }

      if (detectedAccessToken) {
        await context.addInitScript((tok) => {
          try {
            window.localStorage.setItem('access_token', tok);
            window.localStorage.setItem('token', tok);
          } catch (e) {}
        }, detectedAccessToken);
      }
    } catch (e) {
      console.warn('Çerez yükleme uyarısı:', e.message);
    }
  }

  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.actionTimeout);

  const artifactDir = path.join(process.cwd(), 'artifacts');
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  try {
    // 1. ADIM: Ana Akışa Git
    console.log(`🔗 NSosyal ana akışına gidiliyor: ${CONFIG.homeUrl}`);
    await page.goto(CONFIG.homeUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.navigationTimeout });
    await sleep(4000);

    let pageTitle = await page.title();
    console.log(`📍 Mevcut URL: ${page.url()} | Başlık: "${pageTitle}"`);
    await page.screenshot({ path: path.join(artifactDir, 'step1-initial.png') }).catch(() => {});

    // Cloudflare "Just a moment..." veya "Bir dakika lütfen..." ekranı kontrolü
    if (pageTitle.includes('Bir dakika') || pageTitle.includes('Just a moment') || pageTitle.includes('Cloudflare')) {
      console.log('🛡️ Cloudflare güvenlik kontrolü tespit edildi, otomatik çözülmesi bekleniyor...');
      for (let i = 0; i < 15; i++) {
        await sleep(3000);
        pageTitle = await page.title();
        console.log(`⏳ Bekleniyor (${(i + 1) * 3}s)... Mevcut başlık: "${pageTitle}"`);
        if (!pageTitle.includes('Bir dakika') && !pageTitle.includes('Just a moment')) {
          console.log('✅ Cloudflare kontrolü aşıldı!');
          break;
        }
      }
    }

    // Sayfa oturum durumunu analiz et
    const pageStatus = await page.evaluate(() => {
      const hasLoginLink = !!document.querySelector('a[href="/login"]');
      const isLoginPath = window.location.pathname.includes('/login');
      const hasEditable = !!document.querySelector('[contenteditable="true"]') || !!document.querySelector('[data-lexical-editor="true"]');
      const currentUrl = window.location.href;
      return { hasLoginLink, isLoginPath, hasEditable, currentUrl };
    });

    console.log('📊 Sayfa Durumu:', JSON.stringify(pageStatus));

    // 2. ADIM: Eğer kesinlikle oturum kapalıysa ve kullanıcı bilgileri varsa giriş yap
    if ((pageStatus.hasLoginLink || pageStatus.isLoginPath || page.url().includes('/explore')) && username && password) {
      console.log('🔑 Oturum açılması gerekiyor, giriş sayfasına yönlendiriliyor...');
      
      if (!page.url().includes('/login')) {
        const loginLink = page.locator(CONFIG.selectors.loginLinks).first();
        if (await loginLink.isVisible({ timeout: 4000 }).catch(() => false)) {
          await loginLink.click();
          await sleep(2500);
        } else {
          await page.goto(CONFIG.loginUrl, { waitUntil: 'domcontentloaded' });
          await sleep(2500);
        }
      }

      if (page.url().includes('/login')) {
        console.log('📝 Giriş bilgileri dolduruluyor...');
        const userField = page.locator(CONFIG.selectors.usernameInputs).first();
        await userField.waitFor({ state: 'visible', timeout: 15000 });
        await userField.click();
        await userField.fill('');
        await userField.pressSequentially(username.trim(), { delay: 25 });
        await sleep(500);

        const passField = page.locator(CONFIG.selectors.passwordInputs).first();
        await passField.click();
        await passField.fill('');
        await passField.pressSequentially(password.trim(), { delay: 25 });
        await sleep(800);

        const submitBtn = page.locator(CONFIG.selectors.loginSubmitBtns).first();
        await submitBtn.click();
        console.log('🚀 Giriş butonuna tıklandı, oturum açılması bekleniyor...');
        await sleep(6000);
      }

      if (!page.url().includes('/home')) {
        console.log(`🔗 Ana akışa dönülüyor: ${CONFIG.homeUrl}`);
        await page.goto(CONFIG.homeUrl, { waitUntil: 'domcontentloaded' });
        await sleep(3500);
      }
    }

    await page.screenshot({ path: path.join(artifactDir, 'step2-before-editor.png') }).catch(() => {});

    // 3. ADIM: Editör Alanını Bul ve Odaklan
    console.log('✍️ Gönderi editörü aranıyor...');

    // Sayfadaki olası tetikleyici öğeleri tıkla
    for (const triggerSelector of CONFIG.selectors.composerTriggers) {
      try {
        const trigger = page.locator(triggerSelector).first();
        if (await trigger.isVisible({ timeout: 1500 }).catch(() => false)) {
          console.log(`🎯 Editör tetikleyicisine tıklandı: ${triggerSelector}`);
          await trigger.click();
          await sleep(1000);
          break;
        }
      } catch {}
    }

    // Editörün DOM'da var olmasını bekle
    const editorSelector = CONFIG.selectors.editorElements.join(', ');
    const editorLocator = page.locator(editorSelector).first();
    await editorLocator.waitFor({ state: 'attached', timeout: 25000 });

    console.log('✅ Editör alanı aktif! Odaklanılıyor...');
    
    await page.evaluate(() => {
      const el = document.querySelector('[contenteditable="true"]') || 
                 document.querySelector('[data-lexical-editor="true"]') || 
                 document.querySelector('[role="textbox"]') || 
                 document.querySelector('textarea');
      if (el) {
        el.focus();
        el.click();
      }
    });

    await sleep(800);

    // 4. ADIM: Metni Yaz
    console.log('📝 Güncelleme metni editöre yazılıyor...');
    await page.keyboard.type(postContent, { delay: getRandomInt(CONFIG.typingDelayMin, CONFIG.typingDelayMax) });
    await sleep(2000);

    await page.screenshot({ path: path.join(artifactDir, 'step3-text-typed.png') }).catch(() => {});

    // 5. ADIM: "Gönder" Butonunu Bul ve Tıkla
    console.log('📤 "Gönder" butonu aranıyor...');
    
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sendBtn = btns.find(b => b.textContent && (b.textContent.includes('Gönder') || b.textContent.includes('Paylaş')));
      if (sendBtn) {
        sendBtn.removeAttribute('disabled');
      }
    });

    await sleep(1000);

    const sendBtn = page.locator(CONFIG.selectors.sendButtons.join(', ')).first();
    await sendBtn.waitFor({ state: 'attached', timeout: 10000 });
    
    console.log('🚀 Gönderi yayınlanıyor (Click)...');
    await sendBtn.click({ force: true });

    await sleep(6000);
    await page.screenshot({ path: path.join(artifactDir, 'step4-published.png') }).catch(() => {});
    console.log('🎉 TEBRİKLER: EngelsizForum güncelleme duyurusu NSosyal web arayüzü üzerinden başarıyla paylaşıldı!');
    return true;
  } catch (err) {
    console.error('❌ Tarayıcı akışında hata:', err.message);
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
  const sessionCookie = process.env.NSOSYAL_SESSION_COOKIE || process.env.NSOSYAL_COOKIE;
  let explicitToken = process.env.NSOSYAL_ACCESS_TOKEN || null;
  const customMessage = process.env.POST_MESSAGE;
  const deployUrl = process.env.DEPLOYMENT_URL || 'https://engelsizforum.com';

  // Eğer sessionCookie içinde access_token varsa ayıkla
  if (!explicitToken && sessionCookie) {
    const tokenMatch = sessionCookie.match(/access_token=([^;]+)/);
    if (tokenMatch && tokenMatch[1]) {
      explicitToken = tokenMatch[1].trim();
    } else if (sessionCookie.trim().startsWith('ey')) {
      explicitToken = sessionCookie.trim();
    }
  }

  const postContent = customMessage || generateAnnouncementText(deployUrl);

  console.log('====================================================');
  console.log('🚀 NSosyal Otomatik Güncelleme Paylaşım Modülü');
  console.log(`📊 Karakter Sayısı: ${postContent.length}`);
  console.log(`🔑 Kullanıcı Adı / E-posta: ${username ? username : 'Belirtilmemiş'}`);
  console.log(`🔐 Şifre: ${password ? '******' : 'Belirtilmemiş'}`);
  console.log(`🍪 Çerez / Token: ${sessionCookie || explicitToken ? 'Mevcut' : 'Belirtilmemiş'}`);
  console.log('====================================================');

  // 1. Kademe: Doğrudan REST API + RFC 9449 DPoP
  if ((username && password) || explicitToken) {
    try {
      await tryDirectApiPost(username, password, explicitToken, postContent);
      process.exit(0);
    } catch (apiErr) {
      console.warn('⚠️ 1. Kademe (API) uyarısı:', apiErr.message);
      console.log('🔄 2. Kademeye (Playwright Arayüz) geçiliyor...');
    }
  } else {
    console.log('ℹ️ API giriş parametreleri eksik, doğrudan Playwright deneniyor...');
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
