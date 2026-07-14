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
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
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
