import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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

function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip markdown links
    .replace(/[*_#`~>]/g, '') // strip markdown formatting markers
    .replace(/\s+/g, ' ') // replace multiple spaces
    .trim();
}

function fallbackSummary(text: string, title?: string): string {
  const cleaned = cleanText(text);
  if (!cleaned) return "Özet çıkarılabilecek yeterli içerik bulunmuyor.";
  
  // Split into sentences
  const sentences = cleaned.split(/[.!?]\s+/).map(s => s.trim()).filter(Boolean);
  
  let summary = "";
  if (title) {
    summary += `"${title}" başlıklı bu tartışmada, `;
  } else {
    summary += "Bu içerikte, ";
  }
  
  if (sentences.length <= 2) {
    summary += `kısaca şunlardan bahsedilmektedir: ${cleaned}`;
  } else {
    // Take the first 3 sentences
    const topSentences = sentences.slice(0, 3).map(s => {
      const trimmed = s.trim();
      if (trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?')) {
        return trimmed;
      }
      return trimmed + '.';
    });
    summary += `şu ana konular ele alınmaktadır:\n\n` + topSentences.map(s => `• ${s}`).join('\n');
  }
  
  return summary;
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, type } = await req.json();
    
    const textToSummarize = title ? `Başlık: ${title}\nİçerik: ${content}` : content;
    const cleanedText = cleanText(textToSummarize);

    // Smart limit check: if content is already short, return dynamic friendly overview directly
    if (cleanedText.length < 150) {
      const shortSummary = fallbackSummary(content, title);
      console.log(`[AI Smart Bypass] Content is too short (${cleanedText.length} chars). Returned dynamic overview.`);
      return NextResponse.json({ text: shortSummary });
    }

    // 1. Try Yeterly API if key is configured
    const yeterlyKey = process.env.YETERLY_ENGELSIZFORUM_API_KEY;
    if (yeterlyKey) {
      const apiBase = process.env.YETERLY_ENGELSIZFORUM_API_BASE || 'https://engelsizforum-ai.yeterly.ai';
      try {
        console.log("[Yeterly AI Summarize] Generating summary using Yeterly AI...");
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

        const responseText = await upstream.text();
        let data: any = null;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // Not a JSON response
        }

        if (upstream.ok && data && data.summary) {
          console.log(`[Yeterly AI Audit] Summarized using Yeterly. Characters: ${textToSummarize?.length || 0}`);
          return NextResponse.json({ text: data.summary });
        } else {
          console.warn(`[Yeterly AI Warning] Upstream summary failed. HTTP: ${upstream.status}`);
        }
      } catch (yeterlyError: any) {
        console.warn("[Yeterly AI Warning] Connection failed:", yeterlyError.message);
      }
    }

    // 2. Try Gemini API as a secondary fallback if Yeterly failed or is not configured
    if (ai) {
      try {
        console.log("[Gemini AI Summarize Fallback] Generating summary using gemini-3.5-flash as fallback...");
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Aşağıdaki forum tartışmasını Türkçe olarak özetle. Özet kısa (en fazla 2-3 cümle), net, anlaşılır ve özellikle ekran okuyucu kullanan engelli bireyler için seslendirildiğinde rahat anlaşılacak akıcı bir dilde olmalıdır. Sadece özet metnini döndür, ek açıklama ekleme.\n\n${textToSummarize}`,
        });
        
        if (response.text) {
          return NextResponse.json({ text: response.text.trim() });
        }
      } catch (geminiError: any) {
        console.error("[Gemini AI Summarize Error] Falling back to local methods...", geminiError);
      }
    }

    // 3. Fallback to local smart summary
    console.warn("[AI Summarize Warning] No API keys succeeded. Falling back to local smart summary.");
    const fallbackText = fallbackSummary(content, title);
    return NextResponse.json({ text: fallbackText });
  } catch (error: any) {
    console.error("Summarize API Error:", error);
    return NextResponse.json({ error: error.message || "Özetleme isteği sırasında bir hata oluştu" }, { status: 500 });
  }
}
