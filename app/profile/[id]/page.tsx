'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { 
  User, Mail, Shield, Award, Sparkles, Zap, Flame, Star, 
  MessageSquare, BookOpen, Heart, Calendar, Loader2, ArrowLeft, Clock,
  Plus, Edit, Camera, X, Check
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/user-avatar';

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
  const [loadingContent, setLoadingContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'opened' | 'replied' | 'liked'>('opened');
  const [openedTopics, setOpenedTopics] = useState<any[]>([]);
  const [repliedTopics, setRepliedTopics] = useState<any[]>([]);
  const [likedTopics, setLikedTopics] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    avatar_url: ''
  });

  const [profile, setProfile] = useState<{
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    role: string;
    level: number;
    xp: number;
    is_verified: boolean;
    last_seen_at?: string | null;
    updated_at: string;
    created_at: string;
    followers_count: number;
    following_count: number;
  } | null>(null);

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
          // Fetch real follow counts if they might be inaccurate in profile row
          const { count: followers } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId);
          
          const { count: following } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', userId);

          const profileData = {
            ...data,
            followers_count: followers || 0,
            following_count: following || 0
          };

          setProfile(profileData);
          setEditForm({
            full_name: data.full_name || '',
            username: data.username || '',
            bio: data.bio || '',
            avatar_url: data.avatar_url || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [userId]);

  const handleUpdateProfile = async () => {
    if (!currentUser || !profile || updateLoading) return;
    setUpdateLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          username: editForm.username,
          bio: editForm.bio,
          avatar_url: editForm.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      setProfile(prev => prev ? { 
        ...prev, 
        full_name: editForm.full_name,
        username: editForm.username,
        bio: editForm.bio,
        avatar_url: editForm.avatar_url
      } : null);
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Profil güncellenirken bir hata oluştu.');
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    async function checkFollowStatus() {
      if (!currentUser || !userId || currentUser.id === userId) return;
      try {
        const { data } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
          .maybeSingle();
        
        if (data) setIsFollowing(true);
      } catch (err) {
        console.error('Error checking follow status:', err);
      }
    }
    
    if (userId) {
      checkFollowStatus();
    }
  }, [userId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !userId || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId);
        
        if (error) throw error;
        setIsFollowing(false);
        setProfile(prev => prev ? { ...prev, followers_count: Math.max(0, prev.followers_count - 1) } : null);
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: userId
          });
        
        if (error) throw error;
        setIsFollowing(true);
        setProfile(prev => prev ? { ...prev, followers_count: prev.followers_count + 1 } : null);

        // Send notification safely
        try {
          await supabase.from('notifications').insert({
            recipient_id: userId,
            sender_id: currentUser.id,
            type: 'follow',
            title: 'Yeni Takipçi',
            body: `${currentUser.email?.split('@')[0]} sizi takip etmeye başladı.`,
            content: `${currentUser.email?.split('@')[0]} sizi takip etmeye başladı.`,
            data: { link: `/profile/${currentUser.id}` }
          });
        } catch (notifErr) {
          console.warn('Could not send follow notification:', notifErr);
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

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
            category:categories(name, slug, description, icon, color)
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
              category:categories(name, slug, description, icon, color)
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
              category:categories(name, slug, description, icon, color)
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
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-card border-2 border-border rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10"
          >
            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">PROFİLİ DÜZENLE</h2>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">AD SOYAD</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full h-12 bg-muted/50 border-2 border-border rounded-xl px-4 font-bold focus:border-primary outline-none transition-all"
                    placeholder="Adınız Soyadınız"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">KULLANICI ADI</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full h-12 bg-muted/50 border-2 border-border rounded-xl px-4 font-bold focus:border-primary outline-none transition-all"
                    placeholder="kullaniciadi"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">BİO (KISA ÖZGEÇMİŞ)</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full h-32 bg-muted/50 border-2 border-border rounded-xl p-4 font-bold focus:border-primary outline-none transition-all resize-none"
                    placeholder="Kendinizden bahsedin..."
                    maxLength={160}
                  />
                  <div className="text-[10px] text-right text-muted-foreground font-bold">{editForm.bio.length}/160</div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">AVATAR URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editForm.avatar_url}
                      onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                      className="flex-1 h-12 bg-muted/50 border-2 border-border rounded-xl px-4 font-bold focus:border-primary outline-none transition-all"
                      placeholder="https://..."
                    />
                    <div className="size-12 rounded-xl border-2 border-border overflow-hidden shrink-0 bg-muted">
                      {editForm.avatar_url && (
                        <img src={editForm.avatar_url} alt="Önizleme" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest bg-muted text-foreground hover:bg-muted/80 transition-all"
                  >
                    İPTAL
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={updateLoading}
                    className="flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest vibe-button-primary disabled:opacity-50"
                  >
                    {updateLoading ? <Loader2 className="animate-spin mx-auto" /> : "KAYDET"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="w-full py-6 sm:py-8 md:py-12 min-w-0">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
            <ArrowLeft size={14} className="stroke-[3]" /> TARTIŞMALARA GERİ DÖN
          </Link>
        </div>

        {/* Profile Header Card */}
        <div className="flex flex-col 2xl:grid 2xl:grid-cols-[1fr_320px] gap-6 w-full min-w-0">
          
          <div className="space-y-6 sm:space-y-8 min-w-0 w-full overflow-hidden">
            <header className="vibe-card p-0 relative overflow-hidden shadow-2xl border-2 border-border rounded-[2.5rem]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent -z-10" />
              <div className="p-5 sm:p-10 md:p-12 flex flex-col md:flex-row items-center gap-5 sm:gap-8 text-center md:text-left">
                
                {/* Avatar */}
                <UserAvatar 
                  src={profile.avatar_url}
                  username={profile.username}
                  name={profile.full_name}
                  size="xl"
                  className="size-20 sm:size-28 md:size-32 rounded-[1.75rem] sm:rounded-[2rem] border-4 border-primary/20 shadow-xl shrink-0"
                  badge={
                    isOnline && (
                      <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 size-3.5 sm:size-4 rounded-full bg-green-500 border-2 border-background animate-pulse" title="Çevrimiçi" />
                    )
                  }
                />

                <div className="space-y-3 min-w-0 flex-1 w-full">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center md:justify-start">
                    <span className="px-2.5 py-1 bg-primary/15 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl">
                      {profile.role.toUpperCase()}
                    </span>
                    <span className="px-2.5 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1">
                      <Zap size={10} className="fill-current" /> SEVİYE {userLevel}
                    </span>
                    {isOnline ? (
                      <span className="px-2.5 py-1 bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
                        ÇEVRİMİÇİ
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-xl">
                        ÇEVRİMDIŞI
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground truncate max-w-full">
                    {profile.full_name || profile.username || 'Engelsiz Kullanıcı'}
                  </h2>
                  
                  {profile.bio && (
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground leading-relaxed max-w-2xl italic">
                      "{profile.bio}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-black text-muted-foreground uppercase tracking-wider">
                    <span className="truncate max-w-[150px] sm:max-w-none">@{profile.username || 'isimsiz'}</span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-foreground">{profile.followers_count || 0} TAKİPÇİ</span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-foreground">{profile.following_count || 0} TAKİP</span>
                  </div>

                  <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-4 pt-2 w-full">
                    <div className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-center md:text-left">
                      <div className="text-base sm:text-lg font-black text-foreground leading-none">{openedTopics.length}</div>
                      <div className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">KONU</div>
                    </div>
                    <div className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-center md:text-left">
                      <div className="text-base sm:text-lg font-black text-foreground leading-none">{repliedTopics.length}</div>
                      <div className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">YANIT</div>
                    </div>
                    <div className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-center md:text-left">
                      <div className="text-base sm:text-lg font-black text-foreground leading-none">{likedTopics.length}</div>
                      <div className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">BEĞENİ</div>
                    </div>
                  </div>

                  {currentUser && currentUser.id !== userId && (
                    <div className="pt-2 flex justify-center md:justify-start">
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={cn(
                          "h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 w-full sm:w-auto",
                          isFollowing 
                            ? "bg-muted text-muted-foreground hover:bg-red-500/10 hover:text-red-500 border border-border" 
                            : "vibe-button-primary"
                        )}
                      >
                        {followLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : isFollowing ? (
                          "TAKİBİ BIRAK"
                        ) : (
                          <>
                            <Plus size={14} /> TAKİP ET
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {currentUser && currentUser.id === userId && (
                    <div className="pt-2 flex justify-center md:justify-start">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 bg-muted text-foreground border border-border hover:bg-primary/10 hover:text-primary w-full sm:w-auto"
                      >
                        <Edit size={14} /> PROFİLİ DÜZENLE
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Info Footer */}
              <div className="bg-muted/35 border-t border-border px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-6 items-center justify-center md:justify-start text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary shrink-0" />
                  <span>En Son Görülme: <strong className="text-foreground">{formatLastSeen(profile.last_seen_at, profile.updated_at)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-primary shrink-0" />
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
            <section className="vibe-card p-4 sm:p-6 border-2 border-border text-center relative overflow-hidden w-full max-w-full" aria-label="XP Durumu">
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
            <section className="vibe-card p-4 sm:p-6 border-2 border-border w-full max-w-full" aria-label="Kazanılan Rozetler">
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
      </div>
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
