import { NextRequest, NextResponse } from "next/server";

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
    
    // Check if Yeterly API is configured
    const yeterlyKey = process.env.YETERLY_ENGELSIZFORUM_API_KEY;
    if (!yeterlyKey) {
      return NextResponse.json(
        { error: "Yeterly AI API anahtarı (YETERLY_ENGELSIZFORUM_API_KEY) sunucuda tanımlanmamış. Lütfen çevre değişkenlerini yapılandırın." },
        { status: 500 }
      );
    }

    const textToSummarize = title ? `Başlık: ${title}\nİçerik: ${content}` : content;
    const cleanedText = cleanText(textToSummarize);

    // Smart limit check: if content is already short, return dynamic friendly overview directly
    if (cleanedText.length < 150) {
      const shortSummary = fallbackSummary(content, title);
      console.log(`[Yeterly AI Smart Bypass] Content is too short (${cleanedText.length} chars). Returned dynamic overview.`);
      return NextResponse.json({ text: shortSummary });
    }

    const apiBase = process.env.YETERLY_ENGELSIZFORUM_API_BASE || 'https://engelsizforum-ai.yeterly.ai';
    
    let upstreamSuccess = false;
    let data: any = null;
    let errorMsg = '';

    try {
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
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Not a JSON response
      }

      if (upstream.ok && data && data.summary) {
        upstreamSuccess = true;
      } else {
        errorMsg = `HTTP Durum: ${upstream.status}. Yanıt: ${responseText}`;
      }
    } catch (e: any) {
      errorMsg = e.message || 'Bağlantı hatası';
    }

    if (upstreamSuccess) {
      const text = data.summary;
      console.log(`[Yeterly AI Audit] Summarized using Yeterly. Characters: ${textToSummarize?.length || 0}`);
      return NextResponse.json({ text });
    } else {
      // Graceful fallback to avoid showing red error message to users
      console.warn(`[Yeterly AI Warning] Upstream summary failed (${errorMsg}). Falling back to local smart summary.`);
      const text = fallbackSummary(content, title);
      return NextResponse.json({ text });
    }
  } catch (error: any) {
    console.error("Yeterly Summarize API Error:", error);
    return NextResponse.json({ error: error.message || "Özetleme isteği sırasında bir hata oluştu" }, { status: 500 });
  }
}
