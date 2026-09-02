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
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <div className="bg-[#eef2f7] px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border border-slate-200 rounded-sm mb-4">
        <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/" className="hover:text-[#185886] hover:underline">Forumlar</Link>
        {parentCategory && (
          <>
            <span className="opacity-50">/</span>
            <Link href={`/category/${parentCategory.slug}`} className="hover:text-[#185886] hover:underline">{parentCategory.name}</Link>
          </>
        )}
        <span className="opacity-50">/</span>
        <span className="font-bold text-slate-800">{category.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-black text-[#185886] uppercase tracking-wide">{category.name}</h1>
            <Link 
              href="/discussions/new" 
              className="bg-[#f2930d] hover:bg-[#d5800a] text-white px-4.5 py-2.5 rounded-sm text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Yeni Konu Aç</span>
            </Link>
          </div>

          <div className="xf-block rounded-sm overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="xf-block-header bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 py-3 px-4">
              <div className="flex items-center gap-2 text-[#185886] font-black text-sm">
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
                <div className="p-10 text-center text-slate-500 bg-slate-50/50 italic border-b border-slate-100 text-xs">
                  Bu kategoride henüz konu açılmamış.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Breadcrumbs */}
          <div className="mt-6 bg-[#eef2f7] px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border border-slate-200 rounded-sm">
            <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1">
              <Home size={12} />
              Ana Sayfa
            </Link>
            <span className="opacity-50">/</span>
            <Link href="/" className="hover:text-[#185886] hover:underline">Forumlar</Link>
            {parentCategory && (
              <>
                <span className="opacity-50">/</span>
                <Link href={`/category/${parentCategory.slug}`} className="hover:text-[#185886] hover:underline">{parentCategory.name}</Link>
              </>
            )}
            <span className="opacity-50">/</span>
            <span className="font-bold text-slate-800">{category.name}</span>
          </div>
        </div>

        <ClassicSidebar />
      </div>
    </div>
  );
}
