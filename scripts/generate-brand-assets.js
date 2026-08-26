/* eslint-disable */
const path = require('path');
const sharp = require('sharp');

// 1. Icon SVG (512x512)
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0F172A" />
      <stop offset="0.5" stop-color="#0B0F19" />
      <stop offset="1" stop-color="#030712" />
    </linearGradient>
    <linearGradient id="sky" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
      <stop stop-color="#38BDF8" />
      <stop offset="0.6" stop-color="#0284C7" />
      <stop offset="1" stop-color="#2563EB" />
    </linearGradient>
    <linearGradient id="spark" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF" />
      <stop offset="0.4" stop-color="#38BDF8" />
      <stop offset="1" stop-color="#10B981" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100" height="100" rx="26" fill="url(#bg)" />
  <rect width="98" height="98" x="1" y="1" rx="25" fill="none" stroke="url(#sky)" stroke-width="1.5" stroke-opacity="0.5" />

  <!-- Ambient Circle Glow -->
  <circle cx="50" cy="50" r="28" fill="#0284C7" fill-opacity="0.25" />

  <!-- Head / Beacon -->
  <circle cx="50" cy="22" r="8" fill="url(#spark)" />

  <!-- Arms / Upper Wings -->
  <path d="M 20 40 C 32 30, 68 30, 80 40 C 83 42.5, 80 46.5, 75 45.5 C 62 40, 38 40, 25 45.5 C 20 46.5, 17 42.5, 20 40 Z" fill="url(#sky)" />

  <!-- Middle Bar -->
  <path d="M 30 53 L 62 53 C 65 53, 65 58, 62 58 L 30 58 C 27 58, 27 53, 30 53 Z" fill="url(#sky)" />
  <circle cx="68" cy="55.5" r="3.5" fill="#10B981" />

  <!-- Base Spine Curve -->
  <path d="M 23 36 L 23 72 C 23 78, 29 81, 38 80 L 76 76 C 80 75.5, 80 70.5, 75 71 L 33 75 C 29.5 75, 28.5 73, 28.5 69 L 28.5 36 C 28.5 33, 23 33, 23 36 Z" fill="url(#sky)" />
</svg>
`;

// 2. Banner / OG Image SVG (1200x630)
const bannerSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="0%" r="90%">
      <stop offset="0%" stop-color="#0B1528" />
      <stop offset="70%" stop-color="#090A0F" />
      <stop offset="100%" stop-color="#030712" />
    </radialGradient>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Grid overlay -->
  <path d="M0 100 H1200 M0 200 H1200 M0 300 H1200 M0 400 H1200 M0 500 H1200 M0 600 H1200" stroke="#1E293B" stroke-opacity="0.3" stroke-width="1" />
  <path d="M200 0 V630 M400 0 V630 M600 0 V630 M800 0 V630 M1000 0 V630" stroke="#1E293B" stroke-opacity="0.3" stroke-width="1" />

  <!-- Top Pill Tag -->
  <g transform="translate(380, 70)">
    <rect width="440" height="42" rx="21" fill="#0B192E" stroke="#38BDF8" stroke-width="1.5" stroke-opacity="0.4" />
    <text x="220" y="27" fill="#38BDF8" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing="2" text-anchor="middle">♿ TAM ERİŞİLEBİLİR TOPLULUK PLATFORMU</text>
  </g>

  <!-- Main Logo Mark & Title -->
  <g transform="translate(280, 160)">
    <!-- Logo Emblem (100x100) -->
    <rect width="110" height="110" rx="28" fill="#0F172A" stroke="#38BDF8" stroke-width="2" stroke-opacity="0.6" />
    <circle cx="55" cy="55" r="35" fill="#0284C7" fill-opacity="0.2" />

    <!-- Head -->
    <circle cx="55" cy="27" r="8" fill="#38BDF8" />
    <!-- Arms -->
    <path d="M 23 46 C 36 35, 74 35, 87 46 C 90 48.5, 87 52.5, 82 51.5 C 69 46, 43 46, 28 51.5 C 23 52.5, 20 48.5, 23 46 Z" fill="#38BDF8" />
    <!-- Mid -->
    <path d="M 33 60 L 68 60 C 71 60, 71 65, 68 65 L 33 65 C 30 65, 30 60, 33 60 Z" fill="#0284C7" />
    <circle cx="75" cy="62.5" r="4" fill="#10B981" />
    <!-- Base -->
    <path d="M 26 42 L 26 81 C 26 87, 32 90, 42 89 L 83 85 C 87 84.5, 87 79.5, 82 80 L 37 84 C 33 84, 32 82, 32 78 L 32 42 C 32 39, 26 39, 26 42 Z" fill="#0284C7" />

    <!-- Text -->
    <text x="140" y="75" fill="#FFFFFF" font-family="sans-serif" font-size="68" font-weight="900" letter-spacing="-1">ENGELSİZ<tspan fill="#38BDF8">FORUM</tspan></text>
  </g>

  <!-- Description -->
  <text x="600" y="340" fill="#94A3B8" font-family="sans-serif" font-size="22" font-weight="500" text-anchor="middle">
    Engelli bireyler için %100 erişilebilir, yapay zeka destekli topluluk ve mevzuat danışma platformu.
  </text>
  <text x="600" y="375" fill="#64748B" font-family="sans-serif" font-size="19" font-weight="500" text-anchor="middle">
    Balthazard, ÖTV 2026, Erken Emeklilik Robotu ve WebMCP Ajan Ekosistemi ile bariyersiz bilgi paylaşımı.
  </text>

  <!-- Feature Badges -->
  <g transform="translate(200, 440)">
    <!-- Badge 1 -->
    <rect x="0" y="0" width="250" height="52" rx="14" fill="#0B1324" stroke="#1E293B" stroke-width="1.5" />
    <text x="125" y="32" fill="#38BDF8" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">✓ Balthazard &amp; ÖTV 2026</text>

    <!-- Badge 2 -->
    <rect x="275" y="0" width="250" height="52" rx="14" fill="#0B1324" stroke="#1E293B" stroke-width="1.5" />
    <text x="400" y="32" fill="#38BDF8" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">✓ WebMCP AI Agents</text>

    <!-- Badge 3 -->
    <rect x="550" y="0" width="250" height="52" rx="14" fill="#0B1324" stroke="#1E293B" stroke-width="1.5" />
    <text x="675" y="32" fill="#38BDF8" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">✓ WCAG 2.2 AAA Uyumlu</text>
  </g>
</svg>
`;

async function generate() {
  const publicDir = path.join(__dirname, '..', 'public');

  console.log('Generating brand assets in public/...');

  // 1. icon.png (192x192)
  await sharp(Buffer.from(iconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon.png'));

  // 2. apple-icon.png (180x180)
  await sharp(Buffer.from(iconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-icon.png'));

  // 3. logo.png (512x512)
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'logo.png'));

  // 4. favicon.png (48x48) & favicon.jpg (128x128)
  await sharp(Buffer.from(iconSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  await sharp(Buffer.from(iconSvg))
    .resize(128, 128)
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'favicon.jpg'));

  // 5. banner.png & banner-v2.png (1200x630)
  await sharp(Buffer.from(bannerSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'banner.png'));

  await sharp(Buffer.from(bannerSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'banner-v2.png'));

  await sharp(Buffer.from(bannerSvg))
    .resize(1200, 630)
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'banner.jpg'));

  // 6. og-image.png & og-image-v2.png (1200x630)
  await sharp(Buffer.from(bannerSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  await sharp(Buffer.from(bannerSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image-v2.png'));

  await sharp(Buffer.from(bannerSvg))
    .resize(1200, 630)
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'og-image.jpg'));

  // 7. twitter-image.png & twitter-image-v2.png (1200x630)
  await sharp(Buffer.from(bannerSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'twitter-image.png'));

  await sharp(Buffer.from(bannerSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'twitter-image-v2.png'));

  await sharp(Buffer.from(bannerSvg))
    .resize(1200, 630)
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'twitter-image.jpg'));

  console.log('All brand assets successfully updated!');
}

generate().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
