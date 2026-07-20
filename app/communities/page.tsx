'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { 
  Users, Search, ChevronRight, MessageSquare, Handshake, Loader2, Plus, Save,
  Scale, CreditCard, PiggyBank, Award, FileText, HeartPulse, Activity, Eye, Volume2, MapPin, 
  GraduationCap, Calendar, AlertTriangle, FolderTree, HelpCircle, Stethoscope, BookOpen, 
  Briefcase, Cpu, Code, Smile, Shield, Settings, Megaphone, Car, Sparkles, Info, X, Check,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

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

// Rich aesthetic data mapped to community slugs
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

const FOCUS_GROUPS = [
  { id: 'all', label: 'TÜM TOPLULUKLAR', icon: '🌐', desc: 'Platformumuzdaki tüm alt forum ve uzmanlık grupları.' },
  { id: 'gorme', label: 'GÖRME ENGELLİ', icon: '👁️', desc: 'Ekran okuyucular, kabartma ekranlar ve sesli kütüphaneler.' },
  { id: 'isitme', label: 'İŞİTME ENGELLİ', icon: '👂', desc: 'Altyazı çözümleri, işaret dili destekleri ve cihaz ayarları.' },
  { id: 'ortopedik', label: 'ORTOPEDİK ENGELLİ', icon: '♿', desc: 'ÖTV araç alımları, protezler ve fiziksel mekan erişilebilirliği.' },
  { id: 'bilissel', label: 'BİLİŞSEL & NÖROÇEŞİTLİ', icon: '🧠', desc: 'Özel eğitim, otizm, disleksi ve dikkat destek süreçleri.' },
  { id: 'haklar', label: 'HAKLAR & MEVZUAT', icon: '⚖️', desc: 'Maaşlar, vergi muafiyetleri, yasal haklar ve SGK işlemleri.' },
];

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', icon: 'users' });
  const [creating, setCreating] = useState(false);
  
  // Custom states for Bento & Inclusive additions
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [joinedList, setJoinedList] = useState<string[]>([]);
  const [activeRulesCommunity, setActiveRulesCommunity] = useState<Community | null>(null);
  const [showWelcomeTip, setShowWelcomeTip] = useState(true);

  // Load joined list from local storage
  useEffect(() => {
    const saved = localStorage.getItem('joined_communities');
    if (saved) {
      try {
        setJoinedList(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse joined list:', e);
      }
    }
  }, []);

  const fetchCommunities = React.useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCommunities([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch categories with topic counts
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
      const slug = newCommunity.name.toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-');
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...newCommunity, slug }]);
      
      if (error) throw error;
      setShowCreateForm(false);
      setNewCommunity({ name: '', description: '', icon: 'users' });
      await fetchCommunities();
      toast.success('Yeni topluluk başarıyla oluşturuldu!');
    } catch (err) {
      console.error('Error creating community:', err);
      toast.error('Topluluk oluşturulurken hata oluştu.');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) await fetchCommunities();
    };
    init();
    return () => { isMounted = false; };
  }, [fetchCommunities]);

  // Dynamic mapper for custom aesthetics
  const getMeta = (slug: string) => {
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
  };

  const getScheme = (slug: string) => {
    const meta = getMeta(slug);
    return COLOR_SCHEMES[meta.color] || COLOR_SCHEMES['indigo'];
  };

  // Toggle gruba katılım
  const toggleJoin = (communityId: string, communityName: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    let updated: string[];
    const isJoined = joinedList.includes(communityId);
    if (isJoined) {
      updated = joinedList.filter(id => id !== communityId);
      toast.success(`"${communityName}" topluluğundan ayrıldınız.`);
    } else {
      updated = [...joinedList, communityId];
      toast.success(`"${communityName}" topluluğuna katıldınız! Artık bu gruptaki gelişmeler akışınızda öne çıkacaktır.`);
    }
    setJoinedList(updated);
    localStorage.setItem('joined_communities', JSON.stringify(updated));
  };

  // Filters logic
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

  // Icons renderer
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
      case 'handshake': return <Handshake className={baseColor} />;
      case 'sparkles': return <Sparkles className={baseColor} />;
      default: return <FolderTree className={baseColor} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
        
        {/* Screen Reader accessible updates */}
        <div className="sr-only" aria-live="polite">
          {searchQuery ? `${filteredAndGroupedCommunities.length} topluluk bulundu.` : ''}
          {selectedGroup !== 'all' ? `${FOCUS_GROUPS.find(g => g.id === selectedGroup)?.label} filtresi uygulandı.` : ''}
        </div>

        {/* Dynamic Welcome Tip Banner */}
        <AnimatePresence>
          {showWelcomeTip && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-5 bg-primary/10 border border-primary/20 rounded-2xl relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex gap-3 items-center">
                <span className="text-2xl" role="img" aria-label="Ampul">💡</span>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-wider text-primary">Erişilebilirlik İpucu</h4>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
                    İlgi gruplarını filtreleyerek ihtiyacınız olan topluluğa doğrudan erişebilir, &quot;Katıl&quot; butonuyla akışınızı özelleştirebilirsiniz.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowWelcomeTip(false)}
                className="text-xs font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
                aria-label="İpucu panelini kapat"
              >
                <X size={14} /> Anladım
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-12">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 md:p-14 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 size-80 bg-primary/[0.02] rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl -z-10" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4">
                <p className="text-xs font-black text-primary tracking-widest uppercase">UZMANLIK VE YARDIMLAŞMA GRUPLARI</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-none">Topluluklar</h1>
                <p className="text-lg md:text-xl text-muted-foreground font-bold uppercase tracking-wide max-w-2xl leading-relaxed">
                  Bariyersiz paylaşımlar ve kolektif tecrübe edinimi için özelleşmiş alt forumları keşfedin.
                </p>
              </div>
              <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-xs font-black tracking-widest text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 shadow-md shadow-primary/10 self-start lg:self-auto"
                aria-label="Yeni bir topluluk oluşturma panelini aç"
                aria-expanded={showCreateForm}
              >
                <Plus size={18} className={showCreateForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
                {showCreateForm ? 'VAZGEÇ' : 'YENİ TOPLULUK KUR'}
              </button>
            </div>
          </div>
        </header>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <form 
              onSubmit={createCommunity}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm relative overflow-hidden space-y-8"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Yeni Bir Topluluk Kur</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Topluluğunuzu başlatın ve üyelerinizi bir araya getirin.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="community-name" className="text-xs font-black uppercase tracking-widest text-foreground">Topluluk Adı</label>
                  <input 
                    id="community-name"
                    type="text" 
                    placeholder="Örn: Erişilebilir Oyunlar" 
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                    required
                    className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="community-icon" className="text-xs font-black uppercase tracking-widest text-foreground">İkon Seçin</label>
                  <select 
                    id="community-icon"
                    className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none font-bold text-sm cursor-pointer"
                    value={newCommunity.icon}
                    onChange={(e) => setNewCommunity({...newCommunity, icon: e.target.value})}
                  >
                    <option value="users">Kullanıcılar (Varsayılan)</option>
                    <option value="message">Sohbet Mesajı</option>
                    <option value="handshake">Dayanışma</option>
                    <option value="cpu">Erişilebilir Teknoloji</option>
                    <option value="code">Kodlama / Yazılım</option>
                    <option value="smile">Sosyal Hayat</option>
                    <option value="scale">Hukuk ve Haklar</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="community-desc" className="text-xs font-black uppercase tracking-widest text-foreground">Topluluk Amacı ve Açıklaması</label>
                <textarea 
                  id="community-desc"
                  placeholder="Bu topluluğun amacını, kurallarını ve kimlere hitap ettiğini detaylıca belirtin..." 
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                  required
                  className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none font-bold text-sm min-h-[140px]"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-4 rounded-xl text-xs font-black tracking-widest text-muted-foreground hover:bg-muted transition-colors uppercase"
                >
                  İPTAL ET
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-xs font-black tracking-widest text-primary-foreground transition-all hover:bg-primary/90"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {creating ? 'KURULUYOR...' : 'TOPLULUĞU BAŞLAT'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Premium Focus Filter Tabs */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">İlgi Alanına Göre Keşfet</h2>
            {selectedGroup !== 'all' && (
              <button 
                onClick={() => setSelectedGroup('all')}
                className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {FOCUS_GROUPS.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all border outline-none ${
                  selectedGroup === group.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/15'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/30'
                }`}
                aria-pressed={selectedGroup === group.id}
                aria-label={`${group.label} odaklı topluluklar`}
              >
                <span>{group.icon}</span>
                {group.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider pl-1">
            {FOCUS_GROUPS.find(g => g.id === selectedGroup)?.desc}
          </p>
        </div>

        {/* Search Input block */}
        <div className="relative mb-12 max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="TOPLULUKLARDA VEYA AÇIKLAMALARDA ARA..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 rounded-xl border border-border bg-background pl-12 pr-4 text-xs font-black tracking-widest uppercase outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
            aria-label="Topluluk arama kutusu"
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 h-[220px] flex flex-col justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-primary/10" />
                  <Skeleton className="h-4 w-full bg-primary/5" />
                  <Skeleton className="h-4 w-5/6 bg-primary/5" />
                </div>
                <Skeleton className="h-5 w-24 bg-primary/5" />
              </div>
            ))}
          </div>
        ) : (
          (() => {
            const activeCategories = filteredAndGroupedCommunities;

            if (activeCategories.length === 0) {
              return (
                <div className="text-center py-20 px-6 bg-card rounded-3xl border border-dashed border-border max-w-md mx-auto">
                  <Users className="mx-auto text-muted-foreground/20 mb-4" size={56} />
                  <h3 className="text-lg font-black mb-1 text-foreground tracking-tight uppercase">Topluluk Bulunamadı</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide leading-relaxed">
                    Aradığınız kriterlere uygun bir grup henüz oluşturulmamış. Yeni bir topluluk başlatabilirsiniz!
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-fr">
                {activeCategories.map((community, index) => {
                  const meta = getMeta(community.slug);
                  const scheme = getScheme(community.slug);
                  const isFeatured = meta.featured && selectedGroup === 'all' && !searchQuery;
                  const isJoined = joinedList.includes(community.id);

                  return (
                    <motion.div 
                      key={community.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`group relative ${isFeatured ? 'md:col-span-2' : 'col-span-1'}`}
                    >
                      <div className={`h-full flex flex-col justify-between bg-card border ${scheme.border} ${scheme.hoverBorder} rounded-3xl p-6 md:p-8 transition-all shadow-sm hover:shadow-md relative overflow-hidden`}>
                        
                        {/* Decorative gradient background for aesthetics */}
                        <div className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${scheme.gradient} -z-10`} />

                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-4 mb-5">
                            <div className="flex items-center gap-4">
                              <div className={`p-3.5 ${scheme.lightBg} ${scheme.text} rounded-2xl shrink-0 transition-transform group-hover:scale-105`}>
                                {getIcon(community.icon || 'users', scheme.text)}
                              </div>
                              <div>
                                <div className="flex flex-wrap gap-1.5 items-center">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">TOPLULUK</span>
                                  {isFeatured && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                      <Sparkles size={8} /> ÖNE ÇIKAN
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground whitespace-normal break-words leading-tight group-hover:text-primary transition-colors">
                                  <Link href={`/discussions?kategori=${community.slug}`}>
                                    {community.name}
                                  </Link>
                                </h3>
                              </div>
                            </div>

                            {/* Rules and info action */}
                            <button
                              onClick={() => setActiveRulesCommunity(community)}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all shrink-0"
                              aria-label={`${community.name} kurallarını görüntüle`}
                              title="Kurallar ve Rehber"
                            >
                              <Info size={16} />
                            </button>
                          </div>

                          {/* Description */}
                          <p className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-wide leading-relaxed line-clamp-3 mb-5">
                            {community.description}
                          </p>

                          {/* Focus tags */}
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {meta.tags.map((tag, tIdx) => (
                              <span 
                                key={tIdx} 
                                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${scheme.badgeBg} ${scheme.badgeText}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 mt-4 mb-1">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare size={12} className="text-muted-foreground" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{(community as any).topic_count || 0} TARTIŞMA</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users size={12} className="text-muted-foreground" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{meta.memberCount} ÜYE</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-4 border-t border-border mt-auto flex flex-wrap items-center justify-between gap-4">
                          <button
                            onClick={(e) => toggleJoin(community.id, community.name, e)}
                            className={`flex items-center gap-1.5 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              isJoined 
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                                : 'bg-muted text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent'
                            }`}
                            aria-label={`${community.name} grubuna ${isJoined ? 'üyesiniz. Ayrılmak için tıklayın' : 'katılmak için tıklayın'}`}
                          >
                            {isJoined ? (
                              <>
                                <Check size={12} className="stroke-[3]" /> KATILDINIZ
                              </>
                            ) : (
                              <>
                                <Plus size={12} className="stroke-[3]" /> KATIL
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/discussions/new?kategori=${community.slug}`}
                              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                              aria-label={`${community.name} kategorisinde yeni bir konu aç`}
                            >
                              <Plus size={12} className="stroke-[3]" /> KONU AÇ
                            </Link>

                            <Link 
                              href={`/discussions?kategori=${community.slug}`}
                              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                              aria-label={`${community.name} tartışmalarına gözat`}
                            >
                              TARTIŞMALAR <ChevronRight size={14} className="stroke-[3]" />
                            </Link>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()
        )}

        {/* Inclusive Information guidelines */}
        <section className="mt-20">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 md:p-14 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 size-80 bg-primary/[0.01] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-foreground uppercase">Toplumsal Bilginin Gücü: Engelsiz Dayanışma</h2>
              <p className="text-sm md:text-base text-muted-foreground font-bold uppercase tracking-wide leading-relaxed">
                EngelsizForum toplulukları sıradan birer kategori başlığı değildir. Her topluluk belirli bir engellilik odağı veya hak arama alanına yönelik kurgulanmış, akran desteğini ve kolektif yardımlaşmayı amaçlayan bağımsız **deneyim odalarıdır**.
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-10">
                <div className="space-y-3 p-6 bg-muted/40 rounded-2xl border border-border">
                  <h3 className="text-base font-black text-foreground uppercase tracking-tight">Akran Dayanışması</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide leading-relaxed">
                    Resmi mevzuatlarda bazen karmaşık görünen süreçler, topluluk üyelerimizin birebir tecrübe aktarımları sayesinde çözüme ulaşır.
                  </p>
                </div>
                <div className="space-y-3 p-6 bg-muted/40 rounded-2xl border border-border">
                  <h3 className="text-base font-black text-foreground uppercase tracking-tight">Yapay Zeka Yardımı</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide leading-relaxed">
                    Yeterly AI ve Gemini entegrasyonumuz sayesinde, her gruptaki uzun ve detaylı tartışmaların akıcı seslendirmeye uygun özetleri tek tıkla üretilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Accessible Rules Overlay / Dialog Modal */}
      <AnimatePresence>
        {activeRulesCommunity && (() => {
          const meta = getMeta(activeRulesCommunity.slug);
          const scheme = getScheme(activeRulesCommunity.slug);

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setActiveRulesCommunity(null);
              }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-lg max-h-[85vh] bg-card border border-border rounded-3xl shadow-2xl relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary z-10" />
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4 p-6 md:p-8 pb-4 border-b border-border/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 ${scheme.lightBg} ${scheme.text} rounded-xl shrink-0`}>
                      {getIcon(activeRulesCommunity.icon || 'users', scheme.text)}
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">TOPLULUK REHBERİ</span>
                      <h3 id="modal-title" className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight leading-tight">
                        {activeRulesCommunity.name} Kuralları
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveRulesCommunity(null)}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors shrink-0"
                    aria-label="Kapat"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 md:p-8 py-4 space-y-4 flex-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide leading-relaxed border-b pb-4">
                    Bu kurallar, tüm grup üyelerinin güvenliği, bilgi doğruluğu ve kapsayıcı iletişim ortamının korunması için hazırlanmıştır.
                  </p>
                  
                  <ul className="space-y-4">
                    {meta.rules.map((rule, rIdx) => (
                      <li key={rIdx} className="flex gap-3 items-start">
                        <span className="text-primary mt-1 text-xs font-black shrink-0">📌</span>
                        <p className="text-xs md:text-sm text-foreground font-bold uppercase tracking-wide leading-relaxed">
                          {rule}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Action */}
                <div className="p-6 md:p-8 pt-4 border-t border-border shrink-0 bg-muted/25">
                  <button
                    onClick={() => setActiveRulesCommunity(null)}
                    className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black tracking-widest uppercase rounded-xl transition-colors"
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
