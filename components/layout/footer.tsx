'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronUp, 
  Accessibility, 
  Heart,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="site-footer" className="w-full bg-[#0B1220] border-t border-[#1E293B] text-slate-300 mt-16 text-xs" role="contentinfo">
      
      {/* 1. Destekçiler Şeridi (Footer Üstü) */}
      <div className="bg-[#111B2E] border-b border-[#1E293B] py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-rose-400 fill-rose-400 shrink-0" />
            <span className="font-semibold text-slate-200 uppercase text-[11px] tracking-wider font-heading">
              Resmi Destekçiler &amp; Sponsorlar:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="https://yeterly.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#18243A] hover:bg-[#1E293B] hover:border-indigo-500/60 text-slate-200 font-medium border border-[#1E293B] transition-colors"
            >
              <Sparkles size={12} className="text-amber-400" />
              <span>yeterly.ai</span>
              <ExternalLink size={10} className="text-slate-400" />
            </a>

            <a 
              href="https://goldhost.com.tr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#18243A] hover:bg-[#1E293B] hover:border-indigo-500/60 text-slate-200 font-medium border border-[#1E293B] transition-colors"
            >
              <span>goldhost.com.tr</span>
              <ExternalLink size={10} className="text-slate-400" />
            </a>

            <a
              href="mailto:miracbirben@engelsizforum.com"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
            >
              Sponsor Olun &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* 2. Sayfa Linkleri & Başa Dön */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-400">
          <Link href="/hesaplama" className="hover:text-white transition-colors">
            Hesaplama Robotları
          </Link>
          <Link href="/discussions" className="hover:text-white transition-colors">
            Tartışmalar
          </Link>
          <Link href="/communities" className="hover:text-white transition-colors">
            Topluluklar
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            Hakkımızda
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Kullanım Kuralları
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Gizlilik Politikası
          </Link>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-cookie-settings'));
              }
            }}
            className="hover:text-white transition-colors cursor-pointer text-left text-xs sm:text-sm font-medium text-slate-400"
          >
            Çerez Tercihleri
          </button>
          <Link href="/help" className="hover:text-white transition-colors">
            Yardım &amp; SSS
          </Link>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#18243A] border border-[#1E293B] hover:bg-[#1E293B] hover:text-white text-slate-300 transition-colors cursor-pointer text-xs font-medium"
          aria-label="Sayfanın Başına Dön"
        >
          <span>Başa Dön</span>
          <ChevronUp size={14} />
        </button>
      </div>

      {/* 3. Marka & Durum */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              <Accessibility size={15} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-sm font-heading tracking-tight">
              ENGELSİZ FORUM
            </span>
            <span className="text-[11px] font-mono font-medium text-indigo-400 uppercase bg-indigo-950/60 border border-indigo-800/60 px-1.5 py-0.5 rounded">
              WCAG 2.2 AA
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            Türkiye&apos;nin tam erişilebilir engelli topluluğu; 2026 ÖTV muafiyeti, Balthazard ve erken emeklilik dayanışma platformu.
          </p>
        </div>

        <div className="text-left md:text-right space-y-1 text-xs text-slate-400 font-mono">
          <div className="font-normal text-slate-300">&copy; {currentYear} EngelsizForum &middot; Tüm hakları saklıdır.</div>
          <div className="text-[11px] text-slate-400">
            Aria &bull; Bora &bull; Felix &bull; MiracBirben &bull; TEKNOFEST 2027
          </div>
        </div>

      </div>

    </footer>
  );
}
