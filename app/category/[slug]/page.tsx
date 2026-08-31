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
      viewCount: topic.views_count || 0
    };
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <div className="bg-[#0b0f19] px-4 py-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-400 border border-white/[0.08] rounded-sm mb-4">
        <Link href="/" className="hover:text-sky-400 flex items-center gap-1">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/" className="hover:text-sky-400">Forumlar</Link>
        {parentCategory && (
          <>
            <span className="opacity-50">/</span>
            <Link href={`/category/${parentCategory.slug}`} className="hover:text-sky-400">{parentCategory.name}</Link>
          </>
        )}
        <span className="opacity-50">/</span>
        <span className="font-semibold text-slate-200">{category.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-sky-400 uppercase tracking-wide">{category.name}</h1>
            <Link href="/discussions/new" className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-1.5 rounded-sm text-sm font-bold transition-all hover:shadow-lg hover:shadow-sky-500/10">
              Yeni Konu Aç
            </Link>
          </div>

          <div className="xf-block rounded-sm overflow-hidden border border-white/[0.08]">
            <div className="xf-block-header bg-[#111726] border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-slate-100">
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
                <div className="p-10 text-center text-slate-400 italic bg-[#111726]/60">
                  Bu kategoride henüz konu açılmamış.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Breadcrumbs */}
          <div className="mt-6 bg-[#0b0f19] px-4 py-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-400 border border-white/[0.08] rounded-sm">
            <Link href="/" className="hover:text-sky-400 flex items-center gap-1">
              <Home size={12} />
              Ana Sayfa
            </Link>
            <span className="opacity-50">/</span>
            <Link href="/" className="hover:text-sky-400">Forumlar</Link>
            {parentCategory && (
              <>
                <span className="opacity-50">/</span>
                <Link href={`/category/${parentCategory.slug}`} className="hover:text-sky-400">{parentCategory.name}</Link>
              </>
            )}
            <span className="opacity-50">/</span>
            <span className="font-semibold text-slate-200">{category.name}</span>
          </div>
        </div>

        <ClassicSidebar />
      </div>
    </div>
  );
}
