import React from 'react';
import { cn } from '@/lib/utils';

export interface EngelsizForumLogoProps {
  className?: string;
  variant?: 'banner' | 'badge' | 'compact' | 'transparent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
}

/**
 * EngelsizForum Resmi Logosu (Image 2)
 * #185886 lacivert zemin üzerinde:
 * - "ENGELS" kalın beyaz
 * - "İ" harfinde nokta parlak camgöbeği/cyan (#38bdf8)
 * - "Z" kalın beyaz
 * - "FORUM" açık mavi/cyan (#7dd3fc)
 */
export function EngelsizForumLogo({
  className,
  variant = 'banner',
  size = 'md',
  showBackground = true,
}: EngelsizForumLogoProps) {
  const dimensions = {
    sm: { width: 150, height: 28, textEngelsiz: 16, textForum: 16, dotR: 2.2, dotCy: 8.5 },
    md: { width: 196, height: 36, textEngelsiz: 20, textForum: 20, dotR: 2.6, dotCy: 11 },
    lg: { width: 250, height: 46, textEngelsiz: 26, textForum: 26, dotR: 3.2, dotCy: 14 },
    xl: { width: 320, height: 58, textEngelsiz: 33, textForum: 33, dotR: 4.2, dotCy: 18 },
  }[size];

  if (variant === 'badge') {
    // Rozet biçiminde kompakt logo (EF + Erişilebilirlik sinyali)
    return (
      <div className={cn("inline-flex items-center justify-center shrink-0 rounded-md overflow-hidden shadow-xs", className)}>
        <svg
          viewBox="0 0 36 36"
          width={dimensions.height}
          height={dimensions.height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="EngelsizForum Logo Rozeti"
        >
          <rect width="36" height="36" rx="4" fill="#185886" />
          <path d="M7 10h14v3.5H11v3.5h8v3.5h-8v4.5h11V29H7V10z" fill="#FFFFFF" />
          <circle cx="27" cy="11.5" r="2.8" fill="#38BDF8" />
          <path d="M24 16h6v3h-3.5v10H24V16z" fill="#7DD3FC" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center select-none shrink-0",
        showBackground && "rounded-sm shadow-xs",
        className
      )}
      style={{
        backgroundColor: showBackground ? '#185886' : 'transparent',
      }}
    >
      <svg
        viewBox="0 0 196 36"
        width={dimensions.width}
        height={dimensions.height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto h-auto max-h-full"
        aria-label="EngelsizForum"
      >
        {showBackground && <rect width="196" height="36" rx="3" fill="#185886" />}

        {/* ENGELS - Kalın Beyaz */}
        <text
          x="12"
          y="25.5"
          fill="#FFFFFF"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontSize="21"
          fontWeight="900"
          letterSpacing="-0.3px"
        >
          ENGELS
        </text>

        {/* İ - Gövde Beyaz, Nokta Cyan (#38BDF8) */}
        <text
          x="100.5"
          y="25.5"
          fill="#FFFFFF"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontSize="21"
          fontWeight="900"
        >
          I
        </text>
        <circle cx="104.5" cy="10.5" r="2.5" fill="#38BDF8" />

        {/* Z - Kalın Beyaz */}
        <text
          x="110.5"
          y="25.5"
          fill="#FFFFFF"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontSize="21"
          fontWeight="900"
          letterSpacing="-0.3px"
        >
          Z
        </text>

        {/* FORUM - Açık Camgöbeği/Mavi (#7DD3FC) */}
        <text
          x="126"
          y="25.5"
          fill="#7DD3FC"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontSize="21"
          fontWeight="300"
          letterSpacing="0.4px"
        >
          FORUM
        </text>
      </svg>
    </div>
  );
}

export interface EngelsizForumLoginButtonProps {
  clientId?: string;
  redirectUri?: string;
  scope?: string;
  state?: string;
  theme?: 'green' | 'blue' | 'dark' | 'white';
  size?: 'sm' | 'md' | 'lg';
  layout?: 'split' | 'solid' | 'badge';
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Logolu "EngelsizForum ile Giriş Yap" Butonu
 * 1. Görseldeki yeşil buton deneyimini 2. Görseldeki resmi logo ile zenginleştirir.
 */
export function EngelsizForumLoginButton({
  clientId = 'YOUR_CLIENT_ID',
  redirectUri = 'http://localhost:3000/api/auth/callback/engelsizforum',
  scope = 'read',
  state = 'ef_auth_state',
  theme = 'green',
  size = 'md',
  layout = 'split',
  onClick,
  href,
  className,
  disabled = false,
}: EngelsizForumLoginButtonProps) {
  const targetHref =
    href ||
    `/api/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

  const sizeStyles = {
    sm: {
      btn: 'h-9 px-3 text-xs gap-2',
      logoScale: 'scale-90',
      badgeSize: 'w-6 h-6',
      badgeText: 'text-[11px]',
    },
    md: {
      btn: 'h-11 px-4 text-sm gap-3',
      logoScale: 'scale-100',
      badgeSize: 'w-7 h-7',
      badgeText: 'text-xs',
    },
    lg: {
      btn: 'h-13 px-5 text-base gap-3.5',
      logoScale: 'scale-110',
      badgeSize: 'w-8 h-8',
      badgeText: 'text-sm',
    },
  }[size];

  // Tema Stilleri (Kullanıcının 1. Görselindeki Yeşil ve 2. Görselindeki Resmi Mavi dahil)
  const themeStyles = {
    green: {
      container: 'bg-[#00875a] hover:bg-[#00744e] text-white border border-[#006644] shadow-xs active:bg-[#005a3c]',
      badgeBg: 'bg-[#185886] border border-white/20',
      textHighlight: 'font-extrabold',
    },
    blue: {
      container: 'bg-[#185886] hover:bg-[#12466b] text-white border border-[#103d5e] shadow-xs active:bg-[#0d344f]',
      badgeBg: 'bg-white/15 border border-white/20',
      textHighlight: 'font-extrabold',
    },
    dark: {
      container: 'bg-[#0f172a] hover:bg-[#1e293b] text-white border border-slate-700 shadow-xs active:bg-[#020617]',
      badgeBg: 'bg-[#185886] border border-slate-600',
      textHighlight: 'font-extrabold',
    },
    white: {
      container: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs active:bg-slate-100',
      badgeBg: 'bg-[#185886] border border-transparent text-white',
      textHighlight: 'font-extrabold text-[#185886]',
    },
  }[theme];

  const content = (
    <>
      {/* 2. Görseldeki Logo veya Kompakt Logo Rozeti */}
      {layout === 'split' ? (
        <div className="flex items-center shrink-0">
          <div className={cn("rounded-sm flex items-center justify-center overflow-hidden transition-transform", themeStyles.badgeBg, sizeStyles.badgeSize)}>
            <svg viewBox="0 0 32 32" className="w-full h-full p-1" fill="none">
              <path d="M6 8h14v3.5H10v3.5h7v3.5h-7V23h10V26H6V8z" fill="#FFFFFF" />
              <circle cx="24" cy="9.5" r="2.5" fill="#38BDF8" />
              <path d="M21 14h6v3h-3.5v9H21V14z" fill="#7DD3FC" />
            </svg>
          </div>
        </div>
      ) : layout === 'badge' ? (
        <div className="flex items-center shrink-0 pr-1 border-r border-white/20">
          <EngelsizForumLogo size="sm" showBackground={false} />
        </div>
      ) : (
        <div className="flex items-center shrink-0">
          <EngelsizForumLogo size="sm" showBackground={true} />
        </div>
      )}

      {/* Buton Metni */}
      <span className="font-bold tracking-tight whitespace-nowrap flex items-center gap-1.5 leading-none">
        <span>EngelsizForum</span>
        <span className="font-normal opacity-90">ile Giriş Yap</span>
      </span>
    </>
  );

  const baseClassName = cn(
    "inline-flex items-center justify-center rounded-sm font-sans font-medium transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#185886]/40",
    themeStyles.container,
    sizeStyles.btn,
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    className
  );

  if (onClick || disabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={baseClassName}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={targetHref}
      className={baseClassName}
      role="button"
      title="EngelsizForum ile Güvenli Giriş Yap"
    >
      {content}
    </a>
  );
}
