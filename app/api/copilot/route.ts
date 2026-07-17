import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API anahtarı (GEMINI_API_KEY) sunucuda tanımlanmamış." },
        { status: 500 }
      );
    }

    const { message, history } = await req.json();
    if (!message) {
      return NextResponse.json(
        { error: "Mesaj alanı boş olamaz." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Format history according to @google/genai format
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === 'ai' || h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.text || h.content || '' }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: formattedHistory,
      config: {
        systemInstruction: `Sen EngelsizForum yapay zeka asistanı ve erişilebilirlik rehberisin.
Görevin, engelli hakları, erişilebilirlik standartları (WCAG 2.1), yardımcı teknolojiler (NVDA, JAWS, ekran okuyucular, braille ekranlar), bilişsel kısıtlılıklar (disleksi, DEHB, otizm) ve dijital engelsiz yaşam hakkında kullanıcılara nazik, empati dolu ve bilgilendirici yanıtlar vermektir.
Her zaman Türkçe yanıt ver. Cevapların net, samimi, erişilebilir ve yapay zeka jargonu içermeyen akıcı bir üslupla olsun.
EngelsizForum topluluğunu destekleyici ve kapsayıcı bir dille konuş.`
      }
    });

    const response = await chat.sendMessage({ message: message });
    return NextResponse.json({ text: response.text });

  } catch (error: any) {
    console.error("Copilot API Hatası:", error);
    return NextResponse.json(
      { error: error.message || "İstek işlenirken sunucu tarafında bir hata oluştu." },
      { status: 500 }
    );
  }
}
