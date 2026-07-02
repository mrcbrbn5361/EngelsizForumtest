import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { title, content, type } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key is not configured on the server." }, { status: 500 });
    }

    let prompt = "";
    if (type === "topic_summary") {
      prompt = `Lütfen aşağıdaki forum başlığını ve içeriğini kısa ve öz bir şekilde (maksimum 4 cümle) Türkçe özetle. Önemli noktaları vurgula.\n\nBaşlık: ${title}\nİçerik: ${content}`;
    } else {
      prompt = `Lütfen aşağıdaki içeriği kısa ve öz bir şekilde Türkçe özetle:\n\n${content}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Sen engelli bireyler için tasarlanmış EngelsizForum platformunun yardımcı yapay zeka asistanısın. Sunacağın özetler her zaman yapıcı, destekleyici, net ve kolay anlaşılır olmalıdır. Özet sonuna mutlaka şu uyarıyı ekle: '\\n\\n*Not: Bu özet yapay zeka tarafından oluşturulmuştur. Kritik bilgiler için orijinal tartışmayı okuyun ve uzman görüşü alın.*'",
      }
    });

    const text = response.text || "Özet üretilemedi.";
    console.log(`[AI Audit] Summarized content type: ${type}. Characters: ${content?.length || 0}`);

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate summary" }, { status: 500 });
  }
}
