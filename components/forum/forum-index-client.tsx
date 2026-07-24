'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, ChevronRight, MessageSquare, Handshake, Plus, Sparkles, 
  Scale, CreditCard, PiggyBank, Award, FileText, HeartPulse, Activity, Eye, 
  Volume2, MapPin, GraduationCap, Calendar, AlertTriangle, FolderTree, Pin,
  TrendingUp, Clock, BarChart2, CheckCircle2, User, HelpCircle, ArrowRight,
  Send, Loader2, Play, Stethoscope, BookOpen, Briefcase, Cpu, Code, Smile, 
  Shield, Settings, Megaphone, Car
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/providers/auth-provider';
import { Topic, Category } from '@/types/database';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
    { sender: 'ai', text: 'Merhaba! Ben EngelsizForum Yapay Zeka Asistanıyım. Erişilebilirlik, engelli hakları ya da yardımcı teknolojiler hakkında ne öğrenmek istersiniz?' }
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
      case 'stethoscope': return <Stethoscope className="w-5 h-5" />;
      case 'bookopen':
      case 'book-open': return <BookOpen className="w-5 h-5" />;
      case 'briefcase': return <Briefcase className="w-5 h-5" />;
      case 'cpu': return <Cpu className="w-5 h-5" />;
      case 'code': return <Code className="w-5 h-5" />;
      case 'smile': return <Smile className="w-5 h-5" />;
      case 'shield': return <Shield className="w-5 h-5" />;
      case 'settings': return <Settings className="w-5 h-5" />;
      case 'megaphone': return <Megaphone className="w-5 h-5" />;
      case 'car': return <Car className="w-5 h-5" />;
      case 'scale': return <Scale className="w-5 h-5" />;
      case 'creditcard':
      case 'credit-card': return <CreditCard className="w-5 h-5" />;
      case 'piggybank':
      case 'piggy-bank': return <PiggyBank className="w-5 h-5" />;
      case 'award': return <Award className="w-5 h-5" />;
      case 'filetext':
      case 'file-text': return <FileText className="w-5 h-5" />;
      case 'heartpulse':
      case 'heart-pulse': return <HeartPulse className="w-5 h-5" />;
      case 'activity': return <Activity className="w-5 h-5" />;
      case 'eye': return <Eye className="w-5 h-5" />;
      case 'volume2':
      case 'volume-2': return <Volume2 className="w-5 h-5" />;
      case 'mappin':
      case 'map-pin': return <MapPin className="w-5 h-5" />;
      case 'graduationcap':
      case 'graduation-cap': return <GraduationCap className="w-5 h-5" />;
      case 'calendar': return <Calendar className="w-5 h-5" />;
      case 'alerttriangle':
      case 'alert-triangle': return <AlertTriangle className="w-5 h-5" />;
      default: return <FolderTree className="w-5 h-5" />;
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
        description: "Engelli hakları, yasal süreçler, SGK, ÖTV muafiyeti ve kariyer olanakları.",
        icon: "Scale",
        slugs: ['sosyal-haklar', 'engelli-haklari', 'sgk', 'otv', 'istihdam']
      },
      {
        id: "sec-2",
        name: "Sağlık, Medikal ve Eğitim",
        description: "Sağlık raporları, medikal cihazlar, protezler ve özel eğitim süreçleri.",
        icon: "HeartPulse",
        slugs: ['saglik', 'araclar', 'egitim']
      },
      {
        id: "sec-3",
        name: "Erişilebilirlik ve Teknoloji",
        description: "Ekran okuyucular, yardımcı cihazlar, yazılım ve yapay zeka entegrasyonları.",
        icon: "Eye",
        slugs: ['teknoloji', 'yazilim', 'yapay-zeka']
      },
      {
        id: "sec-4",
        name: "Sosyal Yaşam ve Duyurular",
        description: "Günlük sohbetler, hobiler, EKPSS sınavı ve kamu duyuruları.",
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
    
    // Add user message to UI state immediately
    setAiAnswers(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiQuestion('');
    setAiLoading(true);
    
    try {
      // Build conversational history for context
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
      setAiAnswers(prev => [...prev, { sender: 'ai', text: "Bağlantı hatası oluştu. Lütfen internetinizi kontrol edip tekrar deneyin." }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full" role="main">
      <section className="bg-gradient-to-br from-primary/[0.04] via-primary/[0.01] to-transparent py-12 md:py-20 border-b border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            <div className="lg:col-span-7 space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest"
              >
                <Sparkles size={14} className="animate-pulse" /> %100 ERİŞİLEBİLİR DİJİTAL EKOSİSTEM
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase text-foreground">
                {profile ? (
                  <>Hoş Geldin, <br /><span className="text-primary">{profile.full_name || profile.username}</span>!</>
                ) : (
                  <>Bariyersiz Bilgi, <br /><span className="text-primary">Eşit Topluluk</span></>
                )}
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                EngelsizForum, internette bariyersiz bilgi paylaşımı arayan herkes için tasarlanmış Türkiye&apos;nin ilk tam erişilebilir forumudur.
              </p>
              <div className="relative max-w-xl w-full group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={22} />
                  <input 
                    type="text" 
                    placeholder="TARTIŞMALARDA VE KONULARDA ARA..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="vibe-input vibe-input-pl-16 pr-4 h-16 text-sm uppercase rounded-2xl border border-border bg-card w-full shadow-lg focus:border-primary/80 transition-all font-bold tracking-wider placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
            >
              {[
                { label: 'TOPLAM BAŞLIK', val: stats?.totalTopics !== undefined ? stats.totalTopics.toString() : '0', sub: `+${stats?.todayTopics || 0} Bugün`, color: 'primary' },
                { label: 'TOPLAM CEVAP', val: stats?.totalComments !== undefined ? stats.totalComments.toString() : '0', sub: `+${stats?.todayComments || 0} Bugün`, color: 'foreground' },
                { label: 'TOPLAM ÜYE', val: stats?.totalMembers !== undefined ? stats.totalMembers.toString() : '0', sub: stats?.newestMember ? `Son üye: @${stats.newestMember}` : 'Son üye bulunamadı', color: 'foreground' },
                { label: 'ÇEVRİMİÇİ ÜYE', val: stats?.activeMembers ? stats.activeMembers.length.toString() : '0', sub: 'Lively / Canlı', color: 'primary', live: true }
              ].map((stat, i) => (
                <div key={i} className={cn(
                  "bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-sm transition-all hover:shadow-md hover:border-primary/20 relative overflow-hidden group",
                  stat.color === 'primary' && "bg-primary/[0.01] border-primary/10"
                )}>
                  {stat.live && (
                    <div className="absolute top-3 right-3 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </div>
                  )}
                  <div className={cn("text-[10px] font-bold uppercase tracking-widest mb-3", stat.color === 'primary' ? 'text-primary' : 'text-muted-foreground')}>
                    {stat.label}
                  </div>
                  <div className={cn("text-3xl font-black font-mono", stat.color === 'primary' ? 'text-primary' : 'text-foreground')}>
                    {stat.val}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-2 opacity-70">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-16 min-w-0">
            <div className="space-y-12">
              <div className="flex items-center justify-between border-b border-border/80 pb-5">
                <h2 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-widest flex items-center gap-4">
                  <FolderTree className="text-primary w-6 h-6" /> FORUM DİZİNİ
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest">4 ANA BÖLÜM</span>
                </div>
              </div>
              {forumSections.map((section, idx) => {
                const isCollapsed = collapsedCategories[section.id];
                return (
                  <motion.div 
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all group"
                  >
                    <div 
                      onClick={() => toggleCategory(section.id)}
                      className="bg-muted/30 px-8 py-6 border-b border-border/50 flex items-center justify-between cursor-pointer select-none hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                          {getSubforumIcon(section.icon)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-base sm:text-lg tracking-tight uppercase truncate text-foreground">{section.name}</h3>
                          <p className="text-xs text-muted-foreground font-semibold hidden sm:inline-block truncate max-w-lg opacity-80">{section.description}</p>
                        </div>
                      </div>
                      <button className="p-2 rounded-xl hover:bg-background text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all">
                        <ChevronRight className={cn("w-6 h-6 transition-transform duration-300", !isCollapsed && "rotate-90")} />
                      </button>
                    </div>
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden divide-y divide-border/50"
                        >
                          {section.subforums.map((subforum) => (
                            <div key={subforum.id} className="p-5 sm:p-9 flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8 hover:bg-primary/[0.01] transition-colors relative">
                              <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                  {getSubforumIcon(subforum.icon)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <Link href={`/discussions?kategori=${subforum.slug}`} className="font-black text-lg sm:text-xl text-foreground hover:text-primary transition-colors block leading-tight uppercase tracking-tight">
                                      {subforum.name}
                                    </Link>
                                    <Link 
                                      href={`/discussions/new?kategori=${subforum.slug}`} 
                                      className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-xl border border-primary/10 transition-all shrink-0"
                                      title={`${subforum.name} kategorisinde yeni bir konu aç`}
                                    >
                                      <Plus size={10} className="stroke-[3]" /> Yeni Konu
                                    </Link>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed font-semibold max-w-xl opacity-90">{subforum.desc}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-8 sm:gap-12 shrink-0 xl:w-[400px] justify-between border-t border-border/40 pt-6 xl:border-t-0 xl:pt-0">
                                <div className="flex gap-6 sm:gap-8 font-mono text-[11px] font-bold text-muted-foreground">
                                  <div className="text-center">
                                    <span className="block text-base font-black text-foreground">{subforum.topics}</span>
                                    <span className="opacity-60">KONU</span>
                                  </div>
                                  <div className="text-center">
                                    <span className="block text-base font-black text-foreground">{subforum.replies}</span>
                                    <span className="opacity-60">CEVAP</span>
                                  </div>
                                </div>
                                <div className="text-right text-[11px] min-w-0 max-w-[200px] sm:max-w-[240px]">
                                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 opacity-70">SON PAYLAŞIM</div>
                                  <Link href={`/discussions`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block truncate hover:underline" title={subforum.lastPost.title}>
                                    {subforum.lastPost.title}
                                  </Link>
                                  <div className="text-muted-foreground font-bold flex items-center justify-end gap-2 mt-1.5 uppercase tracking-tighter">
                                    <span className="text-foreground/80 underline decoration-primary/30 decoration-2 underline-offset-4">@{subforum.lastPost.author}</span>
                                    <span>•</span>
                                    <time className="whitespace-nowrap font-mono text-[10px]">{subforum.lastPost.date}</time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            <div className="space-y-10 pt-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/80 pb-6">
                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-widest flex items-center gap-4">
                    <TrendingUp className="text-primary w-6 h-6" /> TARTIŞMA AKIŞI
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium">Topluluğumuzda öne çıkan en yeni başlıklar ve popüler konular.</p>
                </div>
                <Link href="/discussions/new" className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-7 py-3.5 text-xs font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 active:scale-95 uppercase tracking-widest">
                  <Plus size={18} /> YENİ KONU BAŞLAT
                </Link>
              </div>
              <div className="flex border border-border bg-muted/30 p-2 rounded-2xl w-fit flex-wrap gap-1.5 shadow-sm">
                {[{ id: 'all', label: 'TÜMÜ' }, { id: 'pinned', label: 'SABİTLENENLER' }, { id: 'solved', label: 'ÇÖZÜLENLER' }, { id: 'popular', label: 'POPÜLER' }].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn("px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest", activeTab === tab.id ? "bg-card text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="space-y-8">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic, i) => (
                    <motion.article 
                      key={topic.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className={cn("bg-card border border-border p-5 sm:p-10 hover:border-primary/40 hover:shadow-xl transition-all relative rounded-3xl sm:rounded-[2rem] group", topic.is_pinned && "border-primary/30 bg-primary/[0.01] ring-1 ring-primary/5 shadow-md")}
                    >
                      <div className="flex items-start justify-between gap-6 mb-6">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest mb-4">
                            {topic.is_pinned && <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-[9px] shadow-sm"><Pin size={10} className="fill-current" /> SABİT KONU</span>}
                            {topic.is_solved && <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-3 py-1.5 rounded-full text-[9px]"><CheckCircle2 size={11} /> ÇÖZÜLDÜ</span>}
                            <span className="bg-muted text-muted-foreground border border-border px-3 py-1.5 rounded-full">{topic.category?.name || 'GENEL'}</span>
                          </div>
                          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-2 uppercase leading-tight">
                            <Link href={`/discussions/${topic.id}`} className="after:absolute after:inset-0 after:content-[''] after:z-0">{topic.title}</Link>
                          </h3>
                        </div>
                        <div className="h-16 w-16 rounded-[1.25rem] bg-muted/40 border border-border flex flex-col items-center justify-center shrink-0 self-start font-mono shadow-sm group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                          <span className="text-lg font-black text-foreground group-hover:text-primary">{(topic.comments as any)?.[0]?.count || topic.comments_count || 0}</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none mt-0.5">CEVAP</span>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium line-clamp-2 mb-8 pointer-events-none opacity-90">{topic.content}</p>
                      <div className="flex items-center justify-between gap-6 text-[11px] text-muted-foreground pointer-events-none border-t border-border/50 pt-6">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border border-border relative shadow-sm group-hover:border-primary/30 transition-all">
                            <img 
                              src={topic.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${topic.author?.username || 'user'}`} 
                              alt="" 
                              className="object-cover h-full w-full" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-foreground text-xs uppercase tracking-tight">{topic.author?.full_name || topic.author?.username || 'Kullanıcı'}</span>
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-70">
                              {topic.author?.role === 'admin' ? 'YÖNETİCİ' : topic.author?.role === 'moderator' ? 'MODERATÖR' : 'TOPLULUK ÜYESİ'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-xs font-mono font-bold">
                          <span className="hidden sm:inline-flex items-center gap-1.5"><HeartPulse size={14} className="text-rose-500" /> {topic.likes_count || 0} BEĞENİ</span>
                          <time className="font-black uppercase tracking-widest bg-muted px-3 py-1 rounded-lg border border-border/50">{formatDate(topic.created_at)}</time>
                        </div>
                      </div>
                    </motion.article>
                  ))
                ) : (
                  <div className="text-center py-28 bg-card rounded-[2.5rem] border-2 border-dashed border-border p-12 shadow-inner">
                    <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-6" />
                    <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-widest">Tartışma Bulunamadı</h3>
                    <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">Yeni bir tartışma başlatarak topluluğu canlandırabilirsiniz.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-12">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-card border border-border rounded-3xl sm:rounded-[2rem] p-6 sm:p-10 shadow-sm relative overflow-hidden group">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-3"><Award className="text-primary w-5 h-5" /> PROFİL PANELİ</h3>
              {user ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] border-2 border-primary/20 overflow-hidden bg-muted relative shadow-md">
                      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="object-cover h-full w-full" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center text-primary bg-primary/10"><User size={28} /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-lg text-foreground truncate uppercase tracking-tight">{profile?.full_name || profile?.username || user.email}</div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mt-1">SEVİYE {profile?.level || 1}</div>
                    </div>
                  </div>
                  <Link href="/profile" className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all text-center flex items-center justify-center shadow-lg">PROFİL AYARLARI</Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground leading-relaxed font-semibold opacity-90">Aramıza katılarak engelsiz bir dijital dünya inşasına destek olun!</p>
                  <Link href="/auth" className="inline-flex items-center justify-center w-full h-14 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition hover:bg-primary/90">KATIL / GİRİŞ YAP</Link>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-3xl sm:rounded-[2rem] p-6 sm:p-10 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3"><Users className="text-primary w-5 h-5" /> AKTİF ÜYELER</h3>
                <span className="flex items-center gap-2 text-[10px] font-mono font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{onlineMembers.length} AKTİF</span>
              </div>
              {onlineMembers.length > 0 ? (
                <div className="grid grid-cols-4 gap-5">
                  {onlineMembers.map(member => (
                    <Link href={`/profile/${member.id}`} key={member.id} className="relative flex flex-col items-center group outline-none">
                      <div className="w-12 h-12 rounded-2xl border border-border overflow-hidden bg-muted relative cursor-pointer hover:border-primary/50 transition-all">
                        <img src={member.avatar} alt={member.name} className="object-cover h-full w-full" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[8px] font-black text-muted-foreground truncate w-full text-center mt-2 uppercase tracking-tighter hover:text-primary transition-colors">@{member.username}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Henüz diğer üye bulunmuyor
                </div>
              )}
            </motion.div>

            {stats?.topContributors && stats.topContributors.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-3xl sm:rounded-[2rem] p-6 sm:p-10 shadow-sm">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-3"><Sparkles className="text-primary w-5 h-5" /> EN AKTİF ÜYELER</h3>
                <div className="space-y-6">
                  {stats.topContributors.map((contributor, i) => (
                    <Link key={contributor.id} href={`/profile/${contributor.id}`} className="flex items-center gap-4 group">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl border border-border overflow-hidden bg-muted">
                          <img 
                            src={contributor.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${contributor.username}`} 
                            alt="" 
                            className="object-cover h-full w-full" 
                          />
                        </div>
                        <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-primary text-[10px] font-black text-white flex items-center justify-center shadow-lg border-2 border-card">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-sm text-foreground truncate group-hover:text-primary transition-colors">@{contributor.username}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">SEVİYE {contributor.level}</span>
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest">{contributor.xp} XP</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {stats?.trendingTags && stats.trendingTags.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-3xl sm:rounded-[2rem] p-6 sm:p-10 shadow-sm">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-3"><Megaphone className="text-primary w-5 h-5" /> POPÜLER ETİKETLER</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.trendingTags.map((tag) => (
                    <Link 
                      key={tag.slug} 
                      href={`/discussions?etiket=${tag.slug}`}
                      className="px-4 py-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all text-[10px] font-black uppercase tracking-widest border border-border"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">AI Copilot</h3>
                <div className="h-56 bg-white/10 rounded-3xl p-5 overflow-y-auto space-y-4 scrollbar-hide text-xs font-bold border border-white/10 backdrop-blur-sm">
                  {aiAnswers.map((msg, i) => (
                    <div key={i} className={cn("p-4 rounded-2xl max-w-[90%] leading-relaxed", msg.sender === 'user' ? "bg-white/20 text-white ml-auto" : "bg-white text-primary")}>
                      {msg.text}
                    </div>
                  ))}
                  {aiLoading && <div className="bg-white/10 text-white p-4 rounded-2xl flex items-center gap-3"><Loader2 className="animate-spin" size={14} /> Analiz...</div>}
                </div>
                <form onSubmit={handleAskAi} className="flex gap-3">
                  <input type="text" placeholder="Soru sorun..." value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} className="flex-1 bg-white/20 border border-white/30 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-white/40 outline-none" disabled={aiLoading} />
                  <button type="submit" className="w-14 h-14 bg-white text-primary rounded-2xl flex items-center justify-center shadow-lg"><Send size={20} /></button>
                </form>
              </div>
            </motion.div>
          </aside>
        </div>
      </section>
    </div>
  );
}
