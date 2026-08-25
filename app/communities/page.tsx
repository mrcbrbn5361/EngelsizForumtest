'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { 
  Users, Search, ChevronRight, MessageSquare, Handshake, Loader2, Plus, Save,
  Scale, CreditCard, PiggyBank, Award, FileText, HeartPulse, Activity, Eye, Volume2, MapPin, 
  GraduationCap, Calendar, AlertTriangle, FolderTree, Stethoscope, BookOpen, 
  Briefcase, Cpu, Code, Smile, Shield, Settings, Megaphone, Car, Sparkles, Info, X, Check, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { slugify, generateShortId, generateUUID } from '@/lib/utils';
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
  memberCount: number;
  topicCount: number;
  featured?: boolean;
  rules: string[];
}> = {
  'sgk': {
    focusGroups: ['haklar'],
    tags: ['Emeklilik', 'Sağlık Kurulu', 'Mevzuat'],
    memberCount: 1420,
    topicCount: 312,
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
    memberCount: 2350,
    topicCount: 540,
    featured: true,
    rules: [
      'Telif hakkı içeren sınav dokümanlarını veya korsan kitap linklerini kesinlikle paylaşmayın.',
      'Sınav stresi ve motivasyon dışı kırıcı, rekabetçi veya incitici tartışmalardan kaçının.',
      'Öğretmenlik, mühendislik, memurluk gibi kadro özelindeki soruları ilgili konu başlıklarında toplayın.'
    ]
  },
  'otv': {
    focusGroups: ['ortopedik'],
    tags: ['Araç Alımı', 'ÖTV Muafiyeti', 'Limit Takibi'],
    memberCount: 1890,
    topicCount: 425,
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
    memberCount: 1210,
    topicCount: 245,
    rules: [
      'Tıbbi tanı koymak veya reçeteli ilaç tavsiyesinde bulunmak kesinlikle yasaktır.',
      'Onaylanmamış alternatif tıp yöntemlerinin reklamını veya özendirmesini yapmayın.',
      'Sağlık kurulu muayene süreçleri ve hastane deneyimlerinizde yapıcı olun.'
    ]
  },
  'egitim': {
    focusGroups: ['bilissel'],
    tags: ['Özel Eğitim', 'RAM Raporları', 'Kapsayıcı Okullar'],
    memberCount: 940,
    topicCount: 180,
    rules: [
      'Özel gereksinimli çocukların fotoğraflarını veya isimlerini açıkça içeren görseller paylaşmayın.',
      'Öğretmenler, rehabilitasyon merkezleri ve veliler arasında saygılı, yapıcı bir dil kullanın.',
      'Akademik burs, özel eğitim hakları gibi fırsatları doğrulanmış bağlantılarla paylaşın.'
    ]
  },
  'istihdam': {
    focusGroups: ['haklar'],
    tags: ['Kariyer', 'İş İlanları', 'Mülakat Teknikleri'],
    memberCount: 1560,
    topicCount: 290,
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
    memberCount: 2100,
    topicCount: 480,
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
    memberCount: 820,
    topicCount: 140,
    rules: [
      'Kod paylaşırken Markdown formatını kullanarak kodun okunabilirliğini artırın.',
      'WCAG standartlarına uygun örnekler paylaşmaya özen gösterin.',
      'Erişilebilirlik kütüphaneleri ve test araçları hakkında tecrübelerinizi aktarın.'
    ]
  },
  'gunluk-yasam': {
    focusGroups: ['gorme', 'isitme', 'ortopedik', 'bilissel'],
    tags: ['Sohbet', 'Hobiler & Sanat', 'Engelsiz Seyahat'],
    memberCount: 1780,
    topicCount: 390,
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
  { id: 'ortopedik', label: 'Ortopedik Engelliler', icon: '♿', desc: 'ÖTV araç alımları, protezler ve mekan erişilebilirliği.' },
  { id: 'bilissel', label: 'Bilişsel & Nöroçeşitli', icon: '🧠', desc: 'Özel eğitim, otizm, disleksi ve dikkat destek süreçleri.' },
  { id: 'haklar', label: 'Haklar & Mevzuat', icon: '⚖️', desc: 'Maaşlar, vergi muafiyetleri, yasal haklar ve SGK işlemleri.' },
];

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', icon: 'users' });
  const [creating, setCreating] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [joinedList, setJoinedList] = useState<string[]>([]);
  const [activeRulesCommunity, setActiveRulesCommunity] = useState<Community | null>(null);

  // Fetch joined communities from Supabase community_members if user is logged in
  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setJoinedList([]);
      return;
    }
    const fetchJoined = async () => {
      try {
        const { data, error } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', user.id);
        if (error) {
          console.error('Failed to fetch user community members:', error);
          toast.error('Topluluk üyelikleri yüklenemedi.');
          setJoinedList([]);
        } else if (data) {
          setJoinedList(data.map((m: any) => m.community_id));
        }
      } catch (err) {
        console.error('Failed to fetch user community members:', err);
        setJoinedList([]);
      }
    };
    fetchJoined();
  }, [user]);

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
          topic_count: cat.topics?.[0]?.count || 0
        }));
        setCommunities(formatted);
      } else {
        setCommunities([]);
      }
    } catch (err) {
      console.error('Error fetching communities:', err);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const baseSlug = slugify(newCommunity.name) || `topluluk-${generateShortId(4)}`;
      let inserted = false;
      let lastErr: any = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        const slug = attempt === 0 ? baseSlug : `${baseSlug}-${generateShortId(4)}`;
        const { error } = await supabase
          .from('categories')
          .insert([{ ...newCommunity, slug }]);

        if (!error) {
          inserted = true;
          break;
        }
        lastErr = error;
        const isSlugViolation = error.message?.includes('categories_slug_key') || 
                                error.message?.includes('duplicate key') || 
                                error.code === '23505';
        if (!isSlugViolation) break;
      }
      
      if (!inserted && lastErr) throw lastErr;
      setShowCreateForm(false);
      setNewCommunity({ name: '', description: '', icon: 'users' });
      await fetchCommunities();
      toast.success('Yeni topluluk başarıyla oluşturuldu!');
    } catch (err: any) {
      console.error('Error creating community:', err);
      toast.error('Topluluk oluşturulurken hata: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setCreating(false);
    }
  };

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
      memberCount: 240,
      topicCount: 42,
      rules: [
        'Topluluk saygı çerçevesinde paylaşımlar yapmalıdır.',
        'Kapsayıcı, erişilebilir ve hakaret içermeyen bir dil kullanılması zorunludur.'
      ]
    };
  };

  const toggleJoin = async (communityId: string, communityName: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user) {
      toast.error('Topluluklara katılmak için giriş yapmalısınız.');
      return;
    }

    const isJoined = joinedList.includes(communityId);
    let updated: string[];
    if (isJoined) {
      updated = joinedList.filter(id => id !== communityId);
      setJoinedList(updated);
      try {
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('community_id', communityId)
          .eq('user_id', user.id);
        if (error) {
          setJoinedList(joinedList); // rollback
          toast.error(`"${communityName}" topluluğundan ayrılma başarısız: ` + error.message);
          return;
        }
        toast.success(`"${communityName}" topluluğundan ayrıldınız.`);
      } catch (err: any) {
        setJoinedList(joinedList); // rollback
        console.warn('Could not delete community member remotely:', err);
        toast.error(`"${communityName}" topluluğundan ayrılma sırasında hata oluştu.`);
      }
    } else {
      updated = [...joinedList, communityId];
      setJoinedList(updated);
      try {
        const { error } = await supabase
          .from('community_members')
          .insert({
            community_id: communityId,
            user_id: user.id
          });
        if (error) {
          setJoinedList(joinedList); // rollback
          toast.error(`"${communityName}" topluluğuna katılamadı: ` + error.message);
          return;
        }
        toast.success(`"${communityName}" topluluğuna katıldınız!`);
      } catch (err: any) {
        setJoinedList(joinedList); // rollback
        console.warn('Could not insert community member remotely:', err);
        toast.error(`"${communityName}" topluluğuna katılma sırasında hata oluştu.`);
      }
    }
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
    const cls = "text-sky-400";
    switch (iconName?.toLowerCase()) {
      case 'stethoscope': return <Stethoscope size={18} className={cls} />;
      case 'bookopen':
      case 'book-open': return <BookOpen size={18} className={cls} />;
      case 'briefcase': return <Briefcase size={18} className={cls} />;
      case 'cpu': return <Cpu size={18} className={cls} />;
      case 'code': return <Code size={18} className={cls} />;
      case 'smile': return <Smile size={18} className={cls} />;
      case 'shield': return <Shield size={18} className={cls} />;
      case 'settings': return <Settings size={18} className={cls} />;
      case 'megaphone': return <Megaphone size={18} className={cls} />;
      case 'car': return <Car size={18} className={cls} />;
      case 'scale': return <Scale size={18} className={cls} />;
      case 'creditcard':
      case 'credit-card': return <CreditCard size={18} className={cls} />;
      case 'piggybank':
      case 'piggy-bank': return <PiggyBank size={18} className={cls} />;
      case 'award': return <Award size={18} className={cls} />;
      case 'filetext':
      case 'file-text': return <FileText size={18} className={cls} />;
      case 'heartpulse':
      case 'heart-pulse': return <HeartPulse size={18} className={cls} />;
      case 'activity': return <Activity size={18} className={cls} />;
      case 'eye': return <Eye size={18} className={cls} />;
      case 'volume2':
      case 'volume-2': return <Volume2 size={18} className={cls} />;
      case 'mappin':
      case 'map-pin': return <MapPin size={18} className={cls} />;
      case 'graduationcap':
      case 'graduation-cap': return <GraduationCap size={18} className={cls} />;
      case 'calendar': return <Calendar size={18} className={cls} />;
      case 'alerttriangle':
      case 'alert-triangle': return <AlertTriangle size={18} className={cls} />;
      case 'users': return <Users size={18} className={cls} />;
      case 'message': return <MessageSquare size={18} className={cls} />;
      case 'handshake': return <Handshake size={18} className={cls} />;
      case 'sparkles': return <Sparkles size={18} className={cls} />;
      default: return <FolderTree size={18} className={cls} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl space-y-8">
        
        {/* Breadcrumb */}
        <nav aria-label="Erişim yolu" className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-sky-400 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={14} className="text-slate-600" />
          <span className="text-slate-200 font-medium">Topluluklar ve Uzmanlık Grupları</span>
        </nav>

        {/* Header Hero */}
        <header className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                <Sparkles size={13} /> Uzmanlık &amp; Akran Dayanışması
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
                Topluluklar ve Forum Kategorileri
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                Engel gruplarına, hukuki haklara ve erişilebilirlik teknolojilerine özel odaklanmış toplulukları keşfedin, akranlarınızla yardımlaşın.
              </p>
            </div>
            <button 
              onClick={() => {
                if (!user) {
                  toast.error('Topluluk kurmak için lütfen giriş yapın.');
                  return;
                }
                setShowCreateForm(!showCreateForm);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition whitespace-nowrap self-start lg:self-auto cursor-pointer"
              aria-expanded={showCreateForm}
            >
              <Plus size={16} className={showCreateForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
              {showCreateForm ? 'İptal Et' : 'Yeni Topluluk Kur'}
            </button>
          </div>
        </header>

        {/* Create Community Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <form 
                onSubmit={createCommunity}
                className="bg-[#111726] border border-white/[0.1] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4"
              >
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-slate-100">Yeni Bir Topluluk Kur</h2>
                  <p className="text-xs text-slate-400">Yeni uzmanlık veya dayanışma grubunuzu başlatın.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="community-name" className="text-xs font-semibold text-slate-300">Topluluk Adı</label>
                    <input 
                      id="community-name"
                      type="text" 
                      placeholder="Örn: Erişilebilir Oyunlar" 
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                      required
                      className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/80 text-slate-200 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="community-icon" className="text-xs font-semibold text-slate-300">İkon Seçin</label>
                    <select 
                      id="community-icon"
                      className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/80 text-slate-200 text-xs focus:ring-1 focus:ring-sky-500 outline-none cursor-pointer"
                      value={newCommunity.icon}
                      onChange={(e) => setNewCommunity({...newCommunity, icon: e.target.value})}
                    >
                      <option value="users">Kullanıcılar (Varsayılan)</option>
                      <option value="message">Sohbet &amp; Tartışma</option>
                      <option value="handshake">Dayanışma</option>
                      <option value="cpu">Erişilebilir Teknoloji</option>
                      <option value="code">Yazılım &amp; Web</option>
                      <option value="smile">Sosyal Yaşam</option>
                      <option value="scale">Hukuk &amp; Haklar</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="community-desc" className="text-xs font-semibold text-slate-300">Topluluk Amacı ve Açıklaması</label>
                  <textarea 
                    id="community-desc"
                    placeholder="Bu topluluğun amacını ve kimlere hitap ettiğini kısaca belirtin..." 
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                    required
                    className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/80 text-slate-200 text-xs focus:ring-1 focus:ring-sky-500 outline-none min-h-[90px]"
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit" 
                    disabled={creating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2 text-xs font-semibold text-white transition-all disabled:opacity-50"
                  >
                    {creating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {creating ? 'Oluşturuluyor...' : 'Topluluğu Başlat'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 p-1 bg-[#111726]/90 border border-white/[0.08] rounded-xl w-fit">
              {FOCUS_GROUPS.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                    selectedGroup === group.id
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  aria-pressed={selectedGroup === group.id}
                >
                  <span className="text-xs">{group.icon}</span>
                  <span>{group.label}</span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input 
                type="text" 
                placeholder="Topluluklarda ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#111726]/80 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none placeholder:text-slate-500"
                aria-label="Topluluk arama kutusu"
              />
            </div>
          </div>

          <p className="text-xs text-slate-400">
            {FOCUS_GROUPS.find(g => g.id === selectedGroup)?.desc}
          </p>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 h-[180px] flex flex-col justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-slate-800" />
                  <Skeleton className="h-4 w-full bg-slate-850" />
                </div>
                <Skeleton className="h-4 w-24 bg-slate-800" />
              </div>
            ))}
          </div>
        ) : filteredAndGroupedCommunities.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#111726]/60 rounded-2xl border border-dashed border-white/[0.08] max-w-md mx-auto space-y-2">
            <Users className="mx-auto text-slate-600" size={40} />
            <h3 className="text-sm font-bold text-slate-200">Topluluk Bulunamadı</h3>
            <p className="text-xs text-slate-400">
              Aradığınız kriterlere uygun bir grup bulunamadı. &quot;Yeni Topluluk Kur&quot; butonuyla siz başlatabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndGroupedCommunities.map((community) => {
              const meta = getMeta(community.slug);
              const isJoined = joinedList.includes(community.id);

              return (
                <div 
                  key={community.id}
                  className="group flex flex-col justify-between bg-[#111726]/80 border border-white/[0.08] hover:border-sky-500/30 rounded-2xl p-5 transition-all shadow-sm backdrop-blur-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl shrink-0">
                          {getIcon(community.icon || 'users')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-sky-400">Topluluk</span>
                            {meta.featured && (
                              <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-medium flex items-center gap-1">
                                <Sparkles size={9} /> Öne Çıkan
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                            <Link href={`/communities/${community.slug || community.id}`}>
                              {community.name}
                            </Link>
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveRulesCommunity(community)}
                        className="p-1.5 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-all shrink-0 cursor-pointer"
                        aria-label={`${community.name} kurallarını görüntüle`}
                        title="Topluluk Kuralları"
                      >
                        <Info size={15} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 font-normal leading-relaxed line-clamp-2">
                      {community.description || 'Açıklama belirtilmemiş.'}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {meta.tags.map((tag, tIdx) => (
                        <span 
                          key={tIdx} 
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/60 text-slate-300 border border-white/[0.04]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} className="text-slate-500" />
                        <span>{(community as any).topic_count || 0} Tartışma</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={12} className="text-slate-500" />
                        <span>{meta.memberCount} Üye</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => toggleJoin(community.id, community.name, e)}
                      className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isJoined 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-white/[0.06]'
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <Check size={12} /> Katıldınız
                        </>
                      ) : (
                        <>
                          <Plus size={12} /> Katıl
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link 
                        href={`/discussions/new?kategori=${community.slug}`}
                        className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/[0.06] transition-colors"
                      >
                        <Plus size={12} /> Konu Aç
                      </Link>

                      <Link 
                        href={`/communities/${community.slug || community.id}`}
                        className="flex items-center gap-0.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors pl-1"
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

      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {activeRulesCommunity && (() => {
          const meta = getMeta(activeRulesCommunity.slug);

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setActiveRulesCommunity(null);
              }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-md bg-[#111726] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 p-5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                      {getIcon(activeRulesCommunity.icon || 'users')}
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-sky-400">Topluluk Rehberi</span>
                      <h3 id="modal-title" className="text-sm font-bold text-slate-100">
                        {activeRulesCommunity.name} Kuralları
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveRulesCommunity(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                    aria-label="Kapat"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-5 space-y-3.5">
                  <p className="text-xs text-slate-400 font-normal leading-relaxed">
                    Bu kurallar üyelerin güvenliği, doğrulanmış mevzuat akışı ve saygılı iletişim ortamı için belirlenmiştir:
                  </p>
                  
                  <ul className="space-y-2.5">
                    {meta.rules.map((rule, rIdx) => (
                      <li key={rIdx} className="flex gap-2.5 items-start text-xs text-slate-300 leading-relaxed">
                        <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 border-t border-white/[0.08] bg-slate-900/60">
                  <button
                    onClick={() => setActiveRulesCommunity(null)}
                    className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Anladım, Kuralları Kabul Ediyorum
                  </button>
                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </DashboardLayout>
  );
}
