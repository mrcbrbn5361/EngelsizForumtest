import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, content, type } = await req.json();
    
    // Check if Yeterly API is configured
    const yeterlyKey = process.env.YETERLY_ENGELSIZFORUM_API_KEY;
    if (!yeterlyKey) {
      return NextResponse.json(
        { error: "Yeterly AI API anahtarı (YETERLY_ENGELSIZFORUM_API_KEY) sunucuda tanımlanmamış. Lütfen çevre değişkenlerini yapılandırın." },
        { status: 500 }
      );
    }

    const textToSummarize = title ? `Başlık: ${title}\nİçerik: ${content}` : content;
    const apiBase = process.env.YETERLY_ENGELSIZFORUM_API_BASE || 'https://engelsizforum-ai.yeterly.ai';
    
    const upstream = await fetch(
      `${apiBase}/v1/projects/engelsizforum/summarize`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${yeterlyKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToSummarize,
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

    const text = data.summary || "Özet üretilemedi.";
    console.log(`[Yeterly AI Audit] Summarized using Yeterly. Characters: ${textToSummarize?.length || 0}`);
    
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Yeterly Summarize API Error:", error);
    return NextResponse.json({ error: error.message || "Özetleme isteği sırasında bir hata oluştu" }, { status: 500 });
  }
}
