import React from 'react';
import Link from 'next/link';
import { Home, AlertCircle, CheckCircle2, type LucideIcon } from 'lucide-react';

/**
 * Shared frame for the sign-in, sign-up and password pages: breadcrumb, a card with an icon
 * header and a body. Matches the design of /login and /register so every account page looks the same.
 */

export const authLabelClass = 'block text-xs font-semibold text-fg-3 uppercase tracking-wider';
export const authInputClass =
  'w-full pl-10 pr-3.5 h-11 text-xs sm:text-sm font-medium bg-surface-hover border border-line rounded-md text-fg placeholder-fg-5 focus:outline-none focus:border-indigo-400 light:focus:border-indigo-700 transition-colors disabled:opacity-60';
export const authPrimaryButtonClass =
  'w-full h-11 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
export const authSecondaryLinkClass =
  'text-xs font-medium text-fg-4 hover:text-fg transition-colors inline-flex items-center justify-center gap-1.5';

type Tone = 'default' | 'success' | 'error';

const ICON_TONE: Record<Tone, string> = {
  default: 'bg-indigo-500/20 text-indigo-400 light:text-indigo-700 border-indigo-500/30',
  success: 'bg-emerald-500/15 text-emerald-400 light:text-emerald-700 border-emerald-500/30',
  error: 'bg-rose-500/15 text-rose-400 light:text-rose-700 border-rose-500/30',
};

export function AuthCard({
  crumb,
  icon: Icon,
  title,
  subtitle,
  tone = 'default',
  iconClassName,
  children,
}: {
  crumb: string;
  icon: LucideIcon;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  tone?: Tone;
  iconClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto w-full py-6 sm:py-10 px-4">
      <nav aria-label="Konum" className="bg-surface-raised border border-line px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-fg-4 rounded-md font-mono">
        <Link href="/" className="hover:text-indigo-400 light:hover:text-indigo-700 flex items-center gap-1.5 font-sans font-medium transition-colors">
          <Home size={13} aria-hidden="true" />
          <span>Ana Sayfa</span>
        </Link>
        <span className="text-fg-6" aria-hidden="true">/</span>
        <span className="font-semibold text-fg-2 font-sans" aria-current="page">{crumb}</span>
      </nav>

      <div className="bg-surface-raised border border-line rounded-lg overflow-hidden shadow-xl">
        <div className="bg-surface-hover text-fg p-5 sm:p-6 border-b border-line flex items-center gap-3">
          <div className={`w-10 h-10 rounded-md border flex items-center justify-center shrink-0 ${ICON_TONE[tone]}`}>
            <Icon size={20} strokeWidth={2.2} aria-hidden="true" className={iconClassName} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-fg font-heading">{title}</h1>
            {subtitle && <p className="text-xs text-fg-4 font-normal">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="p-6 sm:p-7 space-y-5">{children}</div>}
      </div>
    </div>
  );
}

/** Success or error message inside an auth card. */
export function AuthAlert({ type, id, children }: { type: 'success' | 'error'; id?: string; children: React.ReactNode }) {
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <div
      id={id}
      role={type === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 p-4 rounded-md border text-xs font-medium ${
        type === 'success'
          ? 'bg-emerald-500/10 text-emerald-300 light:text-emerald-800 border-emerald-500/30'
          : 'bg-rose-500/10 text-rose-300 light:text-rose-800 border-rose-500/30'
      }`}
    >
      <Icon size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}
