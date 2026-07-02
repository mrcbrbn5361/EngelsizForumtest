import React, { Suspense } from 'react';
import { Search, Plus, Sparkles, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { DiscussionCard } from '@/components/forum/discussion-card';

// Server-side data fetching
async function getTopics(categoryId?: string, sortBy: string = 'Latest') {
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co';

  if (!isSupabaseConfigured) return [];

  let query = supabase
    .from('topics')
    .select(`
      *,
      author:profiles(username, avatar_url, full_name),
      category:categories(name),
      comments(count)
    `);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (sortBy === 'Latest') {
    query = query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
  return data || [];
}

async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
}

export default async function DiscussionsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const categoryId = params.kategori;
  const sortBy = params.sort || 'Latest';
  
  const [topics, categories] = await Promise.all([
    getTopics(categoryId, sortBy),
    getCategories()
  ]);

  return (
    <DashboardLayout>
      <div className="vibe-container py-12 md:py-16">
        <header className="mb-16">
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 transition-all hover:bg-primary/10">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                <span className="text-xl">🔥</span> POPÜLER KONULAR
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
                Yardımcı teknolojiler, erişilebilir oyun dünyası ve engelli hakları bu hafta en çok konuşulan başlıklar arasında.
              </p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 transition-all hover:bg-primary/10">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                <span className="text-xl">🤖</span> AI ANALİZİ
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
                Topluluğumuzdaki tartışmaların %80'i pratik çözüm önerileri içeriyor. AI özetleme özelliği ile saniyeler içinde bilgiye ulaşın.
              </p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 transition-all hover:bg-primary/10">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                <span className="text-xl">🤝</span> ÜYE DAYANIŞMASI
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
                Her gün ortalama 50+ yeni çözüm önerisi paylaşılıyor. Kendi deneyiminizi paylaşarak topluluğa uzmanlık katın.
              </p>
            </div>
          </div>

          <div className="vibe-card p-10 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-primary/[0.02] -z-10" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
              <div className="space-y-6">
                <p className="vibe-label ml-0">TARTIŞMA PLATFORMU</p>
                <h1 className="vibe-section-title uppercase">Topluluk Konuşmaları</h1>
                <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                  Yardımlaşmak, deneyim paylaşmak ve yeni insanlarla tanışmak için en doğru yerdesiniz.
                </p>
              </div>
              <Link 
                href="/discussions/new"
                className="vibe-button-primary h-20 px-10 text-xl shrink-0 flex items-center gap-2"
              >
                <Plus size={32} /> YENİ BAŞLIK
              </Link>
            </div>
          </div>
        </header>
        
        <section className="space-y-6">
          {topics.length > 0 ? (
            <div className="grid gap-6">
              {topics.map((topic) => (
                <DiscussionCard 
                  key={topic.id}
                  topic={topic}
                />
              ))}
            </div>
          ) : (
             <div className="text-center py-32 bg-card rounded-[3rem] border-4 border-dashed border-border px-8">
               <MessageSquare size={120} className="mx-auto text-muted-foreground/10 mb-8" />
               <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter text-foreground">Başlık Bulunamadı</h3>
               <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                 Aradığınız kriterlere uygun bir tartışma henüz başlatılmamış. İlk adımı siz atmak ister misiniz?
               </p>
             </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
