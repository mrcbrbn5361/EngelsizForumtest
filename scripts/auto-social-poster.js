/* global process, require, fetch, URL, AbortSignal */
const { execSync } = require('child_process');

/**
 * Executes a shell command and returns trimmed stdout.
 * @param {string} command
 * @returns {string}
 */
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

/**
 * Retrieves latest commit message and git diff from the repository with strict security filters.
 * @returns {{ commitMessage: string, diffContent: string }}
 */
function getGitInfo() {
  const commitMessage = runCommand('git log -1 --pretty=%B') || 'Yeni güncellemeler ve iyileştirmeler yayınlandı.';
  // Exclude lockfiles, environment files, secrets, keys, and GitHub workflows from diff to prevent sensitive data leakage
  const rawDiff = runCommand('git diff HEAD~1 HEAD -- . ":(exclude)package-lock.json" ":(exclude).github" ":(exclude).env*" ":(exclude)*config*" ":(exclude)*secret*" ":(exclude)*key*" ":(exclude)*token*"') || '';
  
  const diffContent = rawDiff.length > 12000 ? rawDiff.substring(0, 12000) + '\n... (diff sınırlandı)' : rawDiff;
  return { commitMessage, diffContent };
}

/**
 * Generates an update announcement using Google Gemini API.
 * @param {string} commitMessage
 * @param {string} diffContent
 * @param {string} apiKey
 * @returns {Promise<string>}
 */
async function generateUpdateNote(commitMessage, diffContent, apiKey) {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  const prompt = `
Sen EngelsizForum'un (https://engelsizforum.com) kurucusu ve geliştiricisisin. EngelsizForum, engelli bireyler için tam erişilebilir, bariyersiz ve bağımsız bir topluluk platformudur.

Aşağıda verilen son Git commit mesajını ve kod değişikliklerini (git diff) incele. LinkedIn ve sosyal medya takipçilerin için yapay zeka tarafından yazıldığı HİÇBİR ŞEKİLDE ANLAŞILMAYAN, tamamen içten, samimi, insan diliyle yazılmış, pes etmeyen bir emek ve mücadele ruhu taşıyan Türkçe bir paylaşım metni hazırla.

YAZIM TARZI VE USLUP KURALLARI (ÇOK KRİTİK):
1. KESİNLİKLE yapay zeka veya reklam/ajans dili KULLANMA. ("Heyecanla duyuruyoruz!", "Harika yenilikler!", "Güçlü adımlarla ilerliyoruz!", "Sizlere sunmaktan gurur duyuyoruz!" gibi yapay zeka kalıpları ve robotik pazarlama cümleleri KESİNLİKLE YASAKTIR).
2. Tıpkı kendi sosyal medya hesabında içini döken, gece gündüz emek vererek engelleri kaldırmaya çalışan gerçek bir geliştiricinin/kurucunun samimiyetiyle yaz.
3. İçten, doğal, doğrudan ve insan dili kullan. Kendi emeğini, erişilebilirlik için verilen mücadeleyi ve bu güncellemede neyi neden çözdüğünü samimiyetle anlat.
4. Yapay zeka gibi duran abartılı emoji dizileri kullanma. Sadece gerekirse 1-2 çok doğal simge veya tamamen emojisiz düz insan metni tercih et.
5. Soğuk teknik kod maddeleri yerine; yapılan erişilebilirlik, ekran okuyucu (screen reader) veya arayüz düzeltmelerini "Bugün şuna odaklandım...", "EngelsizForum'da şu engeli aşmak için..." gibi doğal bir dille aktar.
6. KESİNLİKLE hiçbir API Key, Secret Token, şifre, veritabanı adresi veya hassas sistem bilgisini paylaşıma ekleme.
7. Paylaşımın sonuna doğal bir şekilde platform linkini (https://engelsizforum.com) ekle.

[COMMIT MESAJI]:
${commitMessage}

[KOD DEĞİŞİKLİKLERİ (GIT DIFF)]:
${diffContent || 'Kod güncellemesi mevcut.'}
`;

  let lastError = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`Gemini API (${model}) isteği başarısız (${response.status}): ${errorText}`);
        continue;
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        return generatedText.trim();
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Gemini API yanıt üretemedi.');
}

/**
 * Ensures generated text strictly respects the 10,000 character upper limit.
 * @param {string} text
 * @param {number} maxLimit
 * @returns {string}
 */
function sanitizeAndTruncateText(text, maxLimit = 9900) {
  if (text.length <= maxLimit) {
    return text;
  }

  const truncated = text.substring(0, maxLimit - 100);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  const safeText = lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated;

  return `${safeText}\n\n[Devamı için platformumuzu ziyaret edin]\n\n🌐 https://engelsizforum.com\n\n#EngelsizForum #A11y`;
}

/**
 * Sends the generated update text to NSosyal / target social media REST API.
 * Handles automatic endpoint resolution (Mastodon, Misskey, or Custom REST).
 * @param {string} content
 * @param {string} rawApiUrl
 * @param {string} bearerToken
 * @returns {Promise<any>}
 */
async function sendToNsosyal(content, rawApiUrl, bearerToken) {
  const cleanUrl = rawApiUrl.trim().replace(/\/+$/, '');
  
  // Extract base origin if user passed a full web page URL
  let baseOrigin = cleanUrl;
  try {
    const parsed = new URL(cleanUrl);
    baseOrigin = parsed.origin;
  } catch {
    baseOrigin = cleanUrl;
  }

  // Define candidate API endpoints to try
  const candidates = [];

  // If user provided a specific endpoint ending with a recognized path, try it first
  if (cleanUrl.endsWith('/api/v1/statuses') || cleanUrl.endsWith('/api/notes/create') || cleanUrl.endsWith('/api/posts')) {
    candidates.push({
      url: cleanUrl,
      type: cleanUrl.includes('/notes/create') ? 'misskey' : 'mastodon',
    });
  } else {
    // 1. Mastodon API (Default Fediverse Standard used by NextSosyal/NSosyal Mastodon)
    candidates.push({
      url: `${baseOrigin}/api/v1/statuses`,
      type: 'mastodon',
    });
    // 2. Misskey / Firefish API
    candidates.push({
      url: `${baseOrigin}/api/notes/create`,
      type: 'misskey',
    });
    // 3. Custom REST API
    candidates.push({
      url: `${baseOrigin}/api/posts`,
      type: 'custom',
    });
    // 4. Raw provided URL as fallback
    if (cleanUrl !== baseOrigin && !candidates.some(c => c.url === cleanUrl)) {
      candidates.push({
        url: cleanUrl,
        type: 'mastodon',
      });
    }
  }

  let lastError = null;

  for (const candidate of candidates) {
    try {
      let bodyData = {};
      const headers = { 'Content-Type': 'application/json' };

      if (candidate.type === 'misskey') {
        bodyData = {
          i: bearerToken,
          text: content,
          visibility: 'public',
        };
      } else if (candidate.type === 'custom') {
        headers['Authorization'] = `Bearer ${bearerToken}`;
        bodyData = {
          content: content,
          text: content,
          status: content,
        };
      } else {
        // Mastodon standard
        headers['Authorization'] = `Bearer ${bearerToken}`;
        bodyData = {
          status: content,
          visibility: 'public',
        };
      }

      const response = await fetch(candidate.url, {
        method: 'POST',
        headers,
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify(bodyData),
      });

      const responseText = await response.text();

      // Check if response is valid JSON and HTTP OK
      if (response.ok && !responseText.trim().startsWith('<!DOCTYPE') && !responseText.trim().startsWith('<html')) {
        process.stdout.write(`BAŞARILI: İletişim sağlandı -> ${candidate.url}\n`);
        try {
          return JSON.parse(responseText);
        } catch {
          return { raw: responseText };
        }
      }

      // If HTML page returned (404/page not found), record error and try next candidate endpoint
      const isHtml = responseText.includes('<!DOCTYPE') || responseText.includes('<html') || responseText.includes('bulunamadı');
      lastError = `Endpoint: ${candidate.url} | HTTP: ${response.status} | Yanıt: ${isHtml ? 'HTML Sayfası (404 / Sayfa Bulunamadı)' : responseText.substring(0, 150)}`;
    } catch (err) {
      lastError = `Endpoint: ${candidate.url} | Hata: ${err.message}`;
    }
  }

  // If all candidate endpoints failed, print clear diagnostic guide
  throw new Error(
    `NSosyal API Bağlantı Hatası!\n` +
    `Gönderim yapılan adres bir API uç noktası yerine web frontend sayfası döndürdü ("Sayfa Bulunamadı").\n\n` +
    `Son Deneme Detayı: ${lastError}\n\n` +
    `ÇÖZÜM:\n` +
    `1. GitHub Repository -> Settings -> Secrets and variables -> Actions sekmesini açın.\n` +
    `2. NSOSYAL_API_URL değişkenini kontrol edin:\n` +
    `   - Eğer NSosyal Mastodon tabanlı ise: https://domain.com/api/v1/statuses\n` +
    `   - Eğer NSosyal Misskey/Firefish tabanlı ise: https://domain.com/api/notes/create\n` +
    `   - Eğer Özel REST API ise: https://domain.com/api/posts\n` +
    `3. NSOSYAL_BEARER_TOKEN değişkeninizin geçerli bir API Access Token olduğundan emin olun.`
  );
}

/**
 * Sends the generated update text to LinkedIn using LinkedIn REST API.
 * Supports both ugcPosts and REST posts API endpoints for compatibility.
 * @param {string} content
 * @param {string} accessToken
 * @param {string} personUrn - e.g. "urn:li:person:xxxx" or "urn:li:organization:xxxx" or "xxxx"
 * @returns {Promise<any>}
 */
async function sendToLinkedin(content, accessToken, personUrn) {
  if (!accessToken) {
    process.stdout.write('ℹ️ LINKEDIN_ACCESS_TOKEN bulunamadığı için LinkedIn paylaşım adımı atlandı.\n');
    return;
  }

  process.stdout.write('=== LinkedIn Gönderisi Hazırlanıyor ve Gönderiliyor ===\n');

  // Format URN if user provided just the ID
  let formattedUrn = personUrn ? personUrn.trim() : '';
  if (formattedUrn && !formattedUrn.startsWith('urn:li:')) {
    formattedUrn = `urn:li:person:${formattedUrn}`;
  }

  // Fallback URN fetch if personUrn is not provided
  if (!formattedUrn) {
    try {
      const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(15000)
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.sub) {
          formattedUrn = `urn:li:person:${userData.sub}`;
          process.stdout.write(`✅ LinkedIn Kullanıcı Kimliği (URN) Otomatik Bulundu: ${formattedUrn}\n`);
        }
      }
    } catch {
      // Ignore userinfo failure
    }
  }

  if (!formattedUrn) {
    throw new Error('LinkedIn Person URN belirlenemedi. Lütfen GitHub Secret içerisine LINKEDIN_PERSON_URN ekleyin (Örn: urn:li:person:ABC123XYZ).');
  }

  // 1. Attempt via ugcPosts API
  try {
    const payload = {
      author: formattedUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      process.stdout.write('🎉 BAŞARILI: EngelsizForum Türkçe güncelleme notu LinkedIn üzerinde yayınlandı!\n');
      return data;
    }

    const errText = await response.text();
    process.stdout.write(`ℹ️ ugcPosts ucu yanıtı (${response.status}): ${errText.substring(0, 150)}\n`);
  } catch (err) {
    process.stdout.write(`ℹ️ ugcPosts denemesi: ${err.message}\n`);
  }

  // 2. Attempt via REST Posts API
  const restPayload = {
    author: formattedUrn,
    commentary: content,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    lifecycleState: 'PUBLISHED'
  };

  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202401',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify(restPayload)
  });

  if (response.ok) {
    process.stdout.write('🎉 BAŞARILI: EngelsizForum Türkçe güncelleme notu LinkedIn üzerinde yayınlandı!\n');
    return { status: 'success' };
  }

  const errText = await response.text();
  throw new Error(`LinkedIn API Paylaşım Hatası (HTTP ${response.status}): ${errText}`);
}

/**
 * Sends the generated update text to Make.com Webhook which posts to LinkedIn automatically and for FREE.
 * @param {string} content
 * @param {string} webhookUrl
 * @param {string} commitMessage
 * @returns {Promise<any>}
 */
async function sendToMakeWebhook(content, webhookUrl, commitMessage) {
  if (!webhookUrl) {
    process.stdout.write('ℹ️ MAKE_WEBHOOK_URL bulunamadı, Make.com Webhook gönderimi atlandı.\n');
    return;
  }

  process.stdout.write('=== Make.com Webhook Üzerinden LinkedIn Gönderisi Tetikleniyor ===\n');

  const payload = {
    text: content,
    message: content,
    project: 'EngelsizForum',
    commit: commitMessage || '',
    timestamp: new Date().toISOString()
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    process.stdout.write('🎉 BAŞARILI: Make.com Webhook tetiklendi! LinkedIn gönderiniz Make senaryosu üzerinden ücretsiz ve otomatik yayınlanacak.\n');
    return { status: 'success' };
  }

  const errText = await response.text();
  throw new Error(`Make Webhook Hatası (HTTP ${response.status}): ${errText}`);
}

/**
 * Main execution function for auto social posting pipeline.
 * @returns {Promise<void>}
 */
async function main() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
  const linkedinAccessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const linkedinPersonUrn = process.env.LINKEDIN_PERSON_URN;
  const nsosyalApiUrl = process.env.NSOSYAL_API_URL;
  const nsosyalBearerToken = process.env.NSOSYAL_BEARER_TOKEN;

  if (!geminiApiKey) {
    process.stdout.write('⚠️ UYARI: GEMINI_API_KEY ortam değişkeni (GitHub Secret) bulunamadı.\n');
    process.stdout.write('Otomatik paylaşımın çalışması için GitHub Reposundaki Settings -> Secrets and variables -> Actions bölümüne GEMINI_API_KEY ekleyin.\n');
    process.stdout.write('Adım atlanıyor...\n');
    process.exit(0);
  }

  try {
    const { commitMessage, diffContent } = getGitInfo();
    const rawNote = await generateUpdateNote(commitMessage, diffContent, geminiApiKey);
    const finalNote = sanitizeAndTruncateText(rawNote, 9900);

    // 1. Post to LinkedIn via Make.com Webhook (Ücretsiz & Kolay Yol)
    if (makeWebhookUrl) {
      try {
        await sendToMakeWebhook(finalNote, makeWebhookUrl, commitMessage);
      } catch (makeErr) {
        process.stderr.write(`⚠️ Make.com Webhook Uyarısı: ${makeErr.message}\n`);
      }
    } else if (linkedinAccessToken) {
      // Direct LinkedIn API fallback
      try {
        await sendToLinkedin(finalNote, linkedinAccessToken, linkedinPersonUrn);
      } catch (linkedinErr) {
        process.stderr.write(`⚠️ LinkedIn Direct API Uyarısı: ${linkedinErr.message}\n`);
      }
    } else {
      process.stdout.write('ℹ️ MAKE_WEBHOOK_URL veya LINKEDIN_ACCESS_TOKEN tanımlanmadığı için LinkedIn paylaşım adımı atlandı.\n');
    }

    // 2. Post to NSosyal (Opsiyonel)
    if (nsosyalApiUrl && nsosyalBearerToken) {
      try {
        await sendToNsosyal(finalNote, nsosyalApiUrl, nsosyalBearerToken);
        process.stdout.write('BAŞARILI: EngelsizForum güncelleme notu NSosyal platformunda başarıyla yayınlandı.\n');
      } catch (nsosyalErr) {
        process.stderr.write(`⚠️ NSosyal Uyarısı: ${nsosyalErr.message}\n`);
      }
    }
  } catch (error) {
    process.stderr.write(`HATA: Otomasyon çalışırken bir sorun oluştu:\n${error.message}\n`);
    process.exit(1);
  }
}

main();
