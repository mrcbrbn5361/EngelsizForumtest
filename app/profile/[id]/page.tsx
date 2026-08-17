'use client';

import React, { useState, useEffect, useMemo, use, useId } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { 
  User, Award, Sparkles, Zap, Flame, Star, 
  MessageSquare, BookOpen, Heart, Calendar, Loader2, ArrowLeft, Clock,
  Plus, Edit, X, Send, AlertCircle, Users, UserCheck, UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';
import { toggleFollowAction } from '@/app/actions';

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
  const [activeTab, setActiveTab] = useState<'opened' | 'replied' | 'liked' | 'followers' | 'following'>('opened');
  const [openedTopics, setOpenedTopics] = useState<any[]>([]);
  const [repliedTopics, setRepliedTopics] = useState<any[]>([]);
  const [likedTopics, setLikedTopics] = useState<any[]>([]);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [myFollowedUserIds, setMyFollowedUserIds] = useState<Set<string>>(new Set());
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fullNameInputId = useId();
  const usernameInputId = useId();
  const bioInputId = useId();
  const avatarInputId = useId();

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

  const targetUserId = profile?.id || userId;

  useEffect(() => {
    async function fetchUserProfile() {
      if (!userId) return;
      setLoading(true);

      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
        let profileQuery = supabase.from('profiles').select('*');
        if (isUUID) {
          profileQuery = profileQuery.eq('id', userId);
        } else {
          profileQuery = profileQuery.eq('username', userId);
        }

        let { data, error } = await profileQuery.maybeSingle();

        // Fallback if not found by UUID/username
        if (!data && isUUID) {
          const { data: byUsername } = await supabase.from('profiles').select('*').eq('username', userId).maybeSingle();
          if (byUsername) data = byUsername;
        }

        if (error) throw error;
        if (data) {
          const resolvedId = data.id;

          const { count: followers } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', resolvedId);
          
          const { count: following } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', resolvedId);

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !profile || updateLoading) return;
    setEditError(null);

    const cleanUsername = editForm.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (editForm.username.trim() && cleanUsername !== editForm.username.trim().toLowerCase()) {
      setEditError('Kullanıcı adı yalnızca İngilizce harfler, rakamlar ve alt çizgi (_) içerebilir.');
      return;
    }

    if (editForm.username.trim().length > 0 && editForm.username.trim().length < 3) {
      setEditError('Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }

    setUpdateLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name.trim(),
          username: cleanUsername || null,
          bio: editForm.bio.trim() || null,
          avatar_url: editForm.avatar_url.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      setProfile(prev => prev ? { 
        ...prev, 
        full_name: editForm.full_name.trim(),
        username: cleanUsername || null,
        bio: editForm.bio.trim() || null,
        avatar_url: editForm.avatar_url.trim() || null
      } : null);
      
      setIsEditing(false);
      toast.success('Profil başarıyla güncellendi.');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setEditError(err?.message || 'Profil güncellenirken bir hata oluştu.');
      toast.error('Profil güncellenemedi.');
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    async function checkFollowStatus() {
      if (!currentUser || !targetUserId || currentUser.id === targetUserId) return;
      try {
        const { data } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetUserId)
          .maybeSingle();
        
        if (data) setIsFollowing(true);

        // Also fetch user's following IDs to show follow status in member lists
        const { data: myFollows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUser.id);

        if (myFollows) {
          setMyFollowedUserIds(new Set(myFollows.map(f => f.following_id)));
        }
      } catch (err) {
        console.error('Error checking follow status:', err);
      }
    }
    
    if (targetUserId) {
      checkFollowStatus();
    }
  }, [targetUserId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !targetUserId || followLoading) return;
    if (currentUser.id === targetUserId) {
      toast.info('Kendinizi takip edemezsiniz.');
      return;
    }

    setFollowLoading(true);
    try {
      const res = await toggleFollowAction(targetUserId);
      if (!res.success) {
        toast.error(res.error || 'İşlem gerçekleştirilemedi.');
        return;
      }

      const newIsFollowing = Boolean(res.following);
      setIsFollowing(newIsFollowing);
      setMyFollowedUserIds(prev => {
        const next = new Set(prev);
        if (newIsFollowing) {
          next.add(targetUserId);
        } else {
          next.delete(targetUserId);
        }
        return next;
      });

      setProfile(prev => {
        if (!prev) return null;
        const currentCount = prev.followers_count ?? 0;
        return {
          ...prev,
          followers_count: newIsFollowing ? currentCount + 1 : Math.max(0, currentCount - 1)
        };
      });

      toast.success(newIsFollowing ? 'Kullanıcı takip ediliyor.' : 'Takip bırakıldı.');
    } catch (err) {
      console.error('Error toggling follow:', err);
      toast.error('İşlem gerçekleştirilemedi.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMemberFollowToggle = async (memberId: string) => {
    if (!currentUser || !memberId || currentUser.id === memberId) return;

    try {
      const res = await toggleFollowAction(memberId);
      if (!res.success) {
        toast.error(res.error || 'İşlem gerçekleştirilemedi.');
        return;
      }

      const newIsFollowing = Boolean(res.following);
      setMyFollowedUserIds(prev => {
        const next = new Set(prev);
        if (newIsFollowing) {
          next.add(memberId);
        } else {
          next.delete(memberId);
        }
        return next;
      });

      if (memberId === targetUserId) {
        setIsFollowing(newIsFollowing);
        setProfile(prev => {
          if (!prev) return null;
          const currentCount = prev.followers_count ?? 0;
          return {
            ...prev,
            followers_count: newIsFollowing ? currentCount + 1 : Math.max(0, currentCount - 1)
          };
        });
      }

      toast.success(newIsFollowing ? 'Kullanıcı takip ediliyor.' : 'Takip bırakıldı.');
    } catch (err) {
      console.error('Error toggling member follow:', err);
      toast.error('İşlem başarısız oldu.');
    }
  };

  useEffect(() => {
    async function fetchUserActivity() {
      if (!targetUserId) return;
      setLoadingContent(true);

      try {
        const { data: opened, error: openedErr } = await supabase
          .from('topics')
          .select(`
            *,
            author:profiles(username, avatar_url, full_name, role, level, xp, is_verified),
            category:categories(name, slug, description, icon, color)
          `)
          .eq('author_id', targetUserId)
          .order('created_at', { ascending: false });

        if (!openedErr && opened) {
          setOpenedTopics(opened);
        }

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
          .eq('author_id', targetUserId);

        if (!commentsErr && commentsData) {
          const uniqueTopicsMap = new Map();
          commentsData.forEach((c: any) => {
            if (c.topic) {
              uniqueTopicsMap.set(c.topic.id, c.topic);
            }
          });
          setRepliedTopics(Array.from(uniqueTopicsMap.values()));
        }

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
          .eq('user_id', targetUserId)
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

        // Fetch Followers list
        const { data: followsData } = await supabase
          .from('follows')
          .select('follower_id, created_at')
          .eq('following_id', targetUserId)
          .order('created_at', { ascending: false });

        if (followsData && followsData.length > 0) {
          const followerIds = followsData.map(f => f.follower_id);
          const { data: followerProfiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, role, level, xp, is_verified, bio, last_seen_at')
            .in('id', followerIds);

          if (followerProfiles) {
            const profileMap = new Map(followerProfiles.map(p => [p.id, p]));
            const enriched = followsData
              .map(f => profileMap.get(f.follower_id))
              .filter(Boolean);
            setFollowersList(enriched);
          }
        } else {
          setFollowersList([]);
        }

        // Fetch Following list
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id, created_at')
          .eq('follower_id', targetUserId)
          .order('created_at', { ascending: false });

        if (followingData && followingData.length > 0) {
          const followingIds = followingData.map(f => f.following_id);
          const { data: followingProfiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, role, level, xp, is_verified, bio, last_seen_at')
            .in('id', followingIds);

          if (followingProfiles) {
            const profileMap = new Map(followingProfiles.map(p => [p.id, p]));
            const enriched = followingData
              .map(f => profileMap.get(f.following_id))
              .filter(Boolean);
            setFollowingList(enriched);
          }
        } else {
          setFollowingList([]);
        }

      } catch (err) {
        console.error('Error fetching user activity:', err);
      } finally {
        setLoadingContent(false);
      }
    }

    if (targetUserId) {
      fetchUserActivity();
    }
  }, [targetUserId]);

  const badgesList = useMemo<Badge[]>(() => [
    {
      id: 'welcome',
      name: 'İlk Adım',
      description: 'EngelsizForum topluluğuna katıldınız.',
      requirement: 'Hesap oluşturun',
      icon: <Sparkles className="size-5" />,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      unlockedAtXp: 0
    },
    {
      id: 'active_member',
      name: 'Aktif Katılımcı',
      description: 'Topluluk tartışmalarına katılarak fikirlerinizi paylaştınız.',
      requirement: '100 XP Barajı',
      icon: <Flame className="size-5" />,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      unlockedAtXp: 100
    },
    {
      id: 'a11y_champion',
      name: 'Erişilebilirlik Elçisi',
      description: 'Disleksi font, biyonik okuma ve yüksek kontrast özellikleri kullandınız.',
      requirement: '300 XP Barajı',
      icon: <Award className="size-5" />,
      color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      unlockedAtXp: 300
    },
    {
      id: 'inclusive_leader',
      name: 'Kapsayıcı Lider',
      description: 'Sistemdeki diğer kullanıcılara çözüm sunup en iyi cevap işaretlendiniz.',
      requirement: '500 XP Barajı',
      icon: <Star className="size-5" />,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
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
    
    if (diffMs < 10 * 60 * 1000) {
      return 'Şu an aktif';
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 60) {
      return `${diffMinutes} dakika önce`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} saat önce`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Dün';
    return `${diffDays} gün önce`;
  }

  const isOnline = useMemo(() => {
    const activeTimeStr = profile?.last_seen_at || profile?.updated_at;
    if (!activeTimeStr) return false;
    const diffMs = new Date().getTime() - new Date(activeTimeStr).getTime();
    return diffMs < 10 * 60 * 1000;
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="animate-spin text-sky-400 size-8" />
          <p className="text-xs font-semibold text-slate-400">Profil yükleniyor...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="bg-[#111726]/80 p-8 rounded-2xl border border-white/[0.08] max-w-md w-full space-y-4">
            <div className="size-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center mx-auto border border-rose-500/20">
              <User size={24} />
            </div>
            <h1 className="text-lg font-bold text-slate-100">Kullanıcı Bulunamadı</h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              Aradığınız profil mevcut değil veya silinmiş olabilir.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors"
            >
              <ArrowLeft size={13} /> Ana Sayfaya Dön
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsEditing(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-[#111726] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden relative z-10 p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h2 className="text-base font-bold text-slate-100">Profili Düzenle</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            {editError && (
              <div 
                role="alert" 
                aria-live="assertive"
                className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor={fullNameInputId} className="text-xs font-semibold text-slate-300">
                  Ad Soyad
                </label>
                <input
                  id={fullNameInputId}
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 text-slate-200 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  placeholder="Adınız Soyadınız"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor={usernameInputId} className="text-xs font-semibold text-slate-300">
                  Kullanıcı Adı
                </label>
                <input
                  id={usernameInputId}
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 text-slate-200 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  placeholder="kullaniciadi"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor={bioInputId} className="text-xs font-semibold text-slate-300">
                  Biyografi
                </label>
                <textarea
                  id={bioInputId}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full h-20 p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 text-slate-200 text-xs focus:ring-1 focus:ring-sky-500 outline-none resize-none"
                  placeholder="Kendinizden bahsedin..."
                  maxLength={160}
                />
                <div className="text-[10px] text-right text-slate-500 font-mono">{editForm.bio.length}/160</div>
              </div>

              <div className="space-y-1">
                <label htmlFor={avatarInputId} className="text-xs font-semibold text-slate-300">
                  Avatar URL
                </label>
                <input
                  id={avatarInputId}
                  type="url"
                  value={editForm.avatar_url}
                  onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 text-slate-200 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-xl font-semibold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 py-2 rounded-xl font-semibold text-xs bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {updateLoading ? <Loader2 className="animate-spin mx-auto size-4" /> : "Kaydet"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-7xl space-y-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors">
            <ArrowLeft size={13} /> Tartışmalara Geri Dön
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main User Profile & Tabs (8 cols) */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            
            {/* Header Box */}
            <header className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="p-6 sm:p-7 flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                
                <UserAvatar 
                  src={profile.avatar_url}
                  username={profile.username}
                  name={profile.full_name}
                  size="xl"
                  className="size-20 rounded-2xl border border-sky-500/30 shrink-0"
                  badge={
                    isOnline && (
                      <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-400 border-2 border-[#111726]" title="Çevrimiçi" />
                    )
                  }
                />

                <div className="space-y-2 min-w-0 flex-1 w-full">
                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                    <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-semibold rounded-md">
                      {profile.role === 'admin' ? 'Yönetici' : profile.role === 'moderator' ? 'Moderatör' : 'Üye'}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold rounded-md flex items-center gap-1">
                      <Zap size={10} className="fill-current" /> Seviye {userLevel}
                    </span>
                    {isOnline ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold rounded-md">
                        Çevrimiçi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-semibold rounded-md border border-white/[0.06]">
                        Çevrimdışı
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 truncate">
                    {profile.full_name || profile.username || 'Engelsiz Kullanıcı'}
                  </h2>
                  
                  {profile.bio && (
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                      {profile.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-slate-400">
                    <span className="text-sky-400 font-mono">@{profile.username || 'isimsiz'}</span>
                    <span className="text-slate-600">•</span>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('followers')}
                      className="text-slate-300 hover:text-sky-400 transition-colors cursor-pointer font-medium underline-offset-2 hover:underline"
                    >
                      {profile.followers_count || 0} Takipçi
                    </button>
                    <span className="text-slate-600">•</span>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('following')}
                      className="text-slate-300 hover:text-sky-400 transition-colors cursor-pointer font-medium underline-offset-2 hover:underline"
                    >
                      {profile.following_count || 0} Takip
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 pt-1 w-full">
                    <div className="px-3 py-1.5 bg-slate-900/60 border border-white/[0.06] rounded-xl text-center md:text-left">
                      <div className="text-xs font-bold text-slate-200 font-mono">{openedTopics.length}</div>
                      <div className="text-[9px] text-slate-400">Konu</div>
                    </div>
                    <div className="px-3 py-1.5 bg-slate-900/60 border border-white/[0.06] rounded-xl text-center md:text-left">
                      <div className="text-xs font-bold text-slate-200 font-mono">{repliedTopics.length}</div>
                      <div className="text-[9px] text-slate-400">Yanıt</div>
                    </div>
                    <div className="px-3 py-1.5 bg-slate-900/60 border border-white/[0.06] rounded-xl text-center md:text-left">
                      <div className="text-xs font-bold text-slate-200 font-mono">{likedTopics.length}</div>
                      <div className="text-[9px] text-slate-400">Beğeni</div>
                    </div>
                  </div>

                  {currentUser && currentUser.id !== targetUserId && (
                    <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`h-8 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isFollowing 
                            ? 'bg-slate-800 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 border border-white/[0.06]' 
                            : 'bg-sky-600 hover:bg-sky-500 text-white'
                        }`}
                      >
                        {followLoading ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : isFollowing ? (
                          "Takibi Bırak"
                        ) : (
                          <>
                            <Plus size={13} /> Takip Et
                          </>
                        )}
                      </button>

                      <Link
                        href={`/messages?userId=${targetUserId}`}
                        className="h-8 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 bg-[#0b0f19] hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-sky-500/30 hover:border-sky-500/60"
                      >
                        <Send size={12} /> Mesaj Gönder
                      </Link>
                    </div>
                  )}

                  {currentUser && currentUser.id === targetUserId && (
                    <div className="pt-2 flex justify-center md:justify-start">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="h-8 px-3.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/[0.08] cursor-pointer"
                      >
                        <Edit size={13} /> Profili Düzenle
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Info Footer */}
              <div className="bg-slate-950/40 border-t border-white/[0.06] px-6 py-2.5 flex flex-wrap gap-4 items-center justify-center md:justify-start text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-sky-400 shrink-0" />
                  <span>Son Aktivite: <strong className="text-slate-300 font-normal">{formatLastSeen(profile.last_seen_at, profile.updated_at)}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-sky-400 shrink-0" />
                  <span>Katılım: <strong className="text-slate-300 font-normal">{new Date(profile.created_at).toLocaleDateString('tr-TR')}</strong></span>
                </div>
              </div>
            </header>

            {/* TABBED AREA FOR USER CONTRIBUTIONS */}
            <section className="space-y-3" aria-label="Kullanıcı Etkinlikleri">
              <div className="flex border-b border-white/[0.08] gap-1 overflow-x-auto pb-px">
                <button
                  onClick={() => setActiveTab('opened')}
                  className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'opened'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen size={13} /> Açtığı Konular ({openedTopics.length})
                </button>
                <button
                  onClick={() => setActiveTab('replied')}
                  className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'replied'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare size={13} /> Yanıtladığı ({repliedTopics.length})
                </button>
                <button
                  onClick={() => setActiveTab('liked')}
                  className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'liked'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Heart size={13} /> Beğendiği ({likedTopics.length})
                </button>
                <button
                  onClick={() => setActiveTab('followers')}
                  className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'followers'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users size={13} /> Takipçiler ({profile.followers_count || followersList.length})
                </button>
                <button
                  onClick={() => setActiveTab('following')}
                  className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'following'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck size={13} /> Takip Edilenler ({profile.following_count || followingList.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {loadingContent ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-sky-400 size-5" />
                    <span className="text-xs text-slate-400">İçerikler yükleniyor...</span>
                  </div>
                ) : (
                  <>
                    {activeTab === 'opened' && (
                      openedTopics.length > 0 ? (
                        openedTopics.map(topic => <CompactTopicCard key={topic.id} topic={topic} />)
                      ) : (
                        <EmptyState message="Bu kullanıcı henüz bir konu başlatmamış." />
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

                    {activeTab === 'followers' && (
                      followersList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {followersList.map(member => (
                            <MemberCard 
                              key={member.id} 
                              member={member} 
                              currentUserId={currentUser?.id}
                              isFollowing={myFollowedUserIds.has(member.id)}
                              onFollowToggle={() => handleMemberFollowToggle(member.id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="Henüz bu kullanıcıyı takip eden kimse yok." />
                      )
                    )}

                    {activeTab === 'following' && (
                      followingList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {followingList.map(member => (
                            <MemberCard 
                              key={member.id} 
                              member={member} 
                              currentUserId={currentUser?.id}
                              isFollowing={myFollowedUserIds.has(member.id)}
                              onFollowToggle={() => handleMemberFollowToggle(member.id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="Bu kullanıcı henüz kimseyi takip etmiyor." />
                      )
                    )}
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Gamification & Badges Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-4">
            
            {/* Level & XP Status */}
            <section className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 text-center backdrop-blur-md space-y-4" aria-label="XP Durumu">
              <h3 className="text-xs font-bold text-slate-300 pb-2 border-b border-white/[0.06]">Seviye ve Puan Durumu</h3>
              
              <div className="relative size-28 mx-auto flex items-center justify-center">
                <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-slate-800" 
                    strokeWidth="7" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-sky-500 transition-all duration-500 ease-out" 
                    strokeWidth="7" 
                    fill="transparent" 
                    strokeDasharray="251"
                    strokeDashoffset={251 - (251 * xpProgressPercentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="text-center z-10">
                  <span className="text-2xl font-bold text-slate-100 font-mono">{userLevel}</span>
                  <span className="block text-[9px] font-medium text-slate-400">SEVİYE</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>{xpInCurrentLevel} XP</span>
                  <span>{xpNeededForNextLevel} XP</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/[0.06]">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all duration-500" 
                    style={{ width: `${xpProgressPercentage}%` }} 
                  />
                </div>
                <p className="text-[11px] font-semibold text-sky-400 pt-0.5">
                  Toplam: {userXp} XP
                </p>
              </div>
            </section>

            {/* Badges Section */}
            <section className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-md space-y-3" aria-label="Kazanılan Rozetler">
              <h3 className="text-xs font-bold text-slate-300 pb-2 border-b border-white/[0.06]">Kazanılan Rozetler</h3>
              <div className="space-y-2">
                {badgesList.map((badge) => {
                  const isUnlocked = userXp >= badge.unlockedAtXp;
                  return (
                    <div 
                      key={badge.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all ${
                        isUnlocked 
                          ? `${badge.color}` 
                          : 'bg-slate-900/40 border-white/[0.04] opacity-40 grayscale'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-900/80 shrink-0 border border-white/[0.06]">
                        {badge.icon}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-200">
                          {badge.name}
                        </h4>
                        <p className="text-[11px] leading-relaxed text-slate-400">
                          {badge.description}
                        </p>
                        <span className="inline-block text-[9px] font-medium text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-white/[0.04] mt-0.5">
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
      <Footer />
    </div>
  );
}

function CompactTopicCard({ topic }: { topic: any }) {
  return (
    <div className="bg-[#111726]/80 p-4 rounded-xl border border-white/[0.06] hover:border-sky-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.2 text-[10px] font-medium rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {topic.category?.name || 'Genel'}
          </span>
          <span className="text-[11px] text-slate-500">
            {new Date(topic.created_at).toLocaleDateString('tr-TR')}
          </span>
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-sky-400 transition-colors truncate">
          <Link href={`/discussions/${topic.id}`}>
            {topic.title}
          </Link>
        </h3>
      </div>

      <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <MessageSquare size={13} className="text-sky-400" />
          {(topic.comments as any)?.[0]?.count || 0} yanıt
        </span>
        <span className="flex items-center gap-1">
          <Heart size={13} className="text-rose-400" />
          {topic.likes_count || 0} beğeni
        </span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-[#111726]/40 p-8 text-center border border-dashed border-white/[0.08] rounded-xl">
      <p className="text-xs text-slate-400">
        {message}
      </p>
    </div>
  );
}

function MemberCard({ 
  member, 
  currentUserId, 
  isFollowing, 
  onFollowToggle 
}: { 
  member: any; 
  currentUserId?: string; 
  isFollowing: boolean; 
  onFollowToggle: () => void;
}) {
  const isMe = currentUserId === member.id;
  const isOnline = member.last_seen_at && (new Date().getTime() - new Date(member.last_seen_at).getTime() < 5 * 60 * 1000);

  return (
    <div className="bg-[#111726]/80 p-4 rounded-xl border border-white/[0.06] hover:border-sky-500/40 transition-all flex flex-col justify-between gap-3 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${member.id}`} className="shrink-0 relative group">
          <UserAvatar 
            src={member.avatar_url}
            username={member.username}
            name={member.full_name}
            size="md"
            className="size-11 rounded-xl border border-white/[0.08] group-hover:border-sky-500/60 transition-colors"
          />
          {isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-[#111726]" title="Çevrimiçi" />
          )}
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link 
              href={`/profile/${member.id}`}
              className="text-xs font-bold text-slate-200 hover:text-sky-400 transition-colors truncate"
            >
              {member.full_name || member.username || 'Kullanıcı'}
            </Link>
            <span className="px-1.5 py-0.2 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-semibold rounded">
              {member.role === 'admin' ? 'Yönetici' : member.role === 'moderator' ? 'Mod' : 'Üye'}
            </span>
          </div>
          <p className="text-[11px] text-sky-400 font-mono">@{member.username || 'isimsiz'}</p>
          {member.bio && (
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {member.bio}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
        {currentUserId && !isMe && (
          <>
            <button
              type="button"
              onClick={onFollowToggle}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                isFollowing 
                  ? 'bg-slate-800 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 border border-white/[0.06]' 
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={12} /> Takip Ediliyor
                </>
              ) : (
                <>
                  <UserPlus size={12} /> Takip Et
                </>
              )}
            </button>
            <Link
              href={`/messages?userId=${member.id}`}
              className="py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-[#0b0f19] hover:bg-slate-800 text-sky-400 border border-sky-500/30 hover:border-sky-500/60 transition-colors flex items-center gap-1"
              title="Mesaj Gönder"
            >
              <Send size={11} /> Mesaj
            </Link>
          </>
        )}
        {isMe && (
          <span className="text-[11px] text-slate-500 italic">Sizsiniz</span>
        )}
      </div>
    </div>
  );
}
