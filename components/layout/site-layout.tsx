'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { Calculator, Car, Calendar, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* FIXED "ENGELSİZ HIZLI ARAÇLAR" BAND (WCAG AAA Accessible) */}
      <div className="w-full bg-slate-900 text-white dark:bg-slate-950 border-b border-slate-800 py-2.5 px-4">
        <div className="vibe-container flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2 text-blue-400 font-black uppercase tracking-wider">
            <Sparkles size={14} className="animate-pulse" />
            <span>Engelsiz Hızlı Araçlar:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link 
              href="/hesaplama" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors border border-slate-700 group"
              title="Formül: A + B * (100 - A) / 100"
            >
              <Calculator size={13} className="text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Balthazard Hesaplama</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-black">
                %40+
              </span>
            </Link>

            <Link 
              href="/hesaplama" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors border border-slate-700 group"
              title="2026 Üst Sınırı: 2.247.100 TL"
            >
              <Car size={13} className="text-blue-400 group-hover:scale-110 transition-transform" />
              <span>ÖTV Limit Kontrolü (2026)</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-black">
                2.247.100 ₺
              </span>
            </Link>

            <Link 
              href="/hesaplama" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors border border-slate-700 group"
              title="Yaş şartı aranmaksızın sigortalılık süresi ve prim günü hesabı"
            >
              <Calendar size={13} className="text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Erken Emeklilik Robotu</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300 border border-sky-400/30 font-black">
                Yaş Şartsız
              </span>
            </Link>

            <Link 
              href="/discussions/new" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <ShieldCheck size={13} />
              <span>Soru Sor / Hukuki Danış</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full">
        {children}
      </div>
      <Footer />
    </div>
  );
}
