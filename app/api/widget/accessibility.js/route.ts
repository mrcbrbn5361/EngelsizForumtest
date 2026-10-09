import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Serves the EngelsizForum Accessibility Widget script with CORS & Caching headers
 * Can be embedded on ANY external website:
 * <script src="https://engelsizforum.com/api/widget/accessibility.js" async defer></script>
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'widget', 'engelsiz-accessibility.js');
    const scriptContent = fs.readFileSync(filePath, 'utf-8');

    return new NextResponse(scriptContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
        'X-Powered-By': 'EngelsizForum-Accessibility-Engine'
      },
    });
  } catch (error) {
    return new NextResponse('// Error loading widget', {
      status: 500,
      headers: { 'Content-Type': 'application/javascript' }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
