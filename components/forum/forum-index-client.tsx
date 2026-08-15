'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, ChevronRight, MessageSquare, Plus, Sparkles, 
  Scale, CreditCard, PiggyBank, Award, FileText, HeartPulse, Activity, Eye, 
  Volume2, MapPin, GraduationCap, Calendar, AlertTriangle, FolderTree, Pin,
  TrendingUp, CheckCircle2,
  Send, Loader2, Stethoscope, BookOpen, Briefcase, Cpu, Code, Smile, 
  Shield, Settings, Megaphone, Car, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Topic, Category } from '@/types/database';
import { cn } from '@/lib/utils';
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
    topContributors: any[];
    trendingTags: any[];
  };
}

export function ForumIndexClient({ initialTopics, initialCategories, stats }: ForumIndexClientProps) {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'solved' | 'popular' | 'pinned'>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({});
  
  // Interactive AI Copilot State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswers, setAiAnswers] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Merhaba! Ben EngelsizForum Asistanıyım. Erişilebilirlik, engelli hakları, ÖTV muafiyeti veya sağlık raporları hakkında ne öğrenmek istersiniz?' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const [onlineMembers, setOnlineMembers] = useState<{ id: string; username: string; name: string; avatar: string; isOnline: boolean; role: string; }[]>([]);

  useEffect(() => {
    if (stats?.activeMembers && Array.isArray(stats.activeMembers)) {
      const formatted = stats.activeMembers
        .filter((m: any) => m && typeof m === 'object' && m.id)
        .map((m: any) => ({
          id: m.id,
          username: m.username,
          name: m.full_name || m.username,
          avatar: m.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.username}`,
          isOnline: true,
          role: m.role || 'user'
        }));
      setOnlineMembers(formatted);
    }
  }, [stats]);

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const getSubforumIcon = (iconName?: string | null) => {
    switch (iconName?.toLowerCase()) {
      case 'stethoscope': return <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'bookopen':
      case 'book-open': return <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'briefcase': return <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'cpu': return <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'code': return <Code className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'smile': return <Smile className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'shield': return <Shield className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'settings': return <Settings className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'megaphone': return <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'car': return <Car className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'scale': return <Scale className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'creditcard':
      case 'credit-card': return <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'piggybank':
      case 'piggy-bank': return <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'award': return <Award className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'filetext':
      case 'file-text': return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'heartpulse':
      case 'heart-pulse': return <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'activity': return <Activity className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'eye': return <Eye className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'volume2':
      case 'volume-2': return <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'mappin':
      case 'map-pin': return <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'graduationcap':
      case 'graduation-cap': return <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'calendar': return <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'alerttriangle':
      case 'alert-triangle': return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <FolderTree className="w-4 h-4 sm:w-5 sm:h-5" />;
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
        id: "sec-1",
        name: "Haklar, Mevzuat ve İstihdam",
        description: "Engelli hakları, yasal süreçler, SGK, ÖTV muafiyeti ve istihdam rehberleri.",
        icon: "Scale",
        slugs: ['sosyal-haklar', 'engelli-haklari', 'sgk', 'otv', 'istihdam']
      },
      {
        id: "sec-2",
        name: "Sağlık Kurulu Raporları ve Medikal",
        description: "Sağlık kurulu oranları, Balthazard formülü, medikal cihaz ve protez süreçleri.",
        icon: "HeartPulse",
        slugs: ['saglik', 'araclar', 'egitim']
      },
      {
        id: "sec-3",
        name: "Erişilebilirlik ve Yardımcı Teknolojiler",
        description: "Ekran okuyucular, dijital erişilebilirlik araçları ve yapay zeka rehberleri.",
        icon: "Eye",
        slugs: ['teknoloji', 'yazilim', 'yapay-zeka']
      },
      {
        id: "sec-4",
        name: "Sosyal Yaşam, EKPSS ve Duyurular",
        description: "Günlük sohbetler, spor, sanat, EKPSS sınav hazırlığı ve resmi duyurular.",
        icon: "GraduationCap",
        slugs: ['gunluk-yasam', 'ekpss', 'kamu-duyurulari']
      }
    ];

    return sections.map(sec => {
      const categoriesInSec = initialCategories.filter(cat => sec.slugs.includes(cat.slug || ''));
      if (sec.id === "sec-4") {
        const allSecSlugs = sections.flatMap(s => s.slugs);
        const leftoverCats = initialCategories.filter(cat => !allSecSlugs.includes(cat.slug || ''));
        categoriesInSec.push(...leftoverCats);
      }
      const subforums = categoriesInSec.map(cat => {
        const topicsInCat = initialTopics.filter(t => t.category_id === cat.id || t.category?.slug === cat.slug);
        const topicsCount = topicsInCat.length;
        const repliesCount = topicsInCat.reduce((sum, t) => sum + (t.comments_count || 0), 0);
        let lastPost = { title: "Henüz başlık açılmadı", author: "forum", date: "" };
        if (topicsInCat.length > 0) {
          const latestTopic = [...topicsInCat].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          lastPost = {
            title: latestTopic.title,
            author: latestTopic.author?.username || latestTopic.author?.full_name || "Kullanıcı",
            date: formatDate(latestTopic.created_at)
          };
        }
        return { id: cat.id, name: cat.name, slug: cat.slug, desc: cat.description || `${cat.name} yardımlaşma konusu.`, icon: cat.icon || "FolderTree", topics: topicsCount, replies: repliesCount, lastPost };
      });
      return { id: sec.id, name: sec.name, description: sec.description, icon: sec.icon, subforums };
    }).filter(sec => sec.subforums.length > 0);
  };

  const forumSections = getDynamicForumSections();
  const filteredTopics = initialTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || topic.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    switch (activeTab) {
      case 'solved': return topic.is_solved === true;
      case 'pinned': return topic.is_pinned === true;
      case 'popular': return (topic.likes_count || 0) >= 15 || (topic.comments_count || 0) >= 8;
      default: return true;
    }
  });

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsg,
          history: history,
        }),
      });
      
      const data = await response.json();
      if (response.ok && data.text) {
        setAiAnswers(prev => [...prev, { sender: 'ai', text: data.text }]);
      } else {
        setAiAnswers(prev => [...prev, { sender: 'ai', text: data.error || "Şu anda yanıt alamıyorum. Lütfen daha sonra tekrar deneyin." }]);
      }
    } catch (error) {
      console.error("AI Copilot request failed:", error);
      setAiAnswers(prev => [...prev, { sender: 'ai', text: "Bağlantı hatası oluştu. Lütfen tekrar deneyin." }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full min-w-0" role="main">
      {/* Hero Header */}
      <section className="bg-slate-900 border-b border-slate-800 py-8 sm:py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-950/80 border border-sky-800 text-sky-400 text-[10px] sm:text-xs font-bold tracking-wide">
                <Sparkles size={13} className="shrink-0 text-sky-400" />
                <span>ENGELSİZ BİLGİ &amp; DAYANIŞMA PLATFORMU</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {profile ? (
                  <>Hoş Geldiniz, <span className="text-sky-400">{profile.full_name || profile.username}</span></>
                ) : (
                  <>Bariyersiz Bilgi, <span className="text-sky-400">Eşit Topluluk</span></>
                )}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                Engelli hakları, ÖTV muafiyeti, sağlık kurulu raporları, emeklilik hesaplamaları ve sosyal dayanışma için Türkiye&apos;nin tam erişilebilir forumu.
              </p>
              <div className="relative max-w-xl w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" size={18} />
                <input 
                  type="text" 
                  placeholder="Başlıklar, mevzuat ve konularda ara..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-11 text-xs sm:text-sm rounded-lg border border-slate-700 bg-slate-800/90 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Stats Counter Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 sm:gap-3">
              {[
                { label: 'TOPLAM BAŞLIK', val: stats?.totalTopics !== undefined ? stats.totalTopics.toString() : '0', sub: `+${stats?.todayTopics || 0} Bugün`, accent: 'sky' },
                { label: 'TOPLAM CEVAP', val: stats?.totalComments !== undefined ? stats.totalComments.toString() : '0', sub: `+${stats?.todayComments || 0} Bugün`, accent: 'slate' },
                { label: 'TOPLAM ÜYE', val: stats?.totalMembers !== undefined ? stats.totalMembers.toString() : '0', sub: stats?.newestMember ? `@${stats.newestMember}` : 'Aktif', accent: 'slate' },
                { label: 'ÇEVRİMİÇİ ÜYE', val: stats?.activeMembers ? stats.activeMembers.length.toString() : '0', sub: 'Canlı topluluk', accent: 'emerald', live: true }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 sm:p-4 transition-all hover:border-slate-600 relative overflow-hidden min-w-0">
                  {stat.live && (
                    <div className="absolute top-2.5 right-2.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 truncate">
                    {stat.label}
                  </div>
                  <div className={cn("text-xl sm:text-2xl font-black font-mono", stat.accent === 'sky' ? 'text-sky-400' : stat.accent === 'emerald' ? 'text-emerald-400' : 'text-white')}>
                    {stat.val}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-1 truncate">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-12 min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start min-w-0">
          
          {/* Main Forum Column */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Quick Action Tools Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <Link 
                href="/hesaplama"
                className="p-3 sm:p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500/40 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-all flex items-center gap-2.5 group min-w-0"
              >
                <div className="h-8 w-8 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Scale size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                    Balthazard Hesapla
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Rapor oranı formülü</div>
                </div>
              </Link>

              <Link 
                href="/hesaplama"
                className="p-3 sm:p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-2.5 group min-w-0"
              >
                <div className="h-8 w-8 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Car size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    ÖTV 2026 Limiti
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Muafiyetli araç rehberi</div>
                </div>
              </Link>

              <Link 
                href="/communities"
                className="col-span-2 sm:col-span-1 p-3 sm:p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all flex items-center gap-2.5 group min-w-0"
              >
                <div className="h-8 w-8 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    Tanı Toplulukları
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Özel ilgi grupları</div>
                </div>
              </Link>
            </div>

            {/* Forum Directory Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <FolderTree className="text-sky-600 dark:text-sky-400 w-4 h-4" /> 
                  <span>Forum Kategorileri</span>
                </h2>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {forumSections.length} Ana Kategori
                </span>
              </div>

              {forumSections.map((section) => {
                const isCollapsed = collapsedCategories[section.id];
                return (
                  <div 
                    key={section.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs"
                  >
                    {/* Category Header */}
                    <div 
                      onClick={() => toggleCategory(section.id)}
                      className="bg-slate-50 dark:bg-slate-800/60 px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/80 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                          {getSubforumIcon(section.icon)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">{section.name}</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">{section.description}</p>
                        </div>
                      </div>
                      <button 
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-transform"
                        aria-label={isCollapsed ? "Kategoriyi genişlet" : "Kategoriyi daralt"}
                      >
                        <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", !isCollapsed && "rotate-90")} />
                      </button>
                    </div>

                    {/* Subforum Row List */}
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/70"
                        >
                          {section.subforums.map((subforum) => (
                            <div 
                              key={subforum.id} 
                              className="p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                            >
                              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                                  {getSubforumIcon(subforum.icon)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <Link 
                                      href={`/discussions?kategori=${subforum.slug}`} 
                                      className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate"
                                    >
                                      {subforum.name}
                                    </Link>
                                    <Link 
                                      href={`/discussions/new?kategori=${subforum.slug}`} 
                                      className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline shrink-0"
                                      title="Konu aç"
                                    >
                                      + Konu Aç
                                    </Link>
                                  </div>
                                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal line-clamp-1">{subforum.desc}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 sm:gap-6 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800/60 pt-2 md:pt-0 pl-9 md:pl-0">
                                <div className="flex gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                                  <span><strong className="text-slate-800 dark:text-slate-200">{subforum.topics}</strong> k</span>
                                  <span><strong className="text-slate-800 dark:text-slate-200">{subforum.replies}</strong> c</span>
                                </div>
                                <div className="text-right text-[11px] min-w-0 max-w-[160px] sm:max-w-[200px]">
                                  <Link 
                                    href={`/discussions`} 
                                    className="font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate block text-xs" 
                                    title={subforum.lastPost.title}
                                  >
                                    {subforum.lastPost.title}
                                  </Link>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    @{subforum.lastPost.author} {subforum.lastPost.date && `• ${subforum.lastPost.date}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Discussion Feed */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="text-sky-600 dark:text-sky-400 w-4 h-4" /> 
                    <span>Son Tartışmalar</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Toplulukta en son güncellenen konular ve soru-cevaplar.</p>
                </div>
                <Link 
                  href="/discussions/new" 
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 px-3.5 py-2 text-xs font-bold text-white dark:text-slate-950 shadow-xs transition-all whitespace-nowrap self-start sm:self-auto"
                >
                  <Plus size={14} /> Yeni Konu Başlat
                </Link>
              </div>

              {/* Tabs */}
              <div className="flex border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-lg w-full sm:w-fit overflow-x-auto no-scrollbar gap-1">
                {[
                  { id: 'all', label: 'Tümü' }, 
                  { id: 'pinned', label: 'Sabitlenenler' }, 
                  { id: 'solved', label: 'Çözülenler' }, 
                  { id: 'popular', label: 'Popüler' }
                ].map((tab) => (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap shrink-0",
                      activeTab === tab.id 
                        ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs border border-slate-200 dark:border-slate-700" 
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Topics List */}
              <div className="space-y-2.5">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic) => (
                    <article 
                      key={topic.id}
                      className={cn(
                        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 hover:border-sky-400/50 dark:hover:border-sky-600/50 transition-all rounded-lg group",
                        topic.is_pinned && "border-sky-200 dark:border-sky-900/60 bg-sky-50/20 dark:bg-sky-950/10"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            {topic.is_pinned && (
                              <span className="inline-flex items-center gap-1 bg-sky-600 text-white px-2 py-0.5 rounded text-[9px]">
                                <Pin size={9} className="fill-current" /> SABİT
                              </span>
                            )}
                            {topic.is_solved && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[9px]">
                                <CheckCircle2 size={10} /> ÇÖZÜLDÜ
                              </span>
                            )}
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px]">
                              {topic.category?.name || 'GENEL'}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors tracking-tight line-clamp-2">
                            <Link href={`/discussions/${topic.id}`}>{topic.title}</Link>
                          </h3>
                        </div>
                        <div className="h-11 w-11 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 font-mono">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                            {(topic.comments as any)?.[0]?.count || topic.comments_count || 0}
                          </span>
                          <span className="text-[8px] font-semibold text-slate-400 uppercase">Cevap</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {topic.content}
                      </p>

                      <div className="flex items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar 
                            src={topic.author?.avatar_url} 
                            username={topic.author?.username} 
                            name={topic.author?.full_name}
                            size="sm"
                            isOnline={true}
                          />
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs truncate">
                            {topic.author?.full_name || topic.author?.username || 'Kullanıcı'}
                          </span>
                          <UserRoleBadge role={topic.author?.role || 'user'} size="xs" />
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-medium shrink-0">
                          <span className="hidden sm:inline text-rose-500 font-semibold">
                            ♥ {topic.likes_count || 0}
                          </span>
                          <time className="font-mono text-slate-400">
                            {formatDate(topic.created_at)}
                          </time>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                    <MessageSquare size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Henüz Tartışma Bulunamadı</h3>
                    <p className="text-xs text-slate-500">İlk konuyu siz başlatarak toplulukla etkileşime geçebilirsiniz.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4 min-w-0">
            {/* User Profile Summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Award className="text-sky-600 dark:text-sky-400 w-4 h-4" /> Profil Durumu
              </h3>
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar 
                      src={profile?.avatar_url}
                      username={profile?.username}
                      name={profile?.full_name}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {profile?.full_name || profile?.username || user.email}
                      </div>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                        Seviye {profile?.level || 1} • {profile?.xp || 0} XP
                      </div>
                    </div>
                  </div>
                  <Link 
                    href="/profile" 
                    className="w-full h-9 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center"
                  >
                    Profilimi Yönet
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Soru sormak, deneyim paylaşmak ve topluluk araçlarını kullanmak için giriş yapın.
                  </p>
                  <Link 
                    href="/login" 
                    className="inline-flex items-center justify-center w-full h-9 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs font-bold rounded-lg shadow-xs transition-all"
                  >
                    Giriş Yap / Kayıt Ol
                  </Link>
                </div>
              )}
            </div>

            {/* Online Members */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="text-sky-600 dark:text-sky-400 w-4 h-4" /> Çevrimiçi Üyeler
                </h3>
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineMembers.length} Canlı
                </span>
              </div>
              {onlineMembers.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                  {onlineMembers.map(member => (
                    <Link 
                      href={`/profile`} 
                      key={member.id} 
                      className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <UserAvatar 
                        src={member.avatar} 
                        username={member.username} 
                        name={member.name}
                        size="sm"
                        isOnline={true}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400">
                          @{member.username}
                        </div>
                      </div>
                      <UserRoleBadge role={member.role} size="xs" showLabel={false} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  Şu an çevrim içi üye yok
                </div>
              )}
            </div>

            {/* Trending Tags */}
            {stats?.trendingTags && stats.trendingTags.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Megaphone className="text-sky-600 dark:text-sky-400 w-4 h-4" /> Popüler Etiketler
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {stats.trendingTags.map((tag) => (
                    <Link 
                      key={tag.slug} 
                      href={`/discussions?etiket=${tag.slug}`}
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* AI Copilot Assistant Box */}
            <div className="bg-slate-900 text-white rounded-lg p-4 shadow-sm border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Asistan Copilot
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Yapay Zeka Destekli</span>
              </div>
              <div className="h-44 bg-slate-950/80 rounded-lg p-3 overflow-y-auto space-y-2.5 text-xs font-medium border border-slate-800">
                {aiAnswers.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "p-2.5 rounded-lg max-w-[90%] leading-relaxed text-xs",
                      msg.sender === 'user' 
                        ? "bg-sky-600 text-white ml-auto" 
                        : "bg-slate-800 text-slate-200 border border-slate-700"
                    )}
                  >
                    {msg.text}
                  </div>
                ))}
                {aiLoading && (
                  <div className="bg-slate-800 text-slate-300 p-2.5 rounded-lg flex items-center gap-2">
                    <Loader2 className="animate-spin" size={13} /> Analiz ediliyor...
                  </div>
                )}
              </div>
              <form onSubmit={handleAskAi} className="flex gap-1.5">
                <input 
                  type="text" 
                  placeholder="Mevzuat veya soru sorun..." 
                  value={aiQuestion} 
                  onChange={(e) => setAiQuestion(e.target.value)} 
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium" 
                  disabled={aiLoading} 
                />
                <button 
                  type="submit" 
                  className="h-8 w-8 bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center justify-center shadow-xs transition-colors shrink-0 disabled:opacity-50"
                  disabled={aiLoading || !aiQuestion.trim()}
                  aria-label="Soruyu gönder"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

