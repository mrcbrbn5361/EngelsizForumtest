/* eslint-disable */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const width = 1200;
const height = 630;

const svgBanner = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>

    <!-- Accent Blue Glow -->
    <radialGradient id="glow-blue" cx="15%" cy="25%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>

    <!-- Accent Cyan Glow -->
    <radialGradient id="glow-cyan" cx="85%" cy="75%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>

    <!-- Card Background Gradient -->
    <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9"/>
    </linearGradient>

    <!-- Text Gradient -->
    <linearGradient id="text-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>

    <!-- Badge Gradient -->
    <linearGradient id="badge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>

    <!-- Subtle Grid Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1" stroke-opacity="0.25"/>
    </pattern>
  </defs>

  <!-- Base Layer -->
  <rect width="${width}" height="${height}" fill="url(#bg-grad)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>

  <!-- Ambient Light Orbs -->
  <circle cx="180" cy="150" r="350" fill="url(#glow-blue)"/>
  <circle cx="1020" cy="480" r="400" fill="url(#glow-cyan)"/>

  <!-- Outer Frame / Border Light -->
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="24" fill="none" stroke="#334155" stroke-width="2" stroke-opacity="0.6"/>

  <!-- Top Badge -->
  <g transform="translate(70, 75)">
    <rect x="0" y="0" width="310" height="42" rx="21" fill="url(#badge-grad)"/>
    <circle cx="21" cy="21" r="7" fill="#60a5fa"/>
    <text x="38" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#ffffff" letter-spacing="0.5">
      %100 ERİŞİLEBİLİR PLATFORM
    </text>
  </g>

  <!-- Main Logo & Brand Heading -->
  <g transform="translate(70, 185)">
    <!-- Wheelchair / Inclusion Icon -->
    <g transform="translate(0, -10)">
      <circle cx="36" cy="36" r="36" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/>
      <!-- Universal Accessibility / Inclusion Symbol -->
      <path d="M 36 18 A 5 5 0 1 0 36 28 A 5 5 0 1 0 36 18 Z M 24 33 L 48 33 M 36 33 L 36 48 M 28 54 L 36 44 L 44 54" 
            fill="none" stroke="#60a5fa" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <text x="92" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="900" fill="#ffffff" letter-spacing="-1">
      Engelsiz<tspan fill="url(#text-grad)">Forum</tspan>
    </text>
  </g>

  <!-- Subtitle Description -->
  <text x="70" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="400" fill="#94a3b8" width="1060">
    Engelli Bireyler İçin Bariyersiz Topluluk, Bilgi &amp; Mevzuat Danışma Platformu
  </text>

  <!-- Feature Grid Cards -->
  <g transform="translate(70, 335)">
    <!-- Feature 1 -->
    <g transform="translate(0, 0)">
      <rect width="250" height="90" rx="16" fill="url(#card-grad)" stroke="#334155" stroke-width="1.5"/>
      <text x="24" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#38bdf8">⚡ Balthazard &amp; ÖTV</text>
      <text x="24" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#94a3b8">2026 Otomatik Hesaplama</text>
    </g>

    <!-- Feature 2 -->
    <g transform="translate(270, 0)">
      <rect width="250" height="90" rx="16" fill="url(#card-grad)" stroke="#334155" stroke-width="1.5"/>
      <text x="24" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#60a5fa">🤖 Yapay Zeka Mevzuat</text>
      <text x="24" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#94a3b8">Haklar &amp; Kanun Danışmanı</text>
    </g>

    <!-- Feature 3 -->
    <g transform="translate(540, 0)">
      <rect width="250" height="90" rx="16" fill="url(#card-grad)" stroke="#334155" stroke-width="1.5"/>
      <text x="24" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#a78bfa">👁️ Biyonik Okuma</text>
      <text x="24" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#94a3b8">Disleksi &amp; Sesli Ekran Dostu</text>
    </g>

    <!-- Feature 4 -->
    <g transform="translate(810, 0)">
      <rect width="250" height="90" rx="16" fill="url(#card-grad)" stroke="#334155" stroke-width="1.5"/>
      <text x="24" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#34d399">💬 Dayanışma Ağları</text>
      <text x="24" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#94a3b8">Yardımlaşma &amp; Sosyal Kulüp</text>
    </g>
  </g>

  <!-- Bottom Footer Domain Strip -->
  <g transform="translate(70, 520)">
    <rect width="1060" height="50" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
    <circle cx="28" cy="25" r="6" fill="#10b981"/>
    <text x="45" y="31" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#cbd5e1">
      https://www.engelsizforum.com
    </text>
    <text x="1035" y="31" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#3b82f6" text-anchor="end">
      Aramıza Katılın →
    </text>
  </g>
</svg>
`;

async function main() {
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const svgBuffer = Buffer.from(svgBanner);

  // Output 1: og-image.png
  await sharp(svgBuffer)
    .resize(1200, 630)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'og-image.png'));

  // Output 2: banner.png
  await sharp(svgBuffer)
    .resize(1200, 630)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'banner.png'));

  // Output 3: twitter-image.png
  await sharp(svgBuffer)
    .resize(1200, 630)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'twitter-image.png'));

  console.log('OG Social Banners created successfully in public/ folder!');
}

main().catch(console.error);
