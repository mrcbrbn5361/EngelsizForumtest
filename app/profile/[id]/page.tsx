import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProfileViewClient } from '@/components/profile/profile-view-client';
import { createClient } from '@/lib/supabase/server';
import { canViewFullProfile, normalizePrivacyPrefs } from '@/lib/preferences';

const PUBLIC_PROFILE_FIELDS = ['id', 'username', 'full_name', 'avatar_url', 'bio', 'role', 'created_at', 'xp', 'level', 'is_banned', 'reputation_points'] as const;

/**
 * Keeps only the columns the public profile page renders, so preference and other private
 * columns never reach the browser.
 */
function publicProfile(row: Record<string, any>) {
  return Object.fromEntries(PUBLIC_PROFILE_FIELDS.filter((k) => k in row).map((k) => [k, row[k]])) as any;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  let query = supabaseServer.from('profiles').select('*');
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

  if (normalizePrivacyPrefs(profile.privacy_prefs).profileVisibility === 'members') {
    return {
      title: `@${profile.username} | Engelsiz Forum`,
      description: 'Bu üyenin profili yalnızca Engelsiz Forum üyelerine açıktır.',
      robots: { index: false, follow: false },
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
  
  let query = supabaseServer.from('profiles').select('*');
  if (isUUID) {
    query = query.eq('id', id);
  } else {
    query = query.eq('username', id);
  }

  const { data: profile, error } = await query.maybeSingle();

  if (error || !profile) {
    notFound();
  }

  const viewerClient = await createClient();
  const { data: { user: viewer } } = await viewerClient.auth.getUser();
  if (!canViewFullProfile(profile.privacy_prefs, { isSignedIn: Boolean(viewer), isOwner: viewer?.id === profile.id })) {
    return (
      <section aria-labelledby="members-only-title" className="max-w-xl mx-auto my-10 p-6 bg-surface-raised border border-line rounded-md space-y-3 text-center">
        <h1 id="members-only-title" className="text-xl font-bold text-fg font-heading">@{profile.username}</h1>
        <p className="text-sm text-fg-3">Bu üye profilini yalnızca Engelsiz Forum üyelerine açtı.</p>
        <Link
          href={`/login?redirect=${encodeURIComponent(`/profile/${id}`)}`}
          className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold"
        >
          Görmek için giriş yapın
        </Link>
      </section>
    );
  }

  // Fetch topic and comment counts
  const { count: topicCount } = await supabaseServer
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', profile.id);

  const { count: commentCount } = await supabaseServer
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', profile.id);

  // Fetch recent topics by this user
  const { data: recentTopics } = await supabaseServer
    .from('topics')
    .select('id, title, created_at, comments_count, views_count, slug')
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <ProfileViewClient 
      targetProfile={publicProfile(profile)}
      stats={{
        topicCount: topicCount || 0,
        commentCount: commentCount || 0
      }}
      recentTopics={recentTopics || []}
    />
  );
}
