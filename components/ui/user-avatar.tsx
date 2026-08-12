'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  username?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  badge?: React.ReactNode;
  isOnline?: boolean;
}

const sizeMap = {
  xs: 'w-6 h-6 text-[8px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
};

export function UserAvatar({ src, name, username, size = 'md', className, badge, isOnline }: UserAvatarProps) {
  const [error, setError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use Dicebear as a secondary fallback, but only if we haven't already failed
  const dicebearUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'user'}`;
  
  // If src is a mock path like "/avatars/..." or something invalid, we might want to default to dicebear early
  const isMockUrl = src?.startsWith('/') || src?.includes('localhost') || src?.includes('mock');
  const effectiveSrc = (error || isMockUrl) ? dicebearUrl : (src || dicebearUrl);

  const getInitials = () => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (username) return username.substring(0, 2).toUpperCase();
    return '';
  };

  const initials = getInitials();

  return (
    <div className={cn("relative shrink-0", className)}>
      <div className={cn(
        "rounded-2xl border border-border overflow-hidden bg-muted relative flex items-center justify-center transition-all",
        sizeMap[size]
      )}>
        {isMounted && (
          <Image
            src={effectiveSrc}
            alt={name || username || 'Kullanıcı'}
            fill
            className={cn("object-cover transition-opacity duration-300", error ? "opacity-0" : "opacity-100")}
            onError={() => setError(true)}
            referrerPolicy="no-referrer"
          />
        )}
        
        {/* Initials Fallback (visible while loading or if image fails) */}
        {(error || !src) && (
          <div className="absolute inset-0 flex items-center justify-center font-black text-primary bg-primary/10 select-none">
            {initials || <UserIcon size={14} />}
          </div>
        )}
      </div>
      {isOnline && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 ring-2 ring-slate-900 z-10">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      )}
      {badge}
    </div>
  );
}
