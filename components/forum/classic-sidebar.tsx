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

export default function ClassicSidebar() {
  const [stats, setStats] = useState({
    topics: 0,
    comments: 0,
    users: 0,
    latestUser: '',
    latestUserId: '',
  });

  useEffect(() => {
    async function loadStats() {
      if (!isSupabaseConfigured) {
        setStats({
          topics: 0,
          comments: 0,
          users: 0,
          latestUser: '',
          latestUserId: '',
        });
        return;
      }

      try {
        const [topicsRes, commentsRes, profilesCountRes, latestProfileRes] = await Promise.all([
          supabase.from('topics').select('*', { count: 'exact', head: true }),
          supabase.from('comments').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('id, username').order('created_at', { ascending: false }).limit(1).maybeSingle()
        ]);

        setStats({
          topics: topicsRes.count || 0,
          comments: commentsRes.count || 0,
          users: profilesCountRes.count || 0,
          latestUser: latestProfileRes.data?.username || '',
          latestUserId: latestProfileRes.data?.id || '',
        });
      } catch (err) {
        console.error('Error loading sidebar stats:', err);
      }
    }

    loadStats();
  }, []);

  return (
    <aside className="w-full space-y-6" aria-label="Topluluk İstatistikleri ve Hızlı Araçlar">
      
      {/* 1. Quick CTA */}
      <div className="space-y-3 pb-6 border-b border-[#1E293B]">
        <Link 
          href="/discussions/new" 
          className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
        >
          <span>Yeni Konu Başlat</span>
          <ArrowRight size={14} />
        </Link>
        <p className="text-xs text-slate-400 leading-relaxed font-normal">
          Haklar, Balthazard oranı, ÖTV istisnası veya mevzuat sorularınızı topluluğa danışın.
        </p>
      </div>

      {/* 2. Hızlı Mevzuat & Hesaplama Araçları */}
      <div className="space-y-2 pb-6 border-b border-[#1E293B]">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 font-heading">
          Popüler Araçlar
        </div>
        <div className="space-y-1">
          <Link
            href="/hesaplama/balthazard"
            className="flex items-center justify-between p-2 rounded-md hover:bg-[#111B2E] transition-colors text-xs text-slate-300 group"
          >
            <span className="flex items-center gap-2 group-hover:text-indigo-400 font-medium">
              <Percent size={14} className="text-indigo-400" />
              <span>Balthazard Robotu</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">2019/30692</span>
          </Link>

          <Link
            href="/hesaplama/otv"
            className="flex items-center justify-between p-2 rounded-md hover:bg-[#111B2E] transition-colors text-xs text-slate-300 group"
          >
            <span className="flex items-center gap-2 group-hover:text-emerald-400 font-medium">
              <Car size={14} className="text-emerald-400" />
              <span>ÖTV Muafiyeti</span>
            </span>
          </Link>

          <Link
            href="/hesaplama/erken-emeklilik"
            className="flex items-center justify-between p-2 rounded-md hover:bg-[#111B2E] transition-colors text-xs text-slate-300 group"
          >
            <span className="flex items-center gap-2 group-hover:text-amber-400 font-medium">
              <FileText size={14} className="text-amber-400" />
              <span>Erken Emeklilik (kapalı)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">5510 m.28</span>
          </Link>
        </div>
      </div>

      {/* 3. Canlı Platform Verileri */}
      <div className="space-y-3 pb-6 border-b border-[#1E293B]">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading">
          <span>Topluluk Durumu</span>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Canlı
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-1">
          <div>
            <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
              {stats.topics.toLocaleString('tr-TR')}
            </div>
            <div className="text-[11px] uppercase font-bold text-slate-400 mt-0.5">Konu</div>
          </div>

          <div>
            <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
              {stats.comments.toLocaleString('tr-TR')}
            </div>
            <div className="text-[11px] uppercase font-bold text-slate-400 mt-0.5">Mesaj</div>
          </div>

          <div>
            <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
              {stats.users.toLocaleString('tr-TR')}
            </div>
            <div className="text-[11px] uppercase font-bold text-slate-400 mt-0.5">Üye</div>
          </div>
        </div>

        {stats.latestUser && (
          <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
            <span>Son Katılan:</span>
            <span className="font-mono font-semibold text-slate-200">
              @{stats.latestUser}
            </span>
          </div>
        )}
      </div>

    </aside>
  );
}
