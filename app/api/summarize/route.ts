import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, content, type } = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured on the server." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";
    if (type === "topic_summary") {
      prompt = `Lütfen aşağıdaki forum başlığını ve içeriğini kısa ve öz bir şekilde (maksimum 4 cümle) Türkçe özetle. Önemli noktaları vurgula.\n\nBaşlık: ${title}\nİçerik: ${content}`;
    } else {
      prompt = `Lütfen aşağıdaki içeriği kısa ve öz bir şekilde Türkçe özetle:\n\n${content}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate summary" }, { status: 500 });
  }
}
