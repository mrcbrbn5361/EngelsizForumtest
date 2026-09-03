import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Logolu "EngelsizForum ile Giriş Yap" Buton Görseli (Image 1 + Image 2)
 * GET /api/brand/button?theme=green|blue|dark|white&text=full|short
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const theme = searchParams.get('theme') || 'green'; // 'green' | 'blue' | 'dark' | 'white'
  const textMode = searchParams.get('text') || 'full'; // 'full' = EngelsizForum ile Giriş Yap, 'short' = Giriş Yap

  // Renk Paleti
  let bg = '#00875a'; // Image 1 yeşili
  let border = '#006644';
  let badgeBg = '#185886';
  let textColor = '#ffffff';
  let subTextColor = '#E2E8F0';

  if (theme === 'blue') {
    bg = '#185886';
    border = '#12466b';
    badgeBg = '#0d344f';
    textColor = '#ffffff';
    subTextColor = '#E2E8F0';
  } else if (theme === 'dark') {
    bg = '#0f172a';
    border = '#1e293b';
    badgeBg = '#185886';
    textColor = '#ffffff';
    subTextColor = '#94a3b8';
  } else if (theme === 'white') {
    bg = '#ffffff';
    border = '#cbd5e1';
    badgeBg = '#185886';
    textColor = '#0f172a';
    subTextColor = '#475569';
  }

  const isFull = textMode === 'full';
  const width = isFull ? 250 : 165;
  const height = 44;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" rx="4" fill="${bg}" stroke="${border}" stroke-width="1"/>
  <!-- 2. Görseldeki Logo Rozeti -->
  <g transform="translate(10, 8)">
    <rect width="28" height="28" rx="3" fill="${badgeBg}" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1"/>
    <path d="M5 6h12v3H9v3h6v3H9v4h9v3H5V6z" fill="#FFFFFF"/>
    <circle cx="21" cy="7.5" r="2.2" fill="#38BDF8"/>
    <path d="M18 11h5v2.5h-3v7h-2V11z" fill="#7DD3FC"/>
  </g>
  <!-- Metin -->
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="14">
    <text x="48" y="27" fill="${textColor}" font-weight="700">EngelsizForum</text>
    ${isFull ? `<text x="146" y="27" fill="${subTextColor}" font-weight="400"> ile Giriş Yap</text>` : ''}
  </g>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
