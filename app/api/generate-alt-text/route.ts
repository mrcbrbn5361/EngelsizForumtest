import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    if (!ai) {
      console.warn("[Gemini AI Alt Text] GEMINI_API_KEY is not configured. Returning fallback alt text.");
      return NextResponse.json({ 
        altText: "Yüklenen görsel (AI betimleme anahtarı eksik)" 
      });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64,
      },
    };

    const textPart = {
      text: "Bu görseli engelli bireyler için (ekran okuyuculara uygun) detaylı ve betimleyici bir alt-metin (alt text) olarak açıkla. Sadece betimlemeyi döndür.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
    });

    return NextResponse.json({ altText: response.text });
  } catch (error: any) {
    console.error("Alt-text generation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
