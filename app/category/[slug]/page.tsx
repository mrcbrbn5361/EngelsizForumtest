import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { TopicCard } from '@/components/forum/topic-card';
import { Tag, MessageSquareOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Category Discussions Page (Server Component)
 * Filters topics by specific category slug.
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
  const { data: topics, error } = await supabase
    .from('topics')
    .select(`
      *,
      author:profiles(username, avatar_url),
      category:categories(name, slug)
    `)
    .eq('category_id', category.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <SiteLayout>
      <div className="vibe-container py-12 space-y-12">
        {/* Header */}
        <div className="space-y-6">
          <Link 
            href="/" 
            className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Tüm Kategoriler
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                <Tag size={32} strokeWidth={3} />
              </div>
              <div>
                <h1 className="vibe-section-title !text-3xl">{category.name}</h1>
                <p className="text-muted-foreground font-medium">{category.description}</p>
              </div>
            </div>
            <Link href="/discussions/new" className="vibe-button-primary">Yeni Konu Başlat</Link>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-6">
          {topics && topics.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {topics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          ) : (
            <div className="vibe-card p-20 flex flex-col items-center text-center space-y-6 border-dashed">
              <div className="p-6 bg-muted rounded-full">
                <MessageSquareOff size={48} className="text-muted-foreground/40" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tight">İçerik Bulunamadı</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Bu kategoride henüz bir tartışma başlatılmamış.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
