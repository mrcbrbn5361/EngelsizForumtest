'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { Calculator, Car, Calendar, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full bg-background">
      {/* FIXED "ENGELSİZ HIZLI ARAÇLAR" BAND (WCAG AAA Accessible - XenForo-like Style) */}
      <div className="w-full bg-[#185886] text-white border-b border-[#0f3b5c] py-2 px-4 mb-4 shadow-sm">
        <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-white font-extrabold uppercase tracking-wide">
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
            <span>Engelsiz Hızlı Araçlar:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Link 
              href="/hesaplama" 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-black/15 hover:bg-black/25 text-white transition-all border border-black/10 font-bold group"
              title="Formül: A + B * (100 - A) / 100"
            >
              <Calculator size={13} className="text-sky-300 group-hover:scale-110 transition-transform" />
              <span>Balthazard Hesaplama</span>
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-sm bg-sky-400/20 text-sky-200 border border-sky-400/20 font-extrabold">
                %40+
              </span>
            </Link>

            <Link 
              href="/hesaplama" 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-black/15 hover:bg-black/25 text-white transition-all border border-black/10 font-bold group"
              title="2026 Üst Sınırı: 2.247.100 TL"
            >
              <Car size={13} className="text-emerald-300 group-hover:scale-110 transition-transform" />
              <span>ÖTV Limit Kontrolü (2026)</span>
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-400/20 text-emerald-200 border border-emerald-400/20 font-extrabold">
                2.247.100 ₺
              </span>
            </Link>

            <Link 
              href="/hesaplama" 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-black/15 hover:bg-black/25 text-white transition-all border border-black/10 font-bold group"
              title="Yaş şartı aranmaksızın sigortalılık süresi ve prim günü hesabı"
            >
              <Calendar size={13} className="text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Erken Emeklilik Robotu</span>
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-400/20 text-amber-200 border border-amber-400/20 font-extrabold">
                Yaş Şartsız
              </span>
            </Link>

            <Link 
              href="/discussions/new" 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#f2930d] hover:bg-[#d68007] text-slate-950 font-black transition-all shadow-xs border border-[#b26904]"
            >
              <ShieldCheck size={13} />
              <span>Soru Sor / Hukuki Danış</span>
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
