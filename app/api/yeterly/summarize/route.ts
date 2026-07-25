import { NextRequest, NextResponse } from 'next/server';

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

    const apiKey = process.env.YETERLY_ENGELSIZFORUM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Yeterly API anahtarı (YETERLY_ENGELSIZFORUM_API_KEY) sunucuda tanımlanmamış.' },
        { status: 500 }
      );
    }

    const cleanedText = cleanText(text);

    // Smart limit check: if content is already short, return dynamic friendly overview directly
    if (cleanedText.length < 150) {
      const shortSummary = fallbackSummary(text);
      return NextResponse.json({ project_id: 'engelsizforum', summary: shortSummary, model: 'local-extractor' });
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
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
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
      return NextResponse.json(data);
    } else {
      console.warn(`[Yeterly API Warning] Upstream summary failed (${errorMsg}). Falling back to local smart summary.`);
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
