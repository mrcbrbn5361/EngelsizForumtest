import { NextRequest } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WIDTH = 1080;
const HEIGHT = 1080;

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function wrapText(value: string, maxChars: number, maxLines: number) {
  const words = value.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) current = candidate;
    else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  return lines;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = params.get('title')?.trim() || 'Yeni güncelleme yayınlandı';
  const sha = params.get('sha')?.trim().slice(0, 7) || '';
  const lines = wrapText(title, 30, 4);
  const lineStartY = 475 - Math.max(0, lines.length - 1) * 22;
  const titleSvg = lines.map((line, index) => `<text x="540" y="${lineStartY + index * 58}" text-anchor="middle" class="title">${escapeXml(line)}</text>`).join('');
  const svg = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#071b2d"/><stop offset="100%" stop-color="#0a5c66"/></linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="18" flood-opacity="0.22"/></filter>
      <style>
        .brand { font-family: Arial, sans-serif; font-weight: 700; fill: #083b4a; }
        .title { font-family: Arial, sans-serif; font-size: 48px; font-weight: 700; fill: #ffffff; }
        .muted { font-family: Arial, sans-serif; font-size: 25px; fill: #d8f3f4; }
        .small { font-family: Arial, sans-serif; font-size: 22px; fill: #b9d8da; }
      </style>
    </defs>
    <rect width="1080" height="1080" fill="url(#bg)"/>
    <circle cx="920" cy="125" r="210" fill="#39c6c8" opacity="0.13"/><circle cx="120" cy="930" r="280" fill="#7be0d6" opacity="0.08"/>
    <rect x="70" y="70" width="940" height="940" rx="52" fill="#ffffff" opacity="0.075" stroke="#ffffff" stroke-opacity="0.16"/>
    <g filter="url(#shadow)"><rect x="135" y="150" width="810" height="88" rx="44" fill="#ffffff"/><text x="540" y="207" text-anchor="middle" class="brand" font-size="35">ENGELSİZFORUM</text></g>
    <text x="540" y="345" text-anchor="middle" class="muted">WEB SİTESİ GÜNCELLENDİ</text>
    ${titleSvg}
    <line x1="260" y1="700" x2="820" y2="700" stroke="#ffffff" stroke-opacity="0.18"/>
    <text x="540" y="765" text-anchor="middle" class="muted">Erişilebilir, bağımsız ve engelsiz bir topluluk</text>
    <text x="540" y="825" text-anchor="middle" class="small">engelsizforum.com</text>
    <text x="540" y="900" text-anchor="middle" class="small">EngelsizForum${sha ? ` · ${escapeXml(sha)}` : ''}</text>
  </svg>`;
  const image = await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();
  return new Response(image, { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=300, s-maxage=300' } });
}
