import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import DiscussionDetailClient from './DiscussionDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!id) {
    return {
      title: 'Konu | Engelsiz Forum',
      description: 'Engelsiz Forum topluluk tartışmaları.',
    };
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  let query = supabaseServer.from('topics').select('title, content, created_at, category:categories(name)');
  if (isUUID) {
    query = query.eq('id', id);
  } else {
    query = query.eq('slug', id);
  }

  const { data: topic } = await query.maybeSingle();

  if (!topic) {
    return {
      title: 'Konu Bulunamadı | Engelsiz Forum',
      description: 'Aradığınız forum konusu bulunamadı veya taşınmış olabilir.',
    };
  }

  const rawDesc = (topic.content || '')
    .replace(/[#*`_~\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const description = rawDesc.length > 155 ? `${rawDesc.substring(0, 152)}...` : (rawDesc || `${topic.title} konusuna ait tüm paylaşımlar ve yanıtlar.`);
  const title = `${topic.title} | Engelsiz Forum`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://engelsizforum.com/discussions/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://engelsizforum.com/discussions/${id}`,
      type: 'article',
      publishedTime: topic.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  // Validate if UUID or Slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  try {
    let query = supabaseServer
      .from('topics')
      .select(`
        *,
        author:profiles(id, username, avatar_url, role, level, xp, full_name, bio),
        category:categories(id, name, slug)
      `);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: topic, error: topicError } = await query.maybeSingle();

    if (topicError || !topic) {
      notFound();
    }

    // Increment views count safely in background
    try {
      await supabaseServer
        .from('topics')
        .update({ views_count: (topic.views_count || 0) + 1 })
        .eq('id', topic.id);
    } catch {
      // Non-blocking view increment
    }

    // Fetch comments for this topic
    let comments: any[] = [];
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

    return (
      <DiscussionDetailClient initialTopic={topic} initialComments={comments} />
    );
  } catch (err) {
    console.error('Database error in discussion detail page:', err);
    notFound();
  }
}
