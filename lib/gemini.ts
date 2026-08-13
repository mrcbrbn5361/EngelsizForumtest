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

export interface GeminiGenerateParams {
  contents: any;
  config?: any;
}

/**
 * Generates content using Google Gemini with model fallbacks and retry logic for transient errors.
 * @param {GeminiGenerateParams} params 
 * @returns {Promise<any>}
 */
export async function generateContentWithRetry(params: GeminiGenerateParams) {
  if (!ai) {
    throw new Error("Gemini API anahtarı (GEMINI_API_KEY) tanımlanmamış.");
  }

  // We try gemini-2.5-flash first, then gemini-2.0-flash, and fallback to gemini-1.5-flash
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let retries = 2; // Total 3 attempts per model
    while (retries >= 0) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        
        if (response && response.text) {
          return response;
        }
      } catch (error: any) {
        lastError = error;
        const errorMessage = error.message || "";
        
        // Check for transient/503/429 errors or network issues
        const isTransient = 
          errorMessage.includes("503") || 
          errorMessage.includes("UNAVAILABLE") || 
          errorMessage.includes("429") || 
          errorMessage.includes("demand") ||
          errorMessage.includes("fetch") ||
          errorMessage.includes("busy") ||
          errorMessage.includes("overloaded");
                            
        if (isTransient && retries > 0) {
          const delay = (3 - retries) * 1000; // 1s, 2s delay
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries--;
        } else {
          // If it's a permanent error or no retries left, break out and try the next model
          break;
        }
      }
    }
  }

  // If all models fail, throw a user-friendly Turkish explanation
  const finalMessage = lastError?.message || "";
  let friendlyMessage = "Yapay zeka servisleri şu anda yoğunluk nedeniyle yanıt vermiyor.";
  
  if (finalMessage.includes("503") || finalMessage.includes("UNAVAILABLE") || finalMessage.includes("demand")) {
    friendlyMessage = "Yapay zeka modelimiz şu anda çok yüksek talep görüyor. Sistem otomatik olarak alternatif modelleri ve tekrarları denedi ancak bağlantı sağlanamadı. Lütfen birkaç saniye sonra tekrar deneyiniz.";
  } else if (finalMessage.includes("API key") || finalMessage.includes("API_KEY")) {
    friendlyMessage = "Gemini API anahtarı doğrulanamadı veya geçersiz. Lütfen ayarlarınızdan geçerli bir API anahtarı girdiğinizden emin olun.";
  } else {
    friendlyMessage = `İstek işlenirken yapay zeka servisinde bir sorun oluştu: ${finalMessage || "Bilinmeyen hata"}`;
  }

  throw new Error(friendlyMessage);
}

