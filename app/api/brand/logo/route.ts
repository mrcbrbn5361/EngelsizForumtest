import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * EngelsizForum Resmi Logo Vektör Uç Noktası (Image 2)
 * GET /api/brand/logo
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const theme = searchParams.get('theme') || 'blue'; // 'blue' | 'dark' | 'transparent'
  const width = Math.min(Math.max(parseInt(searchParams.get('w') || '196', 10), 80), 800);
  const height = Math.round(width * (36 / 196));

  const bgColor =
    theme === 'dark' ? '#0f172a' : theme === 'transparent' ? 'transparent' : '#185886';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 196 36" width="${width}" height="${height}">
  ${bgColor !== 'transparent' ? `<rect width="196" height="36" rx="3" fill="${bgColor}"/>` : ''}
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif">
    <text x="12" y="25.5" fill="#FFFFFF" font-size="21" font-weight="900" letter-spacing="-0.3px">ENGELS</text>
    <text x="100.5" y="25.5" fill="#FFFFFF" font-size="21" font-weight="900">I</text>
    <circle cx="104.5" cy="10.5" r="2.5" fill="#38BDF8"/>
    <text x="110.5" y="25.5" fill="#FFFFFF" font-size="21" font-weight="900" letter-spacing="-0.3px">Z</text>
    <text x="126" y="25.5" fill="#7DD3FC" font-size="21" font-weight="300" letter-spacing="0.4px">FORUM</text>
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
