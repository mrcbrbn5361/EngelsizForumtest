import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import ClassicThreadRow from '@/components/forum/classic-thread-row';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import Link from 'next/link';
import { ChevronRight, Home, MessageSquare, PlusCircle, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await supabaseServer
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .maybeSingle();

  if (!category) {
    return {
      title: 'Kategori Bulunamadı | Engelsiz Forum',
      description: 'Aradığınız forum kategorisi bulunamadı veya taşınmış olabilir.',
    };
  }

  const title = `${category.name} | Engelsiz Forum`;
  const description = category.description 
    ? `${category.description.substring(0, 150)} - Engelsiz Forum topluluk tartışmaları.`
    : `${category.name} kategorisi altındaki tüm konular, engelli hakları ve mevzuat paylaşımları.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://engelsizforum.com/category/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://engelsizforum.com/category/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch category details
  const { data: category, error: catError } = await supabaseServer
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (catError || !category) {
    notFound();
  }

  // Fetch parent category for breadcrumbs if it exists
  let parentCategory = null;
  if (category.parent_id) {
    const { data: parent } = await supabaseServer
      .from('categories')
      .select('name, slug')
      .eq('id', category.parent_id)
      .maybeSingle();
    parentCategory = parent;
  }

  // Fetch topics in this category with reply and view counts
  const { data: topics, error: topicError } = await supabaseServer
    .from('topics')
    .select(`
      *,
      author:profiles(id, username, avatar_url)
    `)
    .eq('category_id', category.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (topicError) {
    console.error('Error fetching topics:', topicError);
  }

  const topicsWithStats = (topics || []).map((topic) => ({
    ...topic,
    replyCount: topic.comments_count || 0,
    viewCount: topic.views_count || 0
  }));

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/" className="hover:text-sky-600 font-semibold">Kategoriler</Link>
        {parentCategory && (
          <>
            <span className="opacity-40">/</span>
            <Link href={`/category/${parentCategory.slug}`} className="hover:text-sky-600 font-semibold">{parentCategory.name}</Link>
          </>
        )}
        <span className="opacity-40">/</span>
        <span className="font-extrabold text-slate-950 dark:text-white">{category.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                <Folder size={24} />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight">
                  {category.name}
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {category.description || 'Bu kategori altındaki güncel tartışmalar ve topluluk paylaşımları.'}
                </p>
              </div>
            </div>

            <Link href="/new-thread" className="shrink-0">
              <Button variant="primary" size="default" className="gap-2 font-bold w-full sm:w-auto">
                <PlusCircle size={15} />
                <span>Yeni Konu Aç</span>
              </Button>
            </Link>
          </div>

          {/* Topics List Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-900 text-white py-3.5 px-5 flex items-center justify-between border-b-2 border-slate-800">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                <MessageSquare size={15} className="text-sky-400" />
                <span>TARTIŞMA KONULARI</span>
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono">
                {topicsWithStats.length} Konu
              </span>
            </div>
            
            <div className="divide-y-2 divide-slate-100 dark:divide-slate-800">
              {topicsWithStats.length > 0 ? (
                topicsWithStats.map((topic) => (
                  <ClassicThreadRow key={topic.id} topic={topic} />
                ))
              ) : (
                <div className="p-12 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-950/30 text-xs font-bold">
                  Bu kategoride henüz konu açılmamış. İlk konuyu siz açabilirsiniz!
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="lg:col-span-4">
          <ClassicSidebar />
        </div>
      </div>
    </div>
  );
}
