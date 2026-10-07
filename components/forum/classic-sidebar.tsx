'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Calculator, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Award,
  ArrowRight,
  TrendingUp,
  BookmarkCheck
} from 'lucide-react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface ActiveProfile {
  id: string;
  username: string;
  role: string;
}

/**
 * Modern, High-Contrast Accessible Sidebar.
 * Displays community statistics, active experts/volunteers, and quick calculation access.
 */
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

        const topicCount = topicsRes.count || 0;
        const commentCount = commentsRes.count || 0;
        const profileCount = profilesCountRes.count || 0;
        const latestProfile = latestProfileRes.data;
        const profilesList = profilesListRes.data;

        setStats({
          topics: topicCount,
          comments: commentCount,
          users: profileCount,
          latestUser: latestProfile?.username || 'MiracBirben',
          latestUserId: latestProfile?.id || 'u-mirac',
        });

        if (profilesList && profilesList.length > 0) {
          setRealUsers(profilesList);
        } else {
          setRealUsers([
            { id: 'u-mirac', username: 'MiracBirben', role: 'admin' },
            { id: 'u-bora', username: 'BoraMevzuat', role: 'uzman' },
            { id: 'u-aria', username: 'AriaA11y', role: 'moderator' },
          ]);
        }
      } catch (err) {
        console.error('Error loading sidebar stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <aside className="w-full space-y-5" aria-label="Topluluk İstatistikleri ve Hızlı Araçlar">
      
      {/* Quick Action Widget */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-5 border-2 border-slate-700 shadow-md">
        <div className="flex items-center gap-2 mb-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
          <Sparkles size={14} />
          <span>Hemen Katıl</span>
        </div>
        <h3 className="text-base font-black tracking-tight mb-1.5">
          Sorunu Topluluğa Sor
        </h3>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Hakların, rapor oranların veya mevzuat itirazların hakkında deneyimli üyelerden hızlı cevap al.
        </p>
        <Link href="/new-thread" className="block">
          <Button variant="primary" className="w-full bg-white text-slate-950 hover:bg-slate-100 font-extrabold justify-between">
            <span>Yeni Konu Oluştur</span>
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {/* Community Statistics Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
              <BarChart3 size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Platform Verileri
            </h3>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            Canlı
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="text-base font-black text-slate-900 dark:text-white">
              {stats.topics.toLocaleString('tr-TR')}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Konu</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="text-base font-black text-slate-900 dark:text-white">
              {stats.comments.toLocaleString('tr-TR')}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Mesaj</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="text-base font-black text-slate-900 dark:text-white">
              {stats.users.toLocaleString('tr-TR')}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Üye</div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Son Katılan:</span>
          <span className="font-bold text-sky-700 dark:text-sky-400">
            {stats.latestUser}
          </span>
        </div>
      </div>

      {/* Online Experts & Volunteer Roles */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Gönüllü &amp; Mevzuat Uzmanları
            </h3>
            <p className="text-[10px] text-slate-500">Doğrulanmış profiller</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {realUsers.slice(0, 8).map((usr) => (
            <Link
              key={usr.id}
              href={`/profile/${usr.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-800 dark:text-slate-200">{usr.username}</span>
              {usr.role === 'admin' && (
                <span className="text-[9px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-1 py-0.2 rounded font-black">
                  Admin
                </span>
              )}
              {usr.role === 'uzman' && (
                <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1 py-0.2 rounded font-black">
                  Uzman
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

    </aside>
  );
}
