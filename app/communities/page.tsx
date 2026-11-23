'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Users, Search, ChevronRight, MessageSquare, Handshake, Loader2, Plus, Save,
  Scale, CreditCard, PiggyBank, Award, FileText, HeartPulse, Activity, Eye, Volume2, MapPin, 
  GraduationCap, Calendar, AlertTriangle, FolderTree, Stethoscope, BookOpen, 
  Briefcase, Cpu, Code, Smile, Shield, Settings, Megaphone, Car, Sparkles, Info, X, Check, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { slugify, generateShortId } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';

interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  member_count?: number;
  parent_id?: string | null;
  topic_count?: number;
}

const COMMUNITY_META: Record<string, {
  focusGroups: string[];
  tags: string[];
  featured?: boolean;
  rules: string[];
}> = {
  'sgk': {
    focusGroups: ['haklar'],
    tags: ['Emeklilik', 'Sağlık Kurulu', 'Mevzuat'],
    featured: true,
    rules: [
      'Resmi evrak ve raporlarınızı paylaşırken kişisel verilerinizi (T.C. Kimlik No, adres vb.) mutlaka maskeleyin.',
      'Sadece güncel mevzuat ve resmi kurum duyuruları üzerinden bilgi paylaşımı yapmaya özen gösterin.',
      'Soru sorarken durumunuzu (engelli oranı, sigorta başlangıcı vb.) net ifade edin.'
    ]
  },
  'ekpss': {
    focusGroups: ['bilissel', 'haklar'],
    tags: ['Sınav Hazırlığı', 'Kadro Atamaları', 'Çalışma Grupları'],
    featured: true,
    rules: [
      'Telif hakkı içeren sınav dokümanlarını veya korsan kitap linklerini kesinlikle paylaşmayın.',
      'Sınav stresi ve motivasyon dışı kırıcı, rekabetçi veya incitici tartışmalardan kaçının.',
      'Öğretmenlik, mühendislik, memurluk gibi kadro özelindeki soruları ilgili konu başlıklarında toplayın.'
    ]
  },
  'otv': {
    focusGroups: ['ortopedik'],
    tags: ['Araç Alımı', 'ÖTV Muafiyeti (2.873.972 TL)', 'Limit Takibi'],
    featured: true,
    rules: [
      'Otomobil galerisi veya aracı takip firması reklamı/pazarlaması yapmak kesinlikle yasaktır.',
      'Sadece resmi vergi dairesi özelgelerini, kendi tescil deneyimlerinizi ve yasal mevzuatı referans gösterin.',
      'Alım-satım veya devir işlemlerinde ticari kâr amacı güden spekülatif yorumlar yapmayın.'
    ]
  },
  'saglik': {
    focusGroups: ['ortopedik', 'bilissel'],
    tags: ['Rapor Derecesi', 'Tedavi Süreçleri', 'Hekim Tavsiyeleri'],
    rules: [
      'Tıbbi tanı koymak veya reçeteli ilaç tavsiyesinde bulunmak kesinlikle yasaktır.',
      'Onaylanmamış alternatif tıp yöntemlerinin reklamını veya özendirmesini yapmayın.',
      'Sağlık kurulu muayene süreçleri ve hastane deneyimlerinizde yapıcı olun.'
    ]
  },
  'egitim': {
    focusGroups: ['bilissel'],
    tags: ['Özel Eğitim', 'RAM Raporları', 'Kapsayıcı Okullar'],
    rules: [
      'Özel gereksinimli çocukların fotoğraflarını veya isimlerini açıkça içeren görseller paylaşmayın.',
      'Öğretmenler, rehabilitasyon merkezleri ve veliler arasında saygılı, yapıcı bir dil kullanın.',
      'Akademik burs, özel eğitim hakları gibi fırsatları doğrulanmış bağlantılarla paylaşın.'
    ]
  },
  'istihdam': {
    focusGroups: ['haklar'],
    tags: ['Kariyer', 'İş İlanları', 'Mülakat Teknikleri'],
    featured: true,
    rules: [
      'Sadece engelli kadrosu barındıran veya uygun çalışma koşulları sunan gerçek ilanları paylaşın.',
      'Kişisel özgeçmiş paylaşımlarında telefon veya açık adres gibi hassas verileri maskeleyin.',
      'Çalışma hayatındaki erişilebilirlik engellerini ve mobbing durumlarını nesnel bir dille aktarın.'
    ]
  },
  'teknoloji': {
    focusGroups: ['gorme', 'isitme'],
    tags: ['Ekran Okuyucular', 'Yardımcı Yazılımlar', 'Erişilebilirlik'],
    featured: true,
    rules: [
      'Yazılımsal yardımlaşmalarda korsan yazılım veya virüslü bağlantı paylaşımı yasaktır.',
      'Ekran okuyucu ses paketleri, NVDA eklentileri veya Jaws scriptleri paylaşırken güvenilir kaynakları seçin.',
      'Donanım incelemelerinde (braille ekranlar, akıllı gözlükler) sponsorlu içerikleri açıkça belirtin.'
    ]
  },
  'yazilim': {
    focusGroups: ['gorme', 'isitme'],
    tags: ['Erişilebilir Kod', 'A11y Standartları', 'Web Geliştirme'],
    rules: [
      'Kod paylaşırken Markdown formatını kullanarak kodun okunabilirliğini artırın.',
      'WCAG standartlarına uygun örnekler paylaşmaya özen gösterin.',
      'Erişilebilirlik kütüphaneleri ve test araçları hakkında tecrübelerinizi aktarın.'
    ]
  },
  'gunluk-yasam': {
    focusGroups: ['gorme', 'isitme', 'ortopedik', 'bilissel'],
    tags: ['Sohbet', 'Hobiler & Sanat', 'Engelsiz Seyahat'],
    rules: [
      'Kutuplaştırıcı ve incitici tartışmalardan kaçının.',
      'Engelsiz seyahat ve mekan deneyimlerinizde rampa, asansör, sesli yönlendirme detaylarını belirtin.',
      'Hobiler, kitap kulüpleri ve sanatsal faaliyetlerde kapsayıcı etkinlikleri duyurun.'
    ]
  }
};

const FOCUS_GROUPS = [
  { id: 'all', label: 'Tüm Topluluklar', icon: '🌐', desc: 'Platformdaki tüm alt forum ve uzmanlık grupları.' },
  { id: 'gorme', label: 'Görme Engelliler', icon: '👁️', desc: 'Ekran okuyucular, kabartma ekranlar ve sesli kütüphaneler.' },
  { id: 'isitme', label: 'İşitme Engelliler', icon: '👂', desc: 'Altyazı çözümleri, işaret dili destekleri ve cihaz ayarları.' },
  { id: 'ortopedik', label: 'Ortopedik Engelliler', icon: '♿', desc: 'ÖTV araç alımları (2.873.972 TL tavan), protezler ve mekan erişilebilirliği.' },
  { id: 'bilissel', label: 'Bilişsel & Nöroçeşitli', icon: '🧠', desc: 'Özel eğitim, otizm, disleksi ve dikkat destek süreçleri.' },
  { id: 'haklar', label: 'Haklar & Mevzuat', icon: '⚖️', desc: 'Maaşlar, vergi muafiyetleri, yasal haklar ve SGK işlemleri.' },
];

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [activeRulesCommunity, setActiveRulesCommunity] = useState<Community | null>(null);

  const fetchCommunities = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCommunities([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, topics:topics(count)')
        .order('name');
      
      if (error) throw error;
      if (data && data.length > 0) {
        const formatted = data.map(cat => ({
          ...cat,
          topic_count: cat.topics?.[0]?.count || 0,
        }));
        setCommunities(formatted);
      } else {
        setCommunities([]);
      }
    } catch {
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const getMeta = (slug: string) => {
    const normalized = slug?.toLowerCase() || '';
    if (COMMUNITY_META[normalized]) {
      return COMMUNITY_META[normalized];
    }
    return {
      focusGroups: ['gorme', 'isitme', 'ortopedik', 'bilissel'],
      tags: ['Topluluk', 'Yardımlaşma', 'Genel'],
      rules: [
        'Topluluk saygı çerçevesinde paylaşımlar yapmalıdır.',
        'Kapsayıcı, erişilebilir ve hakaret içermeyen bir dil kullanılması zorunludur.'
      ]
    };
  };

  const filteredAndGroupedCommunities = useMemo(() => {
    return communities.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchSearch) return false;
      if (selectedGroup === 'all') return true;

      const meta = getMeta(c.slug);
      return meta.focusGroups.includes(selectedGroup);
    });
  }, [communities, searchQuery, selectedGroup]);

  const getIcon = (iconName?: string) => {
    const cls = "text-indigo-400";
    switch (iconName?.toLowerCase()) {
      case 'stethoscope': return <Stethoscope size={16} className={cls} />;
      case 'bookopen':
      case 'book-open': return <BookOpen size={16} className={cls} />;
      case 'briefcase': return <Briefcase size={16} className={cls} />;
      case 'cpu': return <Cpu size={16} className={cls} />;
      case 'code': return <Code size={16} className={cls} />;
      case 'smile': return <Smile size={16} className={cls} />;
      case 'shield': return <Shield size={16} className={cls} />;
      case 'settings': return <Settings size={16} className={cls} />;
      case 'megaphone': return <Megaphone size={16} className={cls} />;
      case 'car': return <Car size={16} className={cls} />;
      case 'scale': return <Scale size={16} className={cls} />;
      case 'creditcard':
      case 'credit-card': return <CreditCard size={16} className={cls} />;
      case 'piggybank':
      case 'piggy-bank': return <PiggyBank size={16} className={cls} />;
      case 'award': return <Award size={16} className={cls} />;
      case 'filetext':
      case 'file-text': return <FileText size={16} className={cls} />;
      case 'heartpulse':
      case 'heart-pulse': return <HeartPulse size={16} className={cls} />;
      case 'activity': return <Activity size={16} className={cls} />;
      case 'eye': return <Eye size={16} className={cls} />;
      case 'volume2':
      case 'volume-2': return <Volume2 size={16} className={cls} />;
      case 'mappin':
      case 'map-pin': return <MapPin size={16} className={cls} />;
      case 'graduationcap':
      case 'graduation-cap': return <GraduationCap size={16} className={cls} />;
      case 'calendar': return <Calendar size={16} className={cls} />;
      case 'alerttriangle':
      case 'alert-triangle': return <AlertTriangle size={16} className={cls} />;
      case 'users': return <Users size={16} className={cls} />;
      case 'message': return <MessageSquare size={16} className={cls} />;
      case 'handshake': return <Handshake size={16} className={cls} />;
      case 'sparkles': return <Sparkles size={16} className={cls} />;
      default: return <FolderTree size={16} className={cls} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6 text-white">
      {/* Breadcrumb */}
      <div className="bg-[#111B2E] border border-[#1E293B] px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-indigo-400 font-semibold transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight size={13} className="text-slate-600" />
        <span className="font-semibold text-slate-200">Topluluklar ve Uzmanlık Grupları</span>
      </div>

      {/* Header Banner */}
      <div className="border-b border-[#1E293B] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 text-[11px] font-mono font-medium uppercase">
            <Sparkles size={12} />
            <span>Akran Dayanışması &amp; Tanı Grupları</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
            Topluluklar ve Forum Kategorileri
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Engel türlerine, hukuki mevzuata ve yardımcı teknolojilere özel odaklanmış toplulukları keşfedin, akranlarınızla yardımlaşın.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {FOCUS_GROUPS.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedGroup === group.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#111B2E] text-slate-300 border border-[#1E293B] hover:bg-[#18243A] hover:text-white'
                }`}
              >
                <span>{group.icon}</span>
                <span>{group.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Topluluklarda ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-md border border-[#1E293B] bg-[#111B2E] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        <p className="text-xs text-slate-400">
          {FOCUS_GROUPS.find(g => g.id === selectedGroup)?.desc}
        </p>
      </div>

      {/* Communities Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Topluluklar yükleniyor...
        </div>
      ) : filteredAndGroupedCommunities.length === 0 ? (
        <div className="text-center py-12 px-6 bg-[#111B2E] rounded-lg border border-dashed border-[#1E293B] max-w-md mx-auto space-y-2">
          <Users className="mx-auto text-slate-500" size={32} />
          <h3 className="text-sm font-bold text-white">Topluluk Bulunamadı</h3>
          <p className="text-xs text-slate-400">
            Arama kriterinize uygun grup bulunamadı.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndGroupedCommunities.map((community) => {
            const meta = getMeta(community.slug);

            return (
              <div 
                key={community.id}
                className="flex flex-col justify-between bg-[#111B2E] border border-[#1E293B] hover:border-indigo-500/50 rounded-lg p-5 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-[#18243A] border border-[#1E293B] rounded-md text-indigo-400">
                        {getIcon(community.icon || 'users')}
                      </div>
                      <div>
                        {meta.featured && (
                          <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                            Öne Çıkan
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-white hover:text-indigo-400 transition-colors font-heading">
                          <Link href={`/communities/${community.slug || community.id}`}>
                            {community.name}
                          </Link>
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveRulesCommunity(community)}
                      className="p-1.5 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                      title="Topluluk Kuralları"
                    >
                      <Info size={14} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 font-normal">
                    {community.description || 'Açıklama belirtilmemiş.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {meta.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#18243A] text-slate-300 border border-[#1E293B]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>{(community as any).topic_count || 0} Tartışma</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-[#1E293B] mt-4 flex items-center justify-between gap-2">

                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/communities/${community.slug || community.id}`}
                      className="flex items-center gap-0.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      <span>İncele</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rules Modal */}
      {activeRulesCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#111B2E] border border-[#1E293B] rounded-lg max-w-lg w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 font-heading">
                <Shield size={16} className="text-indigo-400" />
                <span>{activeRulesCommunity.name} Kuralları</span>
              </h2>
              <button 
                onClick={() => setActiveRulesCommunity(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              {getMeta(activeRulesCommunity.slug).rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-indigo-400 text-[11px] shrink-0">{idx + 1}.</span>
                  <p className="leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveRulesCommunity(null)}
                className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
