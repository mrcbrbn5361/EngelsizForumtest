'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { 
  User, Mail, Shield, Award, Sparkles, Zap, Flame, Star, 
  MessageSquare, BookOpen, Heart, Calendar, Loader2, ArrowLeft, Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon: React.ReactNode;
  color: string;
  unlockedAtXp: number;
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const userId = unwrappedParams.id;
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    level: number;
    xp: number;
    is_verified: boolean;
    last_seen_at?: string | null;
    updated_at: string;
    created_at: string;
  } | null>(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'opened' | 'replied' | 'liked'>('opened');
  const [openedTopics, setOpenedTopics] = useState<any[]>([]);
  const [repliedTopics, setRepliedTopics] = useState<any[]>([]);
  const [likedTopics, setLikedTopics] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!userId) return;
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    async function fetchUserActivity() {
      if (!userId) return;
      setLoadingContent(true);

      try {
        // 1. Fetch Opened Topics
        const { data: opened, error: openedErr } = await supabase
          .from('topics')
          .select(`
            *,
            author:profiles(username, avatar_url, full_name, role, level, xp, is_verified),
            category:categories(name, slug, description, icon, color),
            comments(count)
          `)
          .eq('author_id', userId)
          .order('created_at', { ascending: false });

        if (!openedErr && opened) {
          setOpenedTopics(opened);
        }

        // 2. Fetch Replied Topics (Unique Topics from user's comments)
        const { data: commentsData, error: commentsErr } = await supabase
          .from('comments')
          .select(`
            topic_id,
            topic:topics(
              *,
              author:profiles(username, avatar_url, full_name, role, level, xp, is_verified),
              category:categories(name, slug, description, icon, color),
              comments(count)
            )
          `)
          .eq('author_id', userId);

        if (!commentsErr && commentsData) {
          const uniqueTopicsMap = new Map();
          commentsData.forEach((c: any) => {
            if (c.topic) {
              uniqueTopicsMap.set(c.topic.id, c.topic);
            }
          });
          setRepliedTopics(Array.from(uniqueTopicsMap.values()));
        }

        // 3. Fetch Liked Topics (Unique Topics from user's reactions of type 'like')
        const { data: reactionsData, error: reactionsErr } = await supabase
          .from('reactions')
          .select(`
            topic_id,
            topic:topics(
              *,
              author:profiles(username, avatar_url, full_name, role, level, xp, is_verified),
              category:categories(name, slug, description, icon, color),
              comments(count)
            )
          `)
          .eq('user_id', userId)
          .eq('reaction_type', 'like');

        if (!reactionsErr && reactionsData) {
          const uniqueLikesMap = new Map();
          reactionsData.forEach((r: any) => {
            if (r.topic) {
              uniqueLikesMap.set(r.topic.id, r.topic);
            }
          });
          setLikedTopics(Array.from(uniqueLikesMap.values()));
        }
      } catch (err) {
        console.error('Error fetching user activity:', err);
      } finally {
        setLoadingContent(false);
      }
    }

    if (userId) {
      fetchUserActivity();
    }
  }, [userId]);

  const badgesList = useMemo<Badge[]>(() => [
    {
      id: 'welcome',
      name: 'İlk Adım',
      description: 'EngelsizForum topluluğuna katıldınız.',
      requirement: 'Hesap oluşturun',
      icon: <Sparkles className="size-6" />,
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      unlockedAtXp: 0
    },
    {
      id: 'active_member',
      name: 'Aktif Katılımcı',
      description: 'Topluluk tartışmalarına katılarak fikirlerinizi paylaştınız.',
      requirement: '100 XP Barajı',
      icon: <Flame className="size-6" />,
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      unlockedAtXp: 100
    },
    {
      id: 'a11y_champion',
      name: 'Erişilebilirlik Elçisi',
      description: 'Disleksi font, biyonik okuma ve yüksek kontrast özellikleri kullandınız.',
      requirement: '300 XP Barajı',
      icon: <Award className="size-6" />,
      color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      unlockedAtXp: 300
    },
    {
      id: 'inclusive_leader',
      name: 'Kapsayıcı Lider',
      description: 'Sistemdeki diğer kullanıcılara çözüm sunup en iyi cevap işaretlendiniz.',
      requirement: '500 XP Barajı',
      icon: <Star className="size-6" />,
      color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
      unlockedAtXp: 500
    }
  ], []);

  const userXp = profile?.xp || 0;
  const userLevel = profile?.level || 1;
  const xpInCurrentLevel = userXp % 200;
  const xpNeededForNextLevel = 200;
  const xpProgressPercentage = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  function formatLastSeen(lastSeenStr: string | null | undefined, updatedAtStr: string | null) {
    const activeTimeStr = lastSeenStr || updatedAtStr;
    if (!activeTimeStr) return 'Bilinmiyor';
    
    const date = new Date(activeTimeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Within last 10 minutes -> Online
    if (diffMs < 10 * 60 * 1000) {
      return 'Şu an aktif';
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 60) {
      return `${diffMinutes} dakika önce aktifti`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} saat önce aktifti`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Dün aktifti';
    return `${diffDays} gün önce aktifti`;
  }

  const isOnline = useMemo(() => {
    const activeTimeStr = profile?.last_seen_at || profile?.updated_at;
    if (!activeTimeStr) return false;
    const diffMs = new Date().getTime() - new Date(activeTimeStr).getTime();
    return diffMs < 10 * 60 * 1000;
  }, [profile]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary size-10" />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            Profil Yükleniyor...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-6 text-center">
          <div className="p-4 bg-red-500/10 text-red-500 rounded-full">
            <User size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-widest">Kullanıcı Bulunamadı</h1>
            <p className="text-muted-foreground font-semibold max-w-md">
              Aradığınız profil mevcut değil veya silinmiş olabilir.
            </p>
          </div>
          <Link href="/" className="vibe-button-primary h-12 px-6 flex items-center gap-2">
            <ArrowLeft size={16} /> ANA SAYFAYA DÖN
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="w-full py-8 md:py-12">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
            <ArrowLeft size={14} className="stroke-[3]" /> TARTIŞMALARA GERİ DÖN
          </Link>
        </div>

        {/* Profile Header Card */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_400px] gap-8 md:gap-12">
          
          <div className="space-y-8">
            <header className="vibe-card p-0 relative overflow-hidden shadow-2xl border-2 border-border rounded-[2.5rem]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent -z-10" />
              <div className="p-8 sm:p-12 flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
                
                {/* Avatar */}
                <div className="size-24 sm:size-32 rounded-[2rem] bg-primary/10 flex items-center justify-center border-4 border-primary/20 shrink-0 relative overflow-hidden shadow-xl">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || profile.username || 'Kullanıcı'} 
                      className="object-cover w-full h-full" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="size-12 text-primary" />
                  )}
                  {isOnline && (
                    <span className="absolute bottom-2 right-2 size-4 rounded-full bg-green-500 border-2 border-background animate-pulse" title="Çevrimiçi" />
                  )}
                </div>

                <div className="space-y-3 min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-primary/15 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl">
                      {profile.role.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1">
                      <Zap size={10} className="fill-current" /> SEVİYE {userLevel}
                    </span>
                    {isOnline ? (
                      <span className="px-3 py-1 bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
                        ÇEVRİMİÇİ
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-xl">
                        ÇEVRİMDIŞI
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground truncate max-w-full">
                    {profile.full_name || profile.username || 'Engelsiz Kullanıcı'}
                  </h2>
                  <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                    @{profile.username || 'isimsiz'}
                  </p>
                </div>
              </div>

              {/* Activity Info Footer */}
              <div className="bg-muted/35 border-t border-border px-8 py-4 flex flex-wrap gap-6 items-center justify-center md:justify-start text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary" />
                  <span>En Son Görülme: <strong className="text-foreground">{formatLastSeen(profile.last_seen_at, profile.updated_at)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-primary" />
                  <span>Katılım: <strong className="text-foreground">{new Date(profile.created_at).toLocaleDateString('tr-TR')}</strong></span>
                </div>
              </div>
            </header>

            {/* TABBED AREA FOR USER CONTRIBUTIONS */}
            <section className="space-y-6" aria-label="Kullanıcı Etkinlikleri">
              {/* Tab Buttons */}
              <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
                <button
                  onClick={() => setActiveTab('opened')}
                  className={`py-4 px-6 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'opened'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BookOpen size={14} /> AÇTIĞI KONULAR ({openedTopics.length})
                </button>
                <button
                  onClick={() => setActiveTab('replied')}
                  className={`py-4 px-6 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'replied'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MessageSquare size={14} /> YANITLADIĞI KONULAR ({repliedTopics.length})
                </button>
                <button
                  onClick={() => setActiveTab('liked')}
                  className={`py-4 px-6 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'liked'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Heart size={14} /> BEĞENDİĞİ KONULAR ({likedTopics.length})
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="space-y-4">
                {loadingContent ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-primary size-8" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">İçerikler Yükleniyor...</span>
                  </div>
                ) : (
                  <>
                    {activeTab === 'opened' && (
                      openedTopics.length > 0 ? (
                        openedTopics.map(topic => <CompactTopicCard key={topic.id} topic={topic} />)
                      ) : (
                        <EmptyState message="Bu kullanıcı henüz hiç konu açmamış." />
                      )
                    )}

                    {activeTab === 'replied' && (
                      repliedTopics.length > 0 ? (
                        repliedTopics.map(topic => <CompactTopicCard key={topic.id} topic={topic} />)
                      ) : (
                        <EmptyState message="Bu kullanıcı henüz hiçbir konuyu yanıtlamamış." />
                      )
                    )}

                    {activeTab === 'liked' && (
                      likedTopics.length > 0 ? (
                        likedTopics.map(topic => <CompactTopicCard key={topic.id} topic={topic} />)
                      ) : (
                        <EmptyState message="Bu kullanıcı henüz hiçbir konuyu beğenmemiş." />
                      )
                    )}
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Gamification Sidebar */}
          <aside className="space-y-8">
            <section className="vibe-card p-6 sm:p-8 border-2 border-border text-center relative overflow-hidden" aria-label="XP Durumu">
              <h3 className="vibe-label ml-0 mb-6">SEVİYE VE TECRÜBE</h3>
              
              <div className="relative size-36 mx-auto mb-6 flex items-center justify-center">
                <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="42" 
                    className="stroke-muted" 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="50" cy="50" r="42" 
                    className="stroke-primary transition-all duration-500 ease-out" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * xpProgressPercentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="text-center z-10">
                  <span className="text-4xl font-black text-foreground">{userLevel}</span>
                  <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider">SEVİYE</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
                  <span>{xpInCurrentLevel} XP</span>
                  <span>{xpNeededForNextLevel} XP</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${xpProgressPercentage}%` }} 
                  />
                </div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest pt-2">
                  Son Toplam: {userXp} XP
                </p>
              </div>
            </section>

            {/* Badges Section */}
            <section className="vibe-card p-6 sm:p-8 border-2 border-border" aria-label="Kazanılan Rozetler">
              <h3 className="vibe-label ml-0 mb-6 text-center">KAZANILAN ROZETLER</h3>
              <div className="space-y-4">
                {badgesList.map((badge) => {
                  const isUnlocked = userXp >= badge.unlockedAtXp;
                  return (
                    <div 
                      key={badge.id}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                        isUnlocked 
                          ? `${badge.color} shadow-sm` 
                          : 'bg-muted/10 border-border/40 opacity-40 grayscale'
                      }`}
                    >
                      <div className="p-2.5 rounded-xl bg-background shadow-md border border-border/20 shrink-0">
                        {badge.icon}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                          {badge.name}
                        </h4>
                        <p className="text-[10px] leading-relaxed font-semibold text-muted-foreground">
                          {badge.description}
                        </p>
                        <span className="inline-block text-[8px] font-black tracking-widest uppercase text-muted-foreground/80 bg-background/50 px-2 py-0.5 rounded-md border border-border/10">
                          {badge.requirement}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </DashboardLayout>
  );
}

function CompactTopicCard({ topic }: { topic: any }) {
  return (
    <div className="vibe-card p-6 border border-border hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span 
            className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border text-xs"
            style={{ 
              backgroundColor: `${topic.category?.color || '#3b82f6'}15`, 
              color: topic.category?.color || '#3b82f6',
              borderColor: `${topic.category?.color || '#3b82f6'}30`
            }}
          >
            {topic.category?.name || 'GENEL'}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">
            {new Date(topic.created_at).toLocaleDateString('tr-TR')}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground hover:text-primary transition-colors truncate">
          <Link href={`/discussions/${topic.id}`}>
            {topic.title}
          </Link>
        </h3>
      </div>

      <div className="flex items-center gap-4 shrink-0 text-xs font-black uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageSquare size={14} className="text-primary" />
          {(topic.comments as any)?.[0]?.count || 0} YANIT
        </span>
        <span className="flex items-center gap-1">
          <Heart size={14} className="text-red-500 fill-red-500/10" />
          {topic.likes_count || 0} BEĞENİ
        </span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="vibe-card p-12 text-center border-2 border-dashed border-border bg-transparent flex flex-col items-center justify-center gap-4">
      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
