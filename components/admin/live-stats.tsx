'use client';

import React, { useEffect, useState } from 'react';
import { Users, Globe, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Live Statistics Component for Admin/Staff.
 * Displays real-time data from Supabase analytics.
 */
export function LiveStats() {
  const [stats, setStats] = useState({
    total_visitors: 0,
    active_visitors: 0,
    active_members: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_admin_stats');
        
        if (!error && data) {
          setStats(data);
        } else {
          // Fallback manual count if RPC is missing
          const { count: total } = await supabase
            .from('analytics_visitors')
            .select('*', { count: 'exact', head: true });

          const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
          
          const { count: active } = await supabase
            .from('analytics_visitors')
            .select('*', { count: 'exact', head: true })
            .gt('last_active_at', fiveMinsAgo);

          setStats({
            total_visitors: total || 0,
            active_visitors: active || 0,
            active_members: 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch live stats:', err);
      }
    };

    fetchStats();
    // Refresh every 30 seconds for "live" feel
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="hidden lg:flex items-center gap-4 px-4 py-2 bg-muted/30 hover:bg-muted/50 transition-colors rounded-2xl border border-border/50 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground select-none"
      aria-label="Canlı Site İstatistikleri"
    >
      <div className="flex items-center gap-2 group" title="Toplam Ziyaretçi Sayısı">
        <Globe size={13} className="text-primary/60 group-hover:text-primary transition-colors" />
        <span className="text-foreground/80 tabular-nums">{stats.total_visitors}</span>
      </div>
      
      <div className="w-px h-3 bg-border" aria-hidden="true" />
      
      <div className="flex items-center gap-2 group" title="Son 5 Dakikadaki Aktif Ziyaretçi">
        <Activity size={13} className="text-green-500/60 group-hover:text-green-500 transition-colors animate-pulse" />
        <span className="text-foreground/80 tabular-nums">{stats.active_visitors}</span>
      </div>

      {stats.active_members > 0 && (
        <>
          <div className="w-px h-3 bg-border" aria-hidden="true" />
          <div className="flex items-center gap-2 group" title="Aktif Üye Sayısı">
            <Users size={13} className="text-blue-500/60 group-hover:text-blue-500 transition-colors" />
            <span className="text-foreground/80 tabular-nums">{stats.active_members}</span>
          </div>
        </>
      )}
    </div>
  );
}
