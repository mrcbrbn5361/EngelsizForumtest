'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowRight,
  Percent,
  Car,
  FileText
} from 'lucide-react';
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
        ]);
        return;
      }

      try {
        const [topicsRes, commentsRes, profilesCountRes, latestProfileRes, profilesListRes] = await Promise.all([
          supabase.from('topics').select('*', { count: 'exact', head: true }),
          supabase.from('comments').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('id, username').order('created_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('profiles').select('id, username, role').order('created_at', { ascending: false }).limit(8)
        ]);

        setStats({
          topics: topicsRes.count || 0,
          comments: commentsRes.count || 0,
          users: profilesCountRes.count || 0,
          latestUser: latestProfileRes.data?.username || 'MiracBirben',
          latestUserId: latestProfileRes.data?.id || 'u-mirac',
        });

        if (profilesListRes.data && profilesListRes.data.length > 0) {
          setRealUsers(profilesListRes.data);
        }
      } catch (err) {
        console.error('Error loading sidebar stats:', err);
      }
    }

    loadStats();
  }, []);

  return (
    <aside className="w-full space-y-8" aria-label="Topluluk İstatistikleri ve Hızlı Araçlar">
      
      {/* 1. Quick CTA */}
      <div className="space-y-3 pb-6 border-b border-[#30363d]">
        <Link 
          href="/discussions/new" 
          className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-md bg-white hover:bg-slate-100 text-black font-bold text-xs transition-colors"
        >
          <span>Yeni Konu Başlat</span>
          <ArrowRight size={14} />
        </Link>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          Haklar, Balthazard oranı, ÖTV istisnası veya mevzuat sorularınızı topluluğa danışın.
        </p>
      </div>

      {/* 2. Hızlı Mevzuat & Hesaplama Araçları */}
      <div className="space-y-2 pb-6 border-b border-[#30363d]">
        <div className="text-xs font-bold uppercase tracking-wider text-white mb-2">
          Popüler Araçlar
        </div>
        <div className="space-y-1">
          <Link
            href="/hesaplama/balthazard"
            className="flex items-center justify-between p-2 rounded-md hover:bg-[#161b22] transition-colors text-xs text-slate-200 group"
          >
            <span className="flex items-center gap-2 group-hover:text-white font-semibold">
              <Percent size={14} className="text-sky-400" />
              <span>Balthazard Robotu</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-400">2019/30692</span>
          </Link>

          <Link
            href="/hesaplama/otv"
            className="flex items-center justify-between p-2 rounded-md hover:bg-[#161b22] transition-colors text-xs text-slate-200 group"
          >
            <span className="flex items-center gap-2 group-hover:text-white font-semibold">
              <Car size={14} className="text-emerald-400" />
              <span>2026 ÖTV Muafiyeti</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-400">2.29M ₺</span>
          </Link>

          <Link
            href="/hesaplama/erken-emeklilik"
            className="flex items-center justify-between p-2 rounded-md hover:bg-[#161b22] transition-colors text-xs text-slate-200 group"
          >
            <span className="flex items-center gap-2 group-hover:text-white font-semibold">
              <FileText size={14} className="text-amber-400" />
              <span>Erken Emeklilik Tablosu</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-400">5510 m.28</span>
          </Link>
        </div>
      </div>

      {/* 3. Canlı Platform Verileri */}
      <div className="space-y-3 pb-6 border-b border-[#30363d]">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white">
          <span>Topluluk Durumu</span>
          <span className="text-xs text-emerald-400 font-sans font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Canlı
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-1">
          <div>
            <div className="text-xl font-mono font-bold text-white">
              {stats.topics.toLocaleString('tr-TR')}
            </div>
            <div className="text-[11px] uppercase font-bold text-slate-400 mt-0.5">Konu</div>
          </div>

          <div>
            <div className="text-xl font-mono font-bold text-white">
              {stats.comments.toLocaleString('tr-TR')}
            </div>
            <div className="text-[11px] uppercase font-bold text-slate-400 mt-0.5">Mesaj</div>
          </div>

          <div>
            <div className="text-xl font-mono font-bold text-white">
              {stats.users.toLocaleString('tr-TR')}
            </div>
            <div className="text-[11px] uppercase font-bold text-slate-400 mt-0.5">Üye</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 text-slate-300">
          <span>Son Katılan:</span>
          <span className="font-mono font-bold text-white">
            @{stats.latestUser}
          </span>
        </div>
      </div>

      {/* 4. Aktif Uzmanlar ve Gönüllüler */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-white">
          Mevzuat Uzmanları &amp; Moderatörler
        </div>
        <div className="space-y-1">
          {realUsers.slice(0, 5).map((usr) => (
            <Link
              key={usr.id}
              href={`/profile/${usr.id}`}
              className="flex items-center justify-between p-1.5 rounded hover:bg-[#161b22] transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-200">@{usr.username}</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-sky-400 uppercase">
                {usr.role}
              </span>
            </Link>
          ))}
        </div>
      </div>

    </aside>
  );
}
