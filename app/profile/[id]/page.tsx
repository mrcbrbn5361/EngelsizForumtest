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
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  
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
      <div className="bg-[#eceff3] -mx-4 px-4 py-2 flex flex-wrap items-center gap-2 text-[12px] text-[#4b5563] border-b border-[#d8dee4] mb-4">
        <Link href="/" className="hover:text-[#18587a] flex items-center gap-1">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/" className="hover:text-[#18587a]">Üyeler</Link>
        <span className="opacity-50">/</span>
        <span className="font-semibold text-[#212529]">{profile.username}</span>
      </div>

      <div className="xf-block rounded-sm overflow-hidden mb-6">
        <div className="bg-[#204060] p-6 text-white flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Avatar */}
          <div className="w-32 h-32 bg-slate-100 border-4 border-white/20 rounded-sm overflow-hidden shrink-0 flex items-center justify-center">
             <UserIcon size={64} className="text-slate-600" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-1">{profile.full_name || profile.username}</h1>
            <div className="text-blue-200 font-semibold mb-4 uppercase text-xs tracking-wider">
               {profile.role === 'admin' ? 'Yönetici' : 'Üye'}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
               <div className="flex flex-col">
                  <span className="text-blue-200 text-[11px] uppercase font-bold">Kayıt Tarihi</span>
                  <span className="font-semibold">{format(new Date(profile.created_at), 'd MMMM yyyy', { locale: tr })}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-blue-200 text-[11px] uppercase font-bold">Mesajlar</span>
                  <span className="font-semibold">{(topicCount || 0) + (commentCount || 0)}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-blue-200 text-[11px] uppercase font-bold">Çözüm Sayısı</span>
                  <span className="font-semibold">0</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
             <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm font-bold transition-colors border border-white/20 text-center">
                Takip Et
             </button>
             <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm font-bold transition-colors border border-white/20 text-center">
                Mesaj Gönder
             </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="bg-[#f5f5f5] border-t border-b border-[#d8dee4] flex px-4">
           <button className="px-4 py-3 text-sm font-bold border-b-2 border-[#18587a] text-[#18587a]">Aktivite Akışı</button>
           <button className="px-4 py-3 text-sm font-bold text-[#4b5563] hover:bg-[#eceff3]">Mesajlar</button>
           <button className="px-4 py-3 text-sm font-bold text-[#4b5563] hover:bg-[#eceff3]">Hakkında</button>
        </div>

        <div className="p-6 bg-white flex flex-col lg:flex-row gap-8">
           {/* Left Column: Activity */}
           <div className="flex-1 space-y-6">
              <h3 className="text-lg font-bold text-[#204060] border-b border-[#d8dee4] pb-2">Son Aktiviteler</h3>
              <div className="space-y-4">
                 <div className="p-10 text-center text-slate-700 italic bg-[#f8fafc] border border-dashed border-[#d8dee4] rounded">
                    Bu üyenin son aktivitesi bulunmuyor.
                 </div>
              </div>
           </div>

           {/* Right Column: Sidebar Stats */}
           <div className="w-full lg:w-72 shrink-0 space-y-6">
              <div className="space-y-4">
                 <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">İstatistikler</h4>
                    <div className="space-y-2 text-sm">
                       <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-700">Mesajlar:</span>
                          <span className="font-semibold">{(topicCount || 0) + (commentCount || 0)}</span>
                       </div>
                       <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-700">Beğeniler:</span>
                          <span className="font-semibold">0</span>
                       </div>
                       <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-700">Puanlar:</span>
                          <span className="font-semibold">{profile.xp || 0}</span>
                       </div>
                    </div>
                 </div>

                 <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Hakkında</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
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
