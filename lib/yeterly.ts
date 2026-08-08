/**
 * Yeterly AI API Utility for EngelsizForum
 * Centralizes summarization and TTS logic using the provided Yeterly API credentials.
 */

export interface YeterlySummarizeParams {
  text: string;
  language?: string;
  style?: 'short' | 'medium' | 'detailed';
}

export interface YeterlyTTSParams {
  text: string;
  language?: string;
  format?: 'mp3' | 'wav';
}

const API_BASE = process.env.YETERLY_ENGELSIZFORUM_API_BASE || 'https://engelsizforum-ai.yeterly.ai';
const API_KEY = process.env.YETERLY_ENGELSIZFORUM_API_KEY;

/**
 * Summarizes text using the Yeterly AI API.
 */
export async function summarizeWithYeterly(params: YeterlySummarizeParams) {
  if (!API_KEY) {
    throw new Error('Yeterly API anahtarı (YETERLY_ENGELSIZFORUM_API_KEY) bulunamadı.');
  }

  const response = await fetch(`${API_BASE}/v1/projects/engelsizforum/summarize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: params.text,
      language: params.language || 'tr',
      style: params.style || 'short',
    }),
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Yeterly API Hatası: ${response.status}`);
  }

  return data;
}

/**
 * Generates TTS data using the Yeterly AI API.
 */
export async function generateTTSWithYeterly(params: YeterlyTTSParams) {
  if (!API_KEY) {
    throw new Error('Yeterly API anahtarı (YETERLY_ENGELSIZFORUM_API_KEY) bulunamadı.');
  }

  const response = await fetch(`${API_BASE}/v1/projects/engelsizforum/tts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: params.text,
      language: params.language || 'tr-TR',
      format: params.format || 'mp3',
    }),
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Yeterly TTS Hatası: ${response.status}`);
  }

  return data;
}
