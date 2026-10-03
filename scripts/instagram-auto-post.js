/* global process, fetch */
const fs = require('node:fs');
const path = require('node:path');

const GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || 'v24.0';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const IG_USER_ID = process.env.INSTAGRAM_USER_ID;
const BASE_URL = (process.env.ENGELSIZFORUM_URL || 'https://engelsizforum.com').replace(/\/$/, '');
const STATE_FILE = path.join(process.cwd(), '.instagram-state.json');

function required(name, value) {
  if (!value) throw new Error(`${name} GitHub Secret eksik.`);
  return value;
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { lastSha: '', published: {} };
  }
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

async function graph(pathname, body) {
  const response = await fetch(`https://graph.instagram.com/${GRAPH_VERSION}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
    signal: AbortSignal.timeout(30000),
  });

  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!response.ok) throw new Error(`Instagram API ${response.status}: ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  required('INSTAGRAM_ACCESS_TOKEN', ACCESS_TOKEN);
  required('INSTAGRAM_USER_ID', IG_USER_ID);

  const sha = process.env.GITHUB_SHA || '';
  const shortSha = sha.slice(0, 7);
  const message = process.env.GITHUB_COMMIT_MESSAGE || 'Yeni güncelleme yayınlandı.';
  const title = message.split('\n')[0].replace(/^\s*[^a-zA-Z0-9ÇĞİÖŞÜçğıöşü]+\s*/, '').trim() || 'Yeni güncelleme yayınlandı';

  const state = readState();
  if (sha && state.published?.[sha]) {
    console.log(`Bu commit daha önce yayınlanmış: ${sha}`);
    return;
  }

  const imageUrl = `${BASE_URL}/api/instagram/card?title=${encodeURIComponent(title)}&repo=${encodeURIComponent(process.env.GITHUB_REPOSITORY || 'EngelsizForum')}&sha=${encodeURIComponent(shortSha)}`;
  const caption = `EngelsizForum'da yeni bir güncelleme yayınlandı.\n\n${title}\n\nDetaylar: ${BASE_URL}\n\n#EngelsizForum #Erişilebilirlik #EngelsizYaşam #ErişilebilirTeknoloji`;

  console.log(`Görsel: ${imageUrl}`);
  console.log(`Başlık: ${title}`);

  const container = await graph(`/${IG_USER_ID}/media`, {
    image_url: imageUrl,
    caption,
    access_token: ACCESS_TOKEN,
  });

  if (!container.id) throw new Error(`Instagram media container oluşturulamadı: ${JSON.stringify(container)}`);

  let published = false;
  let lastError = '';

  for (let attempt = 1; attempt <= 8; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, attempt === 1 ? 5000 : 4000));
    try {
      const result = await graph(`/${IG_USER_ID}/media_publish`, {
        creation_id: container.id,
        access_token: ACCESS_TOKEN,
      });
      console.log(`Instagram gönderisi yayınlandı: ${JSON.stringify(result)}`);
      published = true;
      break;
    } catch (error) {
      lastError = error.message;
      console.log(`Yayınlama denemesi ${attempt}/8 başarısız: ${lastError}`);
    }
  }

  if (!published) throw new Error(`Instagram gönderisi yayınlanamadı. Son hata: ${lastError}`);

  state.lastSha = sha;
  state.published = state.published || {};
  state.published[sha] = { containerId: container.id, title, publishedAt: new Date().toISOString() };

  const keys = Object.keys(state.published);
  for (const key of keys.slice(0, Math.max(0, keys.length - 50))) delete state.published[key];
  writeState(state);
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
