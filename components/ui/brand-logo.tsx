import React from 'react';
import { cn } from '@/lib/utils';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  iconOnly?: boolean;
  showSubtitle?: boolean;
}

export function BrandLogoMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105", className)}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ef-bg-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="0.5" stopColor="#0B0F19" />
            <stop offset="1" stopColor="#030712" />
          </linearGradient>
          <linearGradient id="ef-sky-grad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.6" stopColor="#0284C7" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="ef-spark-grad" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.4" stopColor="#38BDF8" />
            <stop offset="1" stopColor="#10B981" />
          </linearGradient>
          <filter id="ef-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shield Container Background */}
        <rect width="100" height="100" rx="26" fill="url(#ef-bg-grad)" />
        <rect width="98" height="98" x="1" y="1" rx="25" fill="none" stroke="url(#ef-sky-grad)" strokeWidth="1.5" strokeOpacity="0.4" />

        {/* Ambient glow behind emblem */}
        <circle cx="50" cy="50" r="28" fill="#0284C7" fillOpacity="0.22" filter="url(#ef-glow)" />

        {/* Beacon / Head for Accessibility Figure */}
        <circle cx="50" cy="22" r="8" fill="url(#ef-spark-grad)" />
        
        {/* Upper Arch (Open Arms / Wings forming top bar of 'E') */}
        <path 
          d="M 20 40 C 32 30, 68 30, 80 40 C 83 42.5, 80 46.5, 75 45.5 C 62 40, 38 40, 25 45.5 C 20 46.5, 17 42.5, 20 40 Z" 
          fill="url(#ef-sky-grad)" 
        />

        {/* Middle Bar of 'E' with Active Node */}
        <path 
          d="M 30 53 L 62 53 C 65 53, 65 58, 62 58 L 30 58 C 27 58, 27 53, 30 53 Z" 
          fill="url(#ef-sky-grad)" 
        />
        <circle cx="68" cy="55.5" r="3.5" fill="#10B981" />

        {/* Spine & Foundation Curve (Bottom Bar of 'E') */}
        <path 
          d="M 23 36 L 23 72 C 23 78, 29 81, 38 80 L 76 76 C 80 75.5, 80 70.5, 75 71 L 33 75 C 29.5 75, 28.5 73, 28.5 69 L 28.5 36 C 28.5 33, 23 33, 23 36 Z" 
          fill="url(#ef-sky-grad)" 
        />
      </svg>
    </div>
  );
}

export function BrandLogo({ 
  size = 'md', 
  showText = true, 
  className,
  iconOnly = false,
  showSubtitle = true
}: BrandLogoProps) {
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9 sm:h-10 sm:w-10',
    lg: 'h-11 w-11 sm:h-12 sm:w-12',
    xl: 'h-14 w-14 sm:h-16 sm:w-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-base sm:text-lg lg:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  const subTextSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={cn("inline-flex items-center gap-2 sm:gap-2.5 group select-none", className)}>
      <BrandLogoMark className={sizeClasses[size]} />
      {showText && !iconOnly && (
        <div className="flex flex-col min-w-0">
          <div className={cn("font-bold tracking-tight text-slate-100 leading-none flex items-center gap-0.5", textSizes[size])}>
            <span>Engelsiz</span>
            <span className="text-sky-400">Forum</span>
          </div>
          {showSubtitle && (
            <span className={cn("font-medium tracking-wide text-slate-400 leading-tight mt-0.5 hidden md:inline truncate", subTextSizes[size])}>
              Erişilebilir Topluluk Platformu
            </span>
          )}
        </div>
      )}
    </div>
  );
}
