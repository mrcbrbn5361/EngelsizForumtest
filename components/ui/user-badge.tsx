'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Award, CheckCircle2, Crown, Sparkles, User, Zap } from 'lucide-react';

export type UserRole = 'admin' | 'moderator' | 'vip' | 'leader' | 'user' | string;

interface UserBadgeProps {
  role?: UserRole | null;
  level?: number | null;
  reputationPoints?: number | null;
  isOnline?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function UserRoleBadge({ role, size = 'sm', showLabel = true, className }: UserBadgeProps) {
  const normalizedRole = (role || 'user').toLowerCase();

  let bgClass = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  let icon = <User className="w-3 h-3" />;
  let label = 'Üye';

  if (normalizedRole === 'admin' || normalizedRole === 'yönetici') {
    bgClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-black';
    icon = <Shield className="w-3 h-3 text-rose-400" />;
    label = 'YÖNETİCİ';
  } else if (normalizedRole === 'moderator' || normalizedRole === 'moderatör') {
    bgClass = 'bg-sky-500/15 text-sky-400 border-sky-500/30 font-black';
    icon = <Zap className="w-3 h-3 text-sky-400" />;
    label = 'MODERATÖR';
  } else if (normalizedRole === 'leader' || normalizedRole === 'topluluk lideri') {
    bgClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-black';
    icon = <Crown className="w-3 h-3 text-amber-400" />;
    label = 'TOPLULUK LİDERİ';
  } else if (normalizedRole === 'vip' || normalizedRole === 'katkı sağlayan') {
    bgClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-black';
    icon = <Sparkles className="w-3 h-3 text-emerald-400" />;
    label = 'VIP / KATKI SAĞLAYAN';
  }

  const sizeClasses = {
    xs: 'text-[8px] px-1.5 py-0.5 gap-1 rounded-md border',
    sm: 'text-[9px] px-2 py-0.5 gap-1 rounded-lg border',
    md: 'text-[10px] px-2.5 py-1 gap-1.5 rounded-xl border',
    lg: 'text-xs px-3 py-1.5 gap-2 rounded-2xl border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center uppercase tracking-widest transition-all shadow-sm',
        bgClass,
        sizeClasses[size],
        className
      )}
    >
      {icon}
      {showLabel && <span>{label}</span>}
    </span>
  );
}

export function OnlineStatusDot({ isOnline = true, size = 'md', className }: { isOnline?: boolean; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  if (!isOnline) return null;

  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  };

  return (
    <span className={cn('relative flex shrink-0', sizeMap[size], className)} title="Çevrim içi">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500 border-2 border-slate-900 shadow-md" />
    </span>
  );
}

export function UserLevelBadge({ level = 1, xp, size = 'sm' }: { level?: number; xp?: number; size?: 'xs' | 'sm' | 'md' }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
      <Award size={10} />
      <span>SEVİYE {level}</span>
      {xp !== undefined && <span className="opacity-70 ml-0.5">({xp} XP)</span>}
    </span>
  );
}
