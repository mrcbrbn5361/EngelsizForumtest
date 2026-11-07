'use client';

import React, { useState, useEffect } from 'react';
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
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    setErrorCount(0);
  }, [src]);

  const cleanUsername = (username || name || 'user').trim();
  const safeSeed = encodeURIComponent(cleanUsername);
  const dicebearUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${safeSeed}`;

  const getInitials = () => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (username) return username.substring(0, 2).toUpperCase();
    return '';
  };

  const initials = getInitials();

  // Determine current image source based on errors
  const isMockUrl = src?.startsWith('/avatars/') || src?.includes('localhost');
  const validCustomSrc = src && !isMockUrl ? src : null;

  let currentImgSrc: string | null = null;
  if (errorCount === 0) {
    currentImgSrc = validCustomSrc || dicebearUrl;
  } else if (errorCount === 1) {
    // If custom image failed, try dicebear fallback
    currentImgSrc = validCustomSrc ? dicebearUrl : null;
  } else {
    // If dicebear also failed, fallback to initials
    currentImgSrc = null;
  }

  return (
    <div className={cn("relative shrink-0 select-none inline-flex items-center justify-center", className)}>
      <div 
        role="img"
        aria-label={name || username || 'Kullanıcı Avatarı'}
        className={cn(
          "rounded-md border border-[#1E293B] overflow-hidden bg-[#18243A] relative flex items-center justify-center transition-all",
          sizeMap[size]
        )}
      >
        {currentImgSrc ? (
          <img
            src={currentImgSrc}
            alt={name || username || 'Kullanıcı'}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setErrorCount(prev => prev + 1)}
            className={cn(
              "w-full h-full",
              fit === 'contain' ? "object-contain object-center" : "object-cover object-center"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/70 select-none">
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
