/* eslint-disable */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const width = 1200;
const height = 630;

// SVG Banner Design (Vibrant Electric Blue matching the user's reference image)
const svgBanner = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient (Rich Electric Navy & Royal Blue) -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#021024"/>
      <stop offset="35%" stop-color="#052659"/>
      <stop offset="70%" stop-color="#093a7a"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <!-- Radial Glows -->
    <radialGradient id="glow-center" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="glow-topleft" cx="20%" cy="20%" r="45%">
      <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#1e40af" stop-opacity="0"/>
    </radialGradient>

    <!-- Text & Accent Gradients -->
    <linearGradient id="title-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f0f9ff"/>
    </linearGradient>

    <linearGradient id="highlight-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#93c5fd"/>
    </linearGradient>

    <!-- Network Mesh Grid Pattern -->
    <pattern id="mesh" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.18"/>
      <circle cx="0" cy="0" r="1.5" fill="#38bdf8" fill-opacity="0.3"/>
    </pattern>

    <!-- Community Emblem Filter -->
    <filter id="blue-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Base Fill -->
  <rect width="${width}" height="${height}" fill="url(#bg-grad)"/>
  <rect width="${width}" height="${height}" fill="url(#mesh)"/>

  <!-- Radial Lights -->
  <circle cx="780" cy="315" r="480" fill="url(#glow-center)"/>
  <circle cx="200" cy="150" r="320" fill="url(#glow-topleft)"/>

  <!-- Abstract Network Nodes / Connecting Lines -->
  <g opacity="0.3" stroke="#60a5fa" stroke-width="1.2">
    <line x1="80" y1="100" x2="220" y2="70" />
    <line x1="220" y1="70" x2="380" y2="160" />
    <line x1="120" y1="420" x2="280" y2="500" />
    <line x1="880" y1="90" x2="1080" y2="180" />
    <line x1="1080" y1="180" x2="1000" y2="380" />
    <line x1="880" y1="520" x2="1120" y2="540" />
    
    <circle cx="80" cy="100" r="4" fill="#38bdf8" />
    <circle cx="220" cy="70" r="5" fill="#60a5fa" />
    <circle cx="380" cy="160" r="3" fill="#93c5fd" />
    <circle cx="880" cy="90" r="4" fill="#38bdf8" />
    <circle cx="1080" cy="180" r="6" fill="#60a5fa" />
    <circle cx="1000" cy="380" r="4" fill="#38bdf8" />
  </g>

  <!-- Outer Border Frame -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="20" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.3"/>

  <!-- Top Brand Tag -->
  <g transform="translate(80, 75)">
    <rect x="0" y="0" width="220" height="36" rx="18" fill="#0b2545" fill-opacity="0.9" stroke="#38bdf8" stroke-width="1.5"/>
    <circle cx="18" cy="18" r="6" fill="#38bdf8"/>
    <text x="32" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#ffffff" letter-spacing="0.5">
      ENGELSİZFORUM
    </text>
  </g>

  <!-- Main Community Emblem (Chat Bubble + People Figures Ring) matching user image -->
  <g transform="translate(780, 315) scale(1.35)">
    <!-- Outer Glow Ring -->
    <circle cx="0" cy="-20" r="100" fill="#38bdf8" fill-opacity="0.25" filter="url(#blue-glow)" />
    
    <!-- Speech Bubble Container -->
    <path d="M -90 -80 C -90 -120, 90 -120, 90 -80 C 90 -40, 20 -40, -10 -10 L -25 15 L -35 -20 C -70 -20, -90 -40, -90 -80 Z" 
          fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />

    <!-- 4 Interconnected Human Figures (Community Inclusion Circle) -->
    <g transform="translate(0, -68)" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- Person Top -->
      <circle cx="0" cy="-28" r="7" fill="#ffffff" stroke="none" />
      <path d="M -14 -14 C -8 -21, 8 -21, 14 -14 C 10 -4, -10 -4, -14 -14 Z" fill="#ffffff" stroke="none" />

      <!-- Person Bottom -->
      <circle cx="0" cy="28" r="7" fill="#ffffff" stroke="none" />
      <path d="M -14 14 C -8 21, 8 21, 14 14 C 10 4, -10 4, -14 14 Z" fill="#ffffff" stroke="none" />

      <!-- Person Left -->
      <circle cx="-28" cy="0" r="7" fill="#ffffff" stroke="none" />
      <path d="M -14 -14 C -21 -8, -21 8, -14 14 C -4 10, -4 -10, -14 -14 Z" fill="#ffffff" stroke="none" />

      <!-- Person Right -->
      <circle cx="28" cy="0" r="7" fill="#ffffff" stroke="none" />
      <path d="M 14 -14 C 21 -8, 21 8, 14 14 C 4 10, 4 -10, 14 -14 Z" fill="#ffffff" stroke="none" />

      <!-- Connecting Circular Hands Ring -->
      <circle cx="0" cy="0" r="24" stroke="#38bdf8" stroke-width="3.5" stroke-dasharray="10 5" fill="none" />
    </g>
  </g>

  <!-- Title Section -->
  <text x="80" y="210" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="url(#title-grad)" letter-spacing="-1">
    Engelsiz<tspan fill="url(#highlight-grad)">Forum</tspan>
  </text>

  <text x="80" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#38bdf8" letter-spacing="-0.5">
    Erişilebilir Forum
  </text>

  <!-- Subtitle / Description -->
  <text x="80" y="315" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500" fill="#e0f2fe">
    Engelli bireyler için tam erişilebilir forum
  </text>
  <text x="80" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500" fill="#e0f2fe">
    ve topluluk platformu.
  </text>

  <!-- Pill Feature Highlights at Bottom -->
  <g transform="translate(80, 415)">
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="190" height="42" rx="21" fill="#021024" fill-opacity="0.8" stroke="#38bdf8" stroke-width="1.2"/>
      <text x="20" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#ffffff">♿ %100 Erişilebilir</text>
    </g>

    <g transform="translate(205, 0)">
      <rect x="0" y="0" width="210" height="42" rx="21" fill="#021024" fill-opacity="0.8" stroke="#38bdf8" stroke-width="1.2"/>
      <text x="20" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#ffffff">🤖 Yapay Zeka Desteği</text>
    </g>

    <g transform="translate(430, 0)">
      <rect x="0" y="0" width="190" height="42" rx="21" fill="#021024" fill-opacity="0.8" stroke="#38bdf8" stroke-width="1.2"/>
      <text x="20" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#ffffff">📊 Balthazard &amp; ÖTV</text>
    </g>
  </g>

  <!-- Footer Link -->
  <g transform="translate(80, 520)">
    <rect x="0" y="0" width="1040" height="52" rx="14" fill="#021024" fill-opacity="0.9" stroke="#1d4ed8" stroke-width="1.5"/>
    <circle cx="28" cy="26" r="6" fill="#38bdf8"/>
    <text x="46" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#ffffff">
      www.engelsizforum.com
    </text>
    <text x="1010" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#38bdf8" text-anchor="end">
      Aramıza Katılın →
    </text>
  </g>
</svg>
`;

// SVG Logo Design (512x512) - Sleek Blue Favicon & App Icon
const svgLogo = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="50%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#021024"/>
    </linearGradient>

    <radialGradient id="logo-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Rounded Blue Container -->
  <rect width="512" height="512" rx="110" fill="url(#logo-bg)"/>
  <circle cx="256" cy="256" r="220" fill="url(#logo-glow)"/>

  <!-- Outer Ring Accent -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#38bdf8" stroke-width="4" stroke-opacity="0.4" stroke-dasharray="20 10" />

  <!-- Main Speech Bubble + Community Ring -->
  <g transform="translate(256, 275) scale(1.65)">
    <!-- Speech Bubble Container -->
    <path d="M -80 -70 C -80 -110, 80 -110, 80 -70 C 80 -30, 20 -30, -10 0 L -25 25 L -35 -10 C -65 -10, -80 -30, -80 -70 Z" 
          fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />

    <!-- 4 Interconnected Figures -->
    <g transform="translate(0, -60)">
      <!-- Top -->
      <circle cx="0" cy="-26" r="7" fill="#ffffff" />
      <path d="M -13 -13 C -8 -20, 8 -20, 13 -13 C 10 -4, -10 -4, -13 -13 Z" fill="#ffffff" />

      <!-- Bottom -->
      <circle cx="0" cy="26" r="7" fill="#ffffff" />
      <path d="M -13 13 C -8 20, 8 20, 13 13 C 10 4, -10 4, -13 13 Z" fill="#ffffff" />

      <!-- Left -->
      <circle cx="-26" cy="0" r="7" fill="#ffffff" />
      <path d="M -13 -13 C -20 -8, -20 8, -13 13 C -4 10, -4 -10, -13 -13 Z" fill="#ffffff" />

      <!-- Right -->
      <circle cx="26" cy="0" r="7" fill="#ffffff" />
      <path d="M 13 -13 C 20 -8, 20 8, 13 13 C 4 10, 4 -10, 13 -13 Z" fill="#ffffff" />

      <!-- Connecting Circle -->
      <circle cx="0" cy="0" r="22" stroke="#38bdf8" stroke-width="3.5" stroke-dasharray="10 5" fill="none" />
    </g>
  </g>
</svg>
`;

async function main() {
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const svgBannerBuffer = Buffer.from(svgBanner);
  const svgLogoBuffer = Buffer.from(svgLogo);

  // 1. OG Images (1200x630)
  await sharp(svgBannerBuffer)
    .resize(1200, 630)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'og-image.png'));

  await sharp(svgBannerBuffer)
    .resize(1200, 630)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'banner.png'));

  await sharp(svgBannerBuffer)
    .resize(1200, 630)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'twitter-image.png'));

  // 2. Logo Image (512x512)
  await sharp(svgLogoBuffer)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'logo.png'));

  // 3. Favicons
  await sharp(svgLogoBuffer)
    .resize(48, 48)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon.ico'));

  await sharp(svgLogoBuffer)
    .resize(48, 48)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon.png'));

  await sharp(svgLogoBuffer)
    .resize(512, 512)
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'favicon.jpg'));

  await sharp(svgLogoBuffer)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'icon.png'));

  await sharp(svgLogoBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-icon.png'));

  console.log('Blue OG Banner, Logo and Favicons generated successfully!');
}

main().catch(console.error);
