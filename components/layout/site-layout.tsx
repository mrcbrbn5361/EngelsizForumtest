'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, Car, Calendar, ShieldCheck, Sparkles } from 'lucide-react';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full bg-background">
      {/* FIXED "ENGELSİZ HIZLI ARAÇLAR" BAND (WCAG AAA Accessible - XenForo-like Style) */}
      <div className="w-full bg-[#185886] text-white border-b border-[#0f3b5c] py-1.5 sm:py-2 px-3 sm:px-4 mb-3 sm:mb-4 shadow-xs">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs">
          <div className="flex items-center justify-between gap-2 text-white font-extrabold uppercase tracking-wide text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-300 shrink-0" />
              <span>Hızlı Mevzuat &amp; Hesaplama:</span>
            </div>
            <Link href="/hesaplama" className="sm:hidden text-[10px] text-sky-200 underline font-normal">
              Tüm Robotlar &rarr;
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
            <Link 
              href="/hesaplama" 
              className="shrink-0 inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-sm bg-black/15 hover:bg-black/25 text-white transition-all border border-black/10 text-[11px] sm:text-xs font-bold group"
              title="Formül: A + B * (100 - A) / 100"
            >
              <Calculator size={12} className="text-sky-300 group-hover:scale-110 transition-transform" />
              <span>Balthazard</span>
              <span className="ml-1 text-[9px] sm:text-[10px] px-1 py-0.2 rounded-sm bg-sky-400/20 text-sky-200 border border-sky-400/20 font-extrabold">
                %40+
              </span>
            </Link>

            <Link 
              href="/hesaplama" 
              className="shrink-0 inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-sm bg-black/15 hover:bg-black/25 text-white transition-all border border-black/10 text-[11px] sm:text-xs font-bold group"
              title="2026 Üst Sınırı: 2.247.100 TL"
            >
              <Car size={12} className="text-emerald-300 group-hover:scale-110 transition-transform" />
              <span>ÖTV 2026</span>
              <span className="ml-1 text-[9px] sm:text-[10px] px-1 py-0.2 rounded-sm bg-emerald-400/20 text-emerald-200 border border-emerald-400/20 font-extrabold">
                2.24M ₺
              </span>
            </Link>

            <Link 
              href="/hesaplama" 
              className="shrink-0 inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-sm bg-black/15 hover:bg-black/25 text-white transition-all border border-black/10 text-[11px] sm:text-xs font-bold group"
              title="Yaş şartı aranmaksızın sigortalılık süresi ve prim günü hesabı"
            >
              <Calendar size={12} className="text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Emeklilik</span>
              <span className="ml-1 text-[9px] sm:text-[10px] px-1 py-0.2 rounded-sm bg-amber-400/20 text-amber-200 border border-amber-400/20 font-extrabold">
                Yaş Şartsız
              </span>
            </Link>

            <Link 
              href="/discussions/new" 
              className="shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-sm bg-[#f2930d] hover:bg-[#d68007] text-slate-950 text-[11px] sm:text-xs font-black transition-all shadow-xs border border-[#b26904]"
            >
              <ShieldCheck size={12} />
              <span>Soru Sor</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
