'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  username?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  badge?: React.ReactNode;
  isOnline?: boolean;
  fit?: 'cover' | 'contain';
}

const sizeMap = {
  xs: 'w-6 h-6 text-[8px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
  '2xl': 'w-20 h-20 text-lg',
};

export function UserAvatar({ src, name, username, size = 'md', className, badge, isOnline, fit = 'cover' }: UserAvatarProps) {
  const [error, setError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const safeUsername = encodeURIComponent(username || name || 'user');
  const dicebearUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${safeUsername}`;
  
  // If src is a mock path like "/avatars/..." or something invalid, we default to dicebear early
  const isMockUrl = src?.startsWith('/avatars/') || src?.includes('localhost') || src?.includes('mock');
  const effectiveSrc = (error || isMockUrl || !src) ? dicebearUrl : src;

  const getInitials = () => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (username) return username.substring(0, 2).toUpperCase();
    return '';
  };

  const initials = getInitials();

  return (
    <div className={cn("relative shrink-0 select-none inline-flex items-center justify-center", className)}>
      <div 
        role="img"
        aria-label={name || username || 'Kullanıcı Avatarı'}
        className={cn(
          "rounded-xl border border-white/[0.08] overflow-hidden bg-[#161f33] relative flex items-center justify-center transition-all",
          sizeMap[size]
        )}
      >
        {isMounted && (
          <Image
            src={effectiveSrc}
            alt={name || username || 'Kullanıcı'}
            fill
            sizes="(max-width: 768px) 80px, 120px"
            unoptimized={effectiveSrc.includes('/svg') || effectiveSrc.includes('.svg') || effectiveSrc.includes('dicebear')}
            className={cn(
              "transition-opacity duration-300",
              fit === 'contain' ? "object-contain object-center" : "object-cover object-center",
              error ? "opacity-0" : "opacity-100"
            )}
            onError={() => setError(true)}
            referrerPolicy="no-referrer"
          />
        )}
        
        {/* Initials Fallback (visible while loading or if image fails) */}
        {(error || !src) && (
          <div className="absolute inset-0 flex items-center justify-center font-black text-sky-400 bg-sky-500/10 select-none">
            {initials || <UserIcon size={14} />}
          </div>
        )}
      </div>
      {isOnline && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#090a0f] ring-2 ring-[#090a0f] z-10" title="Çevrimiçi">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      )}
      {badge}
    </div>
  );
}
