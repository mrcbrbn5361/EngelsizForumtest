import { NextRequest, NextResponse } from 'next/server';
import { summarizeWithYeterly } from '@/lib/yeterly';

function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip markdown links
    .replace(/[*_#`~>]/g, '') // strip markdown formatting markers
    .replace(/\s+/g, ' ') // replace multiple spaces
    .trim();
}

function fallbackSummary(text: string): string {
  const cleaned = cleanText(text);
  if (!cleaned) return "Özet çıkarılabilecek yeterli içerik bulunmuyor.";
  
  // Split into sentences
  const sentences = cleaned.split(/[.!?]\s+/).map(s => s.trim()).filter(Boolean);
  
  let summary = "Bu içerikte, ";
  
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
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text alanı zorunludur' }, { status: 400 });
    }

    const cleanedText = cleanText(text);

    // Smart limit check: if content is already short, return dynamic friendly overview directly
    if (cleanedText.length < 150) {
      const shortSummary = fallbackSummary(text);
      return NextResponse.json({ project_id: 'engelsizforum', summary: shortSummary, model: 'local-extractor' });
    }

    try {
      const data = await summarizeWithYeterly({ text });
      return NextResponse.json(data);
    } catch (error: any) {
      console.warn(`[Yeterly API Warning] Upstream summary failed (${error.message}). Falling back to local smart summary.`);
      const localSummary = fallbackSummary(text);
      return NextResponse.json({
        project_id: 'engelsizforum',
        summary: localSummary,
        model: 'local-extractor-fallback',
        estimated_input_chars: text.length
      });
    }
  } catch (error: any) {
    console.error('Yeterly Summarize API Error:', error);
    return NextResponse.json({ error: error.message || 'Özetleme isteği sırasında bir hata oluştu' }, { status: 500 });
  }
}
