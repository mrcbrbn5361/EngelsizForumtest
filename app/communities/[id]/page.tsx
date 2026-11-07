'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ArrowLeft, Users, MessageSquare, Shield, Globe, Loader2, Plus, Search, Check,
  Stethoscope, BookOpen, Briefcase, Cpu, Code, Smile, Settings, Megaphone, Scale, 
  CreditCard, PiggyBank, Award, FileText, HeartPulse, Activity, Eye, Volume2, MapPin, 
  GraduationCap, Calendar, AlertTriangle, FolderTree, Car, HelpCircle, RefreshCw, AlertCircle
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Topic } from '@/types/database';
import { DiscussionCard } from '@/components/forum/discussion-card';
import { useAuth } from '@/components/providers/auth-provider';
import { formatCompactNumber } from '@/lib/utils';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
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

export default function CommunityDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const router = useRouter();
  const { user } = useAuth();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'solved' | 'pinned' | 'popular'>('all');
  const [isJoined, setIsJoined] = useState(false);

  const getMeta = useCallback((slug: string) => {
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
  }, []);

  const fetchCommunityData = useCallback(async () => {
    if (!id || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setFetchError(null);

      // Find by slug or id
      let query = supabase.from('categories').select('*');
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (isUUID) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        setCommunity(null);
        if (error) setFetchError(error.message);
      } else {
        setCommunity(data);
        
        // Fetch real topics
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select(`
            id, title, content, author_id, category_id, is_pinned, is_locked, is_solved, views_count, created_at, updated_at, slug,
            author:profiles(id, username, display_name, full_name, avatar_url, role),
            category:categories(id, name, slug)
          `)
          .eq('category_id', data.id)
          .order('created_at', { ascending: false });

        if (topicsError) {
          console.warn('Error fetching topics:', topicsError);
        }
        setTopics((topicsData as any || []).filter((t: any) => t.author));

        // Fetch real member count for this community
        const { count: realMembersCount } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', data.id);
        
        setMemberCount(realMembersCount || 0);

        // Check if user is joined
        if (user) {
          const { data: memberEntry } = await supabase
            .from('community_members')
            .select('community_id')
            .eq('community_id', data.id)
            .eq('user_id', user.id)
            .maybeSingle();
          if (memberEntry) {
            setIsJoined(true);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching community data:', error);
      setFetchError(error?.message || 'Topluluk verileri yüklenirken bir hata oluştu.');
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      fetchCommunityData();
    }
  }, [id, fetchCommunityData]);

  const toggleJoin = async () => {
    if (!community) return;
    if (!user) {
      toast.error('Topluluklara katılmak için lütfen giriş yapın.');
      return;
    }

    if (isJoined) {
      setIsJoined(false);
      setMemberCount(prev => Math.max(0, prev - 1));
      try {
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('community_id', community.id)
          .eq('user_id', user.id);
        if (error) throw error;
        toast.success(`"${community.name}" grubundan ayrıldınız.`);
      } catch (err: any) {
        setIsJoined(true);
        setMemberCount(prev => prev + 1);
        toast.error(`Ayrılma sırasında hata: ` + err.message);
      }
    } else {
      setIsJoined(true);
      setMemberCount(prev => prev + 1);
      try {
        const { error } = await supabase
          .from('community_members')
          .insert({
            community_id: community.id,
            user_id: user.id
          });
        if (error) throw error;
        toast.success(`"${community.name}" grubuna katıldınız!`);
      } catch (err: any) {
        setIsJoined(false);
        setMemberCount(prev => Math.max(0, prev - 1));
        toast.error(`Katılma sırasında hata: ` + err.message);
      }
    }
  };

  const getIcon = (iconName?: string) => {
    const cls = "text-indigo-400";
    switch (iconName?.toLowerCase()) {
      case 'stethoscope': return <Stethoscope size={20} className={cls} aria-hidden="true" />;
      case 'bookopen':
      case 'book-open': return <BookOpen size={20} className={cls} aria-hidden="true" />;
      case 'briefcase': return <Briefcase size={20} className={cls} aria-hidden="true" />;
      case 'cpu': return <Cpu size={20} className={cls} aria-hidden="true" />;
      case 'code': return <Code size={20} className={cls} aria-hidden="true" />;
      case 'smile': return <Smile size={20} className={cls} aria-hidden="true" />;
      case 'shield': return <Shield size={20} className={cls} aria-hidden="true" />;
      case 'settings': return <Settings size={20} className={cls} aria-hidden="true" />;
      case 'megaphone': return <Megaphone size={20} className={cls} aria-hidden="true" />;
      case 'car': return <Car size={20} className={cls} aria-hidden="true" />;
      case 'scale': return <Scale size={20} className={cls} aria-hidden="true" />;
      case 'creditcard':
      case 'credit-card': return <CreditCard size={20} className={cls} aria-hidden="true" />;
      case 'piggybank':
      case 'piggy-bank': return <PiggyBank size={20} className={cls} aria-hidden="true" />;
      case 'award': return <Award size={20} className={cls} aria-hidden="true" />;
      case 'filetext':
      case 'file-text': return <FileText size={20} className={cls} aria-hidden="true" />;
      case 'heartpulse':
      case 'heart-pulse': return <HeartPulse size={20} className={cls} aria-hidden="true" />;
      case 'activity': return <Activity size={20} className={cls} aria-hidden="true" />;
      case 'eye': return <Eye size={20} className={cls} aria-hidden="true" />;
      case 'volume2':
      case 'volume-2': return <Volume2 size={20} className={cls} aria-hidden="true" />;
      case 'mappin':
      case 'map-pin': return <MapPin size={20} className={cls} aria-hidden="true" />;
      case 'graduationcap':
      case 'graduation-cap': return <GraduationCap size={20} className={cls} aria-hidden="true" />;
      case 'calendar': return <Calendar size={20} className={cls} aria-hidden="true" />;
      case 'alerttriangle':
      case 'alert-triangle': return <AlertTriangle size={20} className={cls} aria-hidden="true" />;
      case 'users': return <Users size={20} className={cls} aria-hidden="true" />;
      case 'message': return <MessageSquare size={20} className={cls} aria-hidden="true" />;
      default: return <FolderTree size={20} className={cls} aria-hidden="true" />;
    }
  };

  const filteredTopics = useMemo(() => {
    let result = [...topics];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.content.toLowerCase().includes(q)
      );
    }
    
    if (activeFilter === 'solved') {
      result = result.filter(t => t.is_solved);
    } else if (activeFilter === 'pinned') {
      result = result.filter(t => t.is_pinned);
    } else if (activeFilter === 'popular') {
      result = result.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    }
    
    return result;
  }, [topics, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400" role="status">
        <Loader2 className="animate-spin text-indigo-400" size={36} aria-hidden="true" />
        <p className="mt-4 text-xs font-mono">Topluluk verileri yükleniyor...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6 space-y-4 max-w-md mx-auto" role="alert">
        <AlertCircle className="w-12 h-12 text-rose-400" aria-hidden="true" />
        <h1 className="text-xl font-bold text-white font-heading">Topluluk Bulunamadı</h1>
        <p className="text-xs text-slate-400 leading-relaxed font-normal">
          {fetchError || 'Aradığınız topluluk mevcut değil veya taşınmış olabilir.'}
        </p>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchCommunityData()} 
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#18243A] hover:bg-[#1E293B] text-slate-200 rounded-md text-xs font-medium border border-[#1E293B] transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> Tekrar Dene
          </button>
          <button 
            onClick={() => router.push('/communities')} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Topluluklara Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const meta = getMeta(community.slug);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6 text-slate-200">
      
      {/* Navigation Breadcrumb */}
      <nav aria-label="Erişim yolu" className="bg-[#111B2E] border border-[#1E293B] px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs text-slate-400 font-mono">
        <Link href="/communities" className="inline-flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
          <ArrowLeft size={13} aria-hidden="true" /> Topluluklar
        </Link>
        <span className="text-slate-600" aria-hidden="true">/</span>
        <span className="text-slate-200 font-semibold font-sans">{community.name}</span>
      </nav>

      {/* Header Hero Banner */}
      <header className="bg-[#111B2E] border border-[#1E293B] rounded-lg p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#18243A] border border-[#1E293B] rounded-lg text-indigo-400 shrink-0">
              {getIcon(community.icon || 'users')}
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 text-[10px] font-mono uppercase tracking-wider">
                Topluluk &amp; Akran Dayanışması
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading">
                {community.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-2xl">
                {community.description || 'Bu toplulukta deneyimlerinizi paylaşabilir, soru sorabilir ve uzman akran desteği alabilirsiniz.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button 
              onClick={toggleJoin}
              className={`inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isJoined 
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
              }`}
              aria-label={isJoined ? `${community.name} topluluğundan ayrıl` : `${community.name} topluluğuna katıl`}
            >
              {isJoined ? <Check size={13} aria-hidden="true" /> : <Plus size={13} aria-hidden="true" />}
              {isJoined ? 'Katıldınız' : 'Gruba Katıl'}
            </button>

            <Link 
              href={`/discussions/new?category_id=${community.id}`}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-md bg-[#18243A] hover:bg-[#1E293B] text-slate-200 hover:text-white text-xs font-medium border border-[#1E293B] transition-colors"
            >
              <Plus size={13} aria-hidden="true" /> Konu Aç
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#1E293B]">
          {meta.tags.map((tag, tIdx) => (
            <span 
              key={tIdx} 
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#18243A] text-slate-300 border border-[#1E293B]"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Layout: Main topics stream & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Discussions Column */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111B2E] border border-[#1E293B] rounded-lg p-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} aria-hidden="true" />
              <input 
                type="text"
                placeholder={`${community.name} konularında ara...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-md border border-[#1E293B] bg-[#18243A] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#18243A]'
                }`}
              >
                Tümü
              </button>
              <button 
                onClick={() => setActiveFilter('solved')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeFilter === 'solved'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#18243A]'
                }`}
              >
                Çözüldü
              </button>
              <button 
                onClick={() => setActiveFilter('popular')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeFilter === 'popular'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#18243A]'
                }`}
              >
                Popüler
              </button>
            </div>
          </div>

          {/* Discussions List */}
          <div className="space-y-3">
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => (
                <DiscussionCard 
                  key={topic.id} 
                  topic={topic} 
                />
              ))
            ) : (
              <div className="bg-[#111B2E] border border-[#1E293B] rounded-lg p-10 text-center space-y-3">
                <MessageSquare className="mx-auto text-slate-500" size={32} aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white font-heading">Henüz Konu Bulunmuyor</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-normal">
                    Bu toplulukta henüz konu açılmamış veya arama kriterinize uygun başlık yok.
                  </p>
                </div>
                <Link 
                  href={`/discussions/new?category_id=${community.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
                >
                  <Plus size={14} aria-hidden="true" /> İlk Başlığı Siz Açın
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar Column */}
        <aside className="lg:col-span-4 space-y-4" aria-label="Topluluk Bilgileri">
          
          {/* Rules Card */}
          <div className="bg-[#111B2E] border border-[#1E293B] rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-heading">
              <Shield size={15} className="text-indigo-400" aria-hidden="true" />
              <span>Topluluk Kuralları</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-normal">
              {meta.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-mono text-[11px] shrink-0" aria-hidden="true">{idx + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Statistics Card */}
          <div className="bg-[#111B2E] border border-[#1E293B] rounded-lg p-5 space-y-3">
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-heading">Topluluk İstatistikleri</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-[#1E293B]">
                <span className="text-slate-400 flex items-center gap-2"><Users size={14} className="text-indigo-400" aria-hidden="true" /> Üyeler</span>
                <span className="font-mono font-medium text-slate-200">
                  {formatCompactNumber(memberCount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#1E293B]">
                <span className="text-slate-400 flex items-center gap-2"><MessageSquare size={14} className="text-indigo-400" aria-hidden="true" /> Konular</span>
                <span className="font-mono font-medium text-slate-200">{topics.length}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#1E293B]">
                <span className="text-slate-400 flex items-center gap-2"><Globe size={14} className="text-indigo-400" aria-hidden="true" /> Görünürlük</span>
                <span className="text-indigo-400 font-mono font-medium text-xs">Açık Topluluk</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 flex items-center gap-2"><Shield size={14} className="text-indigo-400" aria-hidden="true" /> Moderasyon</span>
                <span className="text-emerald-400 font-mono font-medium text-xs">Doğrulanmış</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Card */}
          <div className="bg-[#111B2E] border border-[#1E293B] rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-heading">
              <HelpCircle size={15} className="text-indigo-400" aria-hidden="true" /> Destek &amp; Moderasyon
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Bu topluluk ile ilgili hak ihlali, yanıltıcı bilgi veya erişilebilirlik sorunu yaşarsanız moderatör ekibimizle iletişime geçebilirsiniz.
            </p>
            <Link 
              href="/help"
              className="inline-flex items-center justify-center w-full py-2 bg-[#18243A] hover:bg-[#1E293B] hover:text-white text-slate-200 border border-[#1E293B] rounded-md text-xs font-medium transition-colors"
            >
              Destek Masasına Ulaşın
            </Link>
          </div>

        </aside>

      </div>

    </div>
  );
}
