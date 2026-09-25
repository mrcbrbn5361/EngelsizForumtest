import ClassicCategoryBlock from '@/components/forum/classic-category-block';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import { supabaseServer } from '@/lib/supabase-server';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default async function Home() {
  // Fetch root categories
  const { data: rootCategories, error: catError } = await supabaseServer
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('created_at', { ascending: true });

  if (catError) {
    console.error('Error fetching root categories:', catError);
  }

  // Fetch all nodes (sub-categories)
  const { data: allNodes, error: nodeError } = await supabaseServer
    .from('categories')
    .select('*')
    .not('parent_id', 'is', null);

  if (nodeError) {
    console.error('Error fetching nodes:', nodeError);
  }

  // Fetch topics to calculate stats and get last post
  const { data: allTopics, error: topicError } = await supabaseServer
    .from('topics')
    .select(`
      *,
      author:profiles(username, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (topicError) {
    console.error('Error fetching topics:', topicError);
  }

  // Map data to the structure expected by components
  const categoriesWithNodes = (rootCategories || []).map(root => {
    const nodes = (allNodes || [])
      .filter(node => node.parent_id === root.id)
      .map(node => {
        // Calculate stats for this node
        const nodeTopics = (allTopics || []).filter(t => t.category_id === node.id);
        const lastTopic = nodeTopics[0];

        return {
          id: node.slug, // Use slug for routing
          title: node.name,
          description: node.description || '',
          threadCount: nodeTopics.length.toLocaleString(),
          messageCount: nodeTopics.length.toLocaleString(), // Placeholder until we have comment count
          lastPost: lastTopic ? {
            title: lastTopic.title,
            author: lastTopic.author?.username || 'Anonim',
            date: formatDistanceToNow(new Date(lastTopic.created_at), { addSuffix: true, locale: tr })
          } : {
            title: 'Henüz konu yok',
            author: '-',
            date: '-'
          }
        };
      });

    return {
      title: root.name.toUpperCase(),
      nodes: nodes
    };
  });

  const DEFAULT_CATEGORIES = [
    {
      title: 'MEVZUAT, SOSYAL GÜVENLİK VE ENGELLİ HAKLARI',
      nodes: [
        {
          id: 'mevzuat-ve-haklar',
          title: 'Balthazard ve Sağlık Kurulu Raporları',
          description: 'Özür oranı cetveli, birden fazla engelin Balthazard formülü ile birleştirilmesi ve rapor itiraz süreçleri.',
          threadCount: '142',
          messageCount: '1,280',
          lastPost: {
            title: '2026 Balthazard Hesaplama ve Rapor Rehberi',
            author: 'BoraMevzuat',
            date: '2 saat önce'
          }
        },
        {
          id: 'otv-muafiyeti-ve-araclar',
          title: 'ÖTV Muafiyeti ve Özel Tertibatlı Araçlar',
          description: '2026 yılı 2.247.100 TL ÖTV muafiyetli araç alım limiti, tertibat kodları, noter devir ve MTV muafiyeti.',
          threadCount: '389',
          messageCount: '4,150',
          lastPost: {
            title: '2026 ÖTV Üst Limiti ve Bayi Uygulamaları',
            author: 'EngelsizSurucu',
            date: '15 dakika önce'
          }
        },
        {
          id: 'erken-emeklilik-ve-sgk',
          title: 'Engelli Erken Emeklilik ve SGK Hakları',
          description: 'Yaş haddi aranmaksızın kademeli erken emeklilik, prim günü ve sigortalılık süresi hesaplamaları.',
          threadCount: '215',
          messageCount: '1,890',
          lastPost: {
            title: '4A / 4B / 4C Kademeli Emeklilik Tablosu',
            author: 'AriaA11y',
            date: '3 saat önce'
          }
        },
        {
          id: 'kamu-istihdam-ekpss',
          title: 'E-KPSS, Vergi İndirimi ve Kamuda İstihdam',
          description: 'E-KPSS atamaları, kura usulü yerleştirme, 1./2./3. derece gelir vergisi indirimi başvuruları.',
          threadCount: '178',
          messageCount: '2,340',
          lastPost: {
            title: '2026 E-KPSS Tercih Kılavuzu Duyurusu',
            author: 'FelixDev',
            date: 'Dün'
          }
        }
      ]
    },
    {
      title: 'SAĞLIK, REHABİLİTASYON VE MEDİKAL CİHAZLAR',
      nodes: [
        {
          id: 'ortez-protez-ve-cihazlar',
          title: 'Ortez, Protez ve Yardımcı Ekipmanlar',
          description: 'SGK SUT geri ödeme kapsamındaki akülü/manuel tekerlekli sandalyeler, biyonik protezler ve medikal cihazlar.',
          threadCount: '96',
          messageCount: '840',
          lastPost: {
            title: 'SGK SUT Akülü Sandalye Geri Ödeme Tutarları',
            author: 'MiracBirben',
            date: '5 saat önce'
          }
        },
        {
          id: 'fizik-tedavi-ve-rehabilitasyon',
          title: 'Fizik Tedavi ve Özel Eğitim Merkezleri',
          description: 'RAM raporları, devlet destekli seans hakları ve nörolojik rehabilitasyon merkezleri deneyimleri.',
          threadCount: '84',
          messageCount: '620',
          lastPost: {
            title: 'Yetişkin Fizik Tedavi Raporu Yenileme',
            author: 'DrRehab',
            date: '2 gün önce'
          }
        }
      ]
    },
    {
      title: 'TOPLULUK, GELİŞTİRİCİLER VE AÇIK STANDARTLAR',
      nodes: [
        {
          id: 'genel-sohbet-ve-tanisma',
          title: 'Engelsiz Sohbet ve Tanışma Köşesi',
          description: 'Topluluk üyeleriyle serbest sohbet, başarı hikayeleri, kültür sanat ve günlük yaşam paylaşımları.',
          threadCount: '512',
          messageCount: '6,400',
          lastPost: {
            title: 'Aramıza Yeni Katılanlar Tanışma Başlığı',
            author: 'AriaA11y',
            date: '8 dakika önce'
          }
        },
        {
          id: 'gelistirici-ve-api-entegrasyonlari',
          title: 'Geliştiriciler & Açık API (OAuth 2.0 / WebMCP)',
          description: 'EngelsizForum ile Giriş Yap, REST API, yapay zeka ajanları (WebMCP) ve açık veri entegrasyonları.',
          threadCount: '47',
          messageCount: '310',
          lastPost: {
            title: 'OAuth 2.0 Authorization Code Flow Canlıya Alındı',
            author: 'BoraMevzuat',
            date: 'Bugün'
          }
        }
      ]
    }
  ];

  const displayCategories = categoriesWithNodes.length > 0 ? categoriesWithNodes : DEFAULT_CATEGORIES;

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Main Forum Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#185886] tracking-tight uppercase">
              Engelsiz Forum - Topluluk ve Engelli Hakları
            </h1>
            <p className="text-xs text-slate-700 font-medium mt-1 max-w-2xl leading-relaxed">
              Türkiye&apos;nin tam erişilebilir engelli topluluğu: Sağlık kurulu Balthazard hesaplama, 2026 ÖTV muafiyeti, erken emeklilik ve güncel mevzuat paylaşımları.
            </p>
          </div>
          <a 
            href="/discussions/new" 
            className="bg-[#b45309] hover:bg-[#92400e] text-white px-4.5 py-2.5 rounded-sm text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto min-h-[36px]"
          >
            <span>Yeni Konu Aç</span>
          </a>
        </div>

        {displayCategories.map((category) => (
          <div key={category.title} className="mb-5">
            <ClassicCategoryBlock 
              title={category.title} 
              nodes={category.nodes} 
            />
          </div>
        ))}

        {/* Legend */}
        <div className="xf-block p-3 flex flex-wrap items-center gap-6 text-[11px] text-slate-500 uppercase tracking-wider font-semibold rounded-sm border border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-200 border border-slate-300"></div>
            <span>Okunmamış mesaj yok</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#eef2f7] border border-[#cbd5e1] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#185886] rounded-full"></div>
            </div>
            <span>Okunmamış mesaj var</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <ClassicSidebar />
    </div>
  );
}
