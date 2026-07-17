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

export async function generateContentWithRetry(params: GeminiGenerateParams) {
  if (!ai) {
    throw new Error("Gemini API anahtarı (GEMINI_API_KEY) tanımlanmamış.");
  }

  // We try gemini-3.5-flash first, and fallback to gemini-3.1-flash-lite which has very high availability.
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let retries = 2; // Total 3 attempts per model
    while (retries >= 0) {
      try {
        console.log(`[Gemini Request] Trying model: ${model}, remaining retries: ${retries}`);
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        
        if (response && response.text) {
          console.log(`[Gemini Success] Successfully generated content using model: ${model}`);
          return response;
        }
      } catch (error: any) {
        lastError = error;
        const errorMessage = error.message || "";
        console.warn(`[Gemini Error] Model ${model} failed:`, errorMessage);
        
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
          console.log(`[Gemini Retry] Transient error detected. Waiting ${delay}ms before retrying...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries--;
        } else {
          // If it's a permanent error or no retries left, break out and try the next model
          break;
        }
      }
    }
  }

  // If both models fail, throw a user-friendly and polite Turkish explanation
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
