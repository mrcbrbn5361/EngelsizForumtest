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
      <div className="bg-[#111B2E] border border-[#1E293B] px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 rounded-lg shadow-sm">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5 font-bold">
          <Home size={13} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-400">Üyeler</span>
        <span className="text-slate-700">/</span>
        <span className="text-white font-black">
          @{targetProfile.username} {isOwnProfile && '(Siz)'}
        </span>
      </div>

      {/* Main Profile Box */}
      <div className="bg-[#111B2E] border border-[#1E293B] rounded-xl overflow-hidden shadow-lg">
        
        {/* Top Header Banner */}
        <div className={`p-6 md:p-8 border-b border-[#1E293B] flex flex-col md:flex-row items-center md:items-start justify-between gap-8 ${
          targetProfile.role === 'admin' 
            ? 'bg-gradient-to-r from-amber-500/10 via-transparent to-transparent' 
            : targetProfile.role === 'moderator'
              ? 'bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent'
              : 'bg-[#18243A]/50'
        }`}>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <UserAvatar
              src={targetProfile.avatar_url}
              username={targetProfile.username}
              name={targetProfile.full_name || targetProfile.username}
              size="xl"
              className="ring-4 ring-[#1E293B] shadow-2xl rounded-2xl"
            />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {targetProfile.full_name || targetProfile.username}
                </h1>

                {/* Role Specific Badges */}
                {targetProfile.role === 'admin' && (
                  <Badge className="bg-amber-950/40 text-amber-400 border border-amber-800 font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 shadow-sm">
                    <ShieldAlert size={12} className="mr-1" />
                    ADMİN
                  </Badge>
                )}

                {targetProfile.role === 'moderator' && (
                  <Badge className="bg-indigo-950/40 text-indigo-400 border border-indigo-800 font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 shadow-sm">
                    <ShieldCheck size={12} className="mr-1" />
                    MODERATÖR
                  </Badge>
                )}

                {targetProfile.role === 'user' && (
                  <Badge className="bg-[#18243A] text-slate-300 border border-[#1E293B] font-bold text-[10px] uppercase tracking-widest px-2.5 py-0.5">
                    ÜYE
                  </Badge>
                )}
              </div>

              <div className="text-xs font-mono font-bold text-slate-500 tracking-wider">
                @{targetProfile.username}
              </div>

              {targetProfile.bio && (
                <p className="text-sm text-[#CBD5E1] max-w-xl font-medium leading-relaxed pt-1">
                  {targetProfile.bio}
                </p>
              )}

              {/* Quick Metadata */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 pt-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-400" />
                  <span>Kayıt: {format(new Date(targetProfile.created_at), 'd MMMM yyyy', { locale: tr })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span>Seviye {targetProfile.level || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-amber-400" />
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
                  <Button variant="outline" className="w-full border-[#1E293B] bg-[#18243A] text-white hover:bg-[#1E293B] font-bold gap-2">
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
                  className={`w-full border-[#1E293B] font-bold ${isFollowing ? 'bg-indigo-900/20 text-indigo-400' : 'bg-[#18243A] text-white hover:bg-[#1E293B]'}`}
                >
                  <span>{isFollowing ? 'Takip Ediliyor' : 'Takip Et'}</span>
                </Button>
              </>
            )}
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 px-6 border-b border-[#1E293B] bg-[#0B1220] overflow-x-auto scrollbar-hide">
          {[
            { id: 'activity', label: 'Etkinlikler', count: stats.topicCount },
            { id: 'about', label: 'İstatistik & Hakkında' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[1px] cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400 bg-[#111B2E]/50'
                  : 'border-transparent text-slate-500 hover:text-white'
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
                  ? 'border-amber-500 text-amber-400 bg-[#111B2E]/50'
                  : 'border-transparent text-amber-600/70 hover:text-amber-500'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Moderasyon</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6 md:p-8 bg-[#111B2E]">
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <History size={16} className="text-indigo-400" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">
                  Açtığı Son Tartışmalar
                </h2>
              </div>

              {recentTopics.length > 0 ? (
                <div className="grid gap-4">
                  {recentTopics.map((topic) => (
                    <div key={topic.id} className="p-5 bg-[#18243A] border border-[#1E293B] rounded-xl hover:border-indigo-500/50 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="space-y-2 min-w-0">
                        <Link 
                          href={`/discussions/${topic.id}`}
                          className="text-base font-bold text-[#F8FAFC] group-hover:text-indigo-400 transition-colors line-clamp-1 tracking-tight"
                        >
                          {topic.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5"><Calendar size={12} className="text-indigo-400" /> {format(new Date(topic.created_at), 'd MMM yyyy', { locale: tr })}</span>
                          <span className="text-slate-700">|</span>
                          <span className="flex items-center gap-1.5"><MessageSquare size={12} className="text-indigo-400" /> {topic.comments_count || 0} Yanıt</span>
                          <span className="text-slate-700">|</span>
                          <span className="flex items-center gap-1.5"><Eye size={12} className="text-indigo-400" /> {topic.views_count || 0} İzleme</span>
                        </div>
                      </div>
                      <Link href={`/discussions/${topic.id}`} className="shrink-0">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto border-[#1E293B] bg-[#0B1220] hover:bg-indigo-600 hover:text-white font-bold text-[11px] uppercase tracking-wider">
                          Konuya Git
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-[#0B1220] rounded-xl border border-dashed border-[#1E293B]">
                  <div className="w-12 h-12 rounded-full bg-[#18243A] flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={20} className="text-slate-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
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
                  <Activity size={16} className="text-indigo-400" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Performans</h2>
                </div>
                <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-6 space-y-4 shadow-inner">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider border-b border-[#1E293B] pb-3">
                    <span className="text-slate-500">Toplam Konu</span>
                    <span className="text-white font-mono text-sm">{stats.topicCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider border-b border-[#1E293B] pb-3">
                    <span className="text-slate-500">Toplam Mesaj</span>
                    <span className="text-white font-mono text-sm">{stats.commentCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider border-b border-[#1E293B] pb-3">
                    <span className="text-slate-500">İtibar (XP)</span>
                    <span className="text-amber-400 font-mono text-sm">{targetProfile.xp || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                    <span className="text-slate-500">Hesap Seviyesi</span>
                    <span className="text-indigo-400 font-mono text-sm">{targetProfile.level || 1}</span>
                  </div>
                </div>
              </div>

              {/* Bio Column */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-2">
                  <UserIcon size={16} className="text-indigo-400" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Biyografi</h2>
                </div>
                <div className="bg-[#18243A] border border-[#1E293B] rounded-xl p-6 text-sm text-[#CBD5E1] leading-relaxed font-medium min-h-[160px] shadow-sm italic">
                  {targetProfile.bio || 'Kullanıcı henüz kendisi hakkında bir bilgi girmemiş.'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modLogs' && isViewerModerator && (
            <div className="space-y-6">
              <div className="bg-amber-950/20 border border-amber-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 text-amber-400 font-black text-sm uppercase tracking-widest mb-4">
                  <ShieldCheck size={20} />
                  <span>Moderatör Denetim Paneli</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-[#0B1220] border border-[#1E293B] rounded-lg">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Rol</span>
                    <span className="text-sm font-black text-white uppercase">{targetProfile.role}</span>
                  </div>
                  <div className="p-4 bg-[#0B1220] border border-[#1E293B] rounded-lg">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Durum</span>
                    <span className="text-sm font-black text-emerald-400 uppercase">DOĞRULANMIŞ</span>
                  </div>
                  <div className="p-4 bg-[#0B1220] border border-[#1E293B] rounded-lg min-w-0">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Sistem ID</span>
                    <span className="text-[10px] font-mono text-slate-400 truncate block">{targetProfile.id}</span>
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
