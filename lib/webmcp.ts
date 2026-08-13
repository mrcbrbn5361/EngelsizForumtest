/**
 * Chrome WebMCP (Web Model Context Protocol) Integration for EngelsizForum
 * 
 * WebMCP is the W3C Web Machine Learning Community Group browser standard
 * co-developed by Google & Microsoft for Chrome 146+.
 * Supports Declarative HTML API (toolname, tooldescription) and
 * Imperative JS API (document.modelContext.registerTool / navigator.modelContext.registerTool).
 */

export interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
  parameters?: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

declare global {
  interface Document {
    modelContext?: {
      registerTool?: (tool: WebMCPToolDefinition) => Promise<boolean> | void;
      unregisterTool?: (name: string) => Promise<boolean> | void;
      getRegisteredTools?: () => WebMCPToolDefinition[];
    };
  }
  interface Navigator {
    modelContext?: {
      registerTool?: (tool: WebMCPToolDefinition) => Promise<boolean> | void;
      unregisterTool?: (name: string) => Promise<boolean> | void;
      getRegisteredTools?: () => WebMCPToolDefinition[];
    };
  }
  interface Window {
    modelContext?: {
      registerTool?: (tool: WebMCPToolDefinition) => Promise<boolean> | void;
      unregisterTool?: (name: string) => Promise<boolean> | void;
      getRegisteredTools?: () => WebMCPToolDefinition[];
    };
    WebMCP?: {
      getRegisteredTools: () => WebMCPToolDefinition[];
      registerTool: (tool: WebMCPToolDefinition) => void;
    };
  }
}

// In-memory store for registered tools
const registeredToolsStore = new Map<string, WebMCPToolDefinition>();

/**
 * Ensures declarative DOM forms exist for registered tools so Chrome DevTools WebMCP inspector can detect them
 */
function syncDeclarativeDOMForm(tool: WebMCPToolDefinition) {
  if (typeof document === 'undefined') return;

  let container = document.getElementById('webmcp-dom-declarative-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'webmcp-dom-declarative-container';
    container.setAttribute('data-webmcp-active', 'true');
    // Using visually offscreen styles instead of display:none so DevTools DOM scanners detect them
    container.style.position = 'absolute';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.padding = '0';
    container.style.margin = '-1px';
    container.style.overflow = 'hidden';
    container.style.clip = 'rect(0, 0, 0, 0)';
    container.style.whiteSpace = 'nowrap';
    container.style.border = '0';
    document.body.appendChild(container);
  }

  const existingForm = document.querySelector(`form[toolname="${tool.name}"]`);
  if (!existingForm) {
    const form = document.createElement('form');
    form.setAttribute('toolname', tool.name);
    form.setAttribute('tooldescription', tool.description);
    form.setAttribute('data-toolname', tool.name);
    form.setAttribute('data-tooldescription', tool.description);
    form.setAttribute('name', tool.name);
    form.action = '#';
    form.method = 'GET';

    // Add inputs based on schema
    const props = tool.inputSchema?.properties || tool.parameters || {};
    Object.entries(props).forEach(([paramName, paramConfig]) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = paramName;
      input.setAttribute('toolparamdescription', paramConfig.description || paramName);
      input.setAttribute('data-toolparamdescription', paramConfig.description || paramName);
      form.appendChild(input);
    });

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Execute Tool';
    form.appendChild(submitBtn);

    container.appendChild(form);
  }
}

/**
 * Initializes polyfill/store for document.modelContext, navigator.modelContext, and window.modelContext
 */
export function initWebMCPPolyfill() {
  if (typeof window === 'undefined') return;

  const modelContextObj = {
    registerTool: (tool: WebMCPToolDefinition) => {
      registeredToolsStore.set(tool.name, tool);
      console.log(`🚀 [WebMCP] Tool registered: ${tool.name}`);
      
      // Sync DOM form for DevTools detection
      syncDeclarativeDOMForm(tool);

      // Dispatch global events for DevTools extensions / agent listeners
      window.dispatchEvent(new CustomEvent('webmcp:tool-registered', { detail: tool }));
      window.dispatchEvent(new CustomEvent('webmcp:tools-updated', { detail: Array.from(registeredToolsStore.values()) }));
      window.dispatchEvent(new CustomEvent('modelcontext:toolregistered', { detail: tool }));

      return Promise.resolve(true);
    },
    unregisterTool: (name: string) => {
      registeredToolsStore.delete(name);
      const form = document.querySelector(`form[toolname="${name}"]`);
      if (form) form.remove();
      return Promise.resolve(true);
    },
    getRegisteredTools: () => {
      return Array.from(registeredToolsStore.values());
    },
  };

  // Polyfill document.modelContext (Chrome 150+ W3C spec)
  if (!('modelContext' in document) || !document.modelContext) {
    try {
      Object.defineProperty(document, 'modelContext', {
        value: modelContextObj,
        writable: true,
        configurable: true,
      });
    } catch {
      (document as unknown as { modelContext: unknown }).modelContext = modelContextObj;
    }
  }

  // Polyfill navigator.modelContext (Chrome 146-149 legacy spec)
  if (!('modelContext' in navigator) || !navigator.modelContext) {
    try {
      Object.defineProperty(navigator, 'modelContext', {
        value: modelContextObj,
        writable: true,
        configurable: true,
      });
    } catch {
      (navigator as unknown as { modelContext: unknown }).modelContext = modelContextObj;
    }
  }

  // Polyfill window.modelContext & window.WebMCP
  if (!('modelContext' in window) || !window.modelContext) {
    try {
      Object.defineProperty(window, 'modelContext', {
        value: modelContextObj,
        writable: true,
        configurable: true,
      });
    } catch {
      (window as unknown as { modelContext: unknown }).modelContext = modelContextObj;
    }
  }

  window.WebMCP = {
    getRegisteredTools: () => Array.from(registeredToolsStore.values()),
    registerTool: (tool: WebMCPToolDefinition) => modelContextObj.registerTool(tool),
  };
}

export function isWebMCPSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return true;
}

export function registerEngelsizForumWebMCPTools(callbacks?: {
  onSearch?: (query: string) => void;
  onCalculateBalthazard?: (rates: number[]) => number;
  onToggleAccessibility?: (feature: string, enabled: boolean) => void;
}) {
  if (typeof window === 'undefined') return false;

  initWebMCPPolyfill();

  const tools: WebMCPToolDefinition[] = [
    {
      name: 'engelsizforum_search',
      description: 'EngelsizForum üzerindeki konuları, mevzuatı, ÖTV 2026 şartlarını ve sağlık raporu rehberlerini arar.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Aranacak kelime veya konu (ör. ÖTV 2026, EKPSS, Balthazard)',
          },
        },
        required: ['query'],
      },
      parameters: {
        query: {
          type: 'string',
          description: 'Aranacak kelime veya konu (ör. ÖTV 2026, EKPSS, Balthazard)',
          required: true,
        },
      },
      execute: async (args) => {
        const query = String(args.query || args.q || '');
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
      inputSchema: {
        type: 'object',
        properties: {
          rates: {
            type: 'array',
            description: 'Engel oranları dizisi (ör. [40, 20, 10])',
          },
        },
        required: ['rates'],
      },
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
      inputSchema: {
        type: 'object',
        properties: {
          feature: {
            type: 'string',
            description: 'Değiştirilecek özellik: highContrast | dyslexicFont | bionicReading',
          },
          enabled: {
            type: 'boolean',
            description: 'Özelliğin aktif (true) veya pasif (false) olma durumu',
          },
        },
        required: ['feature', 'enabled'],
      },
      parameters: {
        feature: {
          type: 'string',
          description: 'Değiştirilecek özellik: highContrast | dyslexicFont | bionicReading',
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
      inputSchema: {
        type: 'object',
        properties: {},
      },
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

  tools.forEach((tool) => {
    try {
      if (document.modelContext?.registerTool) {
        document.modelContext.registerTool(tool);
      }
      if (navigator.modelContext?.registerTool) {
        navigator.modelContext.registerTool(tool);
      }
      if (window.modelContext?.registerTool) {
        window.modelContext.registerTool(tool);
      }
    } catch (e) {
      console.warn('WebMCP tool register notice:', e);
    }
  });

  return true;
}

// Auto-initialize when file is imported on client side
if (typeof window !== 'undefined') {
  initWebMCPPolyfill();
  registerEngelsizForumWebMCPTools();
}
