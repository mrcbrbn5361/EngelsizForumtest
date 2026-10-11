import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import ClassicThreadRow from '@/components/forum/classic-thread-row';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import Link from 'next/link';
import { Plus } from 'lucide-react';

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

  // Fetch topics in this category
  const { data: topics } = await supabaseServer
    .from('topics')
    .select(`
      *,
      author:profiles(id, username, avatar_url)
    `)
    .eq('category_id', category.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  const topicsWithStats = (topics || []).map((topic) => ({
    ...topic,
    replyCount: topic.comments_count || 0,
    viewCount: topic.views_count || 0
  }));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
        <Link href="/" className="hover:text-zinc-300">
          Forum
        </Link>
        <span>/</span>
        <span className="text-zinc-300">{category.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-xs text-zinc-400 mt-1">
                  {category.description}
                </p>
              )}
            </div>

            <Link
              href={`/discussions/new?kategori=${category.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold self-start sm:self-auto transition-colors"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Bu Bölümde Konu Aç</span>
            </Link>
          </div>

          {/* Topics List */}
          {topicsWithStats.length > 0 ? (
            <div className="space-y-1">
              {topicsWithStats.map((topic) => (
                <ClassicThreadRow key={topic.id} topic={topic} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-zinc-500 text-xs">
              Bu kategoride henüz konu açılmamış. İlk konuyu siz başlatabilirsiniz.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <ClassicSidebar />
        </div>
      </div>
    </div>
  );
}
