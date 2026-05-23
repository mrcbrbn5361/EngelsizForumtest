import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI configuration missing on server." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    
    const prompt = `Lütfen aşağıdaki forum başlığını ve içeriğini kısa ve öz bir şekilde (maksimum 4 cümle) Türkçe özetle:\n\nBaşlık: ${title}\nİçerik: ${content}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    
    const text = response.text;

    return NextResponse.json({ summary: text });
  } catch (error: any) {
    console.error("AI Summarization failed:", error);
    return NextResponse.json(
      { error: "Failed to generate summary." },
      { status: 500 }
    );
  }
}
