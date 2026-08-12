'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TopicCard } from './topic-card';
import { LayoutGrid, List, Plus, Search, Filter, Loader2, MessageCircleOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

/**
 * Production Forum Index (WCAG 2.2 AAA)
 * Fetches real topics from Supabase.
 */
export function ForumIndex() {
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch Categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (catError) throw catError;
        setCategories(catData || []);

        // Fetch Topics with joined data
        // Note: In a real app with counts, you might use a view or a separate count query
        // For now we'll fetch the core topic data
        let query = supabase
          .from('topics')
          .select(`
            *,
            author:profiles(username, avatar_url),
            category:categories(name, slug)
          `)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (activeCategory) {
          query = query.eq('category_id', activeCategory);
        }

        const { data: topicData, error: topicError } = await query;
        
        if (topicError) throw topicError;
        setTopics(topicData || []);
      } catch (err: any) {
        console.error('Error fetching forum data:', err);
        toast.error('Forum verileri yüklenemedi: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [activeCategory]);

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="vibe-container py-12 space-y-12">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Plus size={32} strokeWidth={3} />
            </div>
            <h1 className="vibe-section-title">Tartışmalar</h1>
          </div>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            Erişilebilir bilgi paylaşımı ve topluluk dayanışmasının merkezi. Deneyimlerinizi paylaşın, sorularınıza yanıt bulun.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Konularda ara..."
              className="vibe-input !pl-12 w-full sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Forum konularında arama yap"
            />
          </div>
          <Link href="/discussions/new" className="vibe-button-primary flex gap-2">
            <Plus size={20} strokeWidth={3} />
            <span>Yeni Konu</span>
          </Link>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar" role="tablist" aria-label="Kategori Filtreleri">
        <button
          onClick={() => setActiveCategory(null)}
          className={`vibe-badge !normal-case !tracking-normal whitespace-nowrap transition-all ${
            activeCategory === null ? 'bg-primary text-primary-foreground border-primary' : 'hover:border-primary/50'
          }`}
          role="tab"
          aria-selected={activeCategory === null}
        >
          Tüm Konular
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`vibe-badge !normal-case !tracking-normal whitespace-nowrap transition-all ${
              activeCategory === cat.id ? 'bg-primary text-primary-foreground border-primary' : 'hover:border-primary/50'
            }`}
            role="tab"
            aria-selected={activeCategory === cat.id}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Topics List */}
      <div className="space-y-6" role="feed" aria-busy={isLoading}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Konular Yükleniyor...</p>
          </div>
        ) : filteredTopics.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredTopics.map(topic => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        ) : (
          <div className="vibe-card p-20 flex flex-col items-center text-center space-y-6 border-dashed">
            <div className="p-6 bg-muted rounded-full">
              <MessageCircleOff size={48} className="text-muted-foreground/40" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Henüz Konu Yok</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Bu kategoride henüz bir tartışma başlatılmamış. İlk adımı sen atmak ister misin?
              </p>
            </div>
            <Link href="/discussions/new" className="vibe-button-primary">
              İlk Konuyu Başlat
            </Link>
          </div>
        )}
      </div>

      {/* Screen Reader Live Region for Search Results */}
      <div className="sr-only" aria-live="polite">
        {searchQuery ? `${filteredTopics.length} sonuç bulundu.` : ''}
      </div>
    </div>
  );
}
