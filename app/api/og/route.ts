import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'og-image.png');
    if (fs.existsSync(filePath)) {
      const imageBuffer = fs.readFileSync(filePath);
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load OG image' }, { status: 500 });
  }
}
