'use client';

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { 
  Search, Plus, Sparkles, MessageSquare, Mic, Loader2, X, Send,
  Calendar, User, HeartPulse, GraduationCap, Car, Stethoscope, 
  BookOpen, Briefcase, Cpu, Code, Smile, Shield, Settings, Megaphone, FolderTree,
  Scale, Type, Eye, CheckCircle2, Pin, AlertCircle, Volume2, ChevronRight, ArrowUpRight, Flame
} from 'lucide-react';
import Link from 'next/link';
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
  const cls = "size-3.5 shrink-0 text-sky-400";
  switch (iconName?.toLowerCase()) {
    case 'heartpulse':
    case 'heart-pulse': return <HeartPulse className="size-3.5 shrink-0 text-rose-400" />;
    case 'graduationcap':
    case 'graduation-cap': return <GraduationCap className="size-3.5 shrink-0 text-blue-400" />;
    case 'car': return <Car className="size-3.5 shrink-0 text-amber-400" />;
    case 'stethoscope': return <Stethoscope className="size-3.5 shrink-0 text-teal-400" />;
    case 'bookopen':
    case 'book-open': return <BookOpen className="size-3.5 shrink-0 text-indigo-400" />;
    case 'briefcase': return <Briefcase className="size-3.5 shrink-0 text-emerald-400" />;
    case 'cpu': return <Cpu className="size-3.5 shrink-0 text-purple-400" />;
    case 'code': return <Code className={cls} />;
    case 'sparkles': return <Sparkles className="size-3.5 shrink-0 text-sky-400" />;
    case 'smile': return <Smile className="size-3.5 shrink-0 text-pink-400" />;
    case 'scale': return <Scale className="size-3.5 shrink-0 text-cyan-400" />;
    case 'shield': return <Shield className="size-3.5 shrink-0 text-orange-400" />;
    case 'settings': return <Settings className="size-3.5 shrink-0 text-slate-400" />;
    case 'megaphone': return <Megaphone className="size-3.5 shrink-0 text-rose-400" />;
    default: return <MessageSquare className={cls} />;
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

  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [dyslexicMode, setDyslexicMode] = useState(false);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  const announcerRef = useRef<HTMLDivElement>(null);

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
      const slugify = (text: string) => {
        const trMap: Record<string, string> = {
          'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i',
          'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
        };
        let str = text;
        for (const key in trMap) {
          str = str.replace(new RegExp(key, 'g'), trMap[key]);
        }
        return str.toLowerCase()
          .replace(/[^-a-zA-Z0-9\s]+/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim() || `konu-${Date.now()}`;
      };

      const topicSlug = slugify(newTopic.title);

      const { data, error } = await supabase
        .from('topics')
        .insert([{
          title: newTopic.title,
          content: newTopic.content,
          category_id: newTopic.category_id,
          author_id: user.id,
          slug: topicSlug
        }])
        .select();

      if (error) throw error;
      
      toast.success('Konunuz başarıyla oluşturuldu!');

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
      fetchInitialData();
    } catch (err: any) {
      console.error('Error creating topic:', err);
      toast.error('Konu oluşturulurken hata: ' + (err.message || 'Bilinmeyen hata'));
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
  }, [page, pageSize, searchQuery, selectedCategory, isSupabaseConfigured, categories]);

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
    setPage(1);
    fetchInitialData(false);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const catParam = searchParams?.get('kategori');
    if (catParam !== undefined && catParam !== null) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

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

  useEffect(() => {
    if (!loading) {
      announceToScreenReader(`Filtreleme güncellendi. Toplam ${filteredTopics.length} adet tartışma gösteriliyor.`);
    }
  }, [filteredTopics.length, loading, selectedCategory, activeTab]);

  return (
    <DashboardLayout>
      <div 
        ref={announcerRef} 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Erişim yolu" className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-sky-400 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={14} className="text-slate-600" />
          <span className="text-slate-200 font-medium">Tartışmalar &amp; Mevzuat Rehberi</span>
        </nav>

        {/* Header Hero Banner */}
        <header className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                <Sparkles size={13} /> Engelliler.biz Kültürü &amp; Dayanışma Platformu
              </div>
              <h1 id="feed-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
                Topluluk Tartışmaları ve Danışma
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                ÖTV muafiyeti, SGK erken emeklilik, sağlık kurulu raporları ve engelsiz yaşam tecrübelerini akranlarınızla ve uzmanlarla paylaşın.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
              <button 
                onClick={() => user ? setIsCreateModalOpen(true) : router.push('/login')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition whitespace-nowrap cursor-pointer"
                aria-label="Yeni tartışma konusu aç"
              >
                <Plus size={16} /> Yeni Konu Başlat
              </button>
            </div>
          </div>

          {/* Quick Highlight Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/[0.06]">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Car size={13} className="text-sky-400" /> ÖTV Muafiyeti 2026
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-100 mt-1">2.247.100 ₺</div>
              <div className="text-[10px] text-sky-400 font-medium">Güncel Üst Limit</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Scale size={13} className="text-emerald-400" /> SGK Erken Emeklilik
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-100 mt-1">Yaş Şartsız</div>
              <div className="text-[10px] text-emerald-400 font-medium">Prim &amp; Süreye Bağlı</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <HeartPulse size={13} className="text-rose-400" /> Sağlık Raporu
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-100 mt-1">Balthazard</div>
              <div className="text-[10px] text-rose-400 font-medium">Formül Rehberi</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Sparkles size={13} className="text-purple-400" /> AI Destekli
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-100 mt-1">Sesli Özet</div>
              <div className="text-[10px] text-purple-400 font-medium">5 Saniyede Analiz</div>
            </div>
          </div>
        </header>

        {/* Create Topic Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-topic-heading"
              onKeyDown={(e) => { if (e.key === 'Escape') setIsCreateModalOpen(false); }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[#111726] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/[0.1] overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="px-6 py-4 border-b border-white/[0.08] flex justify-between items-center bg-slate-900/60">
                  <div className="space-y-0.5">
                    <h2 id="new-topic-heading" className="text-base font-bold text-slate-100">Yeni Tartışma Oluştur</h2>
                    <p className="text-xs text-slate-400">Topluluğa danışın veya deneyiminizi paylaşın</p>
                  </div>
                  <button 
                    onClick={() => setIsCreateModalOpen(false)} 
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    aria-label="Kapat"
                  >
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleCreateTopic} className="p-6 space-y-4 overflow-y-auto">
                  <div className="space-y-1">
                    <label htmlFor="topic-title-input" className="text-xs font-semibold text-slate-300">Tartışma Başlığı</label>
                    <input 
                      id="topic-title-input"
                      required
                      type="text" 
                      placeholder="Örn: [ÖTV 2026] Otomatik vites tertibatlı araç alım süreci..." 
                      className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/80 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
                      value={newTopic.title}
                      onChange={e => setNewTopic({...newTopic, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="topic-category-select" className="text-xs font-semibold text-slate-300">Kategori Seçimi</label>
                      <select 
                        id="topic-category-select"
                        required
                        className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/80 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none cursor-pointer"
                        value={newTopic.category_id}
                        onChange={e => setNewTopic({...newTopic, category_id: e.target.value})}
                      >
                        <option value="">Lütfen Kategori Seçin</option>
                        {categories.filter(c => c.is_main || !c.parent_id).map(mainCat => {
                          const subCats = categories.filter(sub => sub.parent_id === mainCat.id);
                          if (subCats.length > 0) {
                            return (
                              <optgroup key={mainCat.id} label={mainCat.name} className="font-bold text-sky-400">
                                {subCats.map(sub => (
                                  <option key={sub.id} value={sub.id} className="text-slate-200">-- {sub.name}</option>
                                ))}
                              </optgroup>
                            );
                          }
                          return <option key={mainCat.id} value={mainCat.id}>{mainCat.name}</option>;
                        })}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Erişilebilirlik Desteği</label>
                      <div className="p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/80 flex items-center text-xs text-sky-400 font-medium">
                        <Sparkles size={14} className="mr-2 text-sky-400 shrink-0" /> WCAG AA Uyumlu &amp; AI Özet Aktif
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="topic-content-input" className="text-xs font-semibold text-slate-300">Tartışma Detayı ve İçerik</label>
                    <textarea 
                      id="topic-content-input"
                      required
                      rows={6}
                      placeholder="Mevzuat maddesi, sağlık kurulu raporu oranı, hastane süreci veya sorunuzu detaylandırın..." 
                      className="w-full p-3 rounded-xl border border-white/[0.08] bg-slate-900/80 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none resize-none leading-relaxed"
                      value={newTopic.content}
                      onChange={e => setNewTopic({...newTopic, content: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
                    <button 
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Vazgeç
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2 text-xs font-semibold text-white transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Konuyu Yayınla
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Rail Filter Section */}
        <section aria-labelledby="categories-heading" className="bg-[#111726]/80 border border-white/[0.08] p-4 rounded-2xl backdrop-blur-md space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span id="categories-heading" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FolderTree size={14} className="text-sky-400" /> Kategori Filtresi
            </span>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory('')}
                className="text-xs font-semibold text-sky-400 hover:underline cursor-pointer"
              >
                Filtreyi Temizle
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                !selectedCategory
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-slate-900/60 border border-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FolderTree size={13} className="shrink-0" /> TÜM KATEGORİLER
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
              const isMainCat = cat.is_main || !cat.parent_id;
              return (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => setSelectedCategory(cat.slug || cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : isMainCat
                      ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20'
                      : 'bg-slate-900/60 border border-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  title={cat.description}
                >
                  {getCategoryIcon(cat.icon)}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Search, Tabs and Feed main layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Feed and Filters (Span 8) */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Search and Quick Filters card */}
            <div className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-4 sm:p-5 backdrop-blur-md space-y-4">
              
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {/* Voice & Keyboard accessible Search input */}
                <div className="relative w-full flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Tartışmalarda kelime, mevzuat maddesi veya başlık ara..." 
                    aria-label="Tartışmalarda ara"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 rounded-xl border border-white/[0.08] bg-slate-900/80 pl-10 pr-10 text-xs sm:text-sm text-slate-200 outline-none focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-slate-500"
                  />
                  <button 
                    type="button"
                    onClick={startVoiceSearch}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                      isListening 
                        ? 'text-rose-400 bg-rose-500/10 animate-pulse' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                    title="Sesli arama yap"
                    aria-label="Mikrofon ile sesli arama"
                  >
                    <Mic size={16} />
                  </button>
                </div>

                {/* Styled select fallback */}
                <div className="w-full sm:w-[200px]">
                  <select
                    value={selectedCategory}
                    aria-label="Kategoriye göre filtrele"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 bg-slate-900/80 border border-white/[0.08] rounded-xl px-3 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(c => (
                      <option key={c.id || c.slug} value={c.slug || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Smart Search Synonyms indicator */}
              {searchQuery.trim() && expandedTermsUsed.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/20">
                  <Sparkles className="size-3.5 shrink-0 text-sky-400" />
                  <span className="font-bold">Arama Genişletildi:</span>
                  <span className="font-medium text-slate-300">{expandedTermsUsed.join(", ")}</span>
                </div>
              )}

              {/* Status tabs */}
              <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-3">
                {[
                  { id: 'all', label: 'TÜM BAŞLIKLAR' },
                  { id: 'solved', label: 'ÇÖZÜLENLER' },
                  { id: 'popular', label: 'POPÜLER' },
                  { id: 'pinned', label: 'SABİTLENENLER' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Custom Accessibility Wrapper for list scale */}
            <div 
              className={`space-y-4 transition-all duration-200 ${
                textSize === 'large' 
                  ? '[&_p]:text-base [&_h2]:text-xl [&_span]:text-xs [&_a]:text-lg' 
                  : textSize === 'xlarge'
                  ? '[&_p]:text-lg [&_h2]:text-2xl [&_span]:text-sm [&_a]:text-xl'
                  : ''
              } ${
                dyslexicMode 
                  ? 'tracking-wider !leading-loose [word-spacing:0.18em]' 
                  : ''
              }`}
            >
              {loading ? (
                <div className="grid gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24 bg-slate-800" />
                        <Skeleton className="h-4 w-16 bg-slate-850" />
                      </div>
                      <Skeleton className="h-5 w-3/4 bg-slate-800" />
                      <Skeleton className="h-3.5 w-full bg-slate-850" />
                      <div className="flex items-center gap-3 pt-2">
                        <Skeleton className="h-7 w-7 rounded-full bg-slate-800" />
                        <Skeleton className="h-3.5 w-32 bg-slate-850" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTopics.length > 0 ? (
                <div className="grid gap-4">
                  {filteredTopics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.25) }}
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
                            className="mt-3 p-5 bg-[#0e172a] border border-sky-500/30 rounded-2xl relative overflow-hidden backdrop-blur-md shadow-inner"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                                <Sparkles size={14} /> AI SESLİ ÖZETİ
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
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/10 text-sky-400 text-xs font-semibold hover:bg-sky-500 hover:text-white transition-all cursor-pointer border border-sky-500/20"
                                aria-label="Özeti sesli oku"
                              >
                                <Volume2 size={13} /> Dinle
                              </button>
                            </div>
                            <blockquote className="text-xs sm:text-sm leading-relaxed text-slate-200 border-l-2 border-sky-500 pl-3 py-0.5">
                              &ldquo;{summaryResult.text}&rdquo;
                            </blockquote>
                            <div className="mt-3 flex gap-4">
                              <button 
                                onClick={() => {
                                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                                  setSummaryResult(null);
                                }}
                                className="text-xs font-semibold text-slate-400 hover:text-sky-400 transition-colors underline cursor-pointer"
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
                <div className="text-center py-16 bg-[#111726]/60 rounded-2xl border border-dashed border-white/[0.08] px-6">
                  <MessageSquare size={48} className="mx-auto text-slate-600 mb-3" />
                  <h3 className="text-base font-bold mb-1 text-slate-200">Tartışma Bulunamadı</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-4">
                    Seçili arama veya kategori filtrelerine uygun başlık bulunamadı. Yeni bir konu başlatarak ilk soruyu sorabilirsiniz.
                  </p>
                  <button 
                    onClick={() => user ? setIsCreateModalOpen(true) : router.push('/login')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition-all"
                  >
                    <Plus size={14} /> Yeni Konu Başlat
                  </button>
                </div>
              )}

              {hasMore && filteredTopics.length > 0 && !searchQuery && (
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => fetchInitialData(true)}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#111726] border border-white/[0.08] hover:border-sky-500/40 text-slate-200 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Daha Fazla Göster
                  </button>
                </div>
              )}
            </div>

          </main>

          {/* Right Column: Premium Sidebar Widget Panels (Span 4) */}
          <aside className="lg:col-span-4 space-y-4">
            
            {/* Top Contributors Widget */}
            {topContributors.length > 0 && (
              <section className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.06]">
                  <Flame className="text-sky-400 size-4 shrink-0" />
                  <h2 className="text-xs font-bold text-slate-200">
                    Aktif Katılımcılar &amp; Uzmanlar
                  </h2>
                </div>
                <div className="space-y-2.5">
                  {topContributors.map((contributor, i) => (
                    <Link key={contributor.id} href={`/profile/${contributor.id}`} className="flex items-center gap-2.5 group p-1.5 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <UserAvatar 
                        src={contributor.avatar_url}
                        username={contributor.username}
                        size="sm"
                        badge={
                          <div className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-sky-500 text-[8px] font-black text-white flex items-center justify-center border border-[#111726]">
                            {i + 1}
                          </div>
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-sky-400 transition-colors">
                          @{contributor.username}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-400">LVL {contributor.level || 1}</span>
                          <span className="text-[9px] font-bold text-sky-400">{contributor.xp || 0} XP</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Tags Widget */}
            {popularTags.length > 0 && (
              <section className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.06]">
                  <Megaphone className="text-sky-400 size-4 shrink-0" />
                  <h2 className="text-xs font-bold text-slate-200">
                    Popüler Etiketler
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {popularTags.map((tag) => (
                    <Link 
                      key={tag.slug} 
                      href={`/discussions?etiket=${tag.slug}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/[0.04] hover:border-sky-500/30 text-[10px] font-semibold text-slate-300 hover:text-sky-400 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Accessibility Settings Panel */}
            <section 
              aria-labelledby="accessibility-widget-heading"
              className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-md space-y-3.5"
            >
              <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.06]">
                <Settings className="text-sky-400 size-4 shrink-0" />
                <h2 id="accessibility-widget-heading" className="text-xs font-bold text-slate-200">
                  Erişilebilirlik Paneli
                </h2>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Yazı boyutu ve okuma düzenini kişiselleştirerek okuma konforunuzu artırabilirsiniz.
              </p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Yazı Boyutu</span>
                    <span className="text-sky-400 text-[10px] font-bold">
                      {textSize === 'normal' ? 'Normal' : textSize === 'large' ? 'Büyük (+15%)' : 'Çok Büyük (+30%)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
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
                        className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          textSize === sz.id
                            ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                            : 'bg-slate-900/60 border-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                        aria-label={`Yazı boyutunu ${sz.id === 'normal' ? 'Normal' : sz.id === 'large' ? 'Büyük' : 'Çok Büyük'} yap`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dyslexic Helper Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-white/[0.04] rounded-xl">
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Type size={13} className="text-sky-400" />
                      Disleksi Modu
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Harf aralığını ve satır yüksekliğini açar.
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
                    className={`h-8 px-2.5 rounded-lg border shrink-0 transition-all flex items-center justify-center font-bold text-xs cursor-pointer ${
                      dyslexicMode 
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                        : 'bg-slate-800 border-white/[0.06] text-slate-400'
                    }`}
                    aria-label="Disleksi okuma düzeni anahtarı"
                  >
                    {dyslexicMode ? 'AÇIK' : 'KAPALI'}
                  </button>
                </div>
              </div>
            </section>

            {/* Weekly Accessibility Tip Box */}
            <section 
              aria-labelledby="tips-widget-heading"
              className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-md"
            >
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.06]">
                <AlertCircle className="text-sky-400 size-4 shrink-0" />
                <h2 id="tips-widget-heading" className="text-xs font-bold text-slate-200">
                  Engelsiz Yaşam İpucu
                </h2>
              </div>

              <div className="bg-slate-900/60 border border-white/[0.04] rounded-xl p-3.5 min-h-[90px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={activeTipIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-slate-300 font-medium leading-relaxed"
                  >
                    &ldquo;{ACCESSIBILITY_TIPS[activeTipIndex]}&rdquo;
                  </motion.p>
                </AnimatePresence>
                
                <div className="flex justify-end gap-1 mt-3">
                  {ACCESSIBILITY_TIPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveTipIndex(i);
                        announceToScreenReader(`İpucu ${i + 1} gösteriliyor.`);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === activeTipIndex ? 'bg-sky-400 w-4' : 'bg-slate-700 hover:bg-sky-400/50 w-1.5'
                      }`}
                      aria-label={`İpucu ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Forum Guidelines & Verification */}
            <section 
              aria-labelledby="guidelines-widget-heading"
              className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-md"
            >
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.06]">
                <CheckCircle2 className="text-emerald-400 size-4 shrink-0" />
                <h2 id="guidelines-widget-heading" className="text-xs font-bold text-slate-200">
                  Doğrulanmış Bilgi ve Güven
                </h2>
              </div>
              <ul className="space-y-2">
                {[
                  "Saygılı ve kapsayıcı dil kullanımı önceliğimizdir.",
                  "Konulara verdiğiniz doğru çözümler uzmanlık puanınızı (XP) artırır.",
                  "Hassas veya kişisel verilerinizi (T.C. No vb.) başlıklarda paylaşmayınız."
                ].map((rule, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-xs text-slate-400 leading-relaxed">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
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
      <div className="flex items-center justify-center min-h-screen bg-[#090A0F]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    }>
      <DiscussionsContent />
    </Suspense>
  );
}
