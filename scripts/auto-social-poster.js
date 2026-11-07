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
 * Returns current timestamp formatted according to Turkey Time (TSİ / Europe/Istanbul UTC+3).
 * @returns {{ date: string, dateLong: string, time: string, shortTime: string, fullTurkeyTime: string, timeZone: string, offset: string }}
 */
function getTurkeyTimeInfo() {
  const now = new Date();
  
  const dateStr = now.toLocaleDateString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const dateLongStr = now.toLocaleDateString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const timeStr = now.toLocaleTimeString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const shortTimeStr = now.toLocaleTimeString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const turkeyTimestamp = `${dateStr} ${timeStr} (TSİ - Türkiye Saati)`;

  return {
    date: dateStr,
    dateLong: dateLongStr,
    time: timeStr,
    shortTime: shortTimeStr,
    fullTurkeyTime: turkeyTimestamp,
    timeZone: 'Europe/Istanbul',
    offset: '+03:00'
  };
}

/**
 * Generates an update announcement using Google Gemini API.
 * @param {string} commitMessage
 * @param {string} diffContent
 * @param {string} apiKey
 * @returns {Promise<string>}
 */
async function generateUpdateNote(commitMessage, diffContent, apiKey) {
  // Use active and available models
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.0-flash-exp'];
  const turkeyTime = getTurkeyTimeInfo();

  const prompt = `
Sen EngelsizForum'un (https://engelsizforum.com) kurucusu ve geliştiricisisin. EngelsizForum, engelli bireyler için tam erişilebilir, bariyersiz ve bağımsız bir topluluk platformudur.

[GÜNCEL TARİH VE TÜRKİYE SAATİ (TSİ / UTC+3)]:
Tarih: ${turkeyTime.dateLong} (${turkeyTime.date})
Saat: ${turkeyTime.shortTime} (Türkiye Saati - TSİ)

Aşağıda verilen son Git commit mesajını ve kod değişikliklerini (git diff) incele. LinkedIn ve sosyal medya takipçilerin için yapay zeka tarafından yazıldığı HİÇBİR ŞEKİLDE ANLAŞILMAYAN, tamamen içten, samimi, insan diliyle yazılmış, pes etmeyen bir emek ve mücadele ruhu taşıyan Türkçe bir paylaşım metni hazırla.

YAZIM TARZI VE USLUP KURALLARI (ÇOK KRİTİK):
1. ZAMAN VE SAAT: Zamana atıfta bulunacaksan ("Bugün", "Bu akşam", "Saat ... sularında" vb.) KESİNLİKLE yukarıda verilen Türkiye Saatini (TSİ) esas al.
2. KESİNLİKLE yapay zeka veya reklam/ajans dili KULLANMA. ("Heyecanla duyuruyoruz!", "Harika yenilikler!", "Güçlü adımlarla ilerliyoruz!", "Sizlere sunmaktan gurur duyuyoruz!" gibi yapay zeka kalıpları ve robotik pazarlama cümleleri KESİNLİKLE YASAKTIR).
3. Tıpkı kendi sosyal medya hesabında içini döken, gece gündüz emek vererek engelleri kaldırmaya çalışan gerçek bir geliştiricinin/kurucunun samimiyetiyle yaz.
4. İçten, doğal, doğrudan ve insan dili kullan. Kendi emeğini, erişilebilirlik için verilen mücadeleyi ve bu güncellemede neyi neden çözdüğünü samimiyetle anlat.
5. Yapay zeka gibi duran abartılı emoji dizileri kullanma. Sadece gerekirse 1-2 çok doğal simge veya tamamen emojisiz düz insan metni tercih et.
6. Soğuk teknik kod maddeleri yerine; yapılan erişilebilirlik, ekran okuyucu (screen reader) veya arayüz düzeltmelerini "Bugün şuna odaklandım...", "EngelsizForum'da şu engeli aşmak için..." gibi doğal bir dille aktar.
7. KESİNLİKLE hiçbir API Key, Secret Token, şifre, veritabanı adresi veya hassas sistem bilgisini paylaşıma ekleme.
8. Paylaşımın sonuna doğal bir şekilde platform linkini (https://engelsizforum.com) ekle.

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
async function sendToMakeWebhook(content, webhookUrl, commitMessage, imageUrl) {
  if (!webhookUrl) {
    process.stdout.write('ℹ️ MAKE_WEBHOOK_URL bulunamadı, Make.com Webhook gönderimi atlandı.\n');
    return;
  }

  const turkeyTime = getTurkeyTimeInfo();
  process.stdout.write(`=== Make.com Webhook Üzerinden LinkedIn Gönderisi Tetikleniyor [${turkeyTime.fullTurkeyTime}] ===\n`);

  const payload = {
    text: content,
    message: content,
    project: 'EngelsizForum',
    commit: commitMessage || '',
    turkey_time: turkeyTime.fullTurkeyTime,
    turkey_date: turkeyTime.dateLong,
    turkey_hour: turkeyTime.time,
    date: turkeyTime.date,
    time: turkeyTime.shortTime,
    timezone: 'Europe/Istanbul',
    timestamp: new Date().toISOString(),
    timestamp_tr: `${turkeyTime.date} ${turkeyTime.time}`,
    image_url: imageUrl || ''
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
    process.stdout.write(`🎉 BAŞARILI: Make.com Webhook tetiklendi! LinkedIn gönderiniz Türkiye Saati (${turkeyTime.fullTurkeyTime}) ile Make senaryosu üzerinden yayınlanacak.\n`);
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
  const instagramMakeWebhookUrl = process.env.INSTAGRAM_MAKE_WEBHOOK_URL;
  const githubSha = process.env.GITHUB_SHA || '';
  const linkedinAccessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const linkedinPersonUrn = process.env.LINKEDIN_PERSON_URN;

  if (!geminiApiKey) {
    process.stdout.write('⚠️ UYARI: GEMINI_API_KEY ortam değişkeni (GitHub Secret) bulunamadı.\n');
    process.stdout.write('Otomatik paylaşımın çalışması için GitHub Reposundaki Settings -> Secrets and variables -> Actions bölümüne GEMINI_API_KEY ekleyin.\n');
    process.stdout.write('Adım atlanıyor...\n');
    process.exit(0);
  }

  try {
    const turkeyTime = getTurkeyTimeInfo();
    process.stdout.write(`🕒 Otomasyon Çalıştırılıyor: ${turkeyTime.fullTurkeyTime}\n`);
    const { commitMessage, diffContent } = getGitInfo();
    const rawNote = await generateUpdateNote(commitMessage, diffContent, geminiApiKey);
    const finalNote = sanitizeAndTruncateText(rawNote, 9900);

    // 1. Post to LinkedIn via Make.com Webhook (Ücretsiz & Kolay Yol)
    if (makeWebhookUrl) {
      try {
        await sendToMakeWebhook(finalNote, makeWebhookUrl, commitMessage);
      } catch (makeErr) {
        process.stderr.write(`❌ Make.com Webhook Hatası: ${makeErr.message}\n`);
      }
    } else if (linkedinAccessToken) {
      // Direct LinkedIn API fallback
      try {
        await sendToLinkedin(finalNote, linkedinAccessToken, linkedinPersonUrn);
      } catch (linkedinErr) {
        process.stderr.write(`❌ LinkedIn Direct API Hatası: ${linkedinErr.message}\n`);
      }
    } else {
      process.stdout.write('ℹ️ MAKE_WEBHOOK_URL veya LINKEDIN_ACCESS_TOKEN tanımlanmadığı için LinkedIn paylaşım adımı atlandı.\n');
    }

    // 2. Instagram için ayrı Make.com Webhook
    if (instagramMakeWebhookUrl) {
      try {
        const imageUrl = `https://engelsizforum.miracdeveloper.com.tr/api/instagram/card?title=${encodeURIComponent(commitMessage)}&sha=${encodeURIComponent(githubSha)}`;
        await sendToMakeWebhook(finalNote, instagramMakeWebhookUrl, commitMessage, imageUrl);
        process.stdout.write('🎉 BAŞARILI: Instagram Make.com Webhook tetiklendi.\n');
      } catch (instagramErr) {
        process.stderr.write(`❌ Instagram Make Webhook Hatası: ${instagramErr.message}\n`);
      }
    }
  } catch (error) {
    process.stderr.write(`HATA: Otomasyon çalışırken bir sorun oluştu:\n${error.message}\n`);
    process.exit(1);
  }
}

main();
