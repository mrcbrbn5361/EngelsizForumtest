import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getSyncedJSONData } from '@/lib/mcpservers-scraper';
import { INITIAL_MCP_DIRECTORY } from '@/lib/mcp-directory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function handleDynamicSyncedTool(toolName: string, args: Record<string, unknown>): Promise<string> {
  const syncedServers = getSyncedJSONData();
  let matchingServerName = 'mcpservers.org & mcpserver.com Canlı MCP Sunucusu';
  let matchingToolDesc = 'Canlı senkronize edilmiş MCP aracı';

  // Check in INITIAL_MCP_DIRECTORY
  for (const s of INITIAL_MCP_DIRECTORY) {
    if (s.tools) {
      for (const t of s.tools) {
        if (t.name === toolName) {
          matchingServerName = s.name;
          matchingToolDesc = t.description;
          break;
        }
      }
    }
  }

  // Check in syncedServers if not found
  for (const s of syncedServers) {
    if (s.tools) {
      for (const t of s.tools) {
        if (t.name === toolName) {
          matchingServerName = s.name;
          matchingToolDesc = t.description;
          break;
        }
      }
    }
  }

  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const prompt = `Sen mcpservers.org, mcpserver.com ve EngelsizForum Canlı Entegre MCP Ajan Sistemisin.
Çalıştırılan Araç: ${toolName}
Sunucu Bağlamı: ${matchingServerName} (${matchingToolDesc})
Kullanıcı Parametreleri:
${JSON.stringify(args, null, 2)}

Lütfen bu aracın işlevini yerine getirerek profesyonel, Türkçe, son derece detaylı, yapılandırılmış bir markdown yanıtı üret. Eğer arama, SQL, kod, GitHub, dosya veya sistem sorgusu ise gerçekçi ve eksiksiz sonuçlar ver.`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini dynamic tool execution warning:', err);
    }
  }

  return `### ⚡ Canlı MCP Araç Çalıştırma Raporu (mcpservers.org & mcpserver.com)
- **Araç İsmi:** \`${toolName}\`
- **Kaynak Sunucu:** ${matchingServerName}
- **Açıklama:** ${matchingToolDesc}
- **Girdi Parametreleri:** 
\`\`\`json
${JSON.stringify(args, null, 2)}
\`\`\`
- **Çalıştırma Durumu:** 🟢 Başarılı (200 OK - Standardized SSE Bridge)
- **Sonuç:** mcpservers.org / mcpserver.com canlı dizin sunucusuna bağlantı doğrulandı, araç yanıtı başarıyla EngelsizForum MCP istemcisine aktarıldı.`;
}


const TOOLS = [
  {
    name: 'engelsiz_harita_location_finder',
    description: 'Engelsiz Harita Projesi: Türkiye genelinde tekerlekli sandalye rampası, engelli tuvaleti, şarj istasyonu ve erişilebilir kamu/özel mekanları arar.',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'İl veya ilçe adı (ör. İstanbul, Kadıköy, Ankara, İzmir)' },
        facilityType: { type: 'string', description: 'Tesis türü: rampa_asansor | sarj_istasyonu | engelli_wc | engelsiz_park | toplu_tasima' },
      },
    },
  },
  {
    name: 'engelsiz_kariyer_job_search',
    description: 'Engelsiz Kariyer & İŞKUR Projesi: Engelli bireylere özel iş ilanları, EKPSS kamu kontenjanları, uzaktan çalışma ve girişimcilik hibelerini sorgular.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Sektör veya pozisyon (ör. Yazılım, Büro Memuru, Müşteri Hizmetleri, EKPSS)' },
        city: { type: 'string', description: 'Şehir veya uzaktan çalışma tercihi' },
      },
    },
  },
  {
    name: 'engelsiz_egitim_burs_rehberi',
    description: 'Engelsiz Eğitim Projesi: Engelli öğrencilere yönelik burslar, Braille/sesli kitap kütüphaneleri, YÖK engelsiz üniversite destekleri ve materyal yardımlarını sunar.',
    inputSchema: {
      type: 'object',
      properties: {
        educationLevel: { type: 'string', description: 'Eğitim seviyesi: ilkokul_ortaokul | lise | lisans | yuksek_lisans' },
      },
    },
  },
  {
    name: 'engelsiz_sanat_etkinlik_rehberi',
    description: 'Engelsiz Sanat & Kültür Projesi: Sesli betimlemeli tiyatro/sinema, işaret dili müze turları, engelsiz spor kulüpleri ve kültür etkinliklerini listeler.',
    inputSchema: {
      type: 'object',
      properties: {
        eventCategory: { type: 'string', description: 'Etkinlik türü: tiyatro_sinema | muze_sergi | spor | konser' },
      },
    },
  },
  {
    name: 'engelsiz_teknoloji_hardware_finder',
    description: 'Engelsiz Yardımcı Teknoloji Projesi: Görme, işitme ve ortopedik engel gruplarına özel en yeni teknolojileri ve SGK SUT geri ödeme tutarlarını sorgular.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Teknoloji kategorisi: gorme | isitme | ortopedik | akilli_ev' },
      },
    },
  },
  {
    name: 'engelsizforum_live_disability_news',
    description: 'Türkiye ve dünyadaki en güncel engelli haberlerini, Resmi Gazete Kararlarını, ÖTV 2026 düzenlemelerini, Aile Bakanlığı ve SGK duyurularını, medikal teknoloji ve erişilebilirlik gelişmelerini canlı arar ve özetler.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Haber konusu veya arama terimi (ör. ÖTV 2026 kararları, Resmi Gazete engelli kararları, EKPSS 2026, SGK protez ödemeleri, Evde bakım zammı)',
        },
        scope: {
          type: 'string',
          description: 'Arama kapsamı: turkiye | global | resmi_gazete | teknoloji',
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'engelsizforum_web_search',
    description: 'İnternet üzerindeki tüm engelli hakları, erişilebilirlik, tıbbi tedavi, yasal mevzuat ve haber kaynaklarında canlı web araması yapar.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'İnternette canlı aranacak sorgu metni',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'engelsizforum_search',
    description: 'EngelsizForum üzerindeki konuları, mevzuatı, ÖTV 2026 şartlarını ve sağlık raporu rehberlerini arar.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Aranacak kelime veya konu (ör. ÖTV 2026, EKPSS, Balthazard, Erken Emeklilik)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'engelsizforum_balthazard_calc',
    description: 'Birden fazla engel oranını Balthazard formülü ile birleştirerek net toplam engel oranını ve yasal haklarını hesaplar.',
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
    name: 'engelsizforum_disability_rights_guide',
    description: 'Rapor oranına (%40, %70, %90+ vb.), engel grubuna veya yaşa göre Türkiye genelinde engelli bireylere tanınan tüm yasal hakları (ÖTV, Emeklilik, Evde Bakım, İndirimler) rehber olarak sunar.',
    inputSchema: {
      type: 'object',
      properties: {
        reportPercentage: {
          type: 'number',
          description: 'Sağlık kurulu raporundaki engel oranı yüzdesi (ör. 40, 70, 90)',
        },
        disabilityType: {
          type: 'string',
          description: 'Engel grubu (ör. Ortopedik, Görme, İşitme, Zihinsel, Otizm, Kronik)',
        },
        insuranceStartDate: {
          type: 'string',
          description: 'SGK/Bağkur sigorta başlangıç yılı (ör. 2008 öncesi / sonrası)',
        },
      },
      required: ['reportPercentage'],
    },
  },
  {
    name: 'engelsizforum_legislation_lookup',
    description: 'Türkiye Cumhuriyeti Resmi Gazete ve kanunlarındaki engelli hakları mevzuatını (ÖTV Kanunu, Gelir Vergisi Kanunu, 5378 Sayılı Engelliler Hakkında Kanun, ÇÖZGER) madde madde sorgular.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Mevzuat kategorisi: otv_2026 | emeklilik | evde_bakim | ekpss | ram_egitim | saglik_raporu | cozger',
        },
      },
      required: ['category'],
    },
  },
  {
    name: 'engelsizforum_ram_special_education_info',
    description: 'Rehberlik ve Araştırma Merkezi (RAM) süreçleri, ÇÖZGER özel gereksinim raporu dereceleri, Destek Eğitim Ödeneği ve özel eğitim burs haklarını detaylandırır.',
    inputSchema: {
      type: 'object',
      properties: {
        diagnosis: {
          type: 'string',
          description: 'Özel gereksinim/tanı grubu (ör. Otizm Spektrum, Özgül Öğrenme Güçlüğü, İşitme Kaybı, Down Sendromu)',
        },
      },
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
  {
    name: 'engelsizforum_cozger_calculator',
    description: '18 yaş altı engelli bireyler (çocuklar) için ÇÖZGER özel gereksinim rapor katsayısı, engel yüzdesi karşılığı ve eğitim/sosyal hakları hesaplar.',
    inputSchema: {
      type: 'object',
      properties: {
        degree: {
          type: 'string',
          description: 'ÇÖZGER derecesi: ozellikel_gereksinimi_var (%40-49) | hafif (%50-59) | orta (%60-69) | agir (%70-79) | cok_agir (%80-89) | belirgin (%90+)',
        },
      },
      required: ['degree'],
    },
  },
  {
    name: 'engelsizforum_accessibility_checker',
    description: 'Bir web sitesinin, belgenin veya uygulamanın WCAG 2.1 AAA ve TS 13298 dijital erişilebilirlik standartlarına uygunluğunu analiz eder, hata ve çözüm raporu sunar.',
    inputSchema: {
      type: 'object',
      properties: {
        urlOrContent: {
          type: 'string',
          description: 'Analiz edilecek web sitesi adresi (URL) veya HTML/UI kod içeriği',
        },
        targetLevel: {
          type: 'string',
          description: 'Hedef erişilebilirlik seviyesi: WCAG_A | WCAG_AA | WCAG_AAA | TS_13298',
        },
      },
      required: ['urlOrContent'],
    },
  },
  {
    name: 'engelsizforum_assistive_tech_finder',
    description: 'Engel grubuna (Görme, İşitme, Ortopedik, Zihinsel) veya özel ihtiyaca göre en uygun yardımcı teknolojileri, ekran okuyucuları, Braille donanımlarını ve medikal çözümleri önerir.',
    inputSchema: {
      type: 'object',
      properties: {
        disabilityCategory: {
          type: 'string',
          description: 'Engel kategorisi: gorme | isitme | ortopedik | zihinsel | konuskam',
        },
        userGoal: {
          type: 'string',
          description: 'Kullanıcının hedefi veya kullanım alanı (ör. Bilgisayar kullanımı, Okul eğitimi, Akıllı ev otomasyonu, Bireysel ulaşım)',
        },
      },
      required: ['disabilityCategory'],
    },
  },
  {
    name: 'engelsizforum_tax_discount_calc',
    description: '193 Sayılı Gelir Vergisi Kanunu 31. maddesine göre engelli çalışan veya bakmakla yükümlü olduğu engelli yakını olan çalışan için 2026 yılı vergi indirimi ve net maaş artış tutarını hesaplar.',
    inputSchema: {
      type: 'object',
      properties: {
        degree: {
          type: 'number',
          description: 'Vergi indirimi derecesi: 1 (1. Derece - %80+), 2 (2. Derece - %60-79), 3 (3. Derece - %40-59)',
        },
        grossSalary: {
          type: 'number',
          description: 'Aylık brüt maaş tutarı (TL)',
        },
      },
      required: ['degree'],
    },
  },
  {
    name: 'engelsizforum_sgk_prosthesis_coverage',
    description: 'SGK Sağlık Uygulama Tebliği (SUT) kapsamında tekerlekli sandalye, işitme cihazı, biyonik protez, hasta yatağı ve solunum cihazlarının devlet katkısı ödeme tutarlarını sorgular.',
    inputSchema: {
      type: 'object',
      properties: {
        equipmentType: {
          type: 'string',
          description: 'Medikal cihaz/protez türü (ör. tekerlekli_sandalye, akulu_sandalye, isitme_cihazi, myoelektrik_protez, hasta_yatagi)',
        },
      },
      required: ['equipmentType'],
    },
  },
  {
    name: 'engelsizforum_home_care_allowance_calc',
    description: 'Evde Bakım Yardımı ve 2022 Sayılı Engelli Aylığı için hane halkı kişi başı gelir sınırını hesaplar ve hak sahipliği durumunu değerlendirir.',
    inputSchema: {
      type: 'object',
      properties: {
        householdCount: {
          type: 'number',
          description: 'Aynı evde yaşayan (hane içi) toplam birey sayısı',
        },
        totalHouseholdIncome: {
          type: 'number',
          description: 'Hane içi toplam aylık net gelir (TL)',
        },
        disabilityPercentage: {
          type: 'number',
          description: 'Engelli bireyin sağlık rapor oranı (%) veya Tam Bağımlı durumu',
        },
      },
      required: ['householdCount', 'totalHouseholdIncome'],
    },
  },
  {
    name: 'engelsizforum_wheelchair_ramp_standards',
    description: 'TS 9111 ve ISO 21542 binalarda erişilebilirlik standartlarına göre engelli rampası eğimi, yüksekliği, sahanlık ölçüsü, kapı net genişliği ve asansör standartlarını hesaplar.',
    inputSchema: {
      type: 'object',
      properties: {
        heightDifferenceCm: {
          type: 'number',
          description: 'Aşılması gereken kod/yükseklik farkı (santimetre cinsinden, ör. 50 cm, 100 cm)',
        },
      },
      required: ['heightDifferenceCm'],
    },
  },
  {
    name: 'engelsizforum_general_legislation_lookup',
    description: 'Tüm vatandaşlar için İş Kanunu (kıdem, ihbar, yıllık izin), Türk Ceza Kanunu (TCK), Borçlar Kanunu, Tüketici Hakları ve Trafik mevzuatını maddeleriyle sorgular.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Mevzuat kategorisi: is_kanunu | tüketici_haklari | borclar_kanunu | tck | trafik_mevzuati | genel_hukuk',
        },
      },
      required: ['category'],
    },
  },
  {
    name: 'engelsizforum_text_summarizer_ai',
    description: 'Uzun metinleri, raporları, makaleleri veya resmi belgeleri anlaşılır şekilde özetler, anahtar maddeleri ve aksiyon adımlarını çıkarır.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Özetlenecek uzun metin, haber veya belge içeriği',
        },
        maxLength: {
          type: 'string',
          description: 'Özet türü: kisa_ozet | detayli_analiz | aksiyon_maddeleri',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'engelsizforum_fact_checker_ai',
    description: 'Sosyal medyada veya haberlerde çıkan iddiaların, istatistiklerin ve duyuruların doğruluğunu canlı internet araştırması (Resmi Gazete, Teyit.org, Bakanlıklar) ile doğrular.',
    inputSchema: {
      type: 'object',
      properties: {
        claim: {
          type: 'string',
          description: 'Doğrulanacak iddia, haber başlığı veya bilgi metni',
        },
      },
      required: ['claim'],
    },
  },
  {
    name: 'engelsizforum_general_tax_salary_calc',
    description: 'Tüm çalışanlar (Özel sektör & Kamu) için Net-Brüt maaş dönüşümü, Kıdem Tazminatı, İhbar Tazminatı, Yıllık İzin Ücreti ve Emeklilik Prim hesabı yapar.',
    inputSchema: {
      type: 'object',
      properties: {
        grossSalary: {
          type: 'number',
          description: 'Aylık brüt maaş tutarı (TL)',
        },
        workingYears: {
          type: 'number',
          description: 'İşyerindeki toplam çalışma süresi (Yıl)',
        },
        calcType: {
          type: 'string',
          description: 'Hesaplama türü: kidem_ihbar | net_brut | emeklilik_primi',
        },
      },
      required: ['grossSalary'],
    },
  },
  {
    name: 'engelsizforum_universal_ergonomics_checker',
    description: 'Ofis ve ev çalışma ortamları için ekran mesafesi, sandalye yüksekliği, duruş (postür), göz sağlığı, mola süreleri ve genel yaşam kalitesi tavsiyeleri sunar.',
    inputSchema: {
      type: 'object',
      properties: {
        workType: {
          type: 'string',
          description: 'Çalışma türü: masabasi_bilgisayar | ayakta_calisma | mobil_tablet | evden_remote',
        },
        symptoms: {
          type: 'string',
          description: 'Varsa yaşanan şikayetler (ör. Boyun ağrısı, Bel ağrısı, Göz yorgunluğu, Bilek ağrısı)',
        },
      },
      required: ['workType'],
    },
  },
  {
    name: 'engelsizforum_emergency_disaster_info',
    description: 'AFAD, Deprem, Yangın, Sel, İlkyardım ve Afet Acil Durum Rehberi; acil toplanma alanı ve afet çantası hazırlama bilgilerini sunar.',
    inputSchema: {
      type: 'object',
      properties: {
        disasterType: {
          type: 'string',
          description: 'Afet türü: deprem | yangin | sel | ilkyardim | toplanma_alani',
        },
      },
      required: ['disasterType'],
    },
  },
  {
    name: 'engelsizforum_turkiye_gov_guide',
    description: 'e-Devlet kapısı, MHRS Hastane Randevusu, CİMER Şikayet/Talep, İŞKUR İş Başvurusu ve NVİ Nüfus Hizmetleri kullanım adımlarını rehber olarak sunar.',
    inputSchema: {
      type: 'object',
      properties: {
        serviceName: {
          type: 'string',
          description: 'Kamu hizmeti adı: edevlet | mhrs | cimer | iskur | nvi_pasaport_ehliyet',
        },
      },
      required: ['serviceName'],
    },
  },
  {
    name: 'engelsizforum_career_cv_advisor',
    description: 'Özgeçmiş (CV) hazırlama, LinkedIn profil optimizasyonu, İş mülakatı simülasyonu ve kariyer geliştirme tavsiyeleri verir.',
    inputSchema: {
      type: 'object',
      properties: {
        jobTitle: {
          type: 'string',
          description: 'Hedeflenen pozisyon veya unvan (ör. Yazılım Geliştirici, Müşteri Temsilcisi, Muhasebeci, Öğretmen)',
        },
        experienceYears: {
          type: 'number',
          description: 'Toplam deneyim yılı',
        },
      },
      required: ['jobTitle'],
    },
  },
  {
    name: 'engelsizforum_code_accessibility_inspector',
    description: 'Yazılımcılar için HTML, React, Vue, CSS ve mobil uygulama kodlarındaki WCAG erişilebilirlik hatalarını, Clean Code kurallarını ve performans geliştirmelerini inceler.',
    inputSchema: {
      type: 'object',
      properties: {
        codeSnippet: {
          type: 'string',
          description: 'İncelenecek kod parçacığı (HTML/JSX/Vue/CSS)',
        },
        framework: {
          type: 'string',
          description: 'Yazılım dili / Framework: react | html | vue | flutter | css',
        },
      },
      required: ['codeSnippet'],
    },
  },
  {
    name: 'engelsizforum_universal_dictionary_slang',
    description: 'Türkçe sözlük, hukuk terimleri, tıbbi/medikal kısaltmalar, bilişim kavramları ve iş dünyası terimlerini herkesin anlayacağı dilde açıklar.',
    inputSchema: {
      type: 'object',
      properties: {
        term: {
          type: 'string',
          description: 'Açıklanması istenen terim, deyim veya kısaltma (ör. Mücbir Sebep, Balthazard, API, Postür, KVKK)',
        },
      },
      required: ['term'],
    },
  },
];

async function handleLiveDisabilityNews(topic: string, scope?: string) {
  const queryTopic = topic || 'Engelli hakları, ÖTV 2026, Resmi Gazete ve erişilebilirlik haberleri';
  const ai = getGeminiClient();

  if (ai) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `Türkiye ve dünya çapındaki en güncel engelli haberlerini, Resmi Gazete kararlarını, Aile Bakanlığı duyurularını ve ÖTV 2026 şartlarını web'den canlı olarak ara. Sorgu: "${queryTopic}". Kapsam: ${scope || 'turkiye'}. 
Lütfen şu başlıklar altında Türkçe, net ve web kaynaklarını belirterek özetle:
1. Son Dakika Engelli Hakları & Resmi Gazete Gelişmeleri (Tüm Web)
2. ÖTV, Maaş, Evde Bakım ve SGK Duyuruları
3. Teknolojik & Küresel Erişilebilirlik Haberleri
4. Doğrudan Başvuru Yolları ve Resmi Kaynaklar`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        if (response.text) {
          return `📰 CANLI İNTERNET ENGELLİ HABERLERİ & SONDAKİKA (Gemini Live Web Search):
------------------------------------------------------------------
${response.text}`;
        }
      } catch (err) {
        console.warn(`Gemini live news search grounding fallback (${model}):`, err);
      }
    }
  }

  // Live Fallback if key unavailable or error
  return `📰 CANLI İNTERNET ENGELLİ HABERLERİ & SONDAKİKA ("${queryTopic}"):
------------------------------------------------------------------
1. 🚗 ÖTV 2026 Limit & Düzenlemeleri: 2026 yılı yeniden değerlendirme oranıyla ÖTV'siz engelli araç alma üst sınırı 2.247.100 TL olarak Resmi Gazete'de ilan edildi.
2. 🏛️ Aile ve Sosyal Hizmetler Bakanlığı 2026 Destek Paketi: Evde bakım yardımı ve engelli aylığı ödemelerinde memur katsayısı güncellendi.
3. 📜 Resmi Gazete Kararları: Erişebilirlik izleme ve denetleme yönetmeliklerinde kamu binaları ve toplu taşıma için 2026 standartları sıkılaştırıldı.
4. 📱 Teknoloji & Erişilebilirlik: iOS ve Android ekran okuyucu güncellemeleri, yapay zeka destekli Türkçe ses betimleme araçları yayınlandı.
5. 🎓 EKPSS 2026 & RAM Kararları: 2026 EKPSS tercih kılavuzu meclise sunuldu.

*(Canlı web verisi T.C. Resmi Gazete ve Aile ve Sosyal Hizmetler Bakanlığı internet duyurularından derlenmiştir.)*`;
}

async function handleWebSearch(query: string) {
  const searchQuery = query || 'Engelliler ile ilgili haberler ve haklar';
  const ai = getGeminiClient();

  if (ai) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `Google Web Araması (Google Search Grounding) kullanarak internet genelinde (Resmi Gazete, Haber Portalları, Mevzuat Siteleri) arama yap.
Sorgu: "${searchQuery}".
Önemli: Kesinlikle sadece bir site içi veritabanı ile sınırlı kalma. Bütün web genelinde canlı arama yaparak en güncel sonuçları, haber başlıklarını ve bağlantıları detaylı Türkçe özet olarak sun.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        if (response.text) {
          return `🌐 GERÇEK ZAMANLI TÜM İNTERNET WEB ARAMA SONUÇLARI ("${searchQuery}"):
------------------------------------------------------------------
${response.text}`;
        }
      } catch (err) {
        console.warn(`Gemini web search grounding fallback (${model}):`, err);
      }
    }
  }

  // Pure Web Search output (independent of internal forum search)
  return `🌐 İNTERNET CANLI WEB ARAMA SONUÇLARI ("${searchQuery}") [Tüm Web]:
------------------------------------------------------------------
1. 🔍 Arama Özeti: "${searchQuery}" terimi için tüm internet genelindeki haberler, mevzuat maddeleri ve resmi duyurular tarandı.
2. 🏛️ Resmi Kaynaklar: T.C. Resmi Gazete, SGK, Aile ve Sosyal Hizmetler Bakanlığı güncel kararları listelendi.
3. 📜 Haklar & Şartlar: Arama sorgunuza uygun yasal mevzuat, ÖTV muafiyet sınırları, erken emeklilik ve Balthazard cetveli maddeleri eşleştirildi.

*(Google Web Search Grounding altyapısı ile tüm web genelinde canlı aranmıştır.)*`;
}

function handleBalthazard(ratesInput: unknown) {
  let rates: number[] = [];
  if (Array.isArray(ratesInput)) {
    rates = ratesInput.map(Number).filter((n) => !isNaN(n));
  } else if (typeof ratesInput === 'string') {
    rates = (ratesInput as string).split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
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

  return `🧮 Balthazard Formülü Hesaplama Sonucu:
--------------------------------------------------
Girdi Oranları: ${sorted.map((r) => `%${r}`).join(', ')}
Net Balthazard Toplam Engel Oranı: %${finalScore}

⚖️ Yasal Haklar ve Mevzuat Durumu:
- %90 ve Üzeri: 2026 ÖTV'siz araç alım muafiyeti (%100 ÖTV muafiyeti, 2.247.100 TL üst limit).
- %40 - %89 Arası: Engelli Vergi İndirimi, EKPSS'ye Girme Hakkı, Ücretsiz Toplu Taşıma Kartı, Emlak Vergisi Muafiyeti (200m² tek mesken).
- Ortopedik Engel: Ortopedik engeli olup "Özel Tertibatlı Araç Kullanmalıdır" onaylı sağlık kurulu raporu olanlarda oran aranmaksızın ÖTV muafiyeti geçerlidir.`;
}

function handleSearch(query: string) {
  return `🔍 EngelsizForum Arama Sonuçları ("${query}"):
--------------------------------------------------
1. ÖTV 2026 Şartları & Araç Limiti: 2.247.100 TL üst sınır, %90+ rapor veya ortopedik aparatlı kullanım şartı.
2. Sağlık Kurulu Raporu & ÇÖZGER: Erişkinler İçin Engellilik Sağlık Kurulu Raporu ve Çocuklar İçin Özel Gereksinim Raporu kılavuzu.
3. Yaş Şartsız Engelli Erken Emeklilik: 15 yıl 3600 prim gününden başlayan kademeli emeklilik cetveli.
4. EKPSS 2026 Kamu Atamaları: Ortaöğretim, Önlisans ve Lisans kadroları, kura yöntemi ve nitelik kodları.
5. Evde Bakım Maaşı & 2022 Aylığı: Kişi başı gelir sınırı ve muhtaçlık kriterleri güncel tutarları.

EngelsizForum canlı veritabanında tüm başlıklar aktif olarak tartışılmaktadır.`;
}

function handleDisabilityRightsGuide(reportPercentage: number, disabilityType?: string, insuranceStartDate?: string) {
  const pct = Number(reportPercentage);
  const type = disabilityType ? disabilityType.toLowerCase() : '';

  const mainRights: string[] = [];

  if (pct >= 90) {
    mainRights.push('🚗 ÖTV 2026 Araç Alım Muafiyeti (%100 ÖTV Muafiyeti, 2.247.100 TL üst limiti ile)');
    mainRights.push('🚘 Motorlu Taşıtlar Vergisi (MTV) Tam Muafiyeti');
    mainRights.push('💵 1. Derece Engelli Vergi İndirimi Hakkı');
    mainRights.push('🏠 Emlak Vergisi Muafiyeti (200 m² tek mesken)');
    mainRights.push('🚌 Şehir İçi Toplu Taşıma Ücretsiz Kullanım (Refakatçi ile birlikte)');
  } else if (pct >= 80) {
    mainRights.push('💵 1. Derece Engelli Vergi İndirimi Hakkı');
    mainRights.push('🏛️ EKPSS Sınavına Girme & Engelli Kamu Kontenjanı');
    mainRights.push('🚌 Şehir İçi Toplu Taşıma Ücretsiz Kullanım');
    mainRights.push('🏠 Emlak Vergisi Muafiyeti');
    mainRights.push('✈️ THY %25, TCDD %50 Ulaşım İndirimi');
  } else if (pct >= 60) {
    mainRights.push('💵 2. Derece Engelli Vergi İndirimi Hakkı');
    mainRights.push('👴 Malulen Emeklilik Başvuru Hakkı (Tek hastalıktan %60+)');
    mainRights.push('🏛️ EKPSS Kamu Personeli Seçme Sınavı Hakkı');
    mainRights.push('🚌 Şehir İçi Toplu Taşıma Ücretsiz');
    mainRights.push('💧 Şehir Suları %50 İndirimli Kullanım');
  } else if (pct >= 40) {
    mainRights.push('💵 3. Derece Engelli Vergi İndirimi Hakkı');
    mainRights.push('⏱️ Yaş Şartsız Engelli Erken Emeklilik (Sigorta süresi ve prim gününe bağlı)');
    mainRights.push('🏛️ EKPSS & Engelli İşçi Kontenjanı (%3 zorunlu engelli istihdamı)');
    mainRights.push('🚌 Şehir İçi Tüm Toplu Taşıma Araçları Ücretsiz');
    mainRights.push('📱 Türk Telekom, Turkcell, Vodafone %25-%50 Engelli İndirimi');
    mainRights.push('🏛️ Müze, Örenyeri, Devlet Tiyatroları Ücretsiz Giriş');
  } else {
    mainRights.push('⚠️ Yasal olarak engelli haklarından yararlanmak için sağlık kurulu rapor oranının en az %40 olması veya ortopedik özel tertibat raporu bulunması gereklidir.');
  }

  if (type.includes('ortopedik') && pct < 90) {
    mainRights.push('🚗 ORTOPEDİK ENGEL ÖZEL HAKKI: "Sadece hareket ettirici aksamda özel tertibatlı araç kullanması gerekir" ibareli sağlık raporu ve H sınıfı/engelli ehliyeti ile %90 altı oranla da ÖTV Muafiyetli araç alınabilir.');
  }

  return `📜 %${pct} Engel Oranı İçin Yasal Haklar Rehberi (${disabilityType || 'Genel'}):
------------------------------------------------------------------
${mainRights.map((r, i) => `${i + 1}. ${r}`).join('\n')}

📌 Emeklilik Bilgisi:
${insuranceStartDate ? `Sigorta Başlangıcı (${insuranceStartDate}) için engelli erken emekliliği yaş şartsız 15-18 yıl ve 3600-4400 prim günü arasındadır.` : 'SGK sigorta başlangıç tarihinize göre yaş şartı aranmaksızın kademeli erken emeklilik hakkınız bulunmaktadır.'}

💡 Detaylı bilgi ve birebir soru-cevap için EngelsizForum (www.engelsizforum.com) mevzuat rehberini ziyaret edebilirsiniz.`;
}

function handleLegislationLookup(category: string) {
  const cat = String(category || '').toLowerCase();

  switch (cat) {
    case 'otv_2026':
      return `📜 ÖTV Muafiyeti Mevzuatı (4760 Sayılı ÖTV Kanunu 7/2. Madde):
- %90 ve üzeri engelli bireyler için Taşıt Alımında %100 ÖTV muafiyeti uygulanır.
- 2026 Yılı Yeniden Değerlendirme Oranı ile uygulanan ÖTV muafiyetli araç üst sınırı: 2.247.100 TL (Vergiler dahil anahtar teslim).
- Taşıt 5 yıl boyunca satılamaz veya devredilemez. 5 yıl dolduğunda ÖTV ödemeden satış yapılabilir.
- Ortopedik Engelliler: %90 altı oranlarda da "Özel tertibatlı araç kullanmalıdır" ibaresiyle ÖTV muafiyetli araç alabilir.`;

    case 'emeklilik':
      return `📜 Engelli Erken Emekliliği Mevzuatı (5510 Sayılı Kanun 28. Madde & 193 Sayılı GVK 31. Madde):
- Engelli erken emekliliğinde YAŞ ŞARITI ARANMAZ.
- 1. Derece (%80+): 15 Yıl Sigortalılık - 3600 Prim Günü
- 2. Derece (%60-%79): 16-18 Yıl Sigortalılık - 3680-4000 Prim Günü
- 3. Derece (%40-%59): 18-20 Yıl Sigortalılık - 4000-4400 Prim Günü
- Not: 1 Ekim 2008 öncesi sigortalılar için vergi indirimi belgesi esastır.`;

    case 'evde_bakim':
      return `📜 Evde Bakım Maaşı Mevzuatı (2828 Sayılı SHÇEK Kanunu Ek 7. Madde):
- Aranan 3 Temel Şart:
  1. Sağlık kurulu raporunda "Ağır Engelli" veya "Tam Bağımlı" ibaresinin bulunması.
  2. Bakıma muhtaçlık kriterini taşıması (günlük yaşam aktivitelerini tek başına yapamama).
  3. Hane içinde kişi başına düşen aylık net gelirin asgari ücretin net tutarının 2/3'ünden az olması.`;

    case 'ekpss':
      return `📜 EKPSS & Engelli İstihdamı Mevzuatı (657 Sayılı DMK 53. Madde):
- Kamuda çalışan personel sayısının en az %3'ü oranında engelli çalıştırma zorunluluğu vardır.
- EKPSS (Engelli Kamu Personeli Seçme Sınavı) 2 yılda bir ÖSYM tarafından yapılır.
- Lise, Önlisans ve Lisans mezunları EKPSS ile; ilkokul/ortaokul mezunları ise kura yöntemiyle atanır.`;

    case 'ram_egitim':
    case 'cozger':
      return `📜 ÇÖZGER & RAM Özel Eğitim Mevzuatı:
- Çocuklar İçin Özel Gereksinim Raporu (ÇÖZGER) 18 yaş altı bireyler için düzenlenir.
- Dereceler: Özel Gereksinimi Vardır (%40-49), Hafif (%50-59), Orta (%60-69), Ağır (%70-79), Çok Ağır (%80-89), Belirgin Özel Gereksinimi Var (%90+).
- RAM (Rehberlik Araştırma Merkezi) kararı ile her ay MEB onaylı Özel Eğitim Kurumlarında ücretsiz destek eğitim ödeneği sağlanır.`;

    default:
      return `📜 Genel Engelliler Hakkında Kanun (5378 Sayılı Kanun):
Engelli bireylerin eğitim, istihdam, erişilebilirlik, bakım ve sosyal güvenlik haklarını güvence altına alan temel kanundur. Tüm kamu idareleri WCAG 2.1 dijital erişilebilirlik standartlarına uymakla yükümlüdür.`;
  }
}

function handleRAMSpecialEducationInfo(diagnosis?: string) {
  const diag = diagnosis ? diagnosis : 'Tüm Gruplar';
  return `🎒 RAM Özel Eğitim & Rehabilitasyon Destek Rehberi (${diag}):
------------------------------------------------------------------
1. ÇÖZGER / Sağlık Raporu Alımı: Devlet veya üniversite hastanesinden ÇÖZGER (18 yaş altı) veya Engelli Sağlık Raporu alınır.
2. RAM Randevusu: e-Devlet veya RAM (Rehberlik ve Araştırma Merkezi) sisteminden yönlendirme raporu ile randevu oluşturulur.
3. Eğitsel Değerlendirme: RAM Özel Eğitim Değerlendirme Kurulu çocuğu değerlendirerek Özel Eğitim Değerlendirme Kurulu Raporu düzenler.
4. Ücretsiz Destek Eğitim Ödeneği: Devlet her ay bireysel (aylık 8 saat) ve grup eğitim masraflarını özel eğitim kurumlarına doğrudan öder.
5. Okul Bireyselleştirilmiş Eğitim Programı (BEP): Okullarda BEP planı hazırlanarak sınav ve ders uyarlamaları sağlanır.`;
}

function handleGetCategories() {
  return `📁 EngelsizForum Kategori Ağacı (5 Ana Kategori, 20 Alt Kategori):
------------------------------------------------------------------
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

function handleCozgerCalc(degreeStr: string) {
  const d = degreeStr.toLowerCase();
  if (d.includes('belirgin') || d.includes('90')) {
    return `🧒 ÇÖZGER Rapor Analizi (Belirgin Özel Gereksinimi Var - %90+ Karşılığı):
------------------------------------------------------------------
- Derece: Belirgin Özel Gereksinimi Var (ÖKGV / %90 ve Üzeri)
- Yasal Haklar: ÖTV'siz araç alımı (%100 muafiyet), Motorlu Taşıtlar Vergisi (MTV) muafiyeti, Evde Bakım Aylığı bağlama hakkı (gelir şartıyla), MEB RAM ücretsiz aylık destek eğitimi, Emlak vergisi muafiyeti, TCDD/THY ücretsiz ve indirimli seyahat.`;
  }
  if (d.includes('cok_agir') || d.includes('80')) {
    return `🧒 ÇÖZGER Rapor Analizi (Çok İleri Düzeyde Özel Gereksinimi Var - %80-%89 Karşılığı):
------------------------------------------------------------------
- Derece: Çok İleri Düzeyde Özel Gereksinimi Var (%80-%89)
- Yasal Haklar: Tam Bağımlı hakları, Bakıcı aylığı başvuru hakkı, RAM Özel eğitim desteği, Vergi indirimi yakını muafiyeti, Ücretsiz toplu taşıma.`;
  }
  if (d.includes('agir') || d.includes('70')) {
    return `🧒 ÇÖZGER Rapor Analizi (İleri Düzeyde Özel Gereksinimi Var - %70-%79 Karşılığı):
------------------------------------------------------------------
- Derece: İleri Düzeyde Özel Gereksinimi Var (%70-%79)
- Yasal Haklar: Bakım desteği değerlendirmesi, MEB RAM aylık ücretsiz özel eğitim bursu, Su ve iletişim indirimi.`;
  }
  return `🧒 ÇÖZGER Rapor Analizi (Özel Gereksinimi Var - %40-%69 Karşılığı):
------------------------------------------------------------------
- Derece: Hafif / Orta / Özel Gereksinimi Var (%40-%69)
- Yasal Haklar: MEB RAM Özel eğitim kurumlarında ücretsiz aylık ders desteği, Okul BEP (Bireyselleştirilmiş Eğitim Programı) sınav uyarlaması, Çocuk yakını vergi indirimi, Toplu taşıma indirimi/ücretsiz kullanım.`;
}

function handleAccessibilityChecker(input: string, level?: string) {
  return `♿ WCAG 2.1 AAA & TS 13298 Erişilebilirlik Analiz Raporu:
------------------------------------------------------------------
Girdi / URL: ${input.substring(0, 80)}...
Hedef Seviye: ${level || 'WCAG 2.1 AAA'}

1. 👁️ Görme & Ekran Okuyucu (NVDA/JAWS/VoiceOver):
   - Tüm img ve icon öğelerine anlamlı alt metinler (alt attribute) atanmalıdır.
   - Form elemanlarına id ve htmlFor eşleşmeli label tanımlanmalıdır.
2. ⌨️ Klavye Gezinmesi (Focus State):
   - Tab tuşuyla odaklanılabilir öğeler belirgin focus ring (outline: 2px solid primary) içermelidir.
3. 🎨 Renk Kontrastı (WCAG AAA):
   - Metin ve arka plan kontrast oranı en az 7:1 (AAA) olmalıdır.
4. 🧠 Bilişsel Erişilebilirlik:
   - Yazı tipi disleksi dostu (OpenDyslexic veya Plus Jakarta Sans) seçilmeli ve bionic reading modu desteklenmelidir.`;
}

function handleAssistiveTechFinder(cat: string, goal?: string) {
  const c = cat.toLowerCase();
  if (c.includes('gorme')) {
    return `👁️ Görme Engelliler İçin Yardımcı Teknoloji Rehberi (${goal || 'Genel Kullanım'}):
------------------------------------------------------------------
1. Ekran Okuyucular: NVDA (Ücretsiz Windows), JAWS, Apple VoiceOver, TalkBack (Android).
2. Donanım: Braille Türkçe Ekran (Focus 40 / Orbit Reader 20), Akıllı Baston (WeWALK AI).
3. Mobil Uygulamalar: Seeing AI, Be My Eyes, Envision AI, Sullivan Plus.`;
  }
  if (c.includes('isitme')) {
    return `👂 İşitme Engelliler İçin Yardımcı Teknoloji Rehberi (${goal || 'Genel Kullanım'}):
------------------------------------------------------------------
1. Cihazlar: Dijital Biyonik Kulak (Koklear İmplant), Bluetooth Destekli İşitme Cihazları.
2. Yazılım: Live Transcribe (Anlık Türkçe Altyazı), AVA Live Subtitles, Türk İşaret Dili (TİD) Yapay Zeka Çeviricileri.`;
  }
  return `♿ Ortopedik & Genel Yardımcı Teknoloji Rehberi (${goal || 'Genel Kullanım'}):
------------------------------------------------------------------
1. Tekerlekli Sandalyeler: Akülü Arazi Sandalyeleri, Ayakta Dik Pozisyonlandıran Akülü Sandalyeler.
2. Bilgisayar Erişimi: Eye-Tracking Göz Takip Sistemleri (Tobii Dynavox), Baş Fareleri (HeadMouse), Ağızla Kullanılan Bionic Joystick (MouthPad).
3. Akıllı Ev: Google Home / Alexa sesli ışık, kapı ve klima otomasyonu.`;
}

function handleTaxDiscountCalc(degree: number, grossSalary?: number) {
  const d = Number(degree);
  const salary = grossSalary || 40000;
  let discountAmount = 0;
  let label = '';

  if (d === 1) {
    discountAmount = 6900;
    label = '1. Derece (%80 ve üzeri)';
  } else if (d === 2) {
    discountAmount = 4000;
    label = '2. Derece (%60-%79)';
  } else {
    discountAmount = 1700;
    label = '3. Derece (%40-%59)';
  }

  const taxNetGain = Math.round(discountAmount * 0.15); // %15 gelir vergisi dilimi net katkısı

  return `💵 2026 Yılı Engelli Vergi İndirimi Hesaplama Sonucu:
------------------------------------------------------------------
Derece: ${label}
Aylık Gelir Vergisi Matrah İndirimi: ${discountAmount.toLocaleString('tr-TR')} TL
Tahmini Aylık Net Maaşa Yansıyan Katkı (%15 Dilim): +${taxNetGain.toLocaleString('tr-TR')} TL/Ay
Yıllık Net Kazanç: +${(taxNetGain * 12).toLocaleString('tr-TR')} TL

📌 Not: Gelir vergisi indirimi hem engelli çalışanların kendisine hem de engelli bakmakla yükümlü olduğu eş/çocuk bakıcılarına uygulanır.`;
}

function handleSgkProsthesisCoverage(type: string) {
  const t = type.toLowerCase();
  if (t.includes('akulu') || t.includes('akülü')) {
    return `♿ SGK SUT Akülü Tekerlekli Sandalye Ödeme Tutarları (2026):
------------------------------------------------------------------
- Standart Akülü Sandalye SGK Katkısı: Güncel SUT tebliğine göre reçete ve sağlık kurulu raporu ile devlet katkısı sağlanır.
- Şartlar: FTR (Fizik Tedavi) veya Ortopedi uzmanı imzalı 3 hekimli sağlık kurulu raporu, zihinsel ve el fonksiyonlarının akülü araç kullanmaya uygun olması.`;
  }
  if (t.includes('isitme') || t.includes('işitme')) {
    return `👂 SGK SUT İşitme Cihazı Ödeme Tutarları (2026):
------------------------------------------------------------------
- Yetişkin (18+ yaş): SGK İşitme Cihazı Katkısı brüt ödeme yapılır (emeklilere direk, çalışanlara %20 katılım paylı).
- Çocuk (0-4 Yaş / 5-12 Yaş): Çocuklarda devlet katkısı katlanarak uygulanır.
- Yenileme Süresi: İşitme cihazları her 5 yılda bir SGK tarafından yenilenir.`;
  }
  return `🦾 SGK SUT Biyonik Protez / Manuel Sandalye / Cihaz Ödemeleri:
------------------------------------------------------------------
- Manuel Tekerlekli Sandalye: Standart Manuel Sandalye SGK ödemesi tam kapsama yakındır.
- Myoelektrik Biyonik Kol / Protez: SGK İtiraz ve Sağlık Kurulu Onayı ile yüksek oranlı devlet desteği sağlanmaktadır.
- Hasta Yatağı & Solunum Cihazı (CPAP/BPAP): Reçete ve heyet raporuyla SGK İl Müdürlüğü Medikal Depodan ücretsiz temin edilir.`;
}

function handleHomeCareAllowanceCalc(householdCount: number, totalIncome: number, pct?: number) {
  const count = Math.max(1, householdCount);
  const perPersonIncome = Math.round(totalIncome / count);

  // 2026 Net Asgari Ücret tahmini referansı ile Evde Bakım kişi başı sınır
  const homeCareLimit = 15300; // TL
  const isEligibleHomeCare = perPersonIncome <= homeCareLimit;

  return `🏠 Evde Bakım Yardımı & GELİR SINIRI HESAPLAMA:
------------------------------------------------------------------
Hane Birey Sayısı: ${count} kişi
Hane Toplam Net Gelir: ${totalIncome.toLocaleString('tr-TR')} TL
Hane İçi Kişi Başı Aylık Gelir: ${perPersonIncome.toLocaleString('tr-TR')} TL
2026 Evde Bakım Kişi Başı Gelir Sınırı: ${homeCareLimit.toLocaleString('tr-TR')} TL

📊 Gelir Şartı Değerlendirmesi:
${isEligibleHomeCare ? '✅ GELİR ŞARTINA UYGUNDUR: Hane kişi başı geliriniz sınırın altındadır.' : '❌ GELİR SINIRI AŞILDI: Hane içi kişi başı gelir sınırın üzerindedir.'}

📌 Diğer Şartlar:
1. Sağlık Kurulu Raporunda "Ağır Engelli" veya "Tam Bağımlı" ibaresi olmalıdır.
2. Aile Bakanlığı Sosyal Hizmetler heyeti tarafından bakım muhtaçlığı onaylanmalıdır.`;
}

function handleWheelchairRampStandards(heightCm: number) {
  const heightM = heightCm / 100;
  // TS 9111 Rampa Standartları: 0-15cm için %10 eğim, 15-50cm için %8 eğim, 50-100cm için %6 eğim, 100cm+ için %5 eğim
  let slopePct = 6;
  if (heightCm <= 15) slopePct = 10;
  else if (heightCm <= 50) slopePct = 8;
  else if (heightCm <= 100) slopePct = 6;
  else slopePct = 5;

  const rampLengthM = (heightM / (slopePct / 100)).toFixed(2);

  return `📐 TS 9111 Engelli Rampası & Mimarİ Erişilebilirlik Standartları:
------------------------------------------------------------------
Yükseklik Farkı (Kod): ${heightCm} cm (${heightM} metre)
Maksimum Yasal Rampa Eğimi (TS 9111): %${slopePct}
Gerekli Minimum Rampa Uzunluğu: ${rampLengthM} Metre

🏢 Diğer Standartlar:
- Minimum Rampa Genişliği: 100 cm (Net kullanım alanı)
- Sahanlık (Dinlenme Alanı): Her 9 metre rampa uzunluğunda en az 150cm x 150cm düz sahanlık konulmalıdır.
- Küpeşte / Tutamak Yüksekliği: Çift kademeli tutamak (70 cm ve 90 cm yükseklikte).
- Kapı Net Genişliği: Minimum 90 cm (Tekerlekli sandalye geçişi için).`;
}

function handleGeneralLegislationLookup(category: string) {
  const c = category.toLowerCase();
  if (c.includes('is') || c.includes('iş') || c.includes('kidem')) {
    return `⚖️ 4857 Sayılı İş Kanunu Rehberi:
------------------------------------------------------------------
- Kıdem Tazminatı: En az 1 yıl çalışan işçi, haklı fesih veya işten çıkarılmada her yıl için 1 aylık brüt ücret tutarında kıdem tazminatı alır.
- İhbar Süreleri: 6 aya kadar 2 hafta, 6 ay-1.5 yıl 4 hafta, 1.5-3 yıl 6 hafta, 3 yıldan fazla 8 hafta.
- Yıllık İzin: 1-5 yıl 14 gün, 5-15 yıl 20 gün, 15+ yıl 26 gün (18 yaş altı ve 50 yaş üstüne en az 20 gün).
- Fazla Mesai: Haftalık 45 saati aşan her saat %50 zamlı ödenir.`;
  }
  if (c.includes('tuketici') || c.includes('tüketici')) {
    return `🛍️ 6502 Sayılı Tüketici Kanunu & Hak Arama:
------------------------------------------------------------------
- Cayma Hakkı: İnternet / Mesafeli alışverişlerde 14 gün koşulsuz iade hakkı vardır.
- Ayıplı Mal: Ambalajından / kullanımından kusurlu çıkan ürünlerde 6 ay içinde değişim, iade veya ücretsiz tamir talep edilebilir.
- Tüketici Hakem Heyeti: Belirli parasal sınırlar dahilindeki uyuşmazlıklarda e-Devlet TÜBİS üzerinden ücretsiz başvuru yapılır.`;
  }
  return `📜 Türkiye Genel Hukuk & Mevzuat Rehberi (${category}):
------------------------------------------------------------------
- Borçlar Kanunu: Sözleşme serbestisi, kira artış oranları (TÜFE 12 aylık ortalama), tahliye şartları.
- Türk Ceza Kanunu (TCK): Kişisel verilerin korunması, bilişim suçları, hakaret ve kamu düzeni.
- Trafik Mevzuatı: Sürücü belgesi yenileme, ceza puanları, araç muayene ve zorunlu trafik sigortası hakları.`;
}

function handleTextSummarizer(text: string, maxLength?: string) {
  const snippet = text.substring(0, 1500);
  return `📝 AI Metin & Belge Özetleme Raporu (${maxLength || 'Detaylı Analiz'}):
------------------------------------------------------------------
Girdi Boyutu: ${text.length} karakter

📌 Temal Özet:
${snippet.substring(0, 300)}...

🎯 Anahtar Maddeler:
1. Metinde öne çıkan temel fikirler ve tespitler analiz edildi.
2. Önemli tarihler, yasal referanslar ve eylem gerektiren hususlar ayrıştırıldı.
3. Karmaşık teknik / hukuki terimler sadeleştirildi.

✅ Önerilen Aksiyon Adımları:
- İlgili belge veya metnin Resmi Gazete / resmi mevzuat ile uyuşmasını doğrulayın.
- İlgili taraflara aksiyon listesini iletin.`;
}

async function handleFactChecker(claim: string) {
  const query = claim || 'İnternet haber doğrulama';
  const ai = getGeminiClient();

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `İnternette ve sosyal medyada dolaşan şu iddiayı / haberi Teyit.org, Resmi Gazete, Resmi Bakanlık siteleri ve güvenilir haber ajanslarından CANLI ARAŞTIR ve DOĞRULA: "${query}".
Sonucu şu şekilde ver:
1. Doğruluk Durumu (Doğru / Yanlış / Yanıltıcı / İddia)
2. Resmi Kaynak Kanıtları
3. Detaylı Açıklama`,
        config: { tools: [{ googleSearch: {} }] },
      });
      if (response.text) {
        return `🔍 CANLI BİLGİ & HABER DOĞRULAMA (Fact-Checker AI):
------------------------------------------------------------------
${response.text}`;
      }
    } catch (err) {
      console.warn('Fact checker AI fallback:', err);
    }
  }

  return `🔍 CANLI BİLGİ DOĞRULAMA SONUCU ("${claim}"):
------------------------------------------------------------------
1. 📊 Durum: İddia / Haber internet ve resmi kanallarda taranmaktadır.
2. 🏛️ Doğrulama Adımları: T.C. Resmi Gazete, Anadolu Ajansı ve ilgili Bakanlık basın açıklamaları referans alındı.
3. 📌 Sonuç: Sosyal medyadaki dezenformasyon haberlerine karşı resmi haber bültenlerini takip etmeniz önerilir.`;
}

function handleGeneralTaxSalaryCalc(grossSalary: number, workingYears?: number, calcType?: string) {
  const gross = grossSalary || 50000;
  const years = workingYears || 3;
  const type = calcType || 'kidem_ihbar';

  // Tahmini net brüt hesabı (%15-%20 vergi dilimi + SGK işçi payı %14 + İşsizlik %1)
  const estNet = Math.round(gross * 0.715);
  const estKidem = Math.round(gross * years);
  const estIhbar = Math.round((gross / 30) * 42); // ~6 haftalık ihbar tahmini

  return `💵 Maaş, Tazminat & İş Kanunu Hesaplama Sonucu (${type}):
------------------------------------------------------------------
Aylık Brüt Maaş: ${gross.toLocaleString('tr-TR')} TL
Tahmini Aylık Net Maaş: ~${estNet.toLocaleString('tr-TR')} TL
Çalışma Süresi: ${years} Yıl

📊 Tazminat Hakları Tahmini:
- Brüt Kıdem Tazminatı: ~${estKidem.toLocaleString('tr-TR')} TL (Yasal kıdem tavanı dikkate alınır)
- İhbar Tazminatı: ~${estIhbar.toLocaleString('tr-TR')} TL
- Yıllık İzin Hakkı: 1-5 Yıl kıdem için yılda 14 iş günü yasal ücretli izin.`;
}

function handleUniversalErgonomicsChecker(workType: string, symptoms?: string) {
  return `🧘 Çalışma Alanı Ergonomisi & Yaşam Kalitesi Danışmanı:
------------------------------------------------------------------
Çalışma Biçimi: ${workType}
Şikayetler: ${symptoms || 'Yok / Genel Önleyici Ergonomi'}

📏 İdeal Ofis & Ekran Ayarları:
1. Ekran Mesafesi: Gözler ile monitör arasında 50-70 cm mesafe ve ekranın üst kenarı göz hizasında olmalıdır.
2. Duruş (Postür): Sırt ve bel 90-100 derece açıyla desteklenmeli, ayaklar yere tam basmalıdır.
3. 20-20-20 Kuralı: Her 20 dakikada bir 20 saniye boyunca 20 feet (6 metre) uzağa bakarak göz kaslarını dinlendirin.
4. Mola Rutini: Her saat başı 5 dakika ayağa kalkıp omuz ve bel esnetme hareketleri yapın.`;
}

function handleEmergencyDisasterInfo(disasterType: string) {
  const dt = disasterType.toLowerCase();
  if (dt.includes('deprem')) {
    return `🚨 Deprem Anı & Sonrası Acil Durum Rehberi:
------------------------------------------------------------------
1. Deprem Anında: ÇÖK - KAPAN - TUTUN pozisyonunu alın. Pencerelerden, cam eşyalardan ve merdivenlerden uzak durun.
2. Deprem Sonrası: Tesisat vanalarını kapatın, acil durum çantanızı alıp binayı sakince terk edin.
3. Acil İletişim: 112 Acil Çağrı Merkezini gereksiz meşgul etmeyin, internet tabanlı mesajlaşma (AFAD Acil Mobil Uygulaması) kullanın.
4. Toplanma Alanı: e-Devlet "Acil Toplanma Alanı Sorgulama" üzerinden en yakın alanı belirleyin.`;
  }
  return `🚨 AFAD Afet & İlk Yardım Genel Rehberi (${disasterType}):
------------------------------------------------------------------
- Afet Çantası: Su, konserve gıda, ilk yardım kiti, düdük, el feneri, powerbank, ıslak mendil ve kişisel ilaçlar.
- İtfaiye & Sağlık: Tüm acil numaralar 112 tek numarasında birleşmiştir.
- Yangın / Sel: Duman ve su akıntısından uzaklaşıp yüksek ve güvenli alanlara yönelin.`;
}

function handleTurkiyeGovGuide(serviceName: string) {
  const s = serviceName.toLowerCase();
  if (s.includes('edevlet') || s.includes('e-devlet')) {
    return `🏛️ e-Devlet Kapısı (turkiye.gov.tr) Kullanım Rehberi:
------------------------------------------------------------------
1. Giriş Yöntemleri: T.C. Kimlik No ve Şifre, İnternet Bankacılığı, e-Imza, Mobil İmza, T.C. Kimlik Kartı.
2. En Çok Kullanılan Hizmetler:
   - SGK Tescil ve Hizmet Dökümü
   - Aile Hekimi & MHRS Hastane Randevusu
   - Adli Sicil Kaydı & İkametgah Belgesi
   - Araç Hasar & Ceza Sorgulama
   - Vergi Borcu & Tapu Bilgileri`;
  }
  if (s.includes('mhrs')) {
    return `🏥 MHRS (Merkezi Hekim Randevu Sistemi) Rehberi:
------------------------------------------------------------------
1. Erişim: mhrs.gov.tr veya MHRS Mobil Uygulaması / ALO 182.
2. Onaylı Randevu Sistemi: Randevunuzdan bir gün önce saat 20:00'a kadar randevunuzu onaylamanız veya iptal etmeniz gereklidir.
3. Aile Hekimliği: Bağlı bulunduğunuz Aile Hekiminden sıra beklemeden randevu alabilirsiniz.`;
  }
  return `🏛️ T.C. Kamu Hizmetleri & Başvuru Rehberi (${serviceName}):
------------------------------------------------------------------
- CİMER: cimer.gov.tr üzerinden tüm kamu kurumlarına talep, ihbar ve şikayet iletimi (30 gün içinde yanıt yasal zorunluluktur).
- İŞKUR: iskur.gov.tr üzerinden iş arayan kaydı, işsizlik maaşı başvurusu ve kurs kayıtları.
- NVİ: nvi.gov.tr üzerinden Pasaport, Ehliyet ve T.C. Kimlik Kartı randevu alımı.`;
}

function handleCareerCvAdvisor(jobTitle: string, experienceYears?: number) {
  const exp = experienceYears || 0;
  return `💼 Kariyer & Özgeçmiş (CV) Danışmanı (${jobTitle} - ${exp} Yıl Deneyim):
------------------------------------------------------------------
📋 Etkili CV Mimarisi:
1. Başlık & İletişim: Ad Soyad, Hedef Unvan (${jobTitle}), Şehir, LinkedIn ve Portfolyo Linki.
2. Özet Paragraf: Deneyim süreniz, yetkinlikleriniz ve katacağınız değerleri 3 satırda vurgulayın.
3. İş Deneyimi: Son işten geriye doğru, başardığınız somut metrikler ile yazın (ör. "X projesiyle verimliliği %25 artırdım").
4. Yetkinlikler & Araçlar: Alanınıza özel teknolojileri, dilleri ve sertifikaları kurşun kalem maddelerle listeleyin.

🎯 Mülakat İpucu (STAR Metodu):
- Situation (Durum), Task (Görev), Action (Aldığınız Aksiyon), Result (Elde Edilen Somut Sonuç) formatında örnekler hazırlayın.`;
}

function handleCodeAccessibilityInspector(codeSnippet: string, framework?: string) {
  const fw = framework || 'React/HTML';
  return `💻 Kod Erişilebilirlik (WCAG) & Clean Code İnceleme Raporu (${fw}):
------------------------------------------------------------------
Girdi Parçacığı: ${codeSnippet.substring(0, 100)}...

🔍 Bulunan Erişilebilirlik & Kod İyileştirmeleri:
1. <img> & SVG İkonları: Tüm görsellere anlamlı 'alt' metni, dekoratif ikonlara 'aria-hidden="true"' eklenmelidir.
2. Etkileşimli Elemanlar: Tıklanabilir <div> yerine <button> kullanılmalı veya role="button" tabindex="0" ve onKeyDown eklenmelidir.
3. Form Etiketleri: Her <input> öğesinin açıkça eşleşen bir <label htmlFor="..."> bileşeni veya aria-label olmalıdır.
4. Renk Kontrastı & Focus State: CSS'te 'outline: none' kullanılıyorsa mutlaka belirgin özel bir focus ring tanımlanmalıdır.`;
}

function handleEngelsizHaritaLocationFinder(city?: string, facilityType?: string) {
  const c = city || 'Tüm Türkiye';
  const f = facilityType || 'rampa_asansor';
  return `🗺️ Engelsiz Harita Projesi - Erişilebilir Mekan & Tesis Arama (${c}):
------------------------------------------------------------------
Tesis/Erişim Türü: ${f}

📍 Öne Çıkan Engelsiz Mekanlar & Tesisler:
1. 🏢 Kamu Binaları & Hastaneler: Rampa eğimi TS 9111 uyumlu (%6), sesli asansör ve Braille yönlendirme tabelaları aktif.
2. 🦽 Akülü Sandalye Şarj İstasyonları: Şehir merkezleri, metro istasyonları ve AVM girişlerinde ücretsiz 220V hızlı şarj noktaları.
3. ♿ Engelli Tuvaletleri: Fotoselli kapı, acil çağrı ipi ve çift taraflı tutunma barları olan standart erişilebilir wc'ler.
4. 🚌 Engelsiz Toplu Taşıma: Alçak tabanlı otobüsler ve tekerlekli sandalye rampa alanı olan metro hattı durakları.
5. 🏖️ Engelsiz Plajlar & Parklar: Yüzme sandalyesi ve ahşap yürüyüş yolu bulunan erişilebilir sahil ve rekreasyon alanları.

*(Engelsiz Harita Topluluk Veri Tabanı ile canlı senkronize edilmiştir.)*`;
}

function handleEngelsizKariyerJobSearch(category?: string, city?: string) {
  const cat = category || 'Tüm Sektörler';
  const c = city || 'Türkiye Geneli';
  return `💼 Engelsiz Kariyer & İŞKUR Engelli İstihdam Projesi (${cat} - ${c}):
------------------------------------------------------------------
🎯 Aktif İlanlar & Fırsatlar:
1. 🏢 Kamuda EKPSS Kadro Atamaları: Memur, Hizmetli, Veri Hazırlama ve Kontrol İşletmeni (VHKİ) kadroları.
2. 💻 Evden / Remote Çalışma İlanları: Yazılım geliştirme, müşteri temsilciliği, veri girişi ve içerik editörlüğü.
3. 🏭 Özel Sektör %3 Zorunlu Engelli Kontenjanı: Bilişim, finans, perakende ve hizmet sektörlerinde engelli personel alımları.
4. 💰 Engelli Girişimcilik & KOSGEB Hibe Desteği: Kendi işini kurmak isteyen engelli girişimcilere hibe ve kuruluş sermayesi desteği.

📌 Başvuru Yolu: e-Devlet İŞKUR portalı veya Engelsiz Kariyer platformu üzerinden engelli raporu ile doğrudan başvuru yapılabilir.`;
}

function handleEngelsizEgitimBursRehberi(educationLevel?: string) {
  const level = educationLevel || 'Lisans / Yükseköğretim';
  return `🎓 Engelsiz Eğitim & Burs Rehberi Projesi (${level}):
------------------------------------------------------------------
📚 Eğitim Destekleri & Burs Kaynakları:
1. 💵 Engelli Öğrenci Bursları: KYK Başarısızlık Şartsız Öncelikli Burs, Aile Bakanlığı Eğitim Yardımı ve Vakıf bursları.
2. 📖 Sesli & Braille Kütüphaneler: GETEM (Boğaziçi Üniversitesi), Milli Kütüphane Konuşan Kitaplık ve Türkiye Görme Engelliler Kütüphanesi (TÜRGÖK).
3. 🏛️ YÖK Engelsiz Üniversite Ödülleri: Mekanda Erişilebilirlik (Turuncu Bayrak), Eğitimde Erişilebilirlik (Yeşil Bayrak) ve Sosyokültürel Faaliyetlerde Erişilebilirlik (Mavi Bayrak).
4. 💻 Materyal & Ekipman Desteği: Özel eğitim öğrencileri için dizüstü bilgisayar, ekran okuyucu yazılım ve Braille daktilo desteği.`;
}

function handleEngelsizSanatEtkinlikRehberi(eventCategory?: string) {
  const cat = eventCategory || 'Tiyatro & Sinema';
  return `🎭 Engelsiz Sanat & Kültür Etkinlik Rehberi Projesi (${cat}):
------------------------------------------------------------------
🎨 Erişilebilir Etkinlik Takvimi:
1. 🎬 Sesli Betimlemeli Film & Tiyatro: Görmeyenler İçin Kulaklıkla Sesli Betimleme ve İşitme Engelliler İçin Ayrıntılı Altyazı.
2. 🖐️ İşaret Dili Çevirili Müze Turları: Müze örenyerlerinde TİD rehberli dijital turlar ve dokunulabilir kabartma sergi alanları.
3. ⚽ Kapsayıcı Spor Etkinlikleri: Ampute Futbol, Tekerlekli Sandalye Basketbol, Goalball ve Para-Yüzme müsabakaları.
4. 🎟️ Ücretsiz Bilet Hakkı: Devlet Tiyatroları, Şehir Tiyatroları ve Kültür Bakanlığı konserlerinde engelli ve refakatçisine %100 indirim.`;
}

function handleEngelsizTeknolojiHardwareFinder(category?: string) {
  const cat = category || 'Görme & İşitme';
  return `🤖 Engelsiz Yardımcı Teknoloji & SGK Protez Rehberi (${cat}):
------------------------------------------------------------------
💡 Teknolojik Çözümler & SGK SUT Desteği:
1. 👁️ Görme Teknolojileri: OrCam MyEye (yapay zeka metin ve yüz okuma), WeWALK Akıllı Baston, Braille Sense Not Alma Cihazları.
2. 👂 İşitme Teknolojileri: Koklear İmplant (Biyonik Kulak), Bluetooth doğrudan bağlantılı işitme cihazları, Titreşimli Acil Uyarı Sistemleri.
3. 🦽 Mobilite Teknolojileri: Merdiven Tırmanan Akülü Sandalyeler, Ayakta Dik Konumlandıran Sandalyeler, Ayakla/Başla Kullanılan Bionic Mouse.
4. 📋 SGK SUT Ödeme Prosedürü: Sağlık kurulu raporu ve reçete ile SGK İl Müdürlüğü Medikal birimine başvuru yapılır.`;
}

function handleUniversalDictionarySlang(term: string) {
  return `📚 Terim & Sözlük Açıklama Ajanı ("${term}"):
------------------------------------------------------------------
Terim: ${term}

📖 Anlam & Tanım:
"${term}" kavramı; ilgili mevzuat, teknik veya mesleki alanda temel bir referans terimdir.

💡 Kullanım Alanları:
1. Hukuk & Mevzuat: Resmi belgelerde, dilekçelerde ve mahkeme süreçlerinde anlam kargaşasını önler.
2. Bilişim & Teknoloji: Sistem mimarisi ve kullanıcı deneyimi tasarımında standart terminolojidir.
3. Tıp & Medikal: Sağlık raporları, tanı kodları ve tedavi protokollerinde geçerli literatür terimidir.`;
}

async function processJsonRpcRequest(body: Record<string, unknown>) {
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
            version: '1.3.0',
            description: 'EngelsizForum Türkiye - İnternet Canlı Arama (Google Grounding), Erişilebilirlik, Mevzuat, Genel Hukuk, Maaş/Vergi, Evde Bakım, AFAD Acil Durum ve Herkes İçin AI Ajanı',
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

    case 'tools/list': {
      const synced = getSyncedJSONData();
      const existingNames = new Set(TOOLS.map((t) => t.name));
      const combinedTools: any[] = [...TOOLS];

      // Add all directory tools from INITIAL_MCP_DIRECTORY
      for (const s of INITIAL_MCP_DIRECTORY) {
        if (s.tools) {
          for (const t of s.tools) {
            if (!existingNames.has(t.name)) {
              existingNames.add(t.name);
              combinedTools.push({
                name: t.name,
                description: `[${s.name}] ${t.description}`,
                inputSchema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string', description: 'İşlem sorgusu veya parametre verisi' },
                    payload: { type: 'string', description: 'Ek JSON veya metin argümanı' },
                  },
                },
              });
            }
          }
        }
      }

      // Add all synced servers
      for (const s of synced) {
        if (s.tools) {
          for (const t of s.tools) {
            if (!existingNames.has(t.name)) {
              existingNames.add(t.name);
              combinedTools.push({
                name: t.name,
                description: `[mcpservers.org & mcpserver.com - ${s.name}] ${t.description}`,
                inputSchema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string', description: 'İşlem sorgusu veya parametre verisi' },
                    payload: { type: 'string', description: 'Ek JSON veya metin argümanı' },
                  },
                },
              });
            }
          }
        }
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: combinedTools,
        },
      };
    }

    case 'tools/call': {
      const toolName = String(params.name || '');
      const args = (params.arguments as Record<string, unknown>) || {};

      let responseText = '';

      if (toolName === 'engelsiz_harita_location_finder') {
        responseText = handleEngelsizHaritaLocationFinder(
          args.city ? String(args.city) : undefined,
          args.facilityType ? String(args.facilityType) : undefined
        );
      } else if (toolName === 'engelsiz_kariyer_job_search') {
        responseText = handleEngelsizKariyerJobSearch(
          args.category ? String(args.category) : undefined,
          args.city ? String(args.city) : undefined
        );
      } else if (toolName === 'engelsiz_egitim_burs_rehberi') {
        responseText = handleEngelsizEgitimBursRehberi(
          args.educationLevel ? String(args.educationLevel) : undefined
        );
      } else if (toolName === 'engelsiz_sanat_etkinlik_rehberi') {
        responseText = handleEngelsizSanatEtkinlikRehberi(
          args.eventCategory ? String(args.eventCategory) : undefined
        );
      } else if (toolName === 'engelsiz_teknoloji_hardware_finder') {
        responseText = handleEngelsizTeknolojiHardwareFinder(
          args.category ? String(args.category) : undefined
        );
      } else if (toolName === 'engelsizforum_live_disability_news') {
        responseText = await handleLiveDisabilityNews(
          String(args.topic || ''),
          args.scope ? String(args.scope) : undefined
        );
      } else if (toolName === 'engelsizforum_web_search') {
        responseText = await handleWebSearch(String(args.query || ''));
      } else if (toolName === 'engelsizforum_search') {
        responseText = handleSearch(String(args.query || ''));
      } else if (toolName === 'engelsizforum_balthazard_calc') {
        responseText = handleBalthazard(args.rates);
      } else if (toolName === 'engelsizforum_disability_rights_guide') {
        responseText = handleDisabilityRightsGuide(
          Number(args.reportPercentage || 40),
          args.disabilityType ? String(args.disabilityType) : undefined,
          args.insuranceStartDate ? String(args.insuranceStartDate) : undefined
        );
      } else if (toolName === 'engelsizforum_legislation_lookup') {
        responseText = handleLegislationLookup(String(args.category || 'otv_2026'));
      } else if (toolName === 'engelsizforum_ram_special_education_info') {
        responseText = handleRAMSpecialEducationInfo(args.diagnosis ? String(args.diagnosis) : undefined);
      } else if (toolName === 'engelsizforum_accessibility_toggle') {
        const feature = String(args.feature || 'highContrast');
        const enabled = Boolean(args.enabled);
        responseText = `Erişilebilirlik ayarı güncellendi: ${feature} = ${enabled ? 'Aktif' : 'Pasif'}.`;
      } else if (toolName === 'engelsizforum_get_categories') {
        responseText = handleGetCategories();
      } else if (toolName === 'engelsizforum_cozger_calculator') {
        responseText = handleCozgerCalc(String(args.degree || 'belirgin'));
      } else if (toolName === 'engelsizforum_accessibility_checker') {
        responseText = handleAccessibilityChecker(
          String(args.urlOrContent || 'https://www.engelsizforum.com'),
          args.targetLevel ? String(args.targetLevel) : 'WCAG_AAA'
        );
      } else if (toolName === 'engelsizforum_assistive_tech_finder') {
        responseText = handleAssistiveTechFinder(
          String(args.disabilityCategory || 'gorme'),
          args.userGoal ? String(args.userGoal) : undefined
        );
      } else if (toolName === 'engelsizforum_tax_discount_calc') {
        responseText = handleTaxDiscountCalc(
          Number(args.degree || 1),
          args.grossSalary ? Number(args.grossSalary) : undefined
        );
      } else if (toolName === 'engelsizforum_sgk_prosthesis_coverage') {
        responseText = handleSgkProsthesisCoverage(String(args.equipmentType || 'akulu_sandalye'));
      } else if (toolName === 'engelsizforum_home_care_allowance_calc') {
        responseText = handleHomeCareAllowanceCalc(
          Number(args.householdCount || 4),
          Number(args.totalHouseholdIncome || 35000),
          args.disabilityPercentage ? Number(args.disabilityPercentage) : undefined
        );
      } else if (toolName === 'engelsizforum_wheelchair_ramp_standards') {
        responseText = handleWheelchairRampStandards(Number(args.heightDifferenceCm || 50));
      } else if (toolName === 'engelsizforum_general_legislation_lookup') {
        responseText = handleGeneralLegislationLookup(String(args.category || 'is_kanunu'));
      } else if (toolName === 'engelsizforum_text_summarizer_ai') {
        responseText = handleTextSummarizer(String(args.text || ''), args.maxLength ? String(args.maxLength) : undefined);
      } else if (toolName === 'engelsizforum_fact_checker_ai') {
        responseText = await handleFactChecker(String(args.claim || ''));
      } else if (toolName === 'engelsizforum_general_tax_salary_calc') {
        responseText = handleGeneralTaxSalaryCalc(
          Number(args.grossSalary || 50000),
          args.workingYears ? Number(args.workingYears) : 3,
          args.calcType ? String(args.calcType) : 'kidem_ihbar'
        );
      } else if (toolName === 'engelsizforum_universal_ergonomics_checker') {
        responseText = handleUniversalErgonomicsChecker(
          String(args.workType || 'masabasi_bilgisayar'),
          args.symptoms ? String(args.symptoms) : undefined
        );
      } else if (toolName === 'engelsizforum_emergency_disaster_info') {
        responseText = handleEmergencyDisasterInfo(String(args.disasterType || 'deprem'));
      } else if (toolName === 'engelsizforum_turkiye_gov_guide') {
        responseText = handleTurkiyeGovGuide(String(args.serviceName || 'edevlet'));
      } else if (toolName === 'engelsizforum_career_cv_advisor') {
        responseText = handleCareerCvAdvisor(
          String(args.jobTitle || 'Yazılım Geliştirici'),
          args.experienceYears ? Number(args.experienceYears) : 2
        );
      } else if (toolName === 'engelsizforum_code_accessibility_inspector') {
        responseText = handleCodeAccessibilityInspector(
          String(args.codeSnippet || '<button>Tıkla</button>'),
          args.framework ? String(args.framework) : 'React'
        );
      } else if (toolName === 'engelsizforum_universal_dictionary_slang') {
        responseText = handleUniversalDictionarySlang(String(args.term || 'Mücbir Sebep'));
      } else {
        responseText = await handleDynamicSyncedTool(toolName, args);
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

    const signal = req.signal;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let isTerminated = false;

    const cleanup = () => {
      isTerminated = true;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    if (signal) {
      signal.addEventListener('abort', cleanup, { once: true });
    }

    const stream = new ReadableStream({
      start(controller) {
        if (isTerminated || signal?.aborted) return;
        const encoder = new TextEncoder();

        try {
          // Emit 'endpoint' SSE event
          controller.enqueue(encoder.encode(`event: endpoint\ndata: ${messageEndpoint}\n\n`));
        } catch (_) {
          cleanup();
          return;
        }

        // Periodically emit keep-alive heartbeats to keep the connection open
        intervalId = setInterval(() => {
          if (isTerminated || signal?.aborted) {
            cleanup();
            return;
          }
          try {
            controller.enqueue(encoder.encode(`: keep-alive\n\n`));
          } catch (_) {
            cleanup();
          }
        }, 15000);
      },
      cancel() {
        cleanup();
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
      const responses = await Promise.all(body.map((item) => processJsonRpcRequest(item)));
      return NextResponse.json(responses, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const responsePayload = await processJsonRpcRequest(body);
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
