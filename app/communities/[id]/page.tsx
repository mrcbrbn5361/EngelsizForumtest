'use client';
import { toast } from 'sonner';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { 
  ArrowLeft, Users, MessageSquare, Shield, Globe, Loader2, Sparkles, Plus, Search, Check, Info, X,
  Stethoscope, BookOpen, Briefcase, Cpu, Code, Smile, Settings, Megaphone, Scale, 
  CreditCard, PiggyBank, Award, FileText, HeartPulse, Activity, Eye, Volume2, MapPin, 
  GraduationCap, Calendar, AlertTriangle, FolderTree, HelpCircle, Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Topic } from '@/types/database';
import { DiscussionCard } from '@/components/forum/discussion-card';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
}

const COMMUNITY_META: Record<string, {
  color: string;
  focusGroups: string[];
  tags: string[];
  memberCount: number;
  topicCount: number;
  featured?: boolean;
  rules: string[];
}> = {
  'sgk': {
    color: 'rose',
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
    color: 'violet',
    focusGroups: ['bilissel', 'haklar'],
    tags: ['Sınav Hazırlığı', 'Kadro Atamaları', 'Çalışma Grupları'],
    memberCount: 2350,
    topicCount: 540,
    featured: true,
    rules: [
      'Telif hakkı içeren sınav dokümanlarını veya korsan kitap linklerini kesinlikle paylaşmayın.',
      'Sınav stresi ve motivasyon dışı kırıcı, rekabetçi veya incitici tartışmalardan kaçının.',
      'Öğretmenlik, mühendislik, düz memurluk gibi kadro özelindeki soruları ilgili konu başlıklarında toplayın.'
    ]
  },
  'otv': {
    color: 'amber',
    focusGroups: ['ortopedik'],
    tags: ['Araç Alımı', 'ÖTV Muafiyeti', 'Mevzuat Değişikliği'],
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
    color: 'emerald',
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
    color: 'sky',
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
    color: 'indigo',
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
    color: 'teal',
    focusGroups: ['gorme', 'isitme'],
    tags: ['Ekran Okuyucular', 'Yardımcı Yazılımlar', 'Erişilebilirlik Yamaları'],
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
    color: 'blue',
    focusGroups: ['gorme', 'isitme'],
    tags: ['Erişilebilir Kod', 'A11y Standartları', 'Web Geliştirme'],
    memberCount: 820,
    topicCount: 140,
    rules: [
      'Kod paylaşırken Markdown formatını (` ```js ` gibi) kullanarak kodun okunabilirliğini artırın.',
      'WCAG (Web İçeriği Erişilebilirlik Kılavuzu) standartlarına uygun örnekler paylaşmaya çalışın.',
      'Erişilebilirlik kütüphaneleri ve test araçları hakkında tecrübelerinizi aktarın.'
    ]
  },
  'yapay-zeka': {
    color: 'fuchsia',
    focusGroups: ['gorme', 'bilissel'],
    tags: ['Gemini Entegrasyonu', 'Görsel Betimleme', 'Yapay Zeka Sesleri'],
    memberCount: 1150,
    topicCount: 195,
    rules: [
      'Yapay zeka ile tamamen otomatik üretilmiş uzun makale/tartışmaları "Yapay Zeka" etiketiyle paylaşın.',
      'Görsel betimleme araçları (Gemini Vision vb.) kullanan üyelerimizin deneyimlerini paylaşmasını destekleyin.',
      'Hayatı kolaylaştırıcı prompt (komut) önerilerini paylaşırken sade bir dil kullanın.'
    ]
  },
  'gunluk-yasam': {
    color: 'pink',
    focusGroups: ['gorme', 'isitme', 'ortopedik', 'bilissel'],
    tags: ['Social Sohbet', 'Hobiler & Sanat', 'Engelsiz Seyahat'],
    memberCount: 1780,
    topicCount: 390,
    rules: [
      'Politik, ideolojik veya inanç temelli hassas konuları içeren kutuplaştırıcı tartışmalardan kaçının.',
      'Engelsiz seyahat ve mekan deneyimlerinizde rampa, asansör, sesli yönlendirme detaylarını belirtin.',
      'Hobiler, kitap kulüpleri ve sanatsal faaliyetlerde kapsayıcı etkinlikleri duyurun.'
    ]
  },
  'sosyal-haklar': {
    color: 'purple',
    focusGroups: ['haklar'],
    tags: ['Yasal Ödenekler', 'Ulaşım İndirimleri', 'Belediye Hizmetleri'],
    memberCount: 1670,
    topicCount: 310,
    rules: [
      'Sadece resmi kanun maddeleri ve doğrulanmış kamu sitelerini kaynak göstererek iddialarda bulunun.',
      'Belediye indirimleri, engelli kartı alma adımları gibi pratik rehberleri aşama aşama anlatın.',
      'Sosyal yardım başvurularında karşılaşılan bürokratik engelleri yapıcı bir dille paylaşın.'
    ]
  },
  'engelli-haklari': {
    color: 'cyan',
    focusGroups: ['haklar'],
    tags: ['Hak Savunuculuğu', 'Ayrımcılık Bildirimi', 'Farkındalık Projeleri'],
    memberCount: 1340,
    topicCount: 280,
    rules: [
      'Yaşanan hak ihlallerini veya ayrımcı tutumları aktarırken hakaret içermeyen, tamamen hukuki ve nesnel bir dil tercih edin.',
      'Farkındalık projelerini ve sivil toplum kuruluşlarının (STK) kapsayıcı etkinliklerini destekleyin.',
      'Erişilebilirlik standartları dışı yapı ve mimarilerin bildirilmesi süreçlerini koordine edin.'
    ]
  },
  'araclar': {
    color: 'slate',
    focusGroups: ['ortopedik'],
    tags: ['Tekerlekli Sandalyeler', 'Protez / Ortez', 'Rehabilitasyon'],
    memberCount: 750,
    topicCount: 115,
    rules: [
      'Medikal marka kayırmadan, kullandığınız tekerlekli sandalye veya protez cihazlarının artı/eksilerini dürüstçe yazın.',
      'İhtiyaç sahipleri için hibe veya takas amaçlı cihaz paylaşımlarında ticari kâr amacı gütmeyin.',
      'Yardımcı araç tamiratı ve yedek parça temini gibi teknik tüyoları paylaşın.'
    ]
  },
  'kamu-duyurulari': {
    color: 'orange',
    focusGroups: ['haklar'],
    tags: ['Resmi İlanlar', 'Yönetmelik Değişikliği', 'Bakanlık Açıklamaları'],
    memberCount: 990,
    topicCount: 160,
    rules: [
      'Duyurunun asıl kaynağını (Resmi Gazete bağlantısı, bakanlık basın bülteni vb.) mutlaka konuya ekleyin.',
      'Aynı duyurunun mükerrer olarak paylaşılmasını önlemek amacıyla konuyu açmadan önce arama yapın.',
      'Duyuruları yalınlaştırarak, ağır bürokratik dilden uzak bir özetle sunun.'
    ]
  }
};

const COLOR_SCHEMES: Record<string, {
  bg: string;
  text: string;
  border: string;
  hoverBorder: string;
  lightBg: string;
  darkText: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
}> = {
  rose: {
    bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-200 dark:border-rose-900/30', hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-700/50',
    lightBg: 'bg-rose-500/10', darkText: 'text-rose-700 dark:text-rose-300', gradient: 'from-rose-500/15 via-rose-500/5 to-transparent',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/20', badgeText: 'text-rose-600 dark:text-rose-400'
  },
  violet: {
    bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-200 dark:border-violet-900/30', hoverBorder: 'hover:border-violet-400 dark:hover:border-violet-700/50',
    lightBg: 'bg-violet-500/10', darkText: 'text-violet-700 dark:text-violet-300', gradient: 'from-violet-500/15 via-violet-500/5 to-transparent',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/20', badgeText: 'text-violet-600 dark:text-violet-400'
  },
  amber: {
    bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-200 dark:border-amber-900/30', hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-700/50',
    lightBg: 'bg-amber-500/10', darkText: 'text-amber-700 dark:text-amber-300', gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/20', badgeText: 'text-amber-600 dark:text-amber-400'
  },
  emerald: {
    bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-200 dark:border-emerald-900/30', hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-700/50',
    lightBg: 'bg-emerald-500/10', darkText: 'text-emerald-700 dark:text-emerald-300', gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/20', badgeText: 'text-emerald-600 dark:text-emerald-400'
  },
  sky: {
    bg: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-200 dark:border-sky-900/30', hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-700/50',
    lightBg: 'bg-sky-500/10', darkText: 'text-sky-700 dark:text-sky-300', gradient: 'from-sky-500/15 via-sky-500/5 to-transparent',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/20', badgeText: 'text-sky-600 dark:text-sky-400'
  },
  indigo: {
    bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-200 dark:border-indigo-900/30', hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-700/50',
    lightBg: 'bg-indigo-500/10', darkText: 'text-indigo-700 dark:text-indigo-300', gradient: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/20', badgeText: 'text-indigo-600 dark:text-indigo-400'
  },
  teal: {
    bg: 'bg-teal-500', text: 'text-teal-500', border: 'border-teal-200 dark:border-teal-900/30', hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-700/50',
    lightBg: 'bg-teal-500/10', darkText: 'text-teal-700 dark:text-teal-300', gradient: 'from-teal-500/15 via-teal-500/5 to-transparent',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/20', badgeText: 'text-teal-600 dark:text-teal-400'
  },
  fuchsia: {
    bg: 'bg-fuchsia-500', text: 'text-fuchsia-500', border: 'border-fuchsia-200 dark:border-fuchsia-900/30', hoverBorder: 'hover:border-fuchsia-400 dark:hover:border-fuchsia-700/50',
    lightBg: 'bg-fuchsia-500/10', darkText: 'text-fuchsia-700 dark:text-fuchsia-300', gradient: 'from-fuchsia-500/15 via-fuchsia-500/5 to-transparent',
    badgeBg: 'bg-fuchsia-50 dark:bg-fuchsia-950/20', badgeText: 'text-fuchsia-600 dark:text-fuchsia-400'
  },
  pink: {
    bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-200 dark:border-pink-900/30', hoverBorder: 'hover:border-pink-400 dark:hover:border-pink-700/50',
    lightBg: 'bg-pink-500/10', darkText: 'text-pink-700 dark:text-pink-300', gradient: 'from-pink-500/15 via-pink-500/5 to-transparent',
    badgeBg: 'bg-pink-50 dark:bg-pink-950/20', badgeText: 'text-pink-600 dark:text-pink-400'
  },
  purple: {
    bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-200 dark:border-purple-900/30', hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-700/50',
    lightBg: 'bg-purple-500/10', darkText: 'text-purple-700 dark:text-purple-300', gradient: 'from-purple-500/15 via-purple-500/5 to-transparent',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/20', badgeText: 'text-purple-600 dark:text-purple-400'
  },
  cyan: {
    bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-200 dark:border-cyan-900/30', hoverBorder: 'hover:border-cyan-400 dark:hover:border-cyan-700/50',
    lightBg: 'bg-cyan-500/10', darkText: 'text-cyan-700 dark:text-cyan-300', gradient: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/20', badgeText: 'text-cyan-600 dark:text-cyan-400'
  },
  slate: {
    bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-200 dark:border-slate-900/30', hoverBorder: 'hover:border-slate-400 dark:hover:border-slate-700/50',
    lightBg: 'bg-slate-500/10', darkText: 'text-slate-700 dark:text-slate-300', gradient: 'from-slate-500/15 via-slate-500/5 to-transparent',
    badgeBg: 'bg-slate-50 dark:bg-slate-950/20', badgeText: 'text-slate-600 dark:text-slate-400'
  },
  orange: {
    bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-200 dark:border-orange-900/30', hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-700/50',
    lightBg: 'bg-orange-500/10', darkText: 'text-orange-700 dark:text-orange-300', gradient: 'from-orange-500/15 via-orange-500/5 to-transparent',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/20', badgeText: 'text-orange-600 dark:text-orange-400'
  },
  blue: {
    bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-200 dark:border-blue-900/30', hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-700/50',
    lightBg: 'bg-blue-500/10', darkText: 'text-blue-700 dark:text-blue-300', gradient: 'from-blue-500/15 via-blue-500/5 to-transparent',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/20', badgeText: 'text-blue-600 dark:text-blue-400'
  }
};

export default function CommunityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<{ id: string, text: string } | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);
  
  // Filtering and searching states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'solved' | 'pinned' | 'popular'>('all');
  const [isJoined, setIsJoined] = useState(false);

  const getMeta = useCallback((slug: string) => {
    const normalized = slug?.toLowerCase() || '';
    if (COMMUNITY_META[normalized]) {
      return COMMUNITY_META[normalized];
    }
    return {
      color: 'indigo',
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

  const getScheme = useCallback((slug: string) => {
    const meta = getMeta(slug);
    return COLOR_SCHEMES[meta.color] || COLOR_SCHEMES['indigo'];
  }, [getMeta]);

  // Sync joined state with local storage
  useEffect(() => {
    if (community?.id) {
      const saved = localStorage.getItem('joined_communities');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          setIsJoined(list.includes(community.id));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [community?.id]);

  const toggleJoin = () => {
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
      list = list.filter(id => id !== community.id);
      setIsJoined(false);
      toast.success(`"${community.name}" topluluğundan ayrıldınız.`);
    } else {
      list.push(community.id);
      setIsJoined(true);
      toast.success(`"${community.name}" topluluğuna katıldınız!`);
    }
    localStorage.setItem('joined_communities', JSON.stringify(list));
  };
  
  const formatCompact = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { notation: 'compact' }).format(val);
  };
  
  const fetchCommunityData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCommunity(null);
      setLoading(false);
      return;
    }

    try {
      const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      
      let catQuery = supabase.from('categories').select('*');
      if (isUuid(id as string)) {
        catQuery = catQuery.eq('id', id);
      } else {
        catQuery = catQuery.eq('slug', id);
      }
      
      const { data, error } = await catQuery.single();
      
      if (error || !data) {
        setCommunity(null);
      } else {
        setCommunity(data);
        
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select(`
            *,
            author:profiles(username, avatar_url, full_name, role, level, xp, is_verified),
            category:categories(name),
            comments(count)
          `)
          .eq('category_id', data.id)
          .order('created_at', { ascending: false });

        if (topicsError) throw topicsError;
        setTopics((topicsData || []).filter(t => t.author));
      }

      const { count: totalProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (totalProfiles) {
        setMemberCount(totalProfiles);
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCommunityData();
    }
  }, [id, fetchCommunityData]);

  const handleSummarize = async (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) {
      toast.error('AI Özeti için gerekli veriler eksik.');
      return;
    }

    setSummarizingId(id);
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
        setSummaryResult({ id, text: data.text });
      }
    } catch (error: any) {
      console.error('Summarization failed:', error);
      toast.error('Özet oluşturulurken bir hata oluştu: ' + error.message);
    } finally {
      setSummarizingId(null);
    }
  };

  const getIcon = (iconName?: string, customColorClass?: string) => {
    const baseColor = customColorClass || "text-primary";
    switch (iconName?.toLowerCase()) {
      case 'stethoscope': return <Stethoscope className={baseColor} />;
      case 'bookopen':
      case 'book-open': return <BookOpen className={baseColor} />;
      case 'briefcase': return <Briefcase className={baseColor} />;
      case 'cpu': return <Cpu className={baseColor} />;
      case 'code': return <Code className={baseColor} />;
      case 'smile': return <Smile className={baseColor} />;
      case 'shield': return <Shield className={baseColor} />;
      case 'settings': return <Settings className={baseColor} />;
      case 'megaphone': return <Megaphone className={baseColor} />;
      case 'car': return <Car className={baseColor} />;
      case 'scale': return <Scale className={baseColor} />;
      case 'creditcard':
      case 'credit-card': return <CreditCard className={baseColor} />;
      case 'piggybank':
      case 'piggy-bank': return <PiggyBank className={baseColor} />;
      case 'award': return <Award className={baseColor} />;
      case 'filetext':
      case 'file-text': return <FileText className={baseColor} />;
      case 'heartpulse':
      case 'heart-pulse': return <HeartPulse className={baseColor} />;
      case 'activity': return <Activity className={baseColor} />;
      case 'eye': return <Eye className={baseColor} />;
      case 'volume2':
      case 'volume-2': return <Volume2 className={baseColor} />;
      case 'mappin':
      case 'map-pin': return <MapPin className={baseColor} />;
      case 'graduationcap':
      case 'graduation-cap': return <GraduationCap className={baseColor} />;
      case 'calendar': return <Calendar className={baseColor} />;
      case 'alerttriangle':
      case 'alert-triangle': return <AlertTriangle className={baseColor} />;
      case 'users': return <Users className={baseColor} />;
      case 'message': return <MessageSquare className={baseColor} />;
      case 'sparkles': return <Sparkles className={baseColor} />;
      default: return <Users className={baseColor} />;
    }
  };

  // Dynamic filtering and search matching
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
      result = result.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    }
    
    return result;
  }, [topics, searchQuery, activeFilter]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-primary" size={64} />
          <p className="mt-6 font-black text-muted-foreground uppercase tracking-widest text-sm">Yükleniyor...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!community) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-6">
          <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">Topluluk Bulunamadı</h1>
          <button 
            onClick={() => router.push('/communities')} 
            className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
          >
            Topluluklara Geri Dön
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const meta = getMeta(community.slug);
  const scheme = getScheme(community.slug);

  return (
    <DashboardLayout>
      <div className="w-full py-8 md:py-12">
        
        {/* Screen Reader Announcements */}
        <div className="sr-only" aria-live="polite">
          {searchQuery ? `${filteredTopics.length} sonuç listelendi.` : ''}
          {activeFilter !== 'all' ? `${activeFilter} filtresi uygulandı.` : ''}
        </div>

        <button 
          onClick={() => router.push('/communities')}
          className="mb-8 flex items-center gap-3 text-sm font-black text-muted-foreground hover:text-primary transition-all group uppercase tracking-[0.2em] px-2"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> TOPLULUKLAR
        </button>

        <div className="grid grid-cols-1 2xl:grid-cols-[1fr_360px] gap-8 md:gap-12">
          <div className="space-y-12">
            
            {/* Header / Banner Card */}
            <header className="vibe-card p-6 sm:p-8 md:p-12 relative overflow-hidden shadow-2xl border-2 border-border">
              <div className={`absolute inset-0 bg-gradient-to-br ${scheme.gradient} opacity-40 -z-10`} />
              <div className="relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                  <div className={`w-16 h-16 md:w-28 md:h-28 ${scheme.lightBg} ${scheme.text} rounded-2xl md:rounded-[2.5rem] flex items-center justify-center shrink-0 transition-all shadow-md`}>
                    {getIcon(community.icon || 'users', `${scheme.text} w-8 h-8 md:w-12 md:h-12`)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="vibe-label ml-0 mb-2 md:mb-3">TOPLULUK VE PAYLAŞIM GRUBU</p>
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-none text-foreground whitespace-normal break-normal">{community.name}</h1>
                  </div>
                </div>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-bold uppercase tracking-wide leading-relaxed max-w-3xl">
                  {community.description}
                </p>

                {/* Focus group tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {meta.tags.map((tag, tIdx) => (
                    <span 
                      key={tIdx} 
                      className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${scheme.badgeBg} ${scheme.badgeText}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={toggleJoin}
                    className={`h-14 sm:h-16 px-8 sm:px-10 rounded-[1.2rem] font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 outline-none flex items-center justify-center gap-2 ${
                      isJoined 
                        ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-2 border-green-500/30'
                        : `${scheme.bg} text-white shadow-xl shadow-primary/25`
                    }`}
                  >
                    {isJoined ? <Check size={18} className="stroke-[3]" /> : <Plus size={18} className="stroke-[3]" />}
                    {isJoined ? 'TOPLULUKTASINIZ' : 'GRUBA KATIL'}
                  </button>
                  <Link 
                    href={`/discussions/new?category_id=${community.id}`}
                    className="h-14 sm:h-16 px-8 sm:px-10 rounded-[1.2rem] bg-muted border-2 border-transparent hover:border-primary/20 text-foreground font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-muted/80 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                  >
                    <Plus size={18} className="shrink-0 stroke-[3]" /> BAŞLIK AÇ
                  </Link>
                </div>
              </div>
            </header>

            {/* Topics/Discussions Section */}
            <section className="space-y-8">
              
              {/* Dynamic Filtering Toolbar */}
              <div className="vibe-card p-6 flex flex-col md:flex-row gap-6 justify-between items-stretch md:items-center border border-border">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                  <input 
                    type="text" 
                    placeholder="BU TOPLULUK İÇİNDE ARA..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background text-xs font-black tracking-widest uppercase outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'HEPSİ' },
                    { id: 'pinned', label: 'SABİT' },
                    { id: 'solved', label: 'ÇÖZÜLMÜŞ' },
                    { id: 'popular', label: 'POPÜLER' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id as any)}
                      className={`px-4 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border outline-none ${
                        activeFilter === filter.id
                          ? `${scheme.bg} text-white border-transparent`
                          : 'bg-background text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

              </div>

              <h2 className="vibe-section-title px-4 flex items-center gap-6">
                <MessageSquare size={48} className="text-primary" /> Tartışmalar 
                <span className="text-primary/20">{filteredTopics.length}</span>
              </h2>
              
              <div className="grid gap-6">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DiscussionCard 
                        topic={topic} 
                        onSummarize={handleSummarize}
                        isLoading={summarizingId === topic.id}
                      />
                      <AnimatePresence>
                        {summaryResult && summaryResult.id === topic.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mt-3 p-6 md:p-8 bg-primary/5 border border-primary/10 rounded-2xl relative overflow-hidden ring-1 ring-primary/20"
                          >
                            <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4">
                              <Sparkles size={16} /> AI ÖZETİ
                            </div>
                            <div className="text-base md:text-lg leading-relaxed font-bold text-foreground italic">
                              &ldquo;{summaryResult.text}&rdquo;
                            </div>
                            <button 
                              onClick={() => setSummaryResult(null)}
                              className="mt-6 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors underline uppercase tracking-widest"
                            >
                              Özeti Kapat
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-24 bg-card rounded-[2rem] border-2 border-dashed border-border px-8">
                    <MessageSquare size={80} className="mx-auto text-muted-foreground/10 mb-8" />
                    <p className="text-xl md:text-3xl font-black text-muted-foreground/40 mb-10 tracking-tighter">Aradığınız kriterlere uygun konu bulunamadı.</p>
                    <Link 
                      href={`/discussions/new?category_id=${community.id}`}
                      className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 inline-block"
                    >
                      İlk tartışmayı sen başlat!
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <aside className="space-y-10">
            
            {/* Rules of Community Card */}
            <section className="vibe-card p-8 md:p-12 border border-border">
              <h2 className="text-2xl font-black mb-10 flex items-center gap-4 tracking-tighter text-foreground">
                <Shield size={32} className="text-primary" /> KURALLAR
              </h2>
              <ul className="space-y-10">
                {meta.rules.map((rule, idx) => (
                  <li className="flex gap-4" key={idx}>
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary mt-1 border border-primary/20">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground leading-relaxed font-semibold uppercase tracking-wide">{rule}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Statistics */}
            <div className="vibe-card p-8 md:p-12 border border-border">
              <h3 className="vibe-label ml-0 mb-10">İSTATİSTİKLER</h3>
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <span className="text-lg text-muted-foreground font-black flex items-center gap-4 tracking-tight"><Users size={24} /> Üyeler</span>
                  <span className="text-2xl font-black text-primary tracking-tighter">
                    {memberCount > 0 ? formatCompact(memberCount + meta.memberCount) : formatCompact(meta.memberCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <span className="text-lg text-muted-foreground font-black flex items-center gap-4 tracking-tight"><MessageSquare size={24} /> Konular</span>
                  <span className="text-2xl font-black text-primary tracking-tighter">{topics.length}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <span className="text-lg text-muted-foreground font-black flex items-center gap-4 tracking-tight"><Globe size={24} /> Görünürlük</span>
                  <span className="vibe-label ml-0">AÇIK TOPLULUK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg text-muted-foreground font-black flex items-center gap-4 tracking-tight"><Shield size={24} /> Durum</span>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">GÜVENLİ</span>
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div className="bg-primary p-12 rounded-[2.5rem] text-primary-foreground relative overflow-hidden shadow-2xl group">
              <div className="absolute -right-16 -bottom-16 opacity-10 group-hover:scale-110 transition-transform">
                <Shield size={220} />
              </div>
              <div className="relative z-10">
                <h3 className="vibe-label ml-0 mb-6 text-white/70">HIZLI YARDIM</h3>
                <p className="text-2xl font-black mb-10 leading-tight tracking-tight">Topluluk hakkında sorun mu var? Moderatörlere hemen yaz.</p>
                <button className="w-full h-16 bg-white text-primary rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-white/90 transition-all active:scale-95 shadow-2xl shadow-black/20">
                  BİZE ULAŞIN
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
