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
    tags: ['Araç Alımı', 'ÖTV Muafiyeti (2.873.972 TL)', 'Limit Takibi'],
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
  { id: 'ortopedik', label: 'Ortopedik Engelliler', icon: '♿', desc: 'ÖTV araç alımları (2.873.972 TL tavan), protezler ve mekan erişilebilirliği.' },
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
          setJoinedList([]);
        } else if (data) {
          setJoinedList(data.map((m: any) => m.community_id));
        }
      } catch {
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
    } catch {
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
          setJoinedList(joinedList);
          toast.error(`"${communityName}" topluluğundan ayrılma başarısız: ` + error.message);
          return;
        }
        toast.success(`"${communityName}" topluluğundan ayrıldınız.`);
      } catch {
        setJoinedList(joinedList);
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
          setJoinedList(joinedList);
          toast.error(`"${communityName}" topluluğuna katılamadı: ` + error.message);
          return;
        }
        toast.success(`"${communityName}" topluluğuna katıldınız!`);
      } catch {
        setJoinedList(joinedList);
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
      <div className="bg-[#161b22] border border-[#30363d] px-4 py-2.5 rounded-md flex items-center gap-2 text-xs text-slate-300">
        <Link href="/" className="hover:text-white font-bold transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight size={13} className="text-slate-500" />
        <span className="font-bold text-white">Topluluklar ve Uzmanlık Grupları</span>
      </div>

      {/* Header Banner */}
      <div className="border-b border-[#30363d] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 text-[11px] font-mono font-bold uppercase">
            <Sparkles size={12} />
            <span>Akran Dayanışması &amp; Tanı Grupları</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Topluluklar ve Forum Kategorileri
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Engel türlerine, hukuki mevzuata ve yardımcı teknolojilere özel odaklanmış toplulukları keşfedin, akranlarınızla yardımlaşın.
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
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-white hover:bg-slate-100 text-black text-xs font-bold transition-colors shadow-xs cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Plus size={14} className={showCreateForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
          <span>{showCreateForm ? 'İptal Et' : 'Yeni Topluluk Kur'}</span>
        </button>
      </div>

      {/* Create Community Form */}
      {showCreateForm && (
        <form 
          onSubmit={createCommunity}
          className="bg-[#161b22] border border-[#30363d] rounded-md p-5 space-y-4"
        >
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white">Yeni Bir Topluluk Kur</h2>
            <p className="text-xs text-slate-400">Yeni uzmanlık veya dayanışma grubunuzu başlatın.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="community-name" className="text-xs font-bold text-slate-300">Topluluk Adı</label>
              <input 
                id="community-name"
                type="text" 
                placeholder="Örn: Erişilebilir Oyunlar" 
                value={newCommunity.name}
                onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                required
                className="w-full p-2.5 rounded-md border border-[#30363d] bg-[#0d1117] text-white text-xs outline-none focus:border-sky-400"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="community-icon" className="text-xs font-bold text-slate-300">İkon</label>
              <select 
                id="community-icon"
                className="w-full p-2.5 rounded-md border border-[#30363d] bg-[#0d1117] text-white text-xs outline-none focus:border-sky-400 cursor-pointer"
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
            <label htmlFor="community-desc" className="text-xs font-bold text-slate-300">Açıklama</label>
            <textarea 
              id="community-desc"
              placeholder="Bu topluluğun amacını ve kimlere hitap ettiğini belirtin..." 
              value={newCommunity.description}
              onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
              required
              className="w-full p-2.5 rounded-md border border-[#30363d] bg-[#0d1117] text-white text-xs outline-none focus:border-sky-400 min-h-[80px]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button 
              type="submit" 
              disabled={creating}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-white hover:bg-slate-100 text-black text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{creating ? 'Oluşturuluyor...' : 'Topluluğu Başlat'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {FOCUS_GROUPS.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedGroup === group.id
                    ? 'bg-white text-black'
                    : 'bg-[#161b22] text-slate-300 border border-[#30363d] hover:bg-[#21262d] hover:text-white'
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
              className="w-full pl-9 pr-3.5 py-1.5 rounded-md border border-[#30363d] bg-[#161b22] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
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
        <div className="text-center py-12 px-6 bg-[#161b22] rounded-md border border-dashed border-[#30363d] max-w-md mx-auto space-y-2">
          <Users className="mx-auto text-slate-500" size={32} />
          <h3 className="text-sm font-bold text-white">Topluluk Bulunamadı</h3>
          <p className="text-xs text-slate-400">
            Arama kriterinize uygun grup bulunamadı. &quot;Yeni Topluluk Kur&quot; butonuyla siz başlatabilirsiniz.
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
                className="flex flex-col justify-between bg-[#161b22] border border-[#30363d] hover:border-slate-500 rounded-md p-5 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-[#21262d] rounded-md text-sky-400">
                        {getIcon(community.icon || 'users')}
                      </div>
                      <div>
                        {meta.featured && (
                          <span className="text-[10px] font-mono text-amber-400 uppercase">
                            Öne Çıkan
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-white hover:text-sky-400 transition-colors">
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

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {community.description || 'Açıklama belirtilmemiş.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {meta.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0d1117] text-slate-300 border border-[#30363d]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>{(community as any).topic_count || 0} Tartışma</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{meta.memberCount} Üye</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-[#30363d] mt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => toggleJoin(community.id, community.name, e)}
                    className={`flex items-center gap-1.5 h-7 px-2.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      isJoined 
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                        : 'bg-[#21262d] text-slate-200 hover:bg-[#30363d] border border-[#30363d]'
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

                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/discussions/new?kategori=${community.slug}`}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Konu Aç
                    </Link>
                    <Link 
                      href={`/communities/${community.slug || community.id}`}
                      className="flex items-center gap-0.5 text-xs font-bold text-sky-400 hover:underline"
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
          <div className="bg-[#161b22] border border-[#30363d] rounded-md max-w-lg w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield size={16} className="text-sky-400" />
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
                  <span className="font-mono text-sky-400 text-[11px] shrink-0">{idx + 1}.</span>
                  <p className="leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveRulesCommunity(null)}
                className="px-4 py-1.5 rounded-md bg-white text-black text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
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
