import { supabaseServer } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import ClassicPostBit from '@/components/forum/classic-post-bit';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import Link from 'next/link';
import { ChevronRight, Home, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default async function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch topic details
  const { data: topic, error: topicError } = await supabaseServer
    .from('topics')
    .select(`
      *,
      author:profiles(id, username, avatar_url, role),
      category:categories(id, name, slug)
    `)
    .eq('id', id)
    .single();

  if (topicError || !topic) {
    // Try by slug if UUID fails
    const { data: topicBySlug, error: slugError } = await supabaseServer
      .from('topics')
      .select(`
        *,
        author:profiles(id, username, avatar_url, role),
        category:categories(id, name, slug)
      `)
      .eq('slug', id)
      .single();

    if (slugError || !topicBySlug) {
      notFound();
    }
    return <DiscussionDetailView topic={topicBySlug} />;
  }

  return <DiscussionDetailView topic={topic} />;
}

async function DiscussionDetailView({ topic }: { topic: any }) {
  // Fetch comments for this topic
  const { data: comments, error: commentError } = await supabaseServer
    .from('comments')
    .select(`
      *,
      author:profiles(id, username, avatar_url, role)
    `)
    .eq('topic_id', topic.id)
    .order('created_at', { ascending: true });

  const mapRole = (role: string): 'YÖNETİCİ' | 'MODERATÖR' | 'UZMAN' | 'ÜYE' => {
    if (role === 'admin') return 'YÖNETİCİ';
    if (role === 'moderator') return 'MODERATÖR';
    if (role === 'uzman') return 'UZMAN';
    return 'ÜYE';
  };

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
        {topic.category && (
          <>
            <span className="opacity-50">/</span>
            <Link href={`/category/${topic.category.slug}`} className="hover:text-[#18587a]">{topic.category.name}</Link>
          </>
        )}
        <span className="opacity-50">/</span>
        <span className="font-semibold text-[#212529]">{topic.title}</span>
      </div>

      {/* Thread Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-[#212529] mb-1">
          {topic.is_pinned && (
            <span className="bg-red-600 text-white text-[11px] px-2 py-0.5 rounded-sm align-middle mr-2 uppercase">Sabit</span>
          )}
          {topic.title}
        </h1>
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <span>Konuyu başlatan: <span className="text-[#18587a] font-semibold">{topic.author?.username}</span></span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          {/* Main Topic Post */}
          <ClassicPostBit 
            id={topic.id}
            author={{
              name: topic.author?.username || 'Anonim',
              role: mapRole(topic.author?.role),
              joinedDate: 'Bilinmiyor', // We could fetch this from profile
              messageCount: '0',
              likeScore: '0',
              isOnline: false
            }}
            date={formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}
            postNumber="1"
            content={topic.content}
          />

          {/* Comment Posts */}
          <div className="flex flex-col gap-1 mt-1">
            {(comments || []).map((comment, index) => (
              <ClassicPostBit 
                key={comment.id}
                id={comment.id}
                author={{
                  name: comment.author?.username || 'Anonim',
                  role: mapRole(comment.author?.role),
                  joinedDate: 'Bilinmiyor',
                  messageCount: '0',
                  likeScore: '0',
                  isOnline: false
                }}
                date={formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: tr })}
                postNumber={(index + 2).toString()}
                content={comment.content}
              />
            ))}
          </div>

          {/* Quick Reply Form Placeholder */}
          <div className="xf-block mt-4">
            <div className="xf-block-header">Hızlı Cevap</div>
            <div className="p-4">
              <textarea 
                className="w-full border border-[#d8dee4] p-3 min-h-[150px] text-sm focus:outline-none focus:border-[#18587a] mb-3"
                placeholder="Mesajınızı buraya yazın..."
              ></textarea>
              <div className="flex justify-end">
                <button className="bg-[#204060] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#18587a] transition-colors shadow-sm">
                  Mesajı Gönder
                </button>
              </div>
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
            {topic.category && (
              <>
                <span className="opacity-50">/</span>
                <Link href={`/category/${topic.category.slug}`} className="hover:text-[#18587a]">{topic.category.name}</Link>
              </>
            )}
            <span className="opacity-50">/</span>
            <span className="font-semibold text-[#212529]">{topic.title}</span>
          </div>
        </div>

        <ClassicSidebar />
      </div>
    </div>
  );
}
