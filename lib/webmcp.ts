/**
 * Chrome WebMCP (Web Model Context Protocol) Integration for EngelsizForum
 * 
 * WebMCP is the browser-native standard (W3C Web Machine Learning Community Group)
 * co-developed by Google & Microsoft for Chrome 146+.
 * Allows browser AI agents to discover & directly execute tools exposed by EngelsizForum.
 */

export interface WebMCPToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
}

export interface WebMCPToolDefinition {
  name: string;
  description: string;
  parameters?: Record<string, WebMCPToolParameter>;
  execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

declare global {
  interface Navigator {
    modelContext?: {
      registerTool?: (tool: WebMCPToolDefinition) => void;
      unregisterTool?: (name: string) => void;
      getRegisteredTools?: () => WebMCPToolDefinition[];
    };
  }
}

/**
 * Checks if Chrome WebMCP API is supported in the current browser environment.
 */
export function isWebMCPSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'modelContext' in navigator && typeof navigator.modelContext?.registerTool === 'function';
}

/**
 * Registers EngelsizForum's AI tools into Chrome's navigator.modelContext API.
 */
export function registerEngelsizForumWebMCPTools(callbacks?: {
  onSearch?: (query: string) => void;
  onCalculateBalthazard?: (rates: number[]) => number;
  onToggleAccessibility?: (feature: string, enabled: boolean) => void;
}) {
  if (typeof window === 'undefined') return false;

  const tools: WebMCPToolDefinition[] = [
    {
      name: 'engelsizforum_search',
      description: 'EngelsizForum üzerindeki konuları, mevzuatı, ÖTV 2026 şartlarını ve sağlık raporu rehberlerini arar.',
      parameters: {
        query: {
          type: 'string',
          description: 'Aranacak kelime veya konu (ör. ÖTV 2026, EKPSSatama, Balthazard)',
          required: true,
        },
      },
      execute: async (args) => {
        const query = String(args.query || '');
        if (callbacks?.onSearch) {
          callbacks.onSearch(query);
        }
        return {
          status: 'success',
          message: `"${query}" araması başlatıldı.`,
          searchUrl: `/search?q=${encodeURIComponent(query)}`,
        };
      },
    },
    {
      name: 'engelsizforum_balthazard_calc',
      description: 'Birden fazla engel oranını Balthazard formülü ile birleştirerek toplam engel oranını hesaplar.',
      parameters: {
        rates: {
          type: 'array',
          description: 'Engel oranları dizisi (ör. [40, 20, 10])',
          required: true,
        },
      },
      execute: (args) => {
        const rates = Array.isArray(args.rates) ? (args.rates as number[]) : [];
        if (rates.length === 0) {
          return { error: 'En az 1 engel oranı girmelisiniz.' };
        }
        // Balthazard calculation logic
        const sorted = [...rates].map(Number).sort((a, b) => b - a);
        let totalRemaining = 100;
        let score = 0;
        for (const r of sorted) {
          const added = (totalRemaining * r) / 100;
          score += added;
          totalRemaining -= added;
        }
        const finalScore = Math.round(score);
        return {
          status: 'success',
          inputRates: sorted,
          balthazardScore: finalScore,
          isRaporedEligibleForOTV: finalScore >= 90,
          summary: `Balthazard formülüne göre net engel oranınız %${finalScore}.`,
        };
      },
    },
    {
      name: 'engelsizforum_accessibility_toggle',
      description: 'EngelsizForum WCAG 2.1 AAA erişilebilirlik tercihlerini (yüksek kontrast, disleksi fontu, biyonik okuma vb.) değiştirir.',
      parameters: {
        feature: {
          type: 'string',
          description: 'Değiştirilecek özellik: highContrast | dyslexicFont | bionicReading | focusMode | reducedMotion',
          required: true,
        },
        enabled: {
          type: 'boolean',
          description: 'Özelliğin aktif (true) veya pasif (false) olma durumu',
          required: true,
        },
      },
      execute: (args) => {
        const feature = String(args.feature || '');
        const enabled = Boolean(args.enabled);
        if (callbacks?.onToggleAccessibility) {
          callbacks.onToggleAccessibility(feature, enabled);
        }
        return {
          status: 'success',
          feature,
          enabled,
          message: `${feature} erişilebilirlik ayarı ${enabled ? 'açıldı' : 'kapatıldı'}.`,
        };
      },
    },
    {
      name: 'engelsizforum_get_categories',
      description: 'EngelsizForum\'daki 5 ana kategori ve 20 alt kategoriyi listeler.',
      execute: () => {
        return {
          categories: [
            { id: 1, name: 'Sağlık & Erişilebilirlik', subcategories: ['Medikal & Tedavi', 'Medikal Cihazlar', 'Dijital Erişilebilirlik', 'Fiziksel Mimari'] },
            { id: 2, name: 'Yasal Haklar & Mevzuat', subcategories: ['Engelli Emekliliği & ÖTV', 'İstihdam & EKPSS', 'Evde Bakım Maaşları', 'Hukuki Danışmanlık'] },
            { id: 3, name: 'Eğitim & Kariyer', subcategories: ['Özel Eğitim & RAM', 'Üniversite Yaşamı', 'İş İlanları', 'Beceri Kursları'] },
            { id: 4, name: 'Sosyal Yaşam', subcategories: ['Spor & Sanat', 'Engelsiz Turizm', 'Deneyimler', 'İkinci El Cihaz Paylaşımı'] },
            { id: 5, name: 'Teknoloji & Yapay Zeka', subcategories: ['Ekran Okuyucular', 'Akıllı Ev', 'Yapay Zeka Betimleme', 'Mobil Uygulamalar'] },
          ],
        };
      },
    },
  ];

  // Safely register tools if navigator.modelContext is present
  try {
    if (navigator.modelContext && typeof navigator.modelContext.registerTool === 'function') {
      tools.forEach((tool) => navigator.modelContext?.registerTool?.(tool));
      console.log('🚀 [WebMCP] Chrome WebMCP Araçları EngelsizForum için başarıyla kaydedildi!');
      return true;
    }
  } catch (err) {
    console.warn('⚠️ [WebMCP] Tool registration fallback handled:', err);
  }

  return false;
}
