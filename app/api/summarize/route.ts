import { NextRequest, NextResponse } from "next/server";
import { generateContentWithRetry } from "@/lib/gemini";
import { summarizeWithYeterly } from "@/lib/yeterly";

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
  const sentences = cleaned.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  
  let summary = "";
  if (title) {
    summary += `"${title}" başlıklı bu tartışmada, `;
  } else {
    summary += "Bu içerikte, ";
  }
  
  if (sentences.length <= 2) {
    summary += `kısaca şunlardan bahsedilmektedir: ${cleaned}`;
  } else {
    // Take the most informative sentences
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
    const body = await req.json().catch(() => ({}));
    const { title, content, text } = body;
    
    const rawContent = content || text || '';
    const textToSummarize = title ? `Başlık: ${title}\nİçerik: ${rawContent}` : rawContent;
    const cleanedText = cleanText(textToSummarize);

    if (!cleanedText) {
      return NextResponse.json({ 
        text: "Özetlenecek metin içeriği bulunamadı.",
        summary: "Özetlenecek metin içeriği bulunamadı.",
        source: "empty-content" 
      });
    }

    // 1. Try Yeterly API if key is configured
    try {
      const data = await summarizeWithYeterly({ text: textToSummarize });
      const summaryText = data?.summary || data?.text;
      if (summaryText) {
        return NextResponse.json({ 
          text: summaryText,
          summary: summaryText,
          source: 'yeterly',
          model: data.model || 'yeterly-ai'
        });
      }
    } catch (yeterlyError: any) {
      console.warn("[Yeterly AI Warning] Fallback triggered due to:", yeterlyError.message);
    }

    // 2. Try Gemini API as a secondary fallback
    try {
      const response = await generateContentWithRetry({
        contents: `Aşağıdaki forum tartışmasını veya metnini Türkçe olarak özetle. Özet kısa (en fazla 2-3 cümle), net, anlaşılır ve özellikle ekran okuyucu kullanan engelli bireyler için seslendirildiğinde rahat anlaşılacak akıcı bir dilde olmalıdır. Sadece özet metnini döndür, ek açıklama ekleme.\n\n${textToSummarize}`,
      });
      
      if (response && response.text) {
        const geminiSummary = response.text.trim();
        return NextResponse.json({ 
          text: geminiSummary,
          summary: geminiSummary,
          source: 'gemini',
          model: 'gemini-flash'
        });
      }
    } catch (geminiError: any) {
      console.warn("[Gemini AI Summarize Warning] Falling back to local extractor...", geminiError);
    }

    // 3. Fallback to local smart semantic summary
    const fallbackText = fallbackSummary(rawContent, title);
    return NextResponse.json({ 
      text: fallbackText,
      summary: fallbackText,
      source: 'local-extractor',
      model: 'smart-extractive-v1'
    });
  } catch (error: any) {
    console.error("Summarize API Error:", error);
    const safeFallback = "Özet oluşturulurken bir hata oluştu. İçeriği tam metin olarak inceleyebilirsiniz.";
    return NextResponse.json({ 
      text: safeFallback,
      summary: safeFallback,
      error: error.message,
      source: 'error-fallback'
    }, { status: 200 });
  }
}

