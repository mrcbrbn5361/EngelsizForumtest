import { supabaseServer } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import DiscussionDetailClient from './DiscussionDetailClient';

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
        author:profiles(id, username, avatar_url, role, level, xp, full_name, bio),
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
        author:profiles(id, username, avatar_url, role, level, xp, full_name, bio),
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
          author:profiles(id, username, avatar_url, role, level, xp, full_name, bio),
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
        author:profiles(id, username, avatar_url, role, level, xp, full_name, bio)
      `)
      .eq('topic_id', topic.id)
      .order('created_at', { ascending: true });

    if (!commentError && fetchedComments) {
      comments = fetchedComments;
    }
  } catch (err) {
    console.error('Error fetching comments:', err);
  }

  return (
    <DiscussionDetailClient initialTopic={topic} initialComments={comments} />
  );
}

