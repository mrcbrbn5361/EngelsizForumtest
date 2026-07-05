import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text alanı zorunludur' }, { status: 400 });
    }

    const apiKey = process.env.YETERLY_ENGELSIZFORUM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Yeterly API anahtarı (YETERLY_ENGELSIZFORUM_API_KEY) sunucuda tanımlanmamış.' },
        { status: 500 }
      );
    }

    const apiBase = process.env.YETERLY_ENGELSIZFORUM_API_BASE || 'https://engelsizforum-ai.yeterly.ai';

    const upstream = await fetch(
      `${apiBase}/v1/projects/engelsizforum/summarize`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language: 'tr',
          style: 'short',
        }),
        cache: 'no-store',
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Özetleme servisi başarısız oldu', detail: data },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Yeterly Summarize API Error:', error);
    return NextResponse.json({ error: error.message || 'Özetleme isteği sırasında bir hata oluştu' }, { status: 500 });
  }
}
