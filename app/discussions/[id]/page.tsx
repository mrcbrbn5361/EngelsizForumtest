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

  // Validate if UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (!isUUID) {
    // If not a UUID, try to find a topic by title matching or return 404 gracefully
    const { data: matchedTopic, error } = await supabaseServer
      .from('topics')
      .select(`
        *,
        author:profiles(id, username, avatar_url, role),
        category:categories(id, name, slug)
      `)
      .limit(1)
      .maybeSingle();

    if (error || !matchedTopic) {
      notFound();
    }
    return <DiscussionDetailView topic={matchedTopic} />;
  }

  // Fetch topic details with UUID safely
  try {
    const { data: topic, error: topicError } = await supabaseServer
      .from('topics')
      .select(`
        *,
        author:profiles(id, username, avatar_url, role),
        category:categories(id, name, slug)
      `)
      .eq('id', id)
      .maybeSingle();

    if (topicError || !topic) {
      // Graceful fallback to first available topic or 404
      const { data: fallbackTopic } = await supabaseServer
        .from('topics')
        .select(`
          *,
          author:profiles(id, username, avatar_url, role),
          category:categories(id, name, slug)
        `)
        .limit(1)
        .maybeSingle();

      if (!fallbackTopic) {
        notFound();
      }
      return <DiscussionDetailView topic={fallbackTopic} />;
    }

    return <DiscussionDetailView topic={topic} />;
  } catch (err) {
    console.error('Database query crash on discussion page:', err);
    notFound();
  }
}

async function DiscussionDetailView({ topic }: { topic: any }) {
  // Fetch comments for this topic safely
  let comments: any[] = [];
  try {
    const { data: fetchedComments, error: commentError } = await supabaseServer
      .from('comments')
      .select(`
        *,
        author:profiles(id, username, avatar_url, role)
      `)
      .eq('topic_id', topic.id)
      .order('created_at', { ascending: true });

    if (!commentError && fetchedComments) {
      comments = fetchedComments;
    }
  } catch (err) {
    console.error('Error fetching comments:', err);
  }

  const mapRole = (role: string): 'YÖNETİCİ' | 'MODERATÖR' | 'UZMAN' | 'ÜYE' => {
    if (role === 'admin') return 'YÖNETİCİ';
    if (role === 'moderator') return 'MODERATÖR';
    if (role === 'uzman') return 'UZMAN';
    return 'ÜYE';
  };

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
        {topic.category && (
          <>
            <span className="opacity-50">/</span>
            <Link href={`/category/${topic.category.slug}`} className="hover:text-sky-400">{topic.category.name}</Link>
          </>
        )}
        <span className="opacity-50">/</span>
        <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
      </div>

      {/* Thread Header */}
      <div className="mb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mb-1 leading-snug break-words">
          {topic.is_pinned && (
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-sm align-middle mr-2 uppercase font-black">Sabit</span>
          )}
          {topic.title}
        </h1>
        <div className="flex items-center gap-2 text-[11px] sm:text-[12px] text-slate-400 flex-wrap">
          <span>Konuyu başlatan: <span className="text-sky-400 font-semibold">{topic.author?.username || 'Anonim'}</span></span>
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
              joinedDate: 'Bilinmiyor',
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
            {comments.map((comment, index) => (
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

          {/* Quick Reply Form */}
          <div className="xf-block mt-4 border border-white/[0.08] rounded-sm">
            <div className="xf-block-header bg-[#111726] border-b border-white/[0.08] text-slate-200 font-extrabold uppercase text-[12px] tracking-wider py-2.5 px-3">Hızlı Cevap</div>
            <div className="p-4 bg-[#111726]/40">
              <textarea 
                className="w-full bg-[#111726]/40 border border-white/[0.08] rounded p-3 min-h-[150px] text-sm focus:outline-none focus:border-sky-500 text-slate-200 placeholder:text-slate-500 mb-3"
                placeholder="Mesajınızı buraya yazın..."
              ></textarea>
              <div className="flex justify-end">
                <button className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-6 py-2 rounded-sm text-sm font-bold transition-all shadow-md">
                  Mesajı Gönder
                </button>
              </div>
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
            {topic.category && (
              <>
                <span className="opacity-50">/</span>
                <Link href={`/category/${topic.category.slug}`} className="hover:text-sky-400">{topic.category.name}</Link>
              </>
            )}
            <span className="opacity-50">/</span>
            <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
          </div>
        </div>

        <ClassicSidebar />
      </div>
    </div>
  );
}
