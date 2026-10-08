'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Car, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  FileText,
  Accessibility,
  ArrowRight
} from 'lucide-react';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full text-slate-900 dark:text-slate-100">
      {/* High-Impact Accessibility & Calculator Action Rail */}
      <div className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-3 sm:px-6 shadow-xs mb-6">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 text-[11px] font-black uppercase tracking-wider">
              <Sparkles size={13} className="text-amber-400 dark:text-amber-600" />
              <span>Hızlı Hesaplayıcılar</span>
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold hidden sm:inline">
              Resmi 2026-2027 mevzuat parametreleri ile anlık simülasyon:
            </span>
          </div>

          {/* Distinctly Colored Interactive Tools */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
            {/* Balthazard Tool */}
            <Link 
              href="/hesaplama" 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-900 dark:text-sky-200 border-2 border-sky-300 dark:border-sky-800 transition-all font-bold text-xs group"
              title="Formül: A + B * (100 - A) / 100"
            >
              <div className="p-1 rounded bg-sky-700 text-white shrink-0 group-hover:scale-110 transition-transform">
                <Calculator size={13} />
              </div>
              <span>Balthazard Oranı</span>
              <span className="text-[10px] bg-sky-200 dark:bg-sky-800 text-sky-950 dark:text-white px-1.5 py-0.2 rounded font-black">
                %40+
              </span>
            </Link>

            {/* ÖTV Muafiyeti */}
            <Link 
              href="/hesaplama" 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-2 border-emerald-300 dark:border-emerald-800 transition-all font-bold text-xs group"
              title="2026 Üst Sınırı: 2.247.100 TL"
            >
              <div className="p-1 rounded bg-emerald-700 text-white shrink-0 group-hover:scale-110 transition-transform">
                <Car size={13} />
              </div>
              <span>ÖTV Muafiyeti</span>
              <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-950 dark:text-white px-1.5 py-0.2 rounded font-black">
                2.24M ₺
              </span>
            </Link>

            {/* Erken Emeklilik */}
            <Link 
              href="/hesaplama" 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-950 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-800 transition-all font-bold text-xs group"
              title="Kademeli prim günü ve sigortalılık süresi hesabı"
            >
              <div className="p-1 rounded bg-amber-600 text-white shrink-0 group-hover:scale-110 transition-transform">
                <Calendar size={13} />
              </div>
              <span>Erken Emeklilik</span>
              <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-white px-1.5 py-0.2 rounded font-black">
                Yaş Şartsız
              </span>
            </Link>

            {/* Tüm Araçlar */}
            <Link 
              href="/hesaplama" 
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700"
            >
              <span>Tümü</span>
              <ArrowRight size={12} />
            </Link>
          </div>

        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
