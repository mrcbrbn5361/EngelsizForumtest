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
  });
  const [realUsers, setRealUsers] = useState<ActiveProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        // Fetch real topics count
        const { count: topicCount } = await supabase
          .from('topics')
          .select('*', { count: 'exact', head: true });

        // Fetch real comments count
        const { count: commentCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true });

        // Fetch real profiles count
        const { count: profileCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch latest profile
        const { data: latestProfile } = await supabase
          .from('profiles')
          .select('username')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Fetch registered real profiles list
        const { data: profilesList } = await supabase
          .from('profiles')
          .select('id, username, role')
          .order('created_at', { ascending: false })
          .limit(12);

        setStats({
          topics: topicCount || 0,
          comments: commentCount || 0,
          users: profileCount || 0,
          latestUser: latestProfile?.username || 'Sistem',
        });

        if (profilesList) {
          setRealUsers(profilesList as ActiveProfile[]);
        }
      } catch (err) {
        console.error('Error fetching real sidebar stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const getRoleStyle = (role: string) => {
    if (role === 'admin') return 'text-red-400 font-bold hover:text-red-300 hover:underline';
    if (role === 'moderator') return 'text-emerald-400 font-bold hover:text-emerald-300 hover:underline';
    if (role === 'uzman') return 'text-sky-400 font-bold hover:text-sky-300 hover:underline';
    return 'text-slate-300 hover:text-white hover:underline';
  };

  return (
    <aside className="w-full lg:w-[300px] flex flex-col gap-5 shrink-0">
      
      {/* Search Widget - Mobile/Tablet Fallback */}
      <div className="xf-sidebar-block md:hidden border border-white/[0.08] rounded-sm">
        <div className="p-3">
          <form action="/search" method="GET" className="relative">
            <input 
              type="text" 
              name="q"
              placeholder="Forumda ara..." 
              className="w-full bg-[#111726]/60 border border-white/[0.08] rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-200 placeholder:text-slate-500"
            />
          </form>
        </div>
      </div>

      {/* Calculator Robots Widget */}
      <div className="xf-sidebar-block border border-white/[0.08] rounded-sm">
        <div className="xf-sidebar-header flex items-center gap-2 bg-[#111726] border-b border-white/[0.08] text-slate-200 font-extrabold uppercase text-[12px] tracking-wider py-2.5 px-3">
          <Calculator size={14} className="text-sky-400" />
          HESAPLAMA ROBOTLARI
        </div>
        <div className="p-3 flex flex-col gap-2.5 bg-[#111726]/40">
          <Link href="/hesaplama" className="flex items-center justify-between text-[13px] group">
            <span className="font-semibold text-sky-400 group-hover:text-sky-300 group-hover:underline">ÖTV 2026 Muafiyet Hesapla</span>
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
          <div className="h-[1px] bg-white/[0.08]"></div>
          <Link href="/hesaplama" className="flex items-center justify-between text-[13px] group">
            <span className="font-semibold text-sky-400 group-hover:text-sky-300 group-hover:underline">Balthazard Formülü Robotu</span>
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
          <div className="h-[1px] bg-white/[0.08]"></div>
          <Link href="/hesaplama" className="flex items-center justify-between text-[13px] group">
            <span className="font-semibold text-sky-400 group-hover:text-sky-300 group-hover:underline">Engelli Emeklilik Sorgulama</span>
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Online/Active Registered Users Widget */}
      <div className="xf-sidebar-block border border-white/[0.08] rounded-sm">
        <div className="xf-sidebar-header flex items-center gap-2 bg-[#111726] border-b border-white/[0.08] text-slate-200 font-extrabold uppercase text-[12px] tracking-wider py-2.5 px-3">
          <Users size={14} className="text-sky-400" />
          KAYITLI ÜYELERİMİZ
        </div>
        <div className="p-3 bg-[#111726]/40">
          {loading ? (
            <div className="text-[13px] text-slate-400 italic">Yükleniyor...</div>
          ) : realUsers.length > 0 ? (
            <>
              <div className="text-[13px] mb-3 text-slate-300">
                Kayıtlı Toplam: <span className="font-bold text-slate-100">{stats.users}</span> Üye
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-[13px]">
                {realUsers.map((p, idx) => (
                  <span key={p.id} className="inline-flex items-center">
                    <Link href={`/profile/${p.username}`} className={getRoleStyle(p.role)}>
                      {p.username}
                    </Link>
                    {idx < realUsers.length - 1 && <span className="text-slate-600 ml-1">,</span>}
                  </span>
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
      <div className="xf-sidebar-block border border-white/[0.08] rounded-sm">
        <div className="xf-sidebar-header flex items-center gap-2 bg-[#111726] border-b border-white/[0.08] text-slate-200 font-extrabold uppercase text-[12px] tracking-wider py-2.5 px-3">
          <BarChart3 size={14} className="text-sky-400" />
          FORUM İSTATİSTİKLERİ
        </div>
        <div className="p-3 flex flex-col gap-2.5 bg-[#111726]/40">
          {loading ? (
            <div className="text-[13px] text-slate-400 italic font-medium">Yükleniyor...</div>
          ) : (
            <>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-300 font-medium">Konular:</span>
                <span className="font-mono font-bold text-slate-100">{stats.topics.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-300 font-medium">Mesajlar:</span>
                <span className="font-mono font-bold text-slate-100">{(stats.topics + stats.comments).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-300 font-medium">Üyeler:</span>
                <span className="font-mono font-bold text-slate-100">{stats.users.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-300 font-medium">Son Üye:</span>
                <Link href={`/profile/${stats.latestUser}`} className="font-bold text-sky-400 hover:text-sky-300 hover:underline">
                  {stats.latestUser}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
