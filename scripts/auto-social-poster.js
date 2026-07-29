/* global process, require, fetch, URL */
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
 * Retrieves latest commit message and git diff from the repository.
 * @returns {{ commitMessage: string, diffContent: string }}
 */
function getGitInfo() {
  const commitMessage = runCommand('git log -1 --pretty=%B') || 'Yeni güncellemeler ve iyileştirmeler yayınlandı.';
  const rawDiff = runCommand('git diff HEAD~1 HEAD -- . ":(exclude)package-lock.json" ":(exclude).github"') || '';
  
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
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
Sen EngelsizForum (https://engelsizforum.com) projesinin resmi dijital temsilcisisin. EngelsizForum, web erişilebilirliği (A11y) ve topluluk etkileşimini ön planda tutan modern bir sosyal platformdur.

Aşağıda verilen son Git commit mesajını ve kod değişikliklerini (git diff) incele. EngelsizForum kullanıcıları ve takipçileri için profesyonel, ilgi çekici, anlaşılır ve detaylı bir güncelleme duyurusu metni hazırla.

Kriterler:
1. Türkçe dilinde, samimi ama profesyonel bir üslup kullan.
2. Güncellemenin getirdiği yenilikleri, erişilebilirlik (screen reader / ekran okuyucu dostu) geliştirmelerini ve teknik performans artışlarını maddeler halinde açıkla.
3. Uygun emoji kullanımı ile okunabilirliği artır.
4. Metnin sonuna resmi web sitesi bağlantısını (https://engelsizforum.com) ve #EngelsizForum #Erişilebilirlik #A11y #WebDev etiketlerini ekle.
5. Sadece paylaşılacak duyuru metnini çıktı olarak ver, başlık veya tırnak işareti ekleme.

[COMMIT MESAJI]:
${commitMessage}

[KOD DEĞİŞİKLİKLERİ (GIT DIFF)]:
${diffContent || 'Kod güncellemesi mevcut.'}
`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API isteği başarısız (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error('Gemini API yanıtı beklenilen formatta metin içermiyor.');
  }

  return generatedText.trim();
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
 * Main execution function for auto social posting pipeline.
 * @returns {Promise<void>}
 */
async function main() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
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

    // Save generated update text to .tiktok_update.txt
    const fs = require('fs');
    fs.writeFileSync('.tiktok_update.txt', finalNote, 'utf8');
    process.stdout.write('✅ Güncelleme notu üretildi ve .tiktok_update.txt dosyasına yazıldı.\n');

    if (nsosyalApiUrl && nsosyalBearerToken) {
      await sendToNsosyal(finalNote, nsosyalApiUrl, nsosyalBearerToken);
      process.stdout.write('BAŞARILI: EngelsizForum güncelleme notu NSosyal platformunda başarıyla yayınlandı.\n');
    } else {
      process.stdout.write('ℹ️ NSOSYAL_API_URL veya NSOSYAL_BEARER_TOKEN tanımlanmadığı için NSosyal paylaşım adımı atlandı.\n');
    }
  } catch (error) {
    process.stderr.write(`HATA: Otomasyon çalışırken bir sorun oluştu:\n${error.message}\n`);
    process.exit(1);
  }
}

main();
