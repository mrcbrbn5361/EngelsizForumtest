import { supabaseServer } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import Link from 'next/link';
import { Home, Calendar, MessageSquare, ThumbsUp, Clock, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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

  // Fetch stats
  const { count: topicCount } = await supabaseServer
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', profile.id);

  const { count: commentCount } = await supabaseServer
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', profile.id);

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <div className="bg-[#111726]/60 -mx-4 px-4 py-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-400 border-b border-white/[0.08] mb-4">
        <Link href="/" className="hover:text-sky-400 flex items-center gap-1 transition-colors">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/" className="hover:text-sky-400 transition-colors">Üyeler</Link>
        <span className="opacity-50">/</span>
        <span className="font-semibold text-slate-200">{profile.username}</span>
      </div>

      <div className="xf-block border border-white/[0.08] rounded-sm overflow-hidden mb-6 bg-[#111726]/40">
        <div className="bg-[#111726]/90 p-6 text-slate-100 border-b border-white/[0.08] flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Avatar */}
          <div className="w-32 h-32 bg-slate-900 border-4 border-white/[0.08] rounded-sm overflow-hidden shrink-0 flex items-center justify-center">
             <UserIcon size={64} className="text-slate-500" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-extrabold mb-1 text-slate-100 tracking-tight">{profile.full_name || profile.username}</h1>
            <div className="text-sky-400 font-bold mb-4 uppercase text-xs tracking-wider">
               {profile.role === 'admin' ? 'Yönetici / Admin' : profile.role === 'moderator' ? 'Moderator' : 'Üye'}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
               <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Kayıt Tarihi</span>
                  <span className="font-bold text-slate-200">{format(new Date(profile.created_at), 'd MMMM yyyy', { locale: tr })}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Mesajlar</span>
                  <span className="font-bold text-slate-200">{(topicCount || 0) + (commentCount || 0)}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">XP Puanı</span>
                  <span className="font-bold text-slate-200">{profile.xp || 10}</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
             <button className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2 rounded-sm text-xs font-black uppercase transition-all shadow-sm">
                Takip Et
             </button>
             <button className="bg-white/[0.04] hover:bg-white/[0.1] text-slate-200 px-5 py-2 rounded-sm text-xs font-bold uppercase transition-all border border-white/[0.08]">
                Mesaj Gönder
             </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="bg-[#111726]/40 border-b border-white/[0.08] flex px-4">
           <button className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 border-sky-400 text-sky-400">Aktivite Akışı</button>
           <button className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]">Mesajlar</button>
           <button className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]">Hakkında</button>
        </div>

        <div className="p-6 flex flex-col lg:flex-row gap-8">
           {/* Left Column: Activity */}
           <div className="flex-1 space-y-6">
              <h3 className="text-sm font-extrabold text-sky-400 uppercase tracking-wider border-b border-white/[0.08] pb-2">Son Aktiviteler</h3>
              <div className="space-y-4">
                 <div className="p-10 text-center text-slate-400 italic bg-[#111726]/20 border border-dashed border-white/[0.08] rounded-sm text-xs">
                    Bu üyenin son aktivitesi bulunmuyor.
                 </div>
              </div>
           </div>

           {/* Right Column: Sidebar Stats */}
           <div className="w-full lg:w-72 shrink-0 space-y-6">
              <div className="space-y-6">
                 <div>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">İstatistikler</h4>
                    <div className="space-y-2 text-xs">
                       <div className="flex justify-between py-2 border-b border-white/[0.04]">
                          <span className="text-slate-400 font-medium">Toplam Mesajlar:</span>
                          <span className="font-mono font-bold text-slate-200">{(topicCount || 0) + (commentCount || 0)}</span>
                       </div>
                       <div className="flex justify-between py-2 border-b border-white/[0.04]">
                          <span className="text-slate-400 font-medium">Beğeniler:</span>
                          <span className="font-mono font-bold text-slate-200">0</span>
                       </div>
                       <div className="flex justify-between py-2 border-b border-white/[0.04]">
                          <span className="text-slate-400 font-medium">İtibar Puanı:</span>
                          <span className="font-mono font-bold text-slate-200">{profile.xp || 10}</span>
                       </div>
                    </div>
                 </div>

                 <div>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Hakkında</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium bg-[#111726]/10 p-3 rounded-sm border border-white/[0.04]">
                       {profile.bio || 'Bu kullanıcı henüz hakkında bir bilgi paylaşmamış.'}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <ClassicSidebar />
    </div>
  );
}
