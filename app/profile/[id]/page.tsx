import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProfileViewClient } from '@/components/profile/profile-view-client';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const supabase = await createClient();
  let query = supabase.from('profiles').select('username, full_name, bio');
  if (isUUID) {
    query = query.eq('id', id);
  } else {
    query = query.eq('username', id);
  }

  const { data: profile } = await query.maybeSingle();

  if (!profile) {
    return {
      title: 'Profil Bulunamadı | Engelsiz Forum',
      description: 'Aradığınız kullanıcı profili bulunamadı.',
    };
  }

  const title = `${profile.full_name || profile.username} (@${profile.username}) | Engelsiz Forum`;
  const description = profile.bio 
    ? `${profile.bio.substring(0, 150)} - Engelsiz Forum Topluluk Üyesi Profili.`
    : `${profile.username} üyesinin Engelsiz Forum üzerindeki paylaşımları ve etkinlikleri.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `https://engelsizforum.com/profile/${id}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    }
  };
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try to fetch profile by UUID or username
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const supabase = await createClient();
  let query = supabase.from('profiles').select('id, username, full_name, avatar_url, role, level, xp, bio, created_at');
  if (isUUID) {
    query = query.eq('id', id);
  } else {
    query = query.eq('username', id);
  }

  const { data: profile, error } = await query.maybeSingle();

  if (error || !profile) {
    notFound();
  }

  // Fetch topic and comment counts
  const { count: topicCount } = await supabase
    .from('topics')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', profile.id);

  const { count: commentCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', profile.id);

  // Fetch recent topics by this user
  const { data: recentTopics } = await supabase
    .from('topics')
    .select('id, title, created_at, comments_count, views_count, slug')
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <ProfileViewClient 
      targetProfile={profile}
      stats={{
        topicCount: topicCount || 0,
        commentCount: commentCount || 0
      }}
      recentTopics={recentTopics || []}
    />
  );
}
