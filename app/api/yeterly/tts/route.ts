import { NextRequest, NextResponse } from 'next/server';
import { generateTTSWithYeterly } from '@/lib/yeterly';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text alanı zorunludur' }, { status: 400 });
    }

    try {
      const data = await generateTTSWithYeterly({ text });
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('Yeterly TTS API Error:', error);
      
      let errorMsg = 'Ses üretme servisi başarısız oldu';
      const status = error.message.includes('401') ? 401 : 
                    error.message.includes('429') ? 429 : 
                    error.message.includes('413') ? 413 : 500;

      if (status === 401) {
        errorMsg = 'API anahtarı (YETERLY_ENGELSIZFORUM_API_KEY) hatalı veya yetkisiz. Lütfen doğru anahtarı girdiğinizden emin olun.';
      } else if (status === 429) {
        errorMsg = 'API kullanım limiti aşıldı.';
      } else if (status === 413) {
        errorMsg = 'Gönderilen metin çok uzun.';
      }

      return NextResponse.json(
        { error: errorMsg, detail: error.message },
        { status }
      );
    }
  } catch (error: any) {
    console.error('TTS API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Ses üretme isteği sırasında bir hata oluştu' }, { status: 500 });
  }
}
