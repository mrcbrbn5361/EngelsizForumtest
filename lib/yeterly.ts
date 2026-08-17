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

function getApiConfig() {
  const apiBase = process.env.YETERLY_ENGELSIZFORUM_API_BASE || 'https://engelsizforum-ai.yeterly.ai';
  const apiKey = process.env.YETERLY_ENGELSIZFORUM_API_KEY;
  return { apiBase: apiBase.replace(/\/+$/, ''), apiKey };
}

/**
 * Summarizes text using the Yeterly AI API.
 */
export async function summarizeWithYeterly(params: YeterlySummarizeParams) {
  const { apiBase, apiKey } = getApiConfig();
  
  if (!apiKey) {
    throw new Error('Yeterly API anahtarı (YETERLY_ENGELSIZFORUM_API_KEY) bulunamadı.');
  }

  // Potential endpoint paths
  const endpoints = [
    `${apiBase}/v1/projects/engelsizforum/summarize`,
    `${apiBase}/v1/summarize`,
    `${apiBase}/api/summarize`,
  ];

  let lastError: any = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: params.text,
          language: params.language || 'tr',
          style: params.style || 'short',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        let errText = '';
        try {
          const errData = await response.json();
          errText = errData.error || errData.message || `HTTP ${response.status}`;
        } catch {
          errText = `HTTP ${response.status} ${response.statusText}`;
        }
        lastError = new Error(errText);
        continue;
      }

      const data = await response.json();
      const summaryText = data.summary || data.text || data.result || data.data?.summary || data.data?.text;
      
      if (summaryText) {
        return {
          project_id: data.project_id || 'engelsizforum',
          summary: summaryText,
          model: data.model || 'yeterly-ai-v1',
          ...data,
        };
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Yeterly özetleme servisine bağlanılamadı.');
}

/**
 * Generates TTS audio data using the Yeterly AI API.
 */
export async function generateTTSWithYeterly(params: YeterlyTTSParams) {
  const { apiBase, apiKey } = getApiConfig();
  
  if (!apiKey) {
    throw new Error('Yeterly API anahtarı (YETERLY_ENGELSIZFORUM_API_KEY) bulunamadı.');
  }

  const endpoints = [
    `${apiBase}/v1/projects/engelsizforum/tts`,
    `${apiBase}/v1/tts`,
    `${apiBase}/api/tts`,
  ];

  let lastError: any = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: params.text,
          language: params.language || 'tr-TR',
          format: params.format || 'mp3',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        let errText = '';
        try {
          const errData = await response.json();
          errText = errData.error || errData.message || `HTTP ${response.status}`;
        } catch {
          errText = `HTTP ${response.status} ${response.statusText}`;
        }
        lastError = new Error(errText);
        continue;
      }

      const contentType = response.headers.get('content-type') || '';

      // Check if response is binary audio stream
      if (contentType.includes('audio/') || contentType.includes('application/octet-stream')) {
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return {
          audio_base64: base64,
          format: params.format || 'mp3',
          source: 'yeterly-binary-audio',
        };
      }

      const data = await response.json();
      const base64 = data.audio_base64 || data.audio || data.data?.audio_base64 || data.data?.audio;
      const audioUrl = data.audio_url || data.url || data.audioUrl;

      if (base64 || audioUrl) {
        return {
          audio_base64: base64,
          audio_url: audioUrl,
          format: data.format || params.format || 'mp3',
          source: 'yeterly-json',
          ...data,
        };
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Yeterly TTS servisine bağlanılamadı.');
}

