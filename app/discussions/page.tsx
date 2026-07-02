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
      {/* ... Re-added layout components (I will need to add them properly here) */}
      <div className="vibe-container py-12 md:py-16">
        <header className="mb-16">
            {/* Header, Search, Navigation... (re-add here) */}
        </header>
        
        <section className="space-y-6">
          {topics.length > 0 ? (
            <div className="grid gap-6">
              {topics.map((topic) => (
                <DiscussionCard 
                  key={topic.id}
                  topic={topic}
                  // Client-side AI summary needs to be handled via client components
                />
              ))}
            </div>
          ) : (
             /* Empty state ... */
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
