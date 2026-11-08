'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, ChevronRight, MessageSquare, Plus,
  Scale, CreditCard, PiggyBank, Award, FileText, HeartPulse, Activity, Eye, 
  Volume2, MapPin, GraduationCap, Calendar, AlertTriangle, FolderTree, Pin,
  TrendingUp, CheckCircle2, Send, Loader2, Stethoscope, BookOpen, Briefcase, 
  Cpu, Code, Smile, Shield, Settings, Megaphone, Car, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Topic, Category } from '@/types/database';
import { cn, formatCompactNumber } from '@/lib/utils';
import { isUserOnline } from '@/lib/presence';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserRoleBadge } from '@/components/ui/user-badge';

interface ForumIndexClientProps {
  initialTopics: Topic[];
  initialCategories: Category[];
  stats?: {
    totalTopics: number;
    totalComments: number;
    totalMembers: number;
    newestMember: string;
    todayTopics: number;
    todayComments: number;
    activeMembers: any[];
    onlineCount?: number;
    topContributors: any[];
    trendingTags: any[];
  };
}

export function ForumIndexClient({ initialTopics, initialCategories, stats }: ForumIndexClientProps) {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'solved' | 'popular' | 'pinned'>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({});
  
  // Balthazard mini calculator
  const [rate1, setRate1] = useState('');
  const [rate2, setRate2] = useState('');
  const [isOver65, setIsOver65] = useState(false);
  const [miniBalthazardResult, setMiniBalthazardResult] = useState<number | null>(null);

  // AI Assistant State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswers, setAiAnswers] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Engelli hakları, 2026 ÖTV üst limiti veya Balthazard mevzuatı hakkında soru sorabilirsiniz.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const [onlineMembers, setOnlineMembers] = useState<{ id: string; username: string; name: string; avatar: string; isOnline: boolean; role: string; }[]>([]);

  useEffect(() => {
    if (stats?.activeMembers && Array.isArray(stats.activeMembers)) {
      const formatted = stats.activeMembers
        .filter((m: any) => m && typeof m === 'object' && m.id && isUserOnline(m.last_seen_at))
        .map((m: any) => ({
          id: m.id,
          username: m.username,
          name: m.full_name || m.username,
          avatar: m.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.username}`,
          isOnline: isUserOnline(m.last_seen_at),
          role: m.role || 'user'
        }));
      setOnlineMembers(formatted);
    }
  }, [stats]);

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const calculateMiniBalthazard = (e: React.FormEvent) => {
    e.preventDefault();
    const r1 = parseFloat(rate1);
    const r2 = parseFloat(rate2);
    if (isNaN(r1) || isNaN(r2)) return;
    const maxR = Math.max(r1, r2);
    const minR = Math.min(r1, r2);
    let combined = maxR + (minR * (100 - maxR)) / 100;
    if (isOver65) combined = combined + 10;
    setMiniBalthazardResult(Math.min(100, Math.round(combined)));
  };

  const getSubforumIcon = (iconName?: string | null) => {
    const iconClass = "w-4 h-4 text-zinc-400";
    switch (iconName?.toLowerCase()) {
      case 'stethoscope': return <Stethoscope className={iconClass} />;
      case 'bookopen':
      case 'book-open': return <BookOpen className={iconClass} />;
      case 'briefcase': return <Briefcase className={iconClass} />;
      case 'cpu': return <Cpu className={iconClass} />;
      case 'code': return <Code className={iconClass} />;
      case 'smile': return <Smile className={iconClass} />;
      case 'shield': return <Shield className={iconClass} />;
      case 'settings': return <Settings className={iconClass} />;
      case 'megaphone': return <Megaphone className={iconClass} />;
      case 'car': return <Car className={iconClass} />;
      case 'scale': return <Scale className={iconClass} />;
      case 'creditcard':
      case 'credit-card': return <CreditCard className={iconClass} />;
      case 'piggybank':
      case 'piggy-bank': return <PiggyBank className={iconClass} />;
      case 'award': return <Award className={iconClass} />;
      case 'filetext':
      case 'file-text': return <FileText className={iconClass} />;
      case 'heartpulse':
      case 'heart-pulse': return <HeartPulse className={iconClass} />;
      case 'activity': return <Activity className={iconClass} />;
      case 'eye': return <Eye className={iconClass} />;
      case 'volume2':
      case 'volume-2': return <Volume2 className={iconClass} />;
      case 'mappin':
      case 'map-pin': return <MapPin className={iconClass} />;
      case 'graduationcap':
      case 'graduation-cap': return <GraduationCap className={iconClass} />;
      case 'calendar': return <Calendar className={iconClass} />;
      case 'alerttriangle':
      case 'alert-triangle': return <AlertTriangle className={iconClass} />;
      default: return <FolderTree className={iconClass} />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getDynamicForumSections = () => {
    const sections = [
      {
        id: "sec-mevzuat",
        name: "Haklar, Mevzuat ve Sosyal Güvenlik",
        description: "Engelli hakları, ÖTV muafiyeti, SGK erken emeklilik ve yasal süreçler.",
        icon: "Scale",
        subforums: [
          {
            id: "sub-otv",
            name: "ÖTV & MTV Muafiyetli Araç Alımı",
            slug: "otv-muafiyeti",
            desc: "2026 yılı 2.873.972 TL üst limit düzenlemesi, tertibat kodları ve vergi istisnası.",
            icon: "Car",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          },
          {
            id: "sub-emeklilik",
            name: "SGK Engelli Erken Emeklilik",
            slug: "engelli-emeklilik",
            desc: "Vergi indirimi derecesine göre yaş şartsız emeklilik, prim gün tabloları.",
            icon: "PiggyBank",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          },
          {
            id: "sub-ayliklar",
            name: "Evde Bakım & 2022 Engelli Aylığı",
            slug: "engelli-maaslari",
            desc: "Hane içi kişi başı gelir kriterleri, SED yardımları ve SYDV başvuruları.",
            icon: "CreditCard",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          },
          {
            id: "sub-istihdam",
            name: "E-KPSS ve Kamuda İstihdam",
            slug: "ekpss-ve-istihdam",
            desc: "Engelli kamu personeli seçme sınavı, kura atamaları, iş kanunu kotaları.",
            icon: "Briefcase",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          }
        ]
      },
      {
        id: "sec-saglik",
        name: "Sağlık Raporları ve Balthazard Robotu",
        description: "Engelli sağlık kurulu heyet raporları, Balthazard formülü ve itiraz süreçleri.",
        icon: "HeartPulse",
        subforums: [
          {
            id: "sub-balthazard",
            name: "Balthazard Hesaplama & Heyet Raporları",
            slug: "balthazard-ve-saglik-raporu",
            desc: "Birden fazla branş oranının formülle birleştirilmesi ve heyet kararları.",
            icon: "Calculator",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          },
          {
            id: "sub-cozger",
            name: "ÇÖZGER (Çocuklar İçin Özel Gereksinim)",
            slug: "cozger-rehberi",
            desc: "18 yaş altı özel gereksinim raporları, ÖKGV ve BÖGV kategori hakları.",
            icon: "Stethoscope",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          },
          {
            id: "sub-medikal",
            name: "Medikal Cihazlar & SGK Geri Ödemeleri",
            slug: "medikal-cihazlar",
            desc: "Tekerlekli sandalye, işitme cihazı, protez-ortez ve SUT geri ödeme listeleri.",
            icon: "Activity",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          }
        ]
      },
      {
        id: "sec-teknoloji",
        name: "Erişilebilirlik ve Yardımcı Teknolojiler",
        description: "Ekran okuyucular, dijital erişilebilirlik ve yardımcı araçlar.",
        icon: "Cpu",
        subforums: [
          {
            id: "sub-ekran-okuyucu",
            name: "Ekran Okuyucular (NVDA, JAWS, VoiceOver)",
            slug: "ekran-okuyucular",
            desc: "Gelişmiş eklentiler, OCR modülleri ve erişilebilir web deneyimi ipuçları.",
            icon: "Volume2",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          },
          {
            id: "sub-web-a11y",
            name: "Web Erişilebilirliği (WCAG) & Kodlama",
            slug: "web-a11y-yazilim",
            desc: "Geliştiriciler için semantik HTML, ARIA desenleri ve WCAG 2.2 AAA standartları.",
            icon: "Code",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          }
        ]
      },
      {
        id: "sec-sosyal",
        name: "Sosyal Yaşam, Dayanışma ve Tanı Grupları",
        description: "Kullanıcı deneyimleri, ortopedik, görme, işitme ve nöroçeşitlilik toplulukları.",
        icon: "Users",
        subforums: [
          {
            id: "sub-ortopedik",
            name: "Ortopedik & Bedensel Engelliler Dayanışması",
            slug: "ortopedik-dayanisma",
            desc: "Mimari erişilebilirlik, rampa standartları ve tekerlekli sandalye yaşamı.",
            icon: "MapPin",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          },
          {
            id: "sub-gorme-isitme",
            name: "Görme & İşitme Engelliler Kulübü",
            slug: "gorme-ve-isitme",
            desc: "Beyaz baston kullanımı, işaret dili eğitimi ve betimleme servisleri.",
            icon: "Eye",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          },
          {
            id: "sub-norocesitlilik",
            name: "Nöroçeşitlilik & Otizm Spektrumu",
            slug: "norocesitlilik",
            desc: "Otizm, DEHB ve disleksi alanında aile dayanışması ve eğitim hakları.",
            icon: "Smile",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          }
        ]
      }
    ];

    // Map DB categories that didn't fit into subforums above
    const matchedSlugs = new Set(sections.flatMap(s => s.subforums.map(sub => sub.slug)));
    const extraSubforums: any[] = [];

    if (initialCategories && initialCategories.length > 0) {
      initialCategories.forEach(cat => {
        if (!matchedSlugs.has(cat.slug)) {
          extraSubforums.push({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            desc: cat.description || "Genel kategori tartışmaları.",
            icon: cat.icon || "FolderTree",
            topics: 0,
            replies: 0,
            lastPost: { title: "Henüz konu bulunmuyor", author: "Topluluk", date: "" }
          });
        }
      });
    }

    if (extraSubforums.length > 0) {
      sections.push({
        id: "sec-other",
        name: "Diğer Forum Kategorileri",
        description: "Platformdaki diğer tartışma alanları ve güncel konular.",
        icon: "FolderTree",
        subforums: extraSubforums
      });
    }

    // Compute real Supabase topics if present
    if (initialTopics && initialTopics.length > 0) {
      sections.forEach(sec => {
        sec.subforums.forEach(sub => {
          const matched = initialTopics.filter(t => 
            t.category?.slug === sub.slug || 
            t.category_id === sub.id ||
            t.title.toLowerCase().includes(sub.slug.replace(/-/g, ' ')) ||
            (sub.name && t.category?.name?.toLowerCase().includes(sub.name.toLowerCase()))
          );
          if (matched.length > 0) {
            const latest = matched[0];
            sub.topics = matched.length;
            sub.replies = matched.reduce((acc, t) => acc + (t.comments_count || 0), 0);
            sub.lastPost = {
              title: latest.title,
              author: latest.author?.full_name || latest.author?.username || 'Topluluk',
              date: formatDate(latest.created_at) || 'Yeni'
            };
          }
        });
      });
    }

    return sections;
  };

  const forumSections = getDynamicForumSections();

  const filteredTopics = useMemo(() => {
    return initialTopics.filter(topic => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || topic.title.toLowerCase().includes(q) || (topic.content || '').toLowerCase().includes(q);
      if (!matchesSearch) return false;
      switch (activeTab) {
        case 'solved': return topic.is_solved === true;
        case 'pinned': return topic.is_pinned === true;
        case 'popular': return (topic.views_count || 0) >= 20 || (topic.comments_count || 0) >= 3;
        default: return true;
      }
    });
  }, [initialTopics, searchQuery, activeTab]);

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || aiLoading) return;
    const userMsg = aiQuestion.trim();
    
    setAiAnswers(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiQuestion('');
    setAiLoading(true);
    
    try {
      const history = aiAnswers.map(ans => ({
        role: ans.sender === 'ai' ? 'model' : 'user',
        text: ans.text
      }));
      
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history }),
      });
      
      const data = await response.json();
      if (response.ok && data.text) {
        setAiAnswers(prev => [...prev, { sender: 'ai', text: data.text }]);
      } else {
        setAiAnswers(prev => [...prev, { sender: 'ai', text: data.error || "Şu anda yanıt alınamadı." }]);
      }
    } catch {
      setAiAnswers(prev => [...prev, { sender: 'ai', text: "Bağlantı hatası oluştu." }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full text-slate-100">
      {/* Top Legislation Notice Bar - Flat hairline divider */}
      <div className="border-b border-[#1E293B] pb-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-400">
            <span className="font-mono text-[11px] text-indigo-400 font-semibold">
              [2026 Mevzuat]
            </span>
            <span>
              2026 ÖTV Muafiyetli Araç Üst Limiti <strong className="text-slate-100 font-mono font-medium">2.873.972 TL</strong> olarak yürürlüktedir.
            </span>
          </div>
          <Link 
            href="/hesaplama" 
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 shrink-0 font-medium"
          >
            Balthazard ve Limit Robotu <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* Hero Header - Generous whitespace, typographic hierarchy, flat linear inputs */}
      <header className="py-6 sm:py-8 border-b border-[#1E293B]">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading">
            {profile ? (
              <>Hoş Geldiniz, {profile.full_name || profile.username}</>
            ) : (
              <>Engelsiz Topluluk ve Bilgi Platformu</>
            )}
          </h1>
          <p className="mt-2.5 text-sm text-slate-300 font-normal leading-relaxed">
            Engelli hakları, 2026 ÖTV istisnası, sağlık kurulu heyet raporları, erken emeklilik ve günlük dayanışma için Türkiye&apos;nin erişilebilir bağımsız forumu.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} aria-hidden="true" />
              <input 
                type="search" 
                placeholder="Başlıklar, mevzuat ve konularda ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Forum genelinde ara"
                className="w-full pl-9 pr-3 h-9 text-xs rounded-md border border-[#1E293B] bg-[#111B2E] text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 transition-colors font-sans"
              />
            </div>
            <Link 
              href="/discussions/new" 
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0"
            >
              <Plus size={14} /> Yeni Konu Aç
            </Link>
          </div>
        </div>

        {/* Minimal Stats Strip */}
        <div className="mt-8 pt-5 border-t border-[#1E293B] flex flex-wrap items-center gap-x-8 gap-y-2 text-xs font-mono text-slate-400">
          <div>
            <span className="text-slate-200 font-medium">{stats?.totalTopics !== undefined ? formatCompactNumber(stats.totalTopics) : '0'}</span> Konu
          </div>
          <div>
            <span className="text-slate-200 font-medium">{stats?.totalComments !== undefined ? formatCompactNumber(stats.totalComments) : '0'}</span> Mesaj
          </div>
          <div>
            <span className="text-slate-200 font-medium">{stats?.totalMembers !== undefined ? formatCompactNumber(stats.totalMembers) : '0'}</span> Üye
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{stats?.onlineCount !== undefined ? stats.onlineCount : onlineMembers.length} Çevrimiçi</span>
          </div>
        </div>
      </header>

      {/* Main Forum Grid */}
      <div className="pt-8 sm:pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <Link 
              href="/hesaplama"
              className="px-3 py-1.5 rounded-md border border-[#1E293B] hover:border-slate-700 bg-[#111B2E] hover:bg-[#18243A] text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Scale size={13} className="text-indigo-400" /> Balthazard Robotu
            </Link>
            <Link 
              href="/hesaplama"
              className="px-3 py-1.5 rounded-md border border-[#1E293B] hover:border-slate-700 bg-[#111B2E] hover:bg-[#18243A] text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Car size={13} className="text-emerald-400" /> 2026 ÖTV Limiti
            </Link>
            <Link 
              href="/communities"
              className="px-3 py-1.5 rounded-md border border-[#1E293B] hover:border-slate-700 bg-[#111B2E] hover:bg-[#18243A] text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Users size={13} className="text-amber-400" /> Tanı Grupları
            </Link>
          </div>

          {/* Forum Categories & Subforums */}
          <div className="space-y-10">
            {forumSections.map((section) => {
              const isCollapsed = collapsedCategories[section.id];
              return (
                <section key={section.id} aria-label={section.name}>
                  {/* Category Header */}
                  <div 
                    onClick={() => toggleCategory(section.id)}
                    className="flex items-center justify-between border-b border-[#1E293B] pb-2 cursor-pointer select-none group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleCategory(section.id);
                      }
                    }}
                    aria-expanded={!isCollapsed}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors font-heading">
                        {section.name}
                      </span>
                    </div>
                    <ChevronRight 
                      size={14} 
                      className={cn("text-slate-400 transition-transform duration-150", !isCollapsed && "rotate-90")} 
                    />
                  </div>

                  {/* Subforums Flat List */}
                  {!isCollapsed && (
                    <div className="divide-y divide-[#1E293B]/70">
                      {section.subforums.map((subforum) => (
                        <div 
                          key={subforum.id} 
                          className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#111B2E]/60 px-2 -mx-2 transition-colors rounded-sm"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="mt-1 shrink-0">
                              {getSubforumIcon(subforum.icon)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link 
                                href={`/category/${subforum.slug}`} 
                                className="text-xs sm:text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-colors block truncate"
                              >
                                {subforum.name}
                              </Link>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                {subforum.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 shrink-0 md:justify-end text-xs text-slate-400 pl-7 md:pl-0">
                            <div className="font-mono text-right shrink-0">
                              <span className="text-slate-200 font-medium">{formatCompactNumber(subforum.topics)}</span> k · <span className="text-slate-200 font-medium">{formatCompactNumber(subforum.replies)}</span> m
                            </div>
                            <div className="text-right truncate max-w-[170px] sm:max-w-[200px]">
                              {subforum.topics > 0 ? (
                                <>
                                  <Link 
                                    href={`/discussions`} 
                                    className="text-slate-300 hover:text-indigo-400 transition-colors truncate block text-xs" 
                                    title={subforum.lastPost.title}
                                  >
                                    {subforum.lastPost.title}
                                  </Link>
                                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                    {subforum.lastPost.author} {subforum.lastPost.date && `· ${subforum.lastPost.date}`}
                                  </div>
                                </>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Henüz konu yok</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Recent Discussions Feed */}
          <section className="space-y-5 pt-2" aria-label="Son Tartışmalar">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading">
                Son Tartışmalar
              </h2>
              
              {/* Tab Switcher */}
              <div className="flex items-center gap-4 text-xs font-medium" role="tablist">
                {[
                  { id: 'all', label: 'Tümü' }, 
                  { id: 'pinned', label: 'Sabitler' }, 
                  { id: 'solved', label: 'Çözülenler' }, 
                  { id: 'popular', label: 'Popüler' }
                ].map((tab) => (
                  <button 
                    key={tab.id} 
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={cn(
                      "transition-colors cursor-pointer pb-0.5",
                      activeTab === tab.id 
                        ? "text-indigo-400 font-semibold border-b-2 border-indigo-400" 
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flat Thread Rows */}
            <div className="divide-y divide-[#1E293B]/70">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <article key={topic.id} className="py-4 hover:bg-[#111B2E]/60 px-2 -mx-2 transition-colors rounded-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1 flex-wrap">
                          {topic.is_pinned && (
                            <span className="font-mono text-amber-300 font-medium">[Sabit]</span>
                          )}
                          {topic.is_solved && (
                            <span className="font-mono text-emerald-400 font-medium">[Çözüldü]</span>
                          )}
                          <span className="text-slate-300 font-medium">{topic.category?.name || 'Genel'}</span>
                          <span>·</span>
                          <time className="font-mono text-slate-400">{formatDate(topic.created_at)}</time>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-colors leading-snug">
                          <Link href={`/discussions/${topic.id}`}>{topic.title}</Link>
                        </h3>
                        {topic.content && (
                          <p className="text-xs text-slate-300 line-clamp-1 mt-1 leading-relaxed">
                            {topic.content}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <span>@{topic.author?.full_name || topic.author?.username || 'Topluluk Üyesi'}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs text-slate-400 shrink-0 pt-1">
                        <span className="text-slate-200 font-medium">
                          {(topic.comments as any)?.[0]?.count || topic.comments_count || 0}
                        </span> yanıt
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Bu filtrede henüz tartışma bulunmuyor.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Flat Sidebar Column */}
        <aside className="lg:col-span-4 space-y-8" aria-label="Yan Panel">
          
          {/* Action button */}
          <Link 
            href="/discussions/new" 
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            <Plus size={14} /> Yeni Konu Başlat
          </Link>

          {/* Quick Balthazard Form */}
          <section className="p-4 rounded-lg bg-[#111B2E] border border-[#1E293B] space-y-3" aria-label="Balthazard Hesaplama">
            <div className="border-b border-[#1E293B] pb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading">
                Balthazard Robotu
              </h3>
              <span className="text-[11px] font-mono text-indigo-400">2026</span>
            </div>
            <form onSubmit={calculateMiniBalthazard} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">1. Oran %</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="99" 
                    value={rate1} 
                    onChange={(e) => setRate1(e.target.value)} 
                    placeholder="Örn: 40" 
                    className="w-full bg-[#18243A] border border-[#1E293B] rounded-md px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">2. Oran %</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="99" 
                    value={rate2} 
                    onChange={(e) => setRate2(e.target.value)} 
                    placeholder="Örn: 30" 
                    className="w-full bg-[#18243A] border border-[#1E293B] rounded-md px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 font-mono"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-0.5">
                <input 
                  type="checkbox" 
                  checked={isOver65} 
                  onChange={(e) => setIsOver65(e.target.checked)} 
                  className="rounded border-[#1E293B] bg-[#18243A] text-indigo-600 focus:ring-0"
                />
                <span>65 yaş veya üzeri (+%10)</span>
              </label>

              <button 
                type="submit" 
                className="w-full py-1.5 bg-[#18243A] hover:bg-[#1E293B] border border-[#1E293B] text-slate-100 font-medium text-xs rounded-md transition-colors cursor-pointer"
              >
                Oranı Birleştir
              </button>
            </form>

            {miniBalthazardResult !== null && (
              <div className="pt-2 text-xs">
                <div className="text-slate-300">Nihai Oran: <span className="font-mono text-indigo-400 font-semibold text-sm">%{miniBalthazardResult}</span></div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {miniBalthazardResult >= 90 ? 'Şartsız ÖTV muafiyeti standardı.' : miniBalthazardResult >= 40 ? 'Vergi indirimi ve engelli kimlik hakkı.' : 'Genel sağlık raporu oranı.'}
                </div>
              </div>
            )}
          </section>

          {/* User Profile / Auth State */}
          <section className="p-4 rounded-lg bg-[#111B2E] border border-[#1E293B] space-y-3" aria-label="Profil Bilgisi">
            <div className="border-b border-[#1E293B] pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading">
                Profil
              </h3>
            </div>
            {user ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <UserAvatar 
                    src={profile?.avatar_url}
                    username={profile?.username}
                    name={profile?.full_name}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-slate-100 truncate">{profile?.full_name || profile?.username}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Seviye {profile?.level || 1} · {profile?.xp || 0} XP</div>
                  </div>
                </div>
                <Link 
                  href="/profile" 
                  className="block text-xs text-indigo-400 hover:text-indigo-300 transition-colors pt-1"
                >
                  Profilimi Yönet →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-300">
                <p>Sorularınızı sormak ve tartışmalara katılmak için giriş yapın.</p>
                <Link 
                  href="/login" 
                  className="inline-block text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Giriş Yap veya Kayıt Ol →
                </Link>
              </div>
            )}
          </section>

          {/* Online Members */}
          <section className="p-4 rounded-lg bg-[#111B2E] border border-[#1E293B] space-y-3" aria-label="Çevrimiçi Üyeler">
            <div className="border-b border-[#1E293B] pb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading">
                Çevrimiçi
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">
                {stats?.onlineCount !== undefined ? stats.onlineCount : onlineMembers.length} Aktif
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              {onlineMembers.length > 0 ? (
                onlineMembers.slice(0, 6).map(member => (
                  <div key={member.id} className="flex items-center justify-between text-slate-300 hover:text-white">
                    <span className="truncate">@{member.username}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{member.role}</span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-400 italic">Şu anda çevrimiçi üye bulunmuyor</div>
              )}
            </div>
          </section>

          {/* Quick Legal Help / AI Assistant */}
          <section className="p-4 rounded-lg bg-[#111B2E] border border-[#1E293B] space-y-3" aria-label="Hukuk Asistanı">
            <div className="border-b border-[#1E293B] pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading">
                Mevzuat Asistanı
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ÖTV istisnası veya rapor itirazları hakkında soru sorabilirsiniz.
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
              {aiAnswers.map((ans, idx) => (
                <div key={idx} className={cn("text-xs leading-relaxed", ans.sender === 'user' ? "text-slate-200 font-medium" : "text-slate-300")}>
                  {ans.sender === 'user' ? 'Siz: ' : 'Asistan: '} {ans.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleAskAi} className="flex gap-2 pt-1">
              <input 
                type="text" 
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Örn: Sol bacak ÖTV şartı..."
                className="flex-1 bg-[#18243A] border border-[#1E293B] rounded-md px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400"
              />
              <button 
                type="submit" 
                disabled={aiLoading}
                className="px-2.5 py-1.5 bg-[#18243A] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 hover:text-white rounded-md text-xs cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
