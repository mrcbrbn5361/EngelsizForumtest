import { NextRequest, NextResponse } from 'next/server';
import { generateTTSWithYeterly } from '@/lib/yeterly';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text alanı zorunludur' }, { status: 400 });
    }

    try {
      const data = await generateTTSWithYeterly({ text });
      return NextResponse.json({
        success: true,
        source: 'yeterly',
        ...data,
      });
    } catch (error: any) {
      console.warn('Yeterly TTS Upstream Warning:', error.message);
      
      // Return 200 with fallback indicator so client hook smoothly switches to browser Web Speech API
      return NextResponse.json({
        success: false,
        fallback: 'web_speech',
        language: 'tr-TR',
        message: 'Yeterly TTS servisi çevrimdışı veya yapılandırılmamış, tarayıcı doğal seslendiricisine yönlendirildi.',
        detail: error.message,
      });
    }
  } catch (error: any) {
    console.error('TTS API Route Error:', error);
    return NextResponse.json({ 
      success: false,
      fallback: 'web_speech',
      error: error.message || 'Ses üretme isteği sırasında bir hata oluştu' 
    }, { status: 200 });
  }
}

