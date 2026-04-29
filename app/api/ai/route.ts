import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.z.ai/api/paas/v4/';
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    openaiClient = new OpenAI({
      apiKey,
      baseURL,
    });
  }
  return openaiClient;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, content } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: 'glm-5.1', // Updated to the latest requested model
      messages: [
        {
          role: 'system',
          content: 'Sen EngelsizForum için yardımcı bir AI asistanısın. Erişilebilirlik odaklı, açık ve anlaşılır bilgi sağlarsın.',
        },
        {
          role: 'user',
          content: `${prompt}\n\nİçerik:\n${content || ''}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const result = response.choices[0]?.message?.content || 'Üzgünüm, bir özet oluşturulamadı.';

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
