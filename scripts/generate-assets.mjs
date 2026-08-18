import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.join(process.cwd(), 'public');

// 1. Generate OG Banner SVG (1200x630) in modern blue/slate theme (No green!)
const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07090E" />
      <stop offset="50%" stop-color="#0B101D" />
      <stop offset="100%" stop-color="#080C16" />
    </linearGradient>
    
    <radialGradient id="glowTop" cx="30%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.35" />
      <stop offset="50%" stop-color="#0369a1" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#07090E" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="glowBottom" cx="80%" cy="80%" r="45%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2" />
      <stop offset="60%" stop-color="#0284c7" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#07090E" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111827" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#0B1120" stop-opacity="0.9" />
    </linearGradient>

    <linearGradient id="blueAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <linearGradient id="pillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0.1" />
    </linearGradient>

    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#0284c7" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect width="1200" height="630" fill="url(#glowTop)" />
  <rect width="1200" height="630" fill="url(#glowBottom)" />

  <!-- Subtle Tech Grid Lines -->
  <g stroke="#38bdf8" stroke-opacity="0.06" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105" />
    <line x1="0" y1="210" x2="1200" y2="210" />
    <line x1="0" y1="315" x2="1200" y2="315" />
    <line x1="0" y1="420" x2="1200" y2="420" />
    <line x1="0" y1="525" x2="1200" y2="525" />
    <line x1="200" y1="0" x2="200" y2="630" />
    <line x1="400" y1="0" x2="400" y2="630" />
    <line x1="600" y1="0" x2="600" y2="630" />
    <line x1="800" y1="0" x2="800" y2="630" />
    <line x1="1000" y1="0" x2="1000" y2="630" />
  </g>

  <!-- Main Card Container -->
  <rect x="70" y="55" width="1060" height="520" rx="28" fill="url(#cardGrad)" stroke="#38bdf8" stroke-opacity="0.2" stroke-width="1.5" filter="url(#shadow)" />

  <!-- Top Badge: WCAG 2.2 AAA & Yerli Topluluk -->
  <g transform="translate(120, 105)">
    <rect x="0" y="0" width="270" height="36" rx="18" fill="#0369a1" fill-opacity="0.25" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1" />
    <circle cx="18" cy="18" r="5" fill="#38bdf8" />
    <text x="32" y="23" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" letter-spacing="1">WCAG 2.2 AAA • TÜRKİYE</text>
  </g>

  <!-- Logo Icon and Brand Title -->
  <g transform="translate(120, 175)">
    <!-- Icon Square -->
    <rect x="0" y="0" width="80" height="80" rx="22" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="2" />
    <!-- Accessibility Symbol -->
    <g transform="translate(16, 16) scale(2)">
      <circle cx="12" cy="4.5" r="2.5" fill="#38bdf8" />
      <path d="M4 8.5C7.5 8.5 16.5 8.5 20 8.5" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
      <path d="M12 9V15L9 20" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12 15L15 20" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <!-- Brand Title -->
    <text x="105" y="56" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" letter-spacing="-0.5">Engelsiz<tspan fill="#38bdf8">Forum</tspan></text>
  </g>

  <!-- Tagline / Description -->
  <text x="120" y="300" fill="#E2E8F0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="600">
    Tam Erişilebilir Dayanışma, Mevzuat ve Rehberlik Platformu
  </text>
  <text x="120" y="336" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400">
    Engelli bireyler, aileleri ve uzmanlar için bariyersiz bilgi paylaşımı ve hesaplama araçları.
  </text>

  <!-- Feature Chips / Modules in Blue Theme -->
  <!-- Chip 1: Hukuki Haklar & CİMER -->
  <g transform="translate(120, 380)">
    <rect x="0" y="0" width="220" height="52" rx="14" fill="url(#pillGrad)" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="1.2" />
    <text x="20" y="32" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700">⚖️ Hukuki Hak &amp; CİMER</text>
  </g>

  <!-- Chip 2: ÖTV 2026 Muafiyeti -->
  <g transform="translate(355, 380)">
    <rect x="0" y="0" width="230" height="52" rx="14" fill="url(#pillGrad)" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="1.2" />
    <text x="20" y="32" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700">🚗 ÖTV 2026 Muafiyeti</text>
  </g>

  <!-- Chip 3: Balthazard & Rapor -->
  <g transform="translate(600, 380)">
    <rect x="0" y="0" width="235" height="52" rx="14" fill="url(#pillGrad)" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="1.2" />
    <text x="20" y="32" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700">📊 Balthazard &amp; Rapor</text>
  </g>

  <!-- Chip 4: Erken Emeklilik -->
  <g transform="translate(850, 380)">
    <rect x="0" y="0" width="230" height="52" rx="14" fill="url(#pillGrad)" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="1.2" />
    <text x="20" y="32" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700">⏳ Erken Emeklilik</text>
  </g>

  <!-- Footer Link & Verification -->
  <g transform="translate(120, 500)">
    <circle cx="8" cy="8" r="6" fill="#38bdf8" />
    <text x="24" y="13" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" letter-spacing="0.5">engelsizforum.com</text>
    <text x="210" y="13" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="500">• Herkes İçin Bariyersiz, Saygılı ve Özgür İletişim</text>
  </g>
</svg>
`;

// 2. Generate Square App Icon SVG (512x512)
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iconBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080C17" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <radialGradient id="iconGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="symbolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>

  <!-- Outer Rounded Square Base -->
  <rect width="512" height="512" rx="120" fill="url(#iconBg)" />
  <rect width="512" height="512" rx="120" fill="url(#iconGlow)" />
  <rect x="6" y="6" width="500" height="500" rx="114" fill="none" stroke="#38bdf8" stroke-width="12" stroke-opacity="0.3" />

  <!-- Inner Accessibility Symbol Icon -->
  <g transform="translate(106, 86) scale(12.5)">
    <!-- Head -->
    <circle cx="12" cy="4.5" r="2.8" fill="#38bdf8" />
    <!-- Arms -->
    <path d="M3.5 9.5C7.5 9 16.5 9 20.5 9.5" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" />
    <!-- Body and Legs -->
    <path d="M12 9.5V15.5L8.5 21" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 15.5L15.5 21" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>
`;

// 3. Generate Favicon SVG (32x32 / Scalable)
const faviconSvg = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="#090A0F" stroke="#38bdf8" stroke-width="2" />
  <g transform="translate(12, 10) scale(1.65)">
    <circle cx="12" cy="4.5" r="2.5" fill="#38bdf8" />
    <path d="M4 8.5C7.5 8.5 16.5 8.5 20 8.5" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" />
    <path d="M12 9V15L9 20" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 15L15 20" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>
`;

async function main() {
  console.log('Generating high-res visual assets in modern blue theme...');

  // Save SVG files
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

  // 1. OG Image & Banner PNG (1200x630)
  const ogBuffer = await sharp(Buffer.from(ogSvg))
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogBuffer);
  fs.writeFileSync(path.join(publicDir, 'twitter-image.png'), ogBuffer);
  fs.writeFileSync(path.join(publicDir, 'banner.png'), ogBuffer);
  console.log('✓ og-image.png, twitter-image.png, banner.png generated (1200x630)');

  // 2. App Icon (512x512)
  const iconBuffer = await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon.png'), iconBuffer);
  fs.writeFileSync(path.join(publicDir, 'logo.png'), iconBuffer);
  console.log('✓ icon.png & logo.png generated (512x512)');

  // 3. Apple Touch Icon (180x180)
  const appleIconBuffer = await sharp(Buffer.from(iconSvg))
    .resize(180, 180)
    .png({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-icon.png'), appleIconBuffer);
  console.log('✓ apple-icon.png generated (180x180)');

  // 4. Favicon PNG (64x64 & 32x32)
  const faviconBuffer = await sharp(Buffer.from(iconSvg))
    .resize(64, 64)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), faviconBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconBuffer);
  console.log('✓ favicon.png & favicon.ico generated');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
