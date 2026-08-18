import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

const TARGET_FILES = [
  { path: '/og-image-v2.jpg', format: 'jpeg', mime: 'image/jpeg', width: 1200, height: 630 },
  { path: '/og-image-v2.png', format: 'png', mime: 'image/png', width: 1200, height: 630 },
  { path: '/twitter-image-v2.jpg', format: 'jpeg', mime: 'image/jpeg', width: 1200, height: 630 },
  { path: '/twitter-image-v2.png', format: 'png', mime: 'image/png', width: 1200, height: 630 },
  { path: '/og-image.jpg', format: 'jpeg', mime: 'image/jpeg', width: 1200, height: 630 },
  { path: '/og-image.png', format: 'png', mime: 'image/png', width: 1200, height: 630 },
  { path: '/banner.jpg', format: 'jpeg', mime: 'image/jpeg', width: 1200, height: 630 },
  { path: '/banner.png', format: 'png', mime: 'image/png', width: 1200, height: 630 },
  { path: '/logo.png', format: 'png', mime: 'image/png', width: 512, height: 512 },
];

function checkMagicBytes(buffer, expectedFormat) {
  if (!buffer || buffer.length < 8) return false;
  if (expectedFormat === 'jpeg') {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  if (expectedFormat === 'png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
           buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A;
  }
  return true;
}

async function verifyLocal() {
  console.log('🔍 Running Local Asset & Binary Verification...\n');
  let hasFailure = false;

  for (const item of TARGET_FILES) {
    const filePath = path.join(publicDir, item.path.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      console.error(`❌ [FAIL] Missing file: ${filePath}`);
      hasFailure = true;
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const isValidMagic = checkMagicBytes(buffer, item.format);
    if (!isValidMagic) {
      console.error(`❌ [FAIL] Corrupted magic bytes in ${item.path} (expected format: ${item.format})`);
      hasFailure = true;
      continue;
    }

    try {
      const meta = await sharp(buffer).metadata();
      if (meta.format !== item.format || meta.width !== item.width || meta.height !== item.height) {
        console.error(`❌ [FAIL] ${item.path}: got format=${meta.format} ${meta.width}x${meta.height}, expected ${item.format} ${item.width}x${item.height}`);
        hasFailure = true;
      } else {
        console.log(`✅ [OK] Local ${item.path}: ${meta.format.toUpperCase()} ${meta.width}x${meta.height} (${(buffer.length / 1024).toFixed(1)} KB) - Magic bytes valid`);
      }
    } catch (err) {
      console.error(`❌ [FAIL] Sharp decoding failed for ${item.path}:`, err.message);
      hasFailure = true;
    }
  }

  // Favicon.ico check
  const icoPath = path.join(publicDir, 'favicon.ico');
  if (fs.existsSync(icoPath)) {
    const icoBuf = fs.readFileSync(icoPath);
    const isIco = icoBuf.length > 4 && icoBuf[0] === 0 && icoBuf[1] === 0 && icoBuf[2] === 1 && icoBuf[3] === 0;
    if (isIco) {
      console.log(`✅ [OK] Local /favicon.ico: Valid Windows ICO container (${icoBuf.length} bytes)`);
    } else {
      console.error(`❌ [FAIL] /favicon.ico is not a valid ICO header container`);
      hasFailure = true;
    }
  }

  if (hasFailure) {
    console.error('\n🚨 Local asset verification failed.');
    process.exit(1);
  } else {
    console.log('\n🎉 All local binary assets verified successfully!');
  }
}

async function verifyRemote() {
  const origin = (process.env.OG_SITE_URL || 'https://www.engelsizforum.com').replace(/\/$/, '');
  console.log(`🌐 Running Remote Production Verification against: ${origin}\n`);
  let hasFailure = false;

  for (const item of TARGET_FILES.slice(0, 4)) {
    const url = `${origin}${item.path}`;
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status !== 200) {
        console.error(`❌ [FAIL] ${url} returned HTTP ${res.status} (expected 200 without redirects)`);
        hasFailure = true;
        continue;
      }

      const contentType = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (contentType !== item.mime) {
        console.error(`❌ [FAIL] ${url} Content-Type: ${contentType} (expected ${item.mime})`);
        hasFailure = true;
      }

      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      if (!checkMagicBytes(buffer, item.format)) {
        console.error(`❌ [FAIL] ${url} returned corrupted binary / invalid magic bytes`);
        hasFailure = true;
        continue;
      }

      const meta = await sharp(buffer).metadata();
      if (meta.format !== item.format || meta.width !== item.width || meta.height !== item.height) {
        console.error(`❌ [FAIL] ${url} metadata mismatch: ${meta.format} ${meta.width}x${meta.height}`);
        hasFailure = true;
      } else {
        console.log(`✅ [OK] Remote ${url}: HTTP 200, Content-Type=${contentType}, ${meta.width}x${meta.height}`);
      }
    } catch (err) {
      console.error(`❌ [FAIL] Remote check error on ${url}:`, err.message);
      hasFailure = true;
    }
  }

  // Check HTML meta tags
  try {
    const htmlRes = await fetch(`${origin}/`, { redirect: 'follow' });
    const html = await htmlRes.text();
    const checks = [
      { name: 'og:image', regex: /property=["']og:image["']\s+content=["'](https:\/\/[^"']+)["']/i },
      { name: 'og:image:type', regex: /property=["']og:image:type["']\s+content=["']image\/(jpeg|png)["']/i },
      { name: 'twitter:card', regex: /name=["']twitter:card["']\s+content=["']summary_large_image["']/i },
      { name: 'twitter:image', regex: /name=["']twitter:image["']\s+content=["'](https:\/\/[^"']+)["']/i },
    ];

    for (const check of checks) {
      if (check.regex.test(html)) {
        console.log(`✅ [OK] HTML Meta Tag: ${check.name} is present and valid`);
      } else {
        console.error(`❌ [FAIL] HTML Meta Tag missing or malformed: ${check.name}`);
        hasFailure = true;
      }
    }
  } catch (err) {
    console.error(`❌ [FAIL] Could not fetch HTML from ${origin}:`, err.message);
    hasFailure = true;
  }

  if (hasFailure) {
    console.error('\n🚨 Remote verification encountered issues.');
    process.exit(1);
  } else {
    console.log('\n🎉 Remote production verification completed successfully!');
  }
}

const isRemote = process.argv.includes('--remote');
if (isRemote) {
  verifyRemote();
} else {
  verifyLocal();
}
