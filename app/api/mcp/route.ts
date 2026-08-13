import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOOLS = [
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
  },
  {
    name: 'engelsizforum_balthazard_calc',
    description: 'Birden fazla engel oranını Balthazard formülü ile birleştirerek toplam engel oranını hesaplar.',
    inputSchema: {
      type: 'object',
      properties: {
        rates: {
          type: 'array',
          items: { type: 'number' },
          description: 'Engel oranları dizisi (ör. [40, 20, 10])',
        },
      },
      required: ['rates'],
    },
  },
  {
    name: 'engelsizforum_accessibility_toggle',
    description: 'EngelsizForum WCAG 2.1 AAA erişilebilirlik tercihlerini (yüksek kontrast, disleksi fontu vb.) değiştirir.',
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
  },
  {
    name: 'engelsizforum_get_categories',
    description: 'EngelsizForum\'daki 5 ana kategori ve 20 alt kategoriyi listeler.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

function handleBalthazard(ratesInput: unknown) {
  let rates: number[] = [];
  if (Array.isArray(ratesInput)) {
    rates = ratesInput.map(Number).filter((n) => !isNaN(n));
  } else if (typeof ratesInput === 'string') {
    rates = ratesInput.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
  }

  if (rates.length === 0) {
    return 'Hata: Lütfen geçerli engel oranları girin (ör. [40, 20, 10]).';
  }

  const sorted = [...rates].sort((a, b) => b - a);
  let remaining = 100;
  let score = 0;
  for (const r of sorted) {
    const add = (remaining * r) / 100;
    score += add;
    remaining -= add;
  }
  const finalScore = Math.round(score);

  return `Balthazard Formülü Hesaplama Sonucu:
------------------------------------------
Girdi Oranları: ${sorted.map((r) => `%${r}`).join(', ')}
Net Toplam Balthazard Oranı: %${finalScore}

Mevzuat Analizi:
- %90 ve Üzeri: ÖTV'siz tam muafiyetli araç alım hakkı bulunmaktadır. 2026 yılı üst limiti 2.247.100 TL'dir.
- %90 Altı: Yalnızca ortopedik engeli bulunup "Özel Tertibatlı Araç Kullanmalıdır" raporu olanlar ÖTV muafiyetinden yararlanabilir.`;
}

function handleSearch(query: string) {
  const q = String(query || '').toLowerCase();
  return `EngelsizForum Arama Sonuçları ("${query}"):
------------------------------------------
1. ÖTV 2026 Limit Şartları: 2026 yılı yeniden değerlendirme oranıyla ÖTV'siz araç alma üst sınırı 2.247.100 TL olarak belirlenmiştir.
2. Balthazard Formülü Rehberi: Birden fazla hastalığı veya engeli olan kişilerin sağlık kurulu rapor oranlarının hesaplanma usulü.
3. Erken Emeklilik & Yaş Şartsız Emeklilik Cetveli: Sigorta başlangıç tarihi ve prim gün sayısına göre engelli erken emeklilik cetveli.
4. EKPSS 2026 Atama Rehberi: Engelli Kamu Personeli Seçme Sınavı tercih ve kadro dağılımları.

Devam eden tüm tartışmalar ve üye yorumları EngelsizForum üzerinde aktiftir.`;
}

function handleGetCategories() {
  return `EngelsizForum Kategori Ağacı (5 Ana Kategori, 20 Alt Kategori):
--------------------------------------------------
1. Sağlık & Erişilebilirlik
   - Medikal & Tedavi
   - Medikal Cihazlar
   - Dijital Erişilebilirlik (WCAG)
   - Fiziksel Mimari & Kentsel Ulaşım

2. Yasal Haklar & Mevzuat
   - Engelli Emekliliği & ÖTV 2026
   - İstihdam & EKPSS Atamaları
   - Evde Bakım & Engelli Aylıkları
   - Hukuki Danışmanlık & Hak Arama

3. Eğitim & Kariyer
   - Özel Eğitim & RAM Süreçleri
   - Üniversite Yaşamı & Burslar
   - İş İlanları & Korumalı İşyerleri
   - Beceri & Sertifika Kursları

4. Sosyal Yaşam & Dayanışma
   - Paralimpik Spor & Sanat
   - Engelsiz Turizm & Tatil
   - Kullanıcı Deneyimleri & Hikayeler
   - 2. El Medikal Cihaz & Ekipman Paylaşımı

5. Teknoloji & Yapay Zeka
   - Ekran Okuyucular (NVDA, JAWS, TalkBack)
   - Akıllı Ev & Erişilebilir Donanım
   - Yapay Zeka Seslendirme & Betimleme
   - Mobil Uygulama İncelemeleri`;
}

function processJsonRpcRequest(body: Record<string, unknown>) {
  const id = body.id ?? null;
  const method = String(body.method || '');
  const params = (body.params as Record<string, unknown>) || {};

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {
              listChanged: false,
            },
            prompts: {},
            resources: {},
          },
          serverInfo: {
            name: 'EngelsizForum MCP Server',
            version: '1.0.0',
            description: 'EngelsizForum Türkiye - Erişilebilirlik, ÖTV 2026, Balthazard ve Mevzuat Ajanı',
          },
        },
      };

    case 'notifications/initialized':
      return {
        jsonrpc: '2.0',
        id,
        result: {},
      };

    case 'ping':
      return {
        jsonrpc: '2.0',
        id,
        result: {},
      };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS,
        },
      };

    case 'tools/call': {
      const toolName = String(params.name || '');
      const args = (params.arguments as Record<string, unknown>) || {};

      let responseText = '';

      if (toolName === 'engelsizforum_search') {
        responseText = handleSearch(String(args.query || ''));
      } else if (toolName === 'engelsizforum_balthazard_calc') {
        responseText = handleBalthazard(args.rates);
      } else if (toolName === 'engelsizforum_accessibility_toggle') {
        const feature = String(args.feature || 'highContrast');
        const enabled = Boolean(args.enabled);
        responseText = `Erişilebilirlik ayarı güncellendi: ${feature} = ${enabled ? 'Aktif' : 'Pasif'}.`;
      } else if (toolName === 'engelsizforum_get_categories') {
        responseText = handleGetCategories();
      } else {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Tool not found: ${toolName}`,
          },
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        },
      };
    }

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method not supported: ${method}`,
        },
      };
  }
}

export async function GET(req: NextRequest) {
  const acceptHeader = req.headers.get('accept') || '';

  // If client expects Server-Sent Events (SSE) stream (standard MCP SSE transport)
  if (acceptHeader.includes('text/event-stream')) {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const host = req.headers.get('host') || 'www.engelsizforum.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const messageEndpoint = `${protocol}://${host}/api/mcp/messages?sessionId=${sessionId}`;

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        // Emit 'endpoint' SSE event
        controller.enqueue(encoder.encode(`event: endpoint\ndata: ${messageEndpoint}\n\n`));
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Standard GET endpoint status / metadata
  return NextResponse.json(
    {
      status: 'online',
      service: 'EngelsizForum Model Context Protocol (MCP) Server',
      protocolVersion: '2024-11-05',
      mcpEndpoint: '/api/mcp',
      supportedTransports: ['sse', 'streamable-http', 'json-rpc'],
      tools: TOOLS.map((t) => t.name),
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if it's a batch JSON-RPC or single
    if (Array.isArray(body)) {
      const responses = body.map((item) => processJsonRpcRequest(item));
      return NextResponse.json(responses, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const responsePayload = processJsonRpcRequest(body);
    return NextResponse.json(responsePayload, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error',
          data: String(error),
        },
      },
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
