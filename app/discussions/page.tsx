'use client';

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { 
  Search, Plus, Sparkles, MessageSquare, Mic, Loader2, ArrowLeft, X, Send,
  Calendar, User, HeartPulse, GraduationCap, Car, Stethoscope, 
  BookOpen, Briefcase, Cpu, Code, Smile, Shield, Settings, Megaphone, FolderTree,
  Scale, Type, Eye, CheckCircle2, Pin, AlertCircle, Volume2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { DiscussionCard } from '@/components/forum/discussion-card';
import { Topic } from '@/types/database';
import { UserAvatar } from '@/components/ui/user-avatar';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { expandSearchQuery, matchQueryWithText } from '@/lib/search-dictionary';

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'HeartPulse': return <HeartPulse className="size-4 shrink-0 text-rose-500" />;
    case 'GraduationCap': return <GraduationCap className="size-4 shrink-0 text-blue-500" />;
    case 'Car': return <Car className="size-4 shrink-0 text-amber-500" />;
    case 'Stethoscope': return <Stethoscope className="size-4 shrink-0 text-teal-500" />;
    case 'BookOpen': return <BookOpen className="size-4 shrink-0 text-indigo-500" />;
    case 'Briefcase': return <Briefcase className="size-4 shrink-0 text-emerald-500" />;
    case 'Cpu': return <Cpu className="size-4 shrink-0 text-purple-500" />;
    case 'Code': return <Code className="size-4 shrink-0 text-sky-500" />;
    case 'Sparkles': return <Sparkles className="size-4 shrink-0 text-violet-500" />;
    case 'Smile': return <Smile className="size-4 shrink-0 text-pink-500" />;
    case 'Scale': return <Scale className="size-4 shrink-0 text-cyan-500" />;
    case 'Shield': return <Shield className="size-4 shrink-0 text-orange-500" />;
    case 'Settings': return <Settings className="size-4 shrink-0 text-slate-500" />;
    case 'Megaphone': return <Megaphone className="size-4 shrink-0 text-red-500" />;
    default: return <MessageSquare className="size-4 shrink-0 text-muted-foreground" />;
  }
};

const ACCESSIBILITY_TIPS = [
  "Ekran okuyucularda başlıklar arasında hızlıca gezinmek için 'H' harfine basabilirsiniz.",
  "Harf aralığını açmak ve satır yüksekliğini artırmak disleksi okumasını %15'e kadar hızlandırır.",
  "Yapay zeka (AI) özetleri sayesinde çok uzun tartışmaları 5 saniyede analiz edebilirsiniz.",
  "Sesli arama yapmak için arama çubuğundaki mikrofon simgesine tıklayıp konuşmanız yeterlidir.",
  "Sitede tamamen klavye ile gezinmek için Tab ve Shift+Tab tuşlarını kullanabilirsiniz."
];

function DiscussionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('kategori') || '');
  const [activeTab, setActiveTab] = useState<'all' | 'solved' | 'popular' | 'pinned'>('all');
  
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [isListening, setIsListening] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<{ id: string; text: string } | null>(null);

  // Accessibility State Preferences
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [dyslexicMode, setDyslexicMode] = useState(false);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  // Screen reader announcer ref
  const announcerRef = useRef<HTMLDivElement>(null);

  // Cycle tips
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % ACCESSIBILITY_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const announceToScreenReader = (msg: string) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = msg;
    }
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', category_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('topics')
        .insert([{
          title: newTopic.title,
          content: newTopic.content,
          category_id: newTopic.category_id,
          author_id: user.id
        }])
        .select();

      if (error) throw error;
      
      // Increase User XP (+20 for new topic) and check Level
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp, level')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          const newXp = (profile.xp || 0) + 20;
          const newLevel = Math.floor(newXp / 200) + 1;

          await supabase
            .from('profiles')
            .update({ 
              xp: newXp,
              level: newLevel
            })
            .eq('id', user.id);
        }
      }

      setIsCreateModalOpen(false);
      setNewTopic({ title: '', content: '', category_id: '' });
      fetchInitialData(); // Refresh list
    } catch (err) {
      console.error('Error creating topic:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchInitialData = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);

    if (!isSupabaseConfigured) {
      setTopics([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      let loadedCats = categories;
      // Fetch Categories (only once)
      if (!isLoadMore) {
        const { data: cats, error: catsErr } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (catsErr) {
          console.error('Categories fetch error:', catsErr);
          toast.error('Kategoriler yüklenemedi.');
        } else if (cats) {
          setCategories(cats);
          loadedCats = cats;
        }
      }

      const currentPage = isLoadMore ? page + 1 : 1;
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      // Fetch Topics with Pagination and Filters
      let query = supabase
        .from('topics')
        .select(`
          id, title, content, author_id, category_id, is_pinned, is_locked, is_solved, views_count, created_at, updated_at, slug,
          author:profiles(*),
          category:categories(name, slug, id)
        `);

      if (searchQuery) {
        const terms = expandSearchQuery(searchQuery).slice(0, 5).filter(t => t.length > 1);
        if (terms.length > 0) {
          // Format OR conditions correctly for PostgREST
          const orConditions = terms
            .map(term => `title.ilike.%${term}%,content.ilike.%${term}%`)
            .join(',');
          query = query.or(orConditions);
        }
      }

      if (selectedCategory) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(selectedCategory);
        if (isUUID) {
          query = query.eq('category_id', selectedCategory);
        } else {
          let matchedCat = loadedCats.find((c: any) => c.slug === selectedCategory);
          if (!matchedCat) {
            const { data: catData } = await supabase
              .from('categories')
              .select('id')
              .eq('slug', selectedCategory)
              .maybeSingle();
            if (catData) matchedCat = catData;
          }
          if (matchedCat) {
            query = query.eq('category_id', matchedCat.id);
          }
        }
      }

      const { data: topicsData, error: topicsErr } = await query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (topicsErr) {
        console.error('Supabase Query Error:', topicsErr);
        throw topicsErr;
      }

      if (topicsData) {
        const validTopics = (topicsData as any[]).filter(t => t.author);
        if (isLoadMore) {
          setTopics(prev => [...prev, ...validTopics]);
          setPage(currentPage);
        } else {
          setTopics(validTopics);
          setPage(1);
        }
        setHasMore(topicsData.length === pageSize);
      } else {
        if (!isLoadMore) setTopics([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching discussions data:', err);
      if (!isLoadMore) {
        setTopics([]);
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, selectedCategory, isSupabaseConfigured]);

  const fetchStats = useCallback(async () => {
    try {
      const { data: topData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, role, level, xp')
        .order('xp', { ascending: false })
        .limit(5);
      if (topData) setTopContributors(topData);

      const { data: tagData } = await supabase
        .from('tags')
        .select('name, slug')
        .limit(8);
      if (tagData) setPopularTags(tagData);
    } catch (err) {
      console.error('Error fetching forum stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    // Reset page when filters change
    setPage(1);
    fetchInitialData(false);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (page > 1) {
      // fetchInitialData(true) is handled by the "Load More" button
    }
  }, [page]);

  // Sync category state with search query param
  useEffect(() => {
    const catParam = searchParams?.get('kategori');
    if (catParam !== undefined && catParam !== null) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  // Handle voice-to-text input search
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Tarayıcınız ses tanımayı desteklemiyor.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    
    recognition.onstart = () => {
      setIsListening(true);
      announceToScreenReader("Sesle arama dinleniyor, lütfen konuşun.");
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      announceToScreenReader(`Sesli arama yapıldı: ${transcript}`);
      toast.success(`Aranan ses: "${transcript}"`);
    };
    recognition.start();
  };

  // AI Summarization Handler
  const handleSummarize = async (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) {
      toast.error('AI Özeti için gerekli veriler eksik.');
      return;
    }

    setSummarizingId(id);
    announceToScreenReader("Yapay zeka özeti hazırlanıyor, lütfen bekleyin.");
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
        announceToScreenReader("Yapay zeka özeti başarıyla oluşturuldu.");
      }
    } catch (error: any) {
      console.error('Summarization failed:', error);
      toast.error('Özet oluşturulurken bir hata oluştu: ' + error.message);
      announceToScreenReader("Özet oluşturulurken bir hata meydana geldi.");
    } finally {
      setSummarizingId(null);
    }
  };

  // Filtering Logic
  const expandedTermsUsed = searchQuery ? expandSearchQuery(searchQuery) : [];

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = !searchQuery ? true : (
      matchQueryWithText(topic.title, expandedTermsUsed) ||
      matchQueryWithText(topic.content, expandedTermsUsed)
    );
    
    const matchesCategory = 
      !selectedCategory || 
      topic.category_id === selectedCategory || 
      topic.category?.slug === selectedCategory ||
      topic.category?.name === selectedCategory;

    if (!matchesSearch || !matchesCategory) return false;

    switch (activeTab) {
      case 'solved': return topic.is_solved === true;
      case 'pinned': return topic.is_pinned === true;
      case 'popular': return (topic.likes_count || 0) >= 15 || (topic.comments_count || 0) >= 8;
      default: return true;
    }
  });

  // Announce filtering result to screen readers
  useEffect(() => {
    if (!loading) {
      announceToScreenReader(`Filtreleme güncellendi. Toplam ${filteredTopics.length} adet tartışma gösteriliyor.`);
    }
  }, [filteredTopics.length, loading, selectedCategory, activeTab]);

  return (
    <DashboardLayout>
      {/* Off-screen Accessibility Announcer */}
      <div 
        ref={announcerRef} 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-10">
          {/* Bento Stats Headers */}
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
              <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                <span className="text-xl" role="img" aria-label="Popüler">🔥</span> POPÜLER KONULAR
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Yardımcı teknolojiler, erişilebilir oyun dünyası ve engelli hakları bu hafta en çok konuşulan başlıklar arasında.
              </p>
            </div>
            <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
              <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                <span className="text-xl" role="img" aria-label="Robot">🤖</span> AI DESTEĞİ
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Yapay zeka özetleme ve sesli asistan aracı ile saniyeler içinde bilgiye ulaşın. Engelsiz bilgi platformu yanınızda.
              </p>
            </div>
            <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
              <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                <span className="text-xl" role="img" aria-label="El Sıkışma">🤝</span> ÜYE DAYANIŞMASI
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Her gün ortalama 50+ yeni çözüm önerisi paylaşılıyor. Kendi deneyiminizi paylaşarak topluluğa rehberlik edin.
              </p>
            </div>
          </div>

          {/* Large Header Banner with glass effect */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12 shadow-md">
            <div className="absolute top-0 right-0 size-96 bg-primary/[0.04] rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <Sparkles size={12} /> BİLGİ PAYLAŞTIKÇA ÇOĞALIR
                </div>
                <h1 id="feed-heading" className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                  Topluluk Konuşmaları
                </h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Yardımlaşmak, deneyim ve çözümleri paylaşmak, engelsiz teknolojileri keşfetmek için buradayız.
                </p>
              </div>
              <button 
                onClick={() => user ? setIsCreateModalOpen(true) : window.location.href = '/login'}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label="Yeni tartışma başlığı oluştur"
              >
                <Plus size={20} /> YENİ BAŞLIK AÇ
              </button>
            </div>
          </div>
        </header>

        {/* Create Topic Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-2xl rounded-3xl shadow-[0_0_50px_-12px_rgba(79,70,229,0.25)] border border-border overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-border flex justify-between items-center bg-muted/30">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold tracking-tight">YENİ TARTIŞMA OLUŞTUR</h2>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Topluluğa Katkıda Bulunun</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateTopic} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">TARTIŞMA BAŞLIĞI</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Etkileyici ve açıklayıcı bir başlık yazın..." 
                    className="w-full h-14 px-5 rounded-2xl border border-border bg-background text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={newTopic.title}
                    onChange={e => setNewTopic({...newTopic, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">KATEGORİ SEÇİMİ</label>
                    <select 
                      required
                      className="w-full h-14 px-5 rounded-2xl border border-border bg-background text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer appearance-none"
                      value={newTopic.category_id}
                      onChange={e => setNewTopic({...newTopic, category_id: e.target.value})}
                    >
                      <option value="">LÜTFEN BİR KATEGORİ SEÇİN</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">ERİŞİLEBİLİRLİK ETİKETİ</label>
                    <div className="h-14 px-5 rounded-2xl border border-border bg-muted/20 flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Sparkles size={14} className="mr-2 text-primary" /> OTOMATİK ANALİZ AKTİF
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">DETAYLI AÇIKLAMA</label>
                  <textarea 
                    required
                    rows={6}
                    placeholder="Sorunuzu, önerinizi veya paylaşmak istediğiniz deneyimi buraya yazın..." 
                    className="w-full p-5 rounded-2xl border border-border bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    value={newTopic.content}
                    onChange={e => setNewTopic({...newTopic, content: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 h-14 rounded-2xl bg-muted text-xs font-bold hover:bg-muted/80 transition-all uppercase tracking-widest"
                  >
                    VAZGEÇ
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] h-14 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-indigo-200 uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    ŞİMDİ YAYINLA
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories Rail Filter Section */}
        <section aria-labelledby="categories-heading" className="mb-8">
          <h2 id="categories-heading" className="sr-only">Kategoriler Filtresi</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setSelectedCategory('')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                !selectedCategory
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <FolderTree size={14} className="shrink-0" /> TÜMÜ
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
              return (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => setSelectedCategory(cat.slug || cat.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                  title={cat.description}
                >
                  {getCategoryIcon(cat.icon)}
                  {cat.name.toUpperCase()}
                </button>
              );
            })}
          </div>
        </section>

        {/* Search, Tabs and Feed main layouts - 2 Column Premium Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Feed and Filters (Span 8) */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Search and Quick Filters card */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Voice & Keyboard accessible Search input */}
                <div className="relative w-full flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={20} />
                  <input 
                    type="text" 
                    placeholder="Tartışmalarda kelime veya başlık ara..." 
                    aria-label="Tartışmalarda ara"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-border bg-background pl-12 pr-12 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button 
                    type="button"
                    onClick={startVoiceSearch}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                      isListening 
                        ? 'text-red-500 bg-red-500/10 animate-pulse ring-2 ring-red-500/30' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    title="Sesli arama yap"
                    aria-label="Mikrofon ile sesli arama"
                  >
                    <Mic size={20} />
                  </button>
                </div>

                {/* Styled select fallback */}
                <div className="w-full md:w-[220px]">
                  <select
                    value={selectedCategory}
                    aria-label="Kategoriye göre filtrele"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-12 bg-background border border-border rounded-2xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">TÜM KATEGORİLER</option>
                    {categories.map(c => (
                      <option key={c.id || c.slug} value={c.slug || c.id}>
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Smart Search Synonyms/Homonyms Expansion indicator */}
              {searchQuery.trim() && expandedTermsUsed.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                  <Sparkles className="size-3.5 shrink-0 text-primary" />
                  <span className="font-bold">Arama Kelimeleri Genişletildi:</span>
                  <span className="font-medium text-muted-foreground">{expandedTermsUsed.join(", ")}</span>
                </div>
              )}

              {/* Status tabs */}
              <div className="flex flex-wrap gap-2 border-t border-border/50 pt-4">
                {[
                  { id: 'all', label: 'TÜM BAŞLIKLAR' },
                  { id: 'solved', label: 'ÇÖZÜME ULAŞANLAR' },
                  { id: 'popular', label: 'POPÜLER KONULAR' },
                  { id: 'pinned', label: 'SABİTLENENLER' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted/30 hover:bg-muted border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Custom Accessibility Wrapper for list scale */}
            <div 
              className={`space-y-6 transition-all duration-200 ${
                textSize === 'large' 
                  ? '[&_p]:text-lg [&_h2]:text-2xl [&_span]:text-sm [&_a]:text-xl' 
                  : textSize === 'xlarge'
                  ? '[&_p]:text-xl [&_h2]:text-3xl [&_span]:text-base [&_a]:text-2xl'
                  : ''
              } ${
                dyslexicMode 
                  ? 'tracking-wider !leading-loose [word-spacing:0.18em]' 
                  : ''
              }`}
            >
              {loading ? (
                <div className="grid gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-4 shadow-sm animate-pulse">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24 bg-primary/10" />
                        <Skeleton className="h-4 w-16 bg-primary/5" />
                      </div>
                      <Skeleton className="h-7 w-3/4 bg-primary/10" />
                      <Skeleton className="h-4 w-full bg-primary/5" />
                      <Skeleton className="h-4 w-5/6 bg-primary/5" />
                      <div className="flex items-center gap-3 pt-2">
                        <Skeleton className="h-6 w-6 rounded-full bg-primary/5" />
                        <Skeleton className="h-4 w-32 bg-primary/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTopics.length > 0 ? (
                <div className="grid gap-6">
                  {filteredTopics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.4) }}
                      className="group"
                    >
                      <DiscussionCard 
                        topic={topic}
                        onSummarize={handleSummarize}
                        isLoading={summarizingId === topic.id}
                      />
                      
                      <AnimatePresence>
                        {summaryResult && summaryResult.id === topic.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="mt-3 p-6 md:p-8 bg-primary/[0.03] border border-primary/20 rounded-3xl relative overflow-hidden ring-1 ring-primary/20 shadow-inner"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                <Sparkles size={16} /> AI SESLİ ÖZET
                              </div>
                              <button 
                                onClick={() => {
                                  if ('speechSynthesis' in window) {
                                    const synth = window.speechSynthesis;
                                    synth.cancel();
                                    const utterance = new SpeechSynthesisUtterance(summaryResult.text);
                                    utterance.lang = 'tr-TR';
                                    synth.speak(utterance);
                                    toast.success("Özet sesli okunuyor.");
                                  } else {
                                    toast.error("Tarayıcınız ses sentezleyiciyi desteklemiyor.");
                                  }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
                                aria-label="Özeti sesli oku"
                              >
                                <Volume2 size={14} /> Dinle
                              </button>
                            </div>
                            <blockquote className="text-base md:text-lg leading-relaxed font-semibold text-foreground italic border-l-4 border-primary/40 pl-4 py-1">
                              &ldquo;{summaryResult.text}&rdquo;
                            </blockquote>
                            <div className="mt-6 flex gap-4">
                              <button 
                                onClick={() => {
                                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                                  setSummaryResult(null);
                                }}
                                className="text-xs font-black text-muted-foreground hover:text-primary transition-colors underline uppercase tracking-widest"
                              >
                                Özeti Kapat
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-card rounded-3xl border-2 border-dashed border-border px-8">
                  <MessageSquare size={80} className="mx-auto text-muted-foreground/10 mb-6" />
                  <h3 className="text-xl md:text-2xl font-bold mb-3 tracking-tight text-foreground">Arama Sonucu Temiz</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed mb-6">
                    Seçili filtrelerde veya arama kriterinde hiçbir tartışma bulunmamaktadır. Yeni bir konu başlatarak tartışmayı canlandırın.
                  </p>
                  <Link 
                    href="/discussions/new"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-sm"
                  >
                    İlk Konuyu Sen Başlat
                  </Link>
                </div>
              )}

              {hasMore && filteredTopics.length > 0 && !searchQuery && (
                <div className="pt-8 flex justify-center">
                  <button
                    onClick={() => fetchInitialData(true)}
                    disabled={loading}
                    className="vibe-button-primary h-14 px-10 text-xs flex items-center gap-3"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    DAHA FAZLA YÜKLE
                  </button>
                </div>
              )}
            </div>

          </main>

          {/* Right Column: Premium Sidebar Widget Panels (Span 4) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Top Contributors Widget */}
            {topContributors.length > 0 && (
              <section className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
                  <Sparkles className="text-primary size-5 shrink-0" />
                  <h2 className="text-sm font-black tracking-wider text-foreground uppercase">
                    Aktif Katılımcılar
                  </h2>
                </div>
                <div className="space-y-4">
                  {topContributors.map((contributor, i) => (
                    <Link key={contributor.id} href={`/profile/${contributor.id}`} className="flex items-center gap-3 group">
                      <UserAvatar 
                        src={contributor.avatar_url}
                        username={contributor.username}
                        size="sm"
                        badge={
                          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-primary text-[8px] font-black text-white flex items-center justify-center border border-card">
                            {i + 1}
                          </div>
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                          @{contributor.username}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">LVL {contributor.level}</span>
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest">{contributor.xp} XP</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Tags Widget */}
            {popularTags.length > 0 && (
              <section className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
                  <Megaphone className="text-primary size-5 shrink-0" />
                  <h2 className="text-sm font-black tracking-wider text-foreground uppercase">
                    Popüler Etiketler
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Link 
                      key={tag.slug} 
                      href={`/discussions?etiket=${tag.slug}`}
                      className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border hover:border-primary hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Sidebar Widget 1: Premium Accessibility Settings Panel */}
            <section 
              aria-labelledby="accessibility-widget-heading"
              className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 size-40 bg-primary/[0.01] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <Settings className="text-primary size-5 shrink-0" />
                <h2 id="accessibility-widget-heading" className="text-sm font-black tracking-wider text-foreground uppercase">
                  Erişilebilirlik Paneli
                </h2>
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                Bu paneldeki ayarları özelleştirerek okuma konforunuzu artırabilir ve arayüzü engelsiz kılabilirsiniz.
              </p>

              <div className="space-y-5">
                {/* Text Size Scale */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
                    <span>YAZI BOYUTU</span>
                    <span className="text-primary font-black uppercase text-[10px]">
                      {textSize === 'normal' ? 'Normal' : textSize === 'large' ? 'Büyük (+15%)' : 'Çok Büyük (+30%)'}
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'normal', label: 'A' },
                      { id: 'large', label: 'A+' },
                      { id: 'xlarge', label: 'A++' }
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        onClick={() => {
                          setTextSize(sz.id as any);
                          toast.success(`Yazı boyutu ${sz.label} olarak ayarlandı.`);
                          announceToScreenReader(`Yazı boyutu değiştirildi: ${sz.label}`);
                        }}
                        className={`py-2 rounded-xl border text-xs font-black transition-all ${
                          textSize === sz.id
                            ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        aria-label={`Yazı boyutunu ${sz.id === 'normal' ? 'Normal' : sz.id === 'large' ? 'Büyük' : 'Çok Büyük'} yap`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dyslexic Helper Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-muted/30 border border-border/50 rounded-2xl">
                  <div className="space-y-1 pr-4">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Type size={14} className="text-primary" />
                      Disleksi Dostu Düzen
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-snug">
                      Harf aralığını açar ve satır okuma genişliğini düzenler.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const mode = !dyslexicMode;
                      setDyslexicMode(mode);
                      toast.success(mode ? 'Disleksi modu aktif.' : 'Disleksi modu pasif.');
                      announceToScreenReader(mode ? 'Disleksi dostu okuma modu etkinleştirildi.' : 'Disleksi okuma modu kapatıldı.');
                    }}
                    role="switch"
                    aria-checked={dyslexicMode}
                    className={`size-12 rounded-xl border shrink-0 transition-all flex items-center justify-center font-bold text-xs ${
                      dyslexicMode 
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' 
                        : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                    }`}
                    aria-label="Disleksi okuma düzeni anahtarı"
                  >
                    {dyslexicMode ? 'AÇIK' : 'KAPALI'}
                  </button>
                </div>
              </div>
            </section>

            {/* Sidebar Widget 2: Weekly Accessibility Tip Box */}
            <section 
              aria-labelledby="tips-widget-heading"
              className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 size-24 bg-primary/[0.01] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <AlertCircle className="text-primary size-5 shrink-0" />
                <h2 id="tips-widget-heading" className="text-sm font-black tracking-wider text-foreground uppercase">
                  Engelsiz Yaşam İpucu
                </h2>
              </div>

              <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-4 min-h-[110px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={activeTipIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-muted-foreground font-semibold leading-relaxed"
                  >
                    &ldquo;{ACCESSIBILITY_TIPS[activeTipIndex]}&rdquo;
                  </motion.p>
                </AnimatePresence>
                
                <div className="flex justify-end gap-1 mt-4">
                  {ACCESSIBILITY_TIPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveTipIndex(i);
                        announceToScreenReader(`İpucu ${i + 1} gösteriliyor.`);
                      }}
                      className={`size-2 rounded-full transition-all ${
                        i === activeTipIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30 hover:bg-primary/50'
                      }`}
                      aria-label={`İpucu ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Sidebar Widget 3: Forum Guidelines & Verification */}
            <section 
              aria-labelledby="guidelines-widget-heading"
              className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <CheckCircle2 className="text-primary size-5 shrink-0" />
                <h2 id="guidelines-widget-heading" className="text-sm font-black tracking-wider text-foreground uppercase">
                  Güvenli Topluluk
                </h2>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Saygılı ve kapsayıcı dil kullanımı önceliğimizdir.",
                  "Konulara verdiğiniz doğru çözümler uzmanlık puanınızı (XP) artırır.",
                  "Hassas veya kişisel verilerinizi başlıkta açık paylaşmayınız."
                ].map((rule, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs text-muted-foreground leading-relaxed">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </section>

          </aside>
          
        </div>

      </div>
    </DashboardLayout>
  );
}

export default function DiscussionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <DiscussionsContent />
    </Suspense>
  );
}
