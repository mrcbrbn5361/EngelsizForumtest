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

    let data: any = null;
    const responseText = await upstream.text();
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Not a JSON response
    }

    if (!upstream.ok) {
      let errorMsg = 'Özetleme servisi başarısız oldu';
      if (upstream.status === 401) {
        errorMsg = 'API anahtarı (YETERLY_ENGELSIZFORUM_API_KEY) hatalı veya yetkisiz. Lütfen doğru anahtarı girdiğinizden emin olun.';
      } else if (upstream.status === 429) {
        errorMsg = 'API kullanım limiti (Günlük 100 istek veya özetleme limiti) aşıldı.';
      } else if (upstream.status === 413) {
        errorMsg = 'Gönderilen metin çok uzun. Maksimum limit 20.000 karakterdir.';
      } else if (upstream.status === 400) {
        errorMsg = 'Geçersiz istek. Lütfen gönderilen içeriği kontrol edin.';
      } else if (upstream.status === 404) {
        errorMsg = 'API servisinde EngelsizForum projesi bulunamadı.';
      } else if (upstream.status >= 500) {
        errorMsg = 'Yeterly AI sunucularında geçici bir kesinti yaşanıyor veya Azure AI servislerine erişilemiyor.';
      }

      if (data && (data.error || data.message)) {
        const detailMsg = data.error || data.message;
        errorMsg += ` (Detay: ${typeof detailMsg === 'object' ? JSON.stringify(detailMsg) : detailMsg})`;
      } else if (responseText && responseText.length < 200) {
        errorMsg += ` (Sunucu Yanıtı: ${responseText})`;
      } else {
        errorMsg += ` (HTTP Durum: ${upstream.status})`;
      }

      return NextResponse.json(
        { error: errorMsg, detail: data || responseText },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Yeterly Summarize API Error:', error);
    return NextResponse.json({ error: error.message || 'Özetleme isteği sırasında bir hata oluştu' }, { status: 500 });
  }
}
