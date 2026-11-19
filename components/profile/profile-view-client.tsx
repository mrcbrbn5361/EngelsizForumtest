'use client';

export const dynamic = 'force-dynamic';

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
  UserX,
  History,
  TrendingUp,
  LayoutDashboard,
  Eye
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
    reputation_points?: number;
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
  const [activeTab, setActiveTab] = useState<'activity' | 'about' | 'modLogs'>('activity');
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="bg-surface-raised border border-line px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-fg-4 rounded-lg shadow-sm">
        <Link href="/" className="hover:text-fg transition-colors flex items-center gap-1.5 font-bold">
          <Home size={13} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-fg-4">Üyeler</span>
        <span className="text-slate-700">/</span>
        <span className="text-fg font-black">
          @{targetProfile.username} {isOwnProfile && '(Siz)'}
        </span>
      </div>

      {/* Main Profile Box */}
      <div className="bg-surface-raised border border-line rounded-xl overflow-hidden shadow-lg">
        
        {/* Top Header Banner */}
        <div className={`p-6 md:p-8 border-b border-line flex flex-col md:flex-row items-center md:items-start justify-between gap-8 ${
          targetProfile.role === 'admin' 
            ? 'bg-gradient-to-r from-amber-500/10 via-transparent to-transparent' 
            : targetProfile.role === 'moderator'
              ? 'bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent'
              : 'bg-surface-hover/50'
        }`}>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <UserAvatar
              src={targetProfile.avatar_url}
              username={targetProfile.username}
              name={targetProfile.full_name || targetProfile.username}
              size="xl"
              className="ring-4 ring-line shadow-2xl rounded-2xl"
            />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-fg tracking-tight">
                  {targetProfile.full_name || targetProfile.username}
                </h1>

                {/* Role Specific Badges */}
                {targetProfile.role === 'admin' && (
                  <Badge className="bg-amber-950/40 light:bg-amber-50/40 text-amber-400 light:text-amber-800 border border-amber-800 font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 shadow-sm">
                    <ShieldAlert size={12} className="mr-1" />
                    ADMİN
                  </Badge>
                )}

                {targetProfile.role === 'moderator' && (
                  <Badge className="bg-indigo-950/40 light:bg-indigo-50/40 text-indigo-400 light:text-indigo-700 border border-indigo-800 font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 shadow-sm">
                    <ShieldCheck size={12} className="mr-1" />
                    MODERATÖR
                  </Badge>
                )}

                {targetProfile.role === 'user' && (
                  <Badge className="bg-surface-hover text-fg-3 border border-line font-bold text-[10px] uppercase tracking-widest px-2.5 py-0.5">
                    ÜYE
                  </Badge>
                )}
              </div>

              <div className="text-xs font-mono font-bold text-fg-5 tracking-wider">
                @{targetProfile.username}
              </div>

              {targetProfile.bio && (
                <p className="text-sm text-[#CBD5E1] max-w-xl font-medium leading-relaxed pt-1">
                  {targetProfile.bio}
                </p>
              )}

              {/* Quick Metadata */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 pt-3 text-[11px] font-bold text-fg-4 uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-400 light:text-indigo-700" />
                  <span>Kayıt: {format(new Date(targetProfile.created_at), 'd MMMM yyyy', { locale: tr })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-400 light:text-emerald-700" />
                  <span>Seviye {targetProfile.level || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-amber-400 light:text-amber-800" />
                  <span>XP: {targetProfile.xp || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap md:flex-col items-center gap-3 shrink-0 w-full md:w-auto">
            {isOwnProfile ? (
              <>
                <Link href="/messages" className="w-full">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 shadow-md">
                    <Mail size={16} />
                    <span>Mesajlarım</span>
                  </Button>
                </Link>
                <Link href="/profile" className="w-full">
                  <Button variant="outline" className="w-full border-line bg-surface-hover text-fg hover:bg-line font-bold gap-2">
                    <Edit3 size={16} />
                    <span>Profili Düzenle</span>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleStartDM}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 shadow-md"
                >
                  <Mail size={16} />
                  <span>Mesaj Gönder</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleFollowToggle}
                  className={`w-full border-line font-bold ${isFollowing ? 'bg-indigo-900/20 light:bg-indigo-100/20 text-indigo-400 light:text-indigo-700' : 'bg-surface-hover text-white hover:bg-line'}`}
                >
                  <span>{isFollowing ? 'Takip Ediliyor' : 'Takip Et'}</span>
                </Button>
              </>
            )}
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 px-6 border-b border-line bg-surface overflow-x-auto scrollbar-hide">
          {[
            { id: 'activity', label: 'Etkinlikler', count: stats.topicCount },
            { id: 'about', label: 'İstatistik & Hakkında' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[1px] cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400 light:text-indigo-700 bg-surface-raised/50'
                  : 'border-transparent text-fg-5 hover:text-fg'
              }`}
            >
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
            </button>
          ))}

          {isViewerModerator && (
            <button
              onClick={() => setActiveTab('modLogs')}
              className={`px-5 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[1px] cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'modLogs'
                  ? 'border-amber-500 text-amber-400 light:text-amber-800 bg-surface-raised/50'
                  : 'border-transparent text-amber-600/70 hover:text-amber-500'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Moderasyon</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6 md:p-8 bg-surface-raised">
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <History size={16} className="text-indigo-400 light:text-indigo-700" />
                <h2 className="text-sm font-black uppercase tracking-widest text-fg">
                  Açtığı Son Tartışmalar
                </h2>
              </div>

              {recentTopics.length > 0 ? (
                <div className="grid gap-4">
                  {recentTopics.map((topic) => (
                    <div key={topic.id} className="p-5 bg-surface-hover border border-line rounded-xl hover:border-indigo-500/50 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="space-y-2 min-w-0">
                        <Link 
                          href={`/discussions/${topic.id}`}
                          className="text-base font-bold text-[#F8FAFC] group-hover:text-indigo-400 light:group-hover:text-indigo-700 transition-colors line-clamp-1 tracking-tight"
                        >
                          {topic.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-fg-4 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5"><Calendar size={12} className="text-indigo-400 light:text-indigo-700" /> {format(new Date(topic.created_at), 'd MMM yyyy', { locale: tr })}</span>
                          <span className="text-slate-700">|</span>
                          <span className="flex items-center gap-1.5"><MessageSquare size={12} className="text-indigo-400 light:text-indigo-700" /> {topic.comments_count || 0} Yanıt</span>
                          <span className="text-slate-700">|</span>
                          <span className="flex items-center gap-1.5"><Eye size={12} className="text-indigo-400 light:text-indigo-700" /> {topic.views_count || 0} İzleme</span>
                        </div>
                      </div>
                      <Link href={`/discussions/${topic.id}`} className="shrink-0">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto border-line bg-surface hover:bg-indigo-600 hover:text-white font-bold text-[11px] uppercase tracking-wider">
                          Konuya Git
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-surface rounded-xl border border-dashed border-line">
                  <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={20} className="text-fg-6" />
                  </div>
                  <p className="text-xs font-bold text-fg-5 uppercase tracking-widest">
                    Bu üye henüz konu başlatmamış.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Stats Column */}
              <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-indigo-400 light:text-indigo-700" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-fg">Performans</h2>
                </div>
                <div className="bg-surface border border-line rounded-xl p-6 space-y-4 shadow-inner">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider border-b border-line pb-3">
                    <span className="text-fg-5">Toplam Konu</span>
                    <span className="text-fg font-mono text-sm">{stats.topicCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider border-b border-line pb-3">
                    <span className="text-fg-5">Toplam Mesaj</span>
                    <span className="text-fg font-mono text-sm">{stats.commentCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider border-b border-line pb-3">
                    <span className="text-fg-5">İtibar (XP)</span>
                    <span className="text-amber-400 light:text-amber-800 font-mono text-sm">{targetProfile.xp || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                    <span className="text-fg-5">Hesap Seviyesi</span>
                    <span className="text-indigo-400 light:text-indigo-700 font-mono text-sm">{targetProfile.level || 1}</span>
                  </div>
                </div>
              </div>

              {/* Bio Column */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-2">
                  <UserIcon size={16} className="text-indigo-400 light:text-indigo-700" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-fg">Biyografi</h2>
                </div>
                <div className="bg-surface-hover border border-line rounded-xl p-6 text-sm text-[#CBD5E1] leading-relaxed font-medium min-h-[160px] shadow-sm italic">
                  {targetProfile.bio || 'Kullanıcı henüz kendisi hakkında bir bilgi girmemiş.'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modLogs' && isViewerModerator && (
            <div className="space-y-6">
              <div className="bg-amber-950/20 light:bg-amber-50/20 border border-amber-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 text-amber-400 light:text-amber-800 font-black text-sm uppercase tracking-widest mb-4">
                  <ShieldCheck size={20} />
                  <span>Moderatör Denetim Paneli</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-surface border border-line rounded-lg">
                    <span className="text-[10px] font-black text-fg-5 uppercase tracking-widest block mb-1">Rol</span>
                    <span className="text-sm font-black text-fg uppercase">{targetProfile.role}</span>
                  </div>
                  <div className="p-4 bg-surface border border-line rounded-lg">
                    <span className="text-[10px] font-black text-fg-5 uppercase tracking-widest block mb-1">Durum</span>
                    <span className="text-sm font-black text-emerald-400 light:text-emerald-700 uppercase">DOĞRULANMIŞ</span>
                  </div>
                  <div className="p-4 bg-surface border border-line rounded-lg min-w-0">
                    <span className="text-[10px] font-black text-fg-5 uppercase tracking-widest block mb-1">Sistem ID</span>
                    <span className="text-[10px] font-mono text-fg-4 truncate block">{targetProfile.id}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="destructive" className="bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest px-6 h-9 shadow-md">
                    <Flag size={14} className="mr-2" />
                    Üyeyi Kısıtla / Uyar
                  </Button>
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
