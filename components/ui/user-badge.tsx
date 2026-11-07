'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Award, CheckCircle2, Crown, Sparkles, User, Zap } from 'lucide-react';

export type UserRole = 'admin' | 'moderator' | 'vip' | 'leader' | 'user' | 'system' | string;

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
  const normalizedRole = (role || 'user').toLowerCase().trim();

  let bgClass = 'bg-[#161f33] text-slate-300 border-white/[0.08]';
  let icon = <User className="w-3 h-3 text-slate-400" aria-hidden="true" />;
  let label = 'Üye';
  let ariaLabel = 'Rol: Standart Üye';

  if (normalizedRole === 'admin' || normalizedRole === 'yönetici') {
    bgClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-black';
    icon = <Shield className="w-3 h-3 text-rose-400" aria-hidden="true" />;
    label = 'YÖNETİCİ';
    ariaLabel = 'Rol: Yönetici';
  } else if (normalizedRole === 'moderator' || normalizedRole === 'moderatör') {
    bgClass = 'bg-sky-500/15 text-sky-400 border-sky-500/30 font-black';
    icon = <Zap className="w-3 h-3 text-sky-400" aria-hidden="true" />;
    label = 'MODERATÖR';
    ariaLabel = 'Rol: Moderatör';
  } else if (normalizedRole === 'system' || normalizedRole === 'sistem') {
    bgClass = 'bg-purple-500/15 text-purple-400 border-purple-500/30 font-black';
    icon = <Shield className="w-3 h-3 text-purple-400" aria-hidden="true" />;
    label = 'SİSTEM';
    ariaLabel = 'Rol: Sistem';
  } else if (normalizedRole === 'leader' || normalizedRole === 'topluluk lideri') {
    bgClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-black';
    icon = <Crown className="w-3 h-3 text-amber-400" aria-hidden="true" />;
    label = 'LİDER';
    ariaLabel = 'Rol: Topluluk Lideri';
  } else if (normalizedRole === 'vip' || normalizedRole === 'katkı sağlayan') {
    bgClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-black';
    icon = <Sparkles className="w-3 h-3 text-emerald-400" aria-hidden="true" />;
    label = 'VIP';
    ariaLabel = 'Rol: VIP Katkı Sağlayan';
  }

  const sizeClasses = {
    xs: 'text-[8px] px-1.5 py-0.5 gap-1 rounded-sm border',
    sm: 'text-[9px] px-2 py-0.5 gap-1 rounded-md border',
    md: 'text-[10px] px-2.5 py-1 gap-1.5 rounded-md border',
    lg: 'text-xs px-3 py-1.5 gap-2 rounded-md border',
  };

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center uppercase tracking-wider font-bold transition-colors select-none',
        bgClass,
        sizeClasses[size],
        className
      )}
    >
      {icon}
      {showLabel && <span className="truncate">{label}</span>}
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
    <span 
      role="status" 
      aria-label="Kullanıcı şu anda çevrim içi"
      className={cn('relative flex shrink-0', sizeMap[size], className)} 
      title="Çevrim içi"
    >
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" aria-hidden="true" />
      <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500 border-2 border-[#090a0f] shadow-xs" aria-hidden="true" />
    </span>
  );
}

export function UserLevelBadge({ level = 1, xp, size = 'sm' }: { level?: number; xp?: number; size?: 'xs' | 'sm' | 'md' }) {
  const safeLevel = Math.max(1, Number(level) || 1);
  return (
    <span 
      role="status"
      aria-label={`Kullanıcı seviyesi ${safeLevel}${xp !== undefined ? `, ${xp} deneyim puanı` : ''}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase tracking-wider"
    >
      <Award size={11} aria-hidden="true" />
      <span>SEVİYE {safeLevel}</span>
      {xp !== undefined && <span className="opacity-75 font-mono ml-0.5">({xp} XP)</span>}
    </span>
  );
}

