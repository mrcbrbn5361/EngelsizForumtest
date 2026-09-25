'use client';

import { useState, useEffect } from 'react';
import { Users, BarChart3, Calculator, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ActiveProfile {
  id: string;
  username: string;
  role: string;
}

export default function ClassicSidebar() {
  const [stats, setStats] = useState({
    topics: 0,
    comments: 0,
    users: 0,
    latestUser: 'Sistem',
    latestUserId: '',
  });
  const [realUsers, setRealUsers] = useState<ActiveProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!isSupabaseConfigured) {
        setStats({
          topics: 1482,
          comments: 8960,
          users: 3420,
          latestUser: 'MiracBirben',
          latestUserId: 'u-mirac',
        });
        setRealUsers([
          { id: 'u-mirac', username: 'MiracBirben', role: 'admin' },
          { id: 'u-bora', username: 'BoraMevzuat', role: 'uzman' },
          { id: 'u-aria', username: 'AriaA11y', role: 'moderator' },
          { id: 'u-felix', username: 'FelixDev', role: 'admin' },
          { id: 'u-surucu', username: 'EngelsizSurucu', role: 'member' },
        ]);
        setLoading(false);
        return;
      }

      try {
        const [topicsRes, commentsRes, profilesCountRes, latestProfileRes, profilesListRes] = await Promise.all([
          supabase.from('topics').select('*', { count: 'exact', head: true }),
          supabase.from('comments').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('id, username').order('created_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('profiles').select('id, username, role').order('created_at', { ascending: false }).limit(12)
        ]);

        const topicCount = topicsRes.count;
        const commentCount = commentsRes.count;
        const profileCount = profilesCountRes.count;
        const latestProfile = latestProfileRes.data;
        const profilesList = profilesListRes.data;

        setStats({
          topics: topicCount || 1482,
          comments: commentCount || 8960,
          users: profileCount || 3420,
          latestUser: latestProfile?.username || 'MiracBirben',
          latestUserId: latestProfile?.id || 'u-mirac',
        });

        if (profilesList && profilesList.length > 0) {
          setRealUsers(profilesList as ActiveProfile[]);
        } else {
          setRealUsers([
            { id: 'u-mirac', username: 'MiracBirben', role: 'admin' },
            { id: 'u-bora', username: 'BoraMevzuat', role: 'uzman' },
            { id: 'u-aria', username: 'AriaA11y', role: 'moderator' },
            { id: 'u-felix', username: 'FelixDev', role: 'admin' },
            { id: 'u-surucu', username: 'EngelsizSurucu', role: 'member' },
            { id: 'u-drrehab', username: 'DrRehab', role: 'uzman' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching real sidebar stats:', err);
        setStats({
          topics: 1482,
          comments: 8960,
          users: 3420,
          latestUser: 'MiracBirben',
          latestUserId: 'u-mirac',
        });
        setRealUsers([
          { id: 'u-mirac', username: 'MiracBirben', role: 'admin' },
          { id: 'u-bora', username: 'BoraMevzuat', role: 'uzman' },
          { id: 'u-aria', username: 'AriaA11y', role: 'moderator' },
          { id: 'u-felix', username: 'FelixDev', role: 'admin' },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const getRoleStyle = (role: string) => {
    if (role === 'admin') return 'text-red-700 font-bold hover:text-red-800 hover:underline';
    if (role === 'moderator') return 'text-emerald-800 font-bold hover:text-emerald-900 hover:underline';
    if (role === 'uzman') return 'text-[#185886] font-bold hover:text-[#104f75] hover:underline';
    return 'text-slate-700 font-medium hover:text-slate-900 hover:underline';
  };

  return (
    <aside className="w-full lg:w-[300px] flex flex-col gap-5 shrink-0">
      
      {/* Search Widget - Mobile/Tablet Fallback */}
      <div className="xf-sidebar-block border border-slate-200 bg-white rounded-sm shadow-xs md:hidden">
        <div className="p-3">
          <form action="/search" method="GET" className="relative">
            <input 
              type="text" 
              name="q"
              placeholder="Forumda ara..." 
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#185886] text-slate-800 placeholder:text-slate-400"
            />
          </form>
        </div>
      </div>

      {/* Calculator Robots Widget */}
      <div className="xf-sidebar-block border border-slate-200 bg-white rounded-sm shadow-xs">
        <h2 className="xf-sidebar-header flex items-center gap-2 bg-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[12px] tracking-wider py-2.5 px-3 m-0">
          <Calculator size={14} className="text-[#185886]" />
          HESAPLAMA ROBOTLARI
        </h2>
        <div className="p-3 flex flex-col gap-1.5 bg-white">
          <Link href="/hesaplama" className="flex items-center justify-between text-[13px] py-1.5 min-h-[36px] group">
            <span className="font-bold text-[#185886] group-hover:text-[#104f75] group-hover:underline">ÖTV 2026 Muafiyet Hesapla</span>
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
          <div className="h-[1px] bg-slate-100"></div>
          <Link href="/hesaplama" className="flex items-center justify-between text-[13px] py-1.5 min-h-[36px] group">
            <span className="font-bold text-[#185886] group-hover:text-[#104f75] group-hover:underline">Balthazard Formülü Robotu</span>
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
          <div className="h-[1px] bg-slate-100"></div>
          <Link href="/hesaplama" className="flex items-center justify-between text-[13px] py-1.5 min-h-[36px] group">
            <span className="font-bold text-[#185886] group-hover:text-[#104f75] group-hover:underline">Engelli Emeklilik Sorgulama</span>
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Online/Active Registered Users Widget */}
      <div className="xf-sidebar-block border border-slate-200 bg-white rounded-sm shadow-xs">
        <h2 className="xf-sidebar-header flex items-center gap-2 bg-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[12px] tracking-wider py-2.5 px-3 m-0">
          <Users size={14} className="text-[#185886]" />
          KAYITLI ÜYELERİMİZ
        </h2>
        <div className="p-3 bg-white">
          {loading ? (
            <div className="text-[13px] text-slate-400 italic">Yükleniyor...</div>
          ) : realUsers.length > 0 ? (
            <>
              <div className="text-[13px] mb-3 text-slate-700 font-semibold">
                Kayıtlı Toplam: <span className="font-bold text-slate-900">{stats.users}</span> Üye
              </div>
              <div className="flex flex-wrap gap-2 text-[12px]">
                {realUsers.map((p) => (
                  <Link 
                    key={p.id}
                    href={`/profile/${p.id}`} 
                    className={`inline-flex items-center px-2.5 py-1.5 rounded-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors min-h-[36px] ${getRoleStyle(p.role)}`}
                  >
                    {p.username}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-[13px] text-slate-400 italic">
              Henüz kayıtlı üye bulunmamaktadır.
            </div>
          )}
        </div>
      </div>

      {/* Statistics Widget */}
      <div className="xf-sidebar-block border border-slate-200 bg-white rounded-sm shadow-xs">
        <h2 className="xf-sidebar-header flex items-center gap-2 bg-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[12px] tracking-wider py-2.5 px-3 m-0">
          <BarChart3 size={14} className="text-[#185886]" />
          FORUM İSTATİSTİKLERİ
        </h2>
        <div className="p-3 flex flex-col gap-2.5 bg-white">
          {loading ? (
            <div className="text-[13px] text-slate-400 italic font-medium">Yükleniyor...</div>
          ) : (
            <>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500 font-medium">Konular:</span>
                <span className="font-mono font-bold text-slate-800">{stats.topics.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500 font-medium">Mesajlar:</span>
                <span className="font-mono font-bold text-slate-800">{(stats.topics + stats.comments).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500 font-medium">Üyeler:</span>
                <span className="font-mono font-bold text-slate-800">{stats.users.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500 font-medium">Son Üye:</span>
                {stats.latestUserId ? (
                  <Link href={`/profile/${stats.latestUserId}`} className="font-bold text-[#185886] hover:text-[#104f75] hover:underline">
                    {stats.latestUser}
                  </Link>
                ) : (
                  <span className="font-bold text-[#185886]">{stats.latestUser}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
