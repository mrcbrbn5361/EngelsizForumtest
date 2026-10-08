'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  Home, 
  User as UserIcon, 
  ShieldCheck, 
  ShieldAlert, 
  MessageSquare, 
  Mail, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Calendar, 
  Activity, 
  Settings, 
  AlertTriangle,
  ExternalLink,
  Lock,
  Flag,
  UserX
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import { toast } from 'sonner';

interface ProfileViewClientProps {
  targetProfile: {
    id: string;
    username: string;
    full_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    role: 'admin' | 'moderator' | 'user';
    created_at: string;
    xp?: number;
    level?: number;
    is_banned?: boolean;
  };
  stats: {
    topicCount: number;
    commentCount: number;
  };
  recentTopics: any[];
}

export function ProfileViewClient({ targetProfile, stats, recentTopics }: ProfileViewClientProps) {
  const router = useRouter();
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'activity' | 'topics' | 'about' | 'modLogs'>('activity');
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = currentUser?.id === targetProfile.id;
  const isViewerAdmin = currentProfile?.role === 'admin';
  const isViewerModerator = currentProfile?.role === 'moderator' || isViewerAdmin;

  const handleStartDM = () => {
    if (!currentUser) {
      toast.info('Mesaj gönderebilmek için lütfen giriş yapın.');
      router.push(`/login?redirect=/profile/${targetProfile.id}`);
      return;
    }
    if (isOwnProfile) {
      toast.info('Kendinize doğrudan mesaj gönderemezsiniz.');
      return;
    }
    router.push(`/messages?userId=${targetProfile.id}`);
  };

  const handleFollowToggle = () => {
    if (!currentUser) {
      toast.info('Takip edebilmek için lütfen giriş yapın.');
      router.push(`/login?redirect=/profile/${targetProfile.id}`);
      return;
    }
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? `${targetProfile.username} takipten çıkarıldı.` : `${targetProfile.username} takip ediliyor.`);
  };

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="hover:text-sky-600 font-semibold">Üyeler</span>
        <span className="opacity-40">/</span>
        <span className="font-extrabold text-slate-950 dark:text-white">
          @{targetProfile.username} {isOwnProfile && '(Siz)'}
        </span>
      </div>

      {/* Main Profile Box */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        
        {/* Top Header Banner */}
        <div className={`p-6 md:p-8 border-b-2 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 ${
          targetProfile.role === 'admin' 
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent' 
            : targetProfile.role === 'moderator'
              ? 'bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent'
              : 'bg-slate-50 dark:bg-slate-950/40'
        }`}>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
            <UserAvatar
              src={targetProfile.avatar_url}
              username={targetProfile.username}
              name={targetProfile.full_name || targetProfile.username}
              size="xl"
              className="ring-4 ring-white dark:ring-slate-900 shadow-md rounded-2xl"
            />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  {targetProfile.full_name || targetProfile.username}
                </h1>

                {/* Role Specific Badges */}
                {targetProfile.role === 'admin' && (
                  <Badge variant="warning" size="default" className="font-black text-[11px] uppercase tracking-wider gap-1 shadow-xs">
                    <ShieldAlert size={13} />
                    <span>SİSTEM YÖNETİCİSİ</span>
                  </Badge>
                )}

                {targetProfile.role === 'moderator' && (
                  <Badge variant="primary" size="default" className="font-black text-[11px] uppercase tracking-wider gap-1 shadow-xs">
                    <ShieldCheck size={13} />
                    <span>MODERATÖR</span>
                  </Badge>
                )}

                {targetProfile.role === 'user' && (
                  <Badge variant="secondary" size="default" className="font-bold text-[11px] uppercase tracking-wider">
                    <span>TOPLULUK ÜYESİ</span>
                  </Badge>
                )}

                {isOwnProfile && (
                  <Badge variant="success" size="default" className="font-black text-[11px] uppercase tracking-wider">
                    <span>KENDİ PROFİLİNİZ</span>
                  </Badge>
                )}
              </div>

              <div className="text-xs font-mono font-bold text-slate-500">
                @{targetProfile.username}
              </div>

              {targetProfile.bio && (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-xl font-medium pt-1">
                  {targetProfile.bio}
                </p>
              )}

              {/* Quick Metadata */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Kayıt: {format(new Date(targetProfile.created_at), 'd MMMM yyyy', { locale: tr })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award size={14} className="text-amber-500" />
                  <span>XP: <strong className="text-slate-900 dark:text-white font-mono">{targetProfile.xp || 10}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs: Own Profile vs Other Profile */}
          <div className="flex flex-wrap sm:flex-nowrap md:flex-col items-center gap-2.5 shrink-0 w-full md:w-auto">
            {isOwnProfile ? (
              <>
                <Link href="/messages" className="w-full">
                  <Button variant="primary" size="default" className="w-full gap-2 font-bold shadow-xs">
                    <Mail size={15} />
                    <span>Özel Mesajlarım (DM)</span>
                  </Button>
                </Link>
                <Link href="/profile" className="w-full">
                  <Button variant="outline" size="default" className="w-full gap-2 font-bold">
                    <Edit3 size={15} />
                    <span>Profili &amp; Tercihleri Düzenle</span>
                  </Button>
                </Link>
                {isViewerAdmin && (
                  <Link href="/admin" className="w-full">
                    <Button variant="warning" size="default" className="w-full gap-2 font-extrabold uppercase text-xs">
                      <ShieldAlert size={15} />
                      <span>Admin Paneli</span>
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Button 
                  variant="primary" 
                  size="default" 
                  onClick={handleStartDM}
                  className="w-full gap-2 font-bold"
                >
                  <Mail size={15} />
                  <span>Mesaj Gönder (DM)</span>
                </Button>
                <Button 
                  variant={isFollowing ? "outline" : "secondary"} 
                  size="default" 
                  onClick={handleFollowToggle}
                  className="w-full gap-2 font-semibold"
                >
                  <span>{isFollowing ? 'Takip Ediliyor' : 'Takip Et'}</span>
                </Button>

                {/* Moderator / Admin quick moderation actions */}
                {isViewerModerator && (
                  <div className="pt-2 w-full border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 text-center">
                      Moderatör Aksiyonu
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => toast.success(`${targetProfile.username} hakkında denetim raporu kaydedildi.`)}
                      className="w-full gap-1.5 text-xs font-bold"
                    >
                      <Flag size={13} />
                      <span>Üyeyi İncele / Uyar</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 px-6 border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors border-b-2 -mb-[2px] cursor-pointer shrink-0 ${
              activeTab === 'activity'
                ? 'border-sky-600 text-sky-700 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Aktiviteler &amp; Konular ({stats.topicCount})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors border-b-2 -mb-[2px] cursor-pointer shrink-0 ${
              activeTab === 'about'
                ? 'border-sky-600 text-sky-700 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Hakkında &amp; İstatistik
          </button>

          {isViewerModerator && (
            <button
              onClick={() => setActiveTab('modLogs')}
              className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors border-b-2 -mb-[2px] cursor-pointer shrink-0 gap-1.5 flex items-center ${
                activeTab === 'modLogs'
                  ? 'border-amber-500 text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-amber-600 hover:text-amber-800'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Yetki &amp; Moderasyon Kayıtları</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6 md:p-8">
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-950 dark:text-white mb-3">
                Açtığı Son Konular ({recentTopics.length})
              </h2>

              {recentTopics.length > 0 ? (
                <div className="divide-y-2 divide-slate-100 dark:divide-slate-800 border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {recentTopics.map((topic) => (
                    <div key={topic.id} className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <Link 
                          href={`/discussions/${topic.id}`}
                          className="text-sm font-bold text-slate-900 dark:text-white hover:text-sky-600 transition-colors line-clamp-1"
                        >
                          {topic.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                          <span>{format(new Date(topic.created_at), 'd MMM yyyy', { locale: tr })}</span>
                          <span>&bull;</span>
                          <span>{topic.comments_count || 0} Yanıt</span>
                          <span>&bull;</span>
                          <span>{topic.views_count || 0} Görüntülenme</span>
                        </div>
                      </div>
                      <Link href={`/discussions/${topic.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Görüntüle
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-500">
                    Bu üye henüz herkese açık bir tartışma konusu başlatmamış.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-950 dark:text-white">
                  Üye İstatistikleri
                </h2>
                <div className="bg-slate-50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Toplam Konu:</span>
                    <span className="font-mono font-black text-slate-950 dark:text-white">{stats.topicCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Toplam Mesaj / Yanıt:</span>
                    <span className="font-mono font-black text-slate-950 dark:text-white">{stats.commentCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Kazanılan İtibar (XP):</span>
                    <span className="font-mono font-black text-amber-600">{targetProfile.xp || 10}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold py-1">
                    <span className="text-slate-600 dark:text-slate-400">Üyelik Seviyesi:</span>
                    <span className="font-mono font-black text-sky-600">Seviye {targetProfile.level || 1}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-950 dark:text-white">
                  Hakkında
                </h2>
                <div className="bg-slate-50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed min-h-[140px]">
                  {targetProfile.bio || 'Bu kullanıcı henüz hakkında bir biyografi metni eklememiş.'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modLogs' && isViewerModerator && (
            <div className="space-y-4 bg-amber-50/40 dark:bg-amber-950/10 border-2 border-amber-200 dark:border-amber-800/40 rounded-xl p-5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-sm">
                <ShieldCheck size={18} />
                <span>Moderatör Özel İnceleme Paneli</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Bu bölüm yalnızca Moderatör ve Admin yetkisine sahip hesaplar tarafından görüntülenebilir.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                  <span className="text-slate-500 block">Kullanıcı Rolü</span>
                  <span className="font-black text-slate-900 dark:text-white uppercase">{targetProfile.role}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                  <span className="text-slate-500 block">Güvenlik Durumu</span>
                  <span className="font-black text-emerald-600">Doğrulanmış Temiz Hesap</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                  <span className="text-slate-500 block">Sistem ID</span>
                  <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 truncate block">{targetProfile.id}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <ClassicSidebar />
    </div>
  );
}
