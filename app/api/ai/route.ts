import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    // Remove trailing slash if present to avoid double slashes in SDK
    const baseURL = (process.env.OPENAI_BASE_URL || 'https://api.z.ai/api/paas/v4').replace(/\/$/, '');
    
    if (!apiKey || apiKey === 'your-api-key') {
      console.error('OPENAI_API_KEY is missing or using placeholder');
      throw new Error('OPENAI_API_KEY environment variable is required and must be valid.');
    }
    
    console.log(`Initializing OpenAI client with baseURL: ${baseURL}`);

    openaiClient = new OpenAI({
      apiKey,
      baseURL,
      // Some proxies need the header explicitly if the SDK's automatic Bearer is not working
      defaultHeaders: {
        'Authorization': `Bearer ${apiKey}`
      }
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
      model: 'glm-4.5-air', // Updated to 4.5 Air as requested
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
