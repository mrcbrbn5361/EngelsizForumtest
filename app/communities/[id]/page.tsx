'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { 
  ArrowLeft, Users, MessageSquare, Shield, Globe, Loader2, Sparkles, Plus, Search, Check,
  Stethoscope, BookOpen, Briefcase, Cpu, Code, Smile, Settings, Megaphone, Scale, 
  CreditCard, PiggyBank, Award, FileText, HeartPulse, Activity, Eye, Volume2, MapPin, 
  GraduationCap, Calendar, AlertTriangle, FolderTree, Car, HelpCircle, RefreshCw, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Topic } from '@/types/database';
import { DiscussionCard } from '@/components/forum/discussion-card';
import { useAuth } from '@/components/providers/auth-provider';
import { formatCompactNumber, generateUUID } from '@/lib/utils';
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

export default function CommunityDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const router = useRouter();
  const { user } = useAuth();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<{ id: string, text: string } | null>(null);
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
      memberCount: 240,
      topicCount: 42,
      rules: [
        'Topluluk saygı çerçevesinde paylaşımlar yapmalıdır.',
        'Kapsayıcı, erişilebilir ve hakaret içermeyen bir dil kullanılması zorunludur.'
      ]
    };
  }, []);

  const fetchCommunityData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCommunity(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);
    try {
      const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      
      let catQuery = supabase.from('categories').select('*');
      if (isUuid(id as string)) {
        catQuery = catQuery.eq('id', id);
      } else {
        catQuery = catQuery.eq('slug', id);
      }
      
      const { data, error } = await catQuery.maybeSingle();
      
      if (error || !data) {
        setCommunity(null);
        if (error) setFetchError(error.message);
      } else {
        setCommunity(data);
        
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

        // Check if user is joined from community_members or local storage
        if (user) {
          const { data: memberEntry } = await supabase
            .from('community_members')
            .select('id')
            .eq('community_id', data.id)
            .eq('user_id', user.id)
            .maybeSingle();
          if (memberEntry) {
            setIsJoined(true);
          }
        }
      }

      const { count: totalProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (totalProfiles) {
        setMemberCount(totalProfiles);
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

  useEffect(() => {
    if (community?.id) {
      const saved = localStorage.getItem('joined_communities');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (list.includes(community.id)) {
            setIsJoined(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [community?.id]);

  const toggleJoin = async () => {
    if (!community) return;
    
    const saved = localStorage.getItem('joined_communities');
    let list: string[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    if (isJoined) {
      list = list.filter(itemId => itemId !== community.id);
      setIsJoined(false);
      toast.success(`"${community.name}" topluluğundan ayrıldınız.`);
      if (user) {
        await supabase
          .from('community_members')
          .delete()
          .eq('community_id', community.id)
          .eq('user_id', user.id);
      }
    } else {
      list.push(community.id);
      setIsJoined(true);
      toast.success(`"${community.name}" topluluğuna katıldınız!`);
      if (user) {
        await supabase
          .from('community_members')
          .insert({
            id: generateUUID(),
            community_id: community.id,
            user_id: user.id
          });
      }
    }
    localStorage.setItem('joined_communities', JSON.stringify(list));
  };

  const handleSummarize = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) {
      toast.error('AI Özeti için gerekli veriler eksik.');
      return;
    }

    setSummarizingId(topicId);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: topic.title, content: topic.content, type: 'topic_summary' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Özet oluşturulamadı');
      }
      
      if (data.text) {
        setSummaryResult({ id: topicId, text: data.text });
      }
    } catch (error: any) {
      console.error('Summarization failed:', error);
      toast.error('Özet oluşturulurken bir hata oluştu: ' + error.message);
    } finally {
      setSummarizingId(null);
    }
  };

  const getIcon = (iconName?: string) => {
    const cls = "text-sky-400";
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
      case 'sparkles': return <Sparkles size={20} className={cls} aria-hidden="true" />;
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
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-24" role="status">
          <Loader2 className="animate-spin text-sky-400" size={40} aria-hidden="true" />
          <p className="mt-4 text-xs font-semibold text-slate-400">Topluluk verileri yükleniyor...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!community) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-6 space-y-4" role="alert">
          <AlertCircle className="w-12 h-12 text-rose-400" aria-hidden="true" />
          <h1 className="text-xl font-bold text-slate-100">Topluluk Bulunamadı</h1>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            {fetchError || 'Aradığınız topluluk mevcut değil veya taşınmış olabilir.'}
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchCommunityData()} 
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-white/[0.08] transition-colors cursor-pointer"
            >
              <RefreshCw size={14} /> Tekrar Dene
            </button>
            <button 
              onClick={() => router.push('/communities')} 
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Topluluklara Geri Dön
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const meta = getMeta(community.slug);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl space-y-6">
        
        {/* Navigation Breadcrumb */}
        <nav aria-label="Erişim yolu" className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/communities" className="inline-flex items-center gap-1.5 hover:text-sky-400 transition-colors">
            <ArrowLeft size={14} aria-hidden="true" /> Topluluklar
          </Link>
          <span className="text-slate-600" aria-hidden="true">/</span>
          <span className="text-slate-200 font-medium">{community.name}</span>
        </nav>

        {/* Header Hero Banner */}
        <header className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400 shrink-0">
                {getIcon(community.icon || 'users')}
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-semibold">
                  Topluluk &amp; Paylaşım Grubu
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
                  {community.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-2xl">
                  {community.description || 'Bu toplulukta deneyimlerinizi paylaşabilir, soru sorabilir ve uzman akran desteği alabilirsiniz.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button 
                onClick={toggleJoin}
                className={`inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isJoined 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
                aria-label={isJoined ? `${community.name} topluluğundan ayrıl` : `${community.name} topluluğuna katıl`}
              >
                {isJoined ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
                {isJoined ? 'Topluluktasınız' : 'Gruba Katıl'}
              </button>

              <Link 
                href={`/discussions/new?category_id=${community.id}`}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/[0.08] transition-colors"
              >
                <Plus size={14} aria-hidden="true" /> Başlık Aç
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.06]">
            {meta.tags.map((tag, tIdx) => (
              <span 
                key={tIdx} 
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/80 text-slate-300 border border-white/[0.06]"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Layout: Main topics stream & Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Discussions Column (2 cols on large screen) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111726]/80 border border-white/[0.08] rounded-xl p-3 backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} aria-hidden="true" />
                <input 
                  type="search" 
                  placeholder="Bu topluluk içinde ara..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Topluluk içi konu arama"
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-white/[0.06] bg-slate-900/60 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="flex flex-wrap gap-1" role="tablist" aria-label="Konu filtreleme">
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'pinned', label: 'Sabit' },
                  { id: 'solved', label: 'Çözüldü' },
                  { id: 'popular', label: 'Popüler' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    role="tab"
                    aria-selected={activeFilter === filter.id}
                    onClick={() => setActiveFilter(filter.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeFilter === filter.id
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Screen reader live notification */}
            <div className="sr-only" aria-live="polite">
              {filteredTopics.length} adet konu bulundu.
            </div>

            {/* Discussions List */}
            <div className="space-y-3">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <div key={topic.id} className="space-y-2">
                    <DiscussionCard 
                      topic={topic} 
                      onSummarize={handleSummarize}
                      isLoading={summarizingId === topic.id}
                    />
                    <AnimatePresence>
                      {summaryResult && summaryResult.id === topic.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl space-y-2"
                        >
                          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold">
                            <Sparkles size={14} aria-hidden="true" /> AI Tartışma Özeti
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            &ldquo;{summaryResult.text}&rdquo;
                          </p>
                          <button 
                            onClick={() => setSummaryResult(null)}
                            className="text-[11px] text-slate-400 hover:text-sky-400 underline transition-colors cursor-pointer"
                          >
                            Özeti Kapat
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 px-6 bg-[#111726]/60 rounded-2xl border border-dashed border-white/[0.08] space-y-3">
                  <MessageSquare size={36} className="mx-auto text-slate-600" aria-hidden="true" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-200">Henüz Tartışma Bulunmuyor</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Bu grupta henüz konu açılmamış veya arama filtrenize uygun başlık yok.
                    </p>
                  </div>
                  <Link 
                    href={`/discussions/new?category_id=${community.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Plus size={14} aria-hidden="true" /> İlk Başlığı Siz Açın
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar Column (1 col on large screen) */}
          <aside className="space-y-4" aria-label="Topluluk Bilgileri">
            
            {/* Rules Card */}
            <div className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Shield size={16} className="text-sky-400" aria-hidden="true" />
                <span>Topluluk Kuralları</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                {meta.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold mt-0.5" aria-hidden="true">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Statistics Card */}
            <div className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-md space-y-3">
              <div className="text-xs font-bold text-slate-200">Topluluk İstatistikleri</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-slate-400 flex items-center gap-2"><Users size={14} className="text-slate-500" aria-hidden="true" /> Üyeler</span>
                  <span className="font-semibold text-slate-200">
                    {memberCount > 0 ? formatCompactNumber(memberCount + meta.memberCount) : formatCompactNumber(meta.memberCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-slate-400 flex items-center gap-2"><MessageSquare size={14} className="text-slate-500" aria-hidden="true" /> Konular</span>
                  <span className="font-semibold text-slate-200">{topics.length}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-slate-400 flex items-center gap-2"><Globe size={14} className="text-slate-500" aria-hidden="true" /> Görünürlük</span>
                  <span className="text-sky-400 font-medium">Açık Topluluk</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 flex items-center gap-2"><Shield size={14} className="text-slate-500" aria-hidden="true" /> Durum</span>
                  <span className="text-emerald-400 font-medium">Moderatör Onaylı</span>
                </div>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-gradient-to-br from-sky-950/40 to-slate-900/60 border border-sky-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <HelpCircle size={16} aria-hidden="true" /> Destek &amp; Moderasyon
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bu topluluk ile ilgili hak ihlali, yanıltıcı bilgi veya erişilebilirlik sorunu yaşarsanız moderatör ekibimizle iletişime geçebilirsiniz.
              </p>
              <Link 
                href="/messages"
                className="inline-flex items-center justify-center w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Moderatöre Ulaşın
              </Link>
            </div>

          </aside>

        </div>

      </div>
    </DashboardLayout>
  );
}
