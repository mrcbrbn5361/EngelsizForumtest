import { supabaseServer } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import ClassicThreadRow from '@/components/forum/classic-thread-row';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import Link from 'next/link';
import { ChevronRight, Home, MessageSquare } from 'lucide-react';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch category details
  const { data: category, error: catError } = await supabaseServer
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

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
      .single();
    parentCategory = parent;
  }

  // Fetch topics in this category with reply counts
  // Note: We'll fetch topics and then count comments separately or use a join if possible
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

  // For each topic, fetch comment count (this could be optimized with a custom RPC)
  const topicsWithStats = await Promise.all((topics || []).map(async (topic) => {
    const { count } = await supabaseServer
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topic.id);
    
    return {
      ...topic,
      replyCount: count || 0,
      viewCount: Math.floor(Math.random() * 1000) // Placeholder for views as it's not in schema
    };
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <div className="bg-[#eceff3] -mx-4 px-4 py-2 flex flex-wrap items-center gap-2 text-[12px] text-[#6c757d] border-b border-[#d8dee4] mb-4">
        <Link href="/" className="hover:text-[#18587a] flex items-center gap-1">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/" className="hover:text-[#18587a]">Forumlar</Link>
        {parentCategory && (
          <>
            <span className="opacity-50">/</span>
            <Link href={`/category/${parentCategory.slug}`} className="hover:text-[#18587a]">{parentCategory.name}</Link>
          </>
        )}
        <span className="opacity-50">/</span>
        <span className="font-semibold text-[#212529]">{category.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#204060]">{category.name}</h1>
            <button className="bg-[#204060] text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-[#18587a] transition-colors border-b-2 border-black/20 active:translate-y-0.5 transition-transform">
              Yeni Konu Aç
            </button>
          </div>

          <div className="xf-block rounded-sm overflow-hidden">
            <div className="xf-block-header">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} />
                KONULAR
              </div>
            </div>
            
            <div className="flex flex-col">
              {topicsWithStats.length > 0 ? (
                topicsWithStats.map((topic) => (
                  <ClassicThreadRow key={topic.id} topic={topic} />
                ))
              ) : (
                <div className="p-10 text-center text-slate-500 italic bg-white">
                  Bu kategoride henüz konu açılmamış.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Breadcrumbs */}
          <div className="mt-6 bg-[#eceff3] px-4 py-2 flex flex-wrap items-center gap-2 text-[12px] text-[#6c757d] border border-[#d8dee4] rounded-sm">
            <Link href="/" className="hover:text-[#18587a] flex items-center gap-1">
              <Home size={12} />
              Ana Sayfa
            </Link>
            <span className="opacity-50">/</span>
            <Link href="/" className="hover:text-[#18587a]">Forumlar</Link>
            {parentCategory && (
              <>
                <span className="opacity-50">/</span>
                <Link href={`/category/${parentCategory.slug}`} className="hover:text-[#18587a]">{parentCategory.name}</Link>
              </>
            )}
            <span className="opacity-50">/</span>
            <span className="font-semibold text-[#212529]">{category.name}</span>
          </div>
        </div>

        <ClassicSidebar />
      </div>
    </div>
  );
}
