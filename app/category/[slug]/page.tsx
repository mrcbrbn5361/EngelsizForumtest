import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { TopicCard } from '@/components/forum/topic-card';
import { Tag, MessageSquareOff, ArrowLeft, ChevronRight, MessageSquare, Flame, CheckCircle2, Plus } from 'lucide-react';
import Link from 'next/link';

/**
 * Category Discussions Page (Server Component)
 * Filters topics by specific category slug with true Engelliler.biz / modern forum design.
 */
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch category details
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!category) {
    notFound();
  }

  // Fetch topics in this category
  const { data: topics } = await supabase
    .from('topics')
    .select(`
      *,
      author:profiles(id, username, avatar_url, full_name, role, level, xp),
      category:categories(id, name, slug, color, icon)
    `)
    .eq('category_id', category.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  const totalTopics = topics?.length || 0;
  const solvedTopics = topics?.filter(t => t.is_solved)?.length || 0;
  const pinnedTopics = topics?.filter(t => t.is_pinned)?.length || 0;

  return (
    <SiteLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6">
        
        {/* Forum Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <Link href="/" className="hover:text-sky-400 transition-colors">ANA SAYFA</Link>
          <ChevronRight size={12} className="text-muted-foreground/50" />
          <Link href="/discussions" className="hover:text-sky-400 transition-colors">FORUM</Link>
          <ChevronRight size={12} className="text-muted-foreground/50" />
          <span className="text-foreground font-black">{category.name}</span>
        </div>

        {/* Category Header Hero Card */}
        <header className="relative bg-card border border-border/80 rounded-2xl p-5 sm:p-7 shadow-xs overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-2xl shrink-0">
                <Tag size={26} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md">
                    KATEGORİ FORUMU
                  </span>
                  {category.is_main && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      ANA BÖLÜM
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{category.name}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-2xl leading-relaxed">
                  {category.description || `${category.name} ile ilgili güncel mevzuat, deneyim paylaşımları, soru ve cevaplar.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link 
                href={`/discussions/new?category_id=${category.id}`} 
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Plus size={16} />
                <span>Yeni Konu Aç</span>
              </Link>
            </div>
          </div>

          {/* Quick Bento Stats for Category */}
          <div className="grid grid-cols-3 gap-3 pt-5 mt-5 border-t border-border/60">
            <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 shrink-0">
                <MessageSquare size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-bold text-foreground leading-none">{totalTopics}</div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mt-1 truncate">Toplam Başlık</div>
              </div>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-bold text-foreground leading-none">{solvedTopics}</div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mt-1 truncate">Çözülen Konu</div>
              </div>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0">
                <Flame size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-bold text-foreground leading-none">{pinnedTopics}</div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mt-1 truncate">Sabitlenmiş</div>
              </div>
            </div>
          </div>
        </header>

        {/* Topics List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MessageSquare size={14} className="text-sky-400" />
              <span>{category.name} Başlıkları ({totalTopics})</span>
            </h2>
            <Link 
              href="/discussions" 
              className="text-xs font-bold text-sky-400 hover:underline uppercase tracking-wider"
            >
              Tüm Forumu Gör
            </Link>
          </div>

          {topics && topics.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5">
              {topics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border/80 border-dashed rounded-2xl p-10 sm:p-14 flex flex-col items-center text-center space-y-3">
              <div className="p-3.5 bg-muted/40 rounded-2xl text-muted-foreground/50">
                <MessageSquareOff size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground tracking-tight">Henüz Konu Açılmamış</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Bu kategoride ilk tartışmayı siz başlatarak topluluk üyelerine soru sorabilir veya rehber paylaşabilirsiniz.
                </p>
              </div>
              <Link 
                href={`/discussions/new?category_id=${category.id}`} 
                className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                <Plus size={15} />
                <span>İlk Konuyu Sen Başlat</span>
              </Link>
            </div>
          )}
        </div>

      </div>
    </SiteLayout>
  );
}
