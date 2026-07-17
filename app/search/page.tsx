'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Search, Filter, ArrowRight, Loader2, Mic, Sparkles } from 'lucide-react';
import { Topic } from '@/types/database';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SEEDED_CATEGORIES = [
  { id: '1', name: 'SGK', slug: 'sgk', description: 'Sosyal Güvenlik Kurumu ile ilgili tüm konular, emeklilik ve haklar.', icon: 'HeartPulse' },
  { id: '2', name: 'EKPSS', slug: 'ekpss', description: 'Engelli Kamu Personeli Seçme Sınavı hazırlık, duyuru ve sonuçlar.', icon: 'GraduationCap' },
  { id: '3', name: 'ÖTV', slug: 'otv', description: 'Özel Tüketim Vergisi muafiyeti, araç alımı ve mevzuat.', icon: 'Car' },
  { id: '4', name: 'Sağlık', slug: 'saglik', description: 'Sağlık raporları, tedavi süreçleri ve medikal destek.', icon: 'Stethoscope' },
  { id: '5', name: 'Eğitim', slug: 'egitim', description: 'Özel eğitim, kapsayıcı eğitim ve akademik fırsatlar.', icon: 'BookOpen' },
  { id: '6', name: 'İstihdam', slug: 'istihdam', description: 'İş ilanları, engelli istihdamı ve kariyer danışmanlığı.', icon: 'Briefcase' },
  { id: '7', name: 'Teknoloji', slug: 'teknoloji', description: 'Erişilebilir teknolojiler, donanım ve yazılım haberleri.', icon: 'Cpu' },
  { id: '8', name: 'Yazılım', slug: 'yazilim', description: 'Programlama, erişilebilir kodlama ve geliştirme.', icon: 'Code' },
  { id: '9', name: 'Yapay Zeka', slug: 'yapay-zeka', description: 'Yapay zeka araçları ve engelliler için sağladığı kolaylıklar.', icon: 'Sparkles' },
  { id: '10', name: 'Günlük Yaşam', slug: 'gunluk-yasam', description: 'Yaşamdan kesitler, hobi ve sosyal aktiviteler.', icon: 'Smile' },
  { id: '11', name: 'Sosyal Haklar', slug: 'sosyal-haklar', description: 'Tüm yasal haklar, ödenekler ve sosyal yardımlar.', icon: 'Scale' },
  { id: '12', name: 'Engelli Hakları', slug: 'engelli-haklari', description: 'Engelli hakları savunuculuğu ve hukuki süreçler.', icon: 'Shield' },
  { id: '13', name: 'Araçlar', slug: 'araclar', description: 'Engelli araçları, yardımcı ekipmanlar ve rehabilitasyon.', icon: 'Settings' },
  { id: '14', name: 'Kamu Duyuruları', slug: 'kamu-duyurulari', description: 'Resmi gazete ilanları ve bakanlık duyuruları.', icon: 'Megaphone' }
];

const FALLBACK_TOPICS: Topic[] = [
  {
    id: "mock-1",
    category_id: "4",
    author_id: "user-1",
    title: "Baltalimanı Hastanesi Rapor Süreci ve Oranlar",
    content: "Ortopedik engelli arkadaşlar için Baltalimanı Kemik Hastalıkları hastanesinde engelli sağlık kurulu raporu alma aşamalarını ve heyet süreçlerini detaylıca anlattım. Hangi polikliniklerin sıra durumları daha rahat, heyet hangi günlerde toplanıyor ve süreç kaç gün sürüyor?",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    likes_count: 14,
    comments_count: 5,
    views_count: 120,
    is_pinned: true,
    is_locked: false,
    is_solved: true,
    category: { id: "4", name: "Sağlık", slug: "saglik", description: "Sağlık raporları, tedavi süreçleri ve medikal destek.", icon: "Stethoscope", color: null, sort_order: 4, created_at: "" },
    author: { id: "user-1", username: "hakan_ses", avatar_url: null, full_name: "Hakan Sesli", role: "user", level: 1, xp: 0, bio: null, is_verified: false, accessibility_prefs: null, updated_at: "" }
  },
  {
    id: "mock-2",
    category_id: "7",
    author_id: "user-2",
    title: "NVDA 2026.1 Türkçe Konuşma Sentezleyicisi Ayarları",
    content: "Yeni yayınlanan NVDA sürümünde Türkçe dil paketi için en optimize ekran okuyucu ses sentezleyici ayarlarını derledim. Özellikle e-ticaret sitelerinde ve bankacılık uygulamalarında gezinirken okuma hızını artıran kısayollar ve eklentileri paylaşıyorum.",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    likes_count: 24,
    comments_count: 12,
    views_count: 240,
    is_pinned: false,
    is_locked: false,
    is_solved: false,
    category: { id: "7", name: "Teknoloji", slug: "teknoloji", description: "Erişilebilir teknolojiler, donanım ve yazılım haberleri.", icon: "Cpu", color: null, sort_order: 7, created_at: "" },
    author: { id: "user-2", username: "mirac", avatar_url: null, full_name: "Miraç Engin", role: "user", level: 2, xp: 120, bio: null, is_verified: false, accessibility_prefs: null, updated_at: "" }
  },
  {
    id: "mock-3",
    category_id: "2",
    author_id: "user-3",
    title: "2026 EKPSS Tercih Kılavuzu Yayınlandı! Kadrolar",
    content: "ÖSYM tarafından bugün yayımlanan 2026/1 EKPSS tercih kılavuzundaki memur ve hizmetli kadrolarını analiz ettim. Hangi öğrenim düzeyinde ne kadar atama var, branş dağılımları ve puan tahminleri hakkında sorularınızı bu başlık altından yanıtlıyorum.",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    likes_count: 42,
    comments_count: 38,
    views_count: 850,
    is_pinned: false,
    is_locked: false,
    is_solved: true,
    category: { id: "2", name: "EKPSS", slug: "ekpss", description: "Engelli Kamu Personeli Seçme Sınavı hazırlık, duyuru ve sonuçlar.", icon: "GraduationCap", color: null, sort_order: 2, created_at: "" },
    author: { id: "user-3", username: "elif_disleksi", avatar_url: null, full_name: "Elif Demir", role: "user", level: 5, xp: 500, bio: null, is_verified: true, accessibility_prefs: null, updated_at: "" }
  },
  {
    id: "mock-4",
    category_id: "5",
    author_id: "user-4",
    title: "Disleksi Dostu Yazı Tiplerinin Okuma Hızına Etkisi: Bilimsel Araştırma",
    content: "Atkinson Hyperlegible ve OpenDyslexic yazı tiplerinin okuma doğruluğunu %15 oranında artırdığı saptandı. Forumumuzda bu fontları aktif ederek deneyimlerinizi paylaşabilirsiniz.",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    likes_count: 18,
    comments_count: 5,
    views_count: 190,
    is_pinned: false,
    is_locked: false,
    is_solved: false,
    category: { id: "5", name: "Eğitim", slug: "egitim", description: "Özel eğitim, kapsayıcı eğitim ve akademik fırsatlar.", icon: "BookOpen", color: null, sort_order: 5, created_at: "" },
    author: { id: "user-4", username: "aria", avatar_url: null, full_name: "Aria Geliştirici", role: "moderator", level: 10, xp: 1500, bio: null, is_verified: true, accessibility_prefs: null, updated_at: "" }
  },
  {
    id: "mock-5",
    category_id: "3",
    author_id: "user-5",
    title: "ÖTV Muafiyetli Araç Alımında Yeni Limitler ve Mevzuat",
    content: "2026 yılı için belirlenen ÖTV muafiyet üst sınırı ve engelli raporuyla araç alım süreçlerindeki güncel değişiklikler hakkında geniş bir rehber hazırladım.",
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    likes_count: 35,
    comments_count: 16,
    views_count: 940,
    is_pinned: false,
    is_locked: false,
    is_solved: true,
    category: { id: "3", name: "ÖTV", slug: "otv", description: "Özel Tüketim Vergisi muafiyeti, araç alımı ve mevzuat.", icon: "Car", color: null, sort_order: 3, created_at: "" },
    author: { id: "user-5", username: "felix", avatar_url: null, full_name: "Felix Moderatör", role: "moderator", level: 12, xp: 2400, bio: null, is_verified: true, accessibility_prefs: null, updated_at: "" }
  }
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const isSupabaseConfigured = 
        process.env.NEXT_PUBLIC_SUPABASE_URL && 
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co';

      if (!isSupabaseConfigured) {
        setCategories(SEEDED_CATEGORIES);
        return;
      }

      try {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(SEEDED_CATEGORIES);
        }
      } catch (err) {
        console.error('Error fetching search categories:', err);
        setCategories(SEEDED_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  const performSearch = useCallback(async (searchQuery: string, catId: string) => {
    if (!searchQuery.trim() && !catId) {
      setResults([]);
      return;
    }
    setLoading(true);

    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co';

    // Client-side fallback search
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        const queryLower = searchQuery.toLowerCase().trim();
        const filtered = FALLBACK_TOPICS.filter(topic => {
          const matchesQuery = !queryLower || 
            topic.title.toLowerCase().includes(queryLower) || 
            topic.content.toLowerCase().includes(queryLower);
          
          const matchesCategory = !catId || 
            topic.category_id === catId || 
            topic.category?.slug === catId ||
            topic.category?.name === catId;

          return matchesQuery && matchesCategory;
        });
        setResults(filtered);
        setLoading(false);
      }, 400);
      return;
    }

    try {
      let queryBuilder = supabase
        .from('topics')
        .select('*, category:categories(*), author:profiles(*)')
        .limit(25);

      if (searchQuery.trim()) {
        queryBuilder = queryBuilder.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }
      
      if (catId) {
        // Query can match UUID or slug
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(catId);
        if (isUuid) {
          queryBuilder = queryBuilder.eq('category_id', catId);
        } else {
          // If slug, match with nested query or lookup beforehand
          const matchedCat = categories.find(c => c.slug === catId || c.id === catId);
          if (matchedCat) {
            queryBuilder = queryBuilder.eq('category_id', matchedCat.id);
          }
        }
      }
            
      const { data, error } = await queryBuilder;
      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
      // Fallback to local on error
      const queryLower = searchQuery.toLowerCase().trim();
      const filtered = FALLBACK_TOPICS.filter(topic => {
        const matchesQuery = !queryLower || 
          topic.title.toLowerCase().includes(queryLower) || 
          topic.content.toLowerCase().includes(queryLower);
        return matchesQuery;
      });
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Tarayıcınız ses tanımayı desteklemiyor.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      performSearch(transcript, categoryId);
    };
    recognition.start();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, categoryId);
  };

  return (
    <DashboardLayout>
      <main className="vibe-container py-8 md:py-12">
        <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mb-12 text-xs font-bold uppercase tracking-wider text-primary">
          <Link href="/" className="hover:underline">ANA SAYFA</Link>
          <Link href="/discussions" className="hover:underline">TARTIŞMALAR</Link>
          <Link href="/communities" className="hover:underline">TOPLULUKLAR</Link>
          <Link href="/about" className="hover:underline">HAKKIMIZDA</Link>
        </nav>

        <header className="mb-12">
          <p className="vibe-label ml-0">GELİŞMİŞ ARAMA</p>
          <h1 className="vibe-section-title mb-8 uppercase">Toplulukta Keşfedin</h1>

          <form onSubmit={handleSearch} className="w-full max-w-5xl space-y-4">
            {/* Optimized layout for search row preventing any overflow on screens */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="TARTIŞMA VEYA İÇERİK ARA..." 
                  className="vibe-input vibe-input-pl-12 h-12 text-sm uppercase rounded border border-border bg-background w-full"
                  autoFocus
                />
              </div>

              {/* Action buttons side-by-side cleanly */}
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-12 px-4 rounded-xl transition-all border shadow-sm flex items-center justify-center gap-2",
                    showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                  )}
                  title="Filtreler"
                >
                  <Filter className="size-4" />
                  <span className="font-bold text-xs uppercase tracking-widest">Filtrele</span>
                </button>

                <button 
                  type="button"
                  onClick={startVoiceSearch}
                  className={cn(
                    "h-12 w-12 rounded-xl transition-all border border-border shadow-sm flex items-center justify-center",
                    isListening ? 'bg-destructive text-white animate-pulse border-destructive' : 'bg-muted/50 hover:bg-muted text-muted-foreground active:scale-95'
                  )}
                  title="Sesli Ara"
                >
                  <Mic className="size-4" />
                </button>

                <button 
                  type="submit"
                  disabled={loading}
                  className="vibe-button-primary h-12 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'ARA'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col gap-3 mt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori Filtresi</label>
                    <select 
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer uppercase"
                    >
                      <option value="">TÜM KATEGORİLER</option>
                      {categories.map(c => (
                        <option key={c.id || c.slug} value={c.slug || c.id}>{c.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </header>

        <section>
          <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              {loading ? 'ARANIYOR...' : `${results.length} SONUÇ BULUNDU`}
            </h2>
          </div>

          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                results.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    <Link 
                      href={`/discussions/${topic.id}`}
                      className="vibe-card vibe-card-hover block p-6 md:p-8"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="space-y-4 min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="vibe-badge bg-primary/10 text-primary uppercase text-[10px] px-2.5 py-1 rounded-full font-bold">
                              {topic.category?.name || 'Genel'}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <h3 className="text-lg md:text-2xl font-bold group-hover:text-primary transition-colors tracking-tight leading-snug line-clamp-2 text-foreground whitespace-normal break-words">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium pointer-events-none">
                            {topic.content}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm shrink-0 flex items-center justify-center h-10 w-10">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : !loading && (query || categoryId) && (
                <div className="text-center py-24 bg-card rounded-2xl border-2 border-dashed border-border px-8">
                  <Search size={64} className="mx-auto text-muted-foreground/15 mb-6" />
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 tracking-tight">Sonuç Bulunamadı</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Aradığınız kriterlere uygun bir içerik bulamadık. Lütfen farklı anahtar kelimeler kullanarak tekrar deneyin.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
