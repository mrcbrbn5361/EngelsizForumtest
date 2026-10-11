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
    <footer id="site-footer" className="w-full bg-[#0d1117] border-t border-[#30363d] text-slate-300 mt-16 text-xs" role="contentinfo">
      
      {/* 1. Sponsorlar Şeridi (Footer Üstü) */}
      <div className="bg-[#161b22] border-b border-[#30363d] py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-red-500 fill-red-500 shrink-0" />
            <span className="font-bold text-white uppercase text-[11px] tracking-wider">
              Resmi Destekçiler &amp; Sponsorlar:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="https://yeterly.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-white font-bold border border-[#30363d] transition-colors"
            >
              <Sparkles size={12} className="text-amber-400" />
              <span>yeterly.ai</span>
              <ExternalLink size={10} className="text-slate-400" />
            </a>

            <a 
              href="https://goldhost.com.tr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-white font-bold border border-[#30363d] transition-colors"
            >
              <span>goldhost.com.tr</span>
              <ExternalLink size={10} className="text-slate-400" />
            </a>

            <a
              href="mailto:miracbirben@engelsizforum.com"
              className="text-[11px] text-sky-400 hover:underline font-semibold"
            >
              Sponsor Olun &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* 2. Sayfa Linkleri & Başa Dön */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
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
          <Link href="/help" className="hover:text-white transition-colors">
            Yardım &amp; SSS
          </Link>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-white transition-colors cursor-pointer text-xs font-bold"
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
            <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-black text-xs">
              <Accessibility size={16} strokeWidth={3} />
            </div>
            <span className="font-extrabold text-white text-sm">
              ENGELSİZ FORUM
            </span>
            <span className="text-xs font-mono font-bold text-sky-400 uppercase">
              WCAG 2.1 AAA
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Türkiye&apos;nin ilk tam erişilebilir engelli topluluğu; 2026 ÖTV muafiyeti, Balthazard ve erken emeklilik dayanışma platformu.
          </p>
        </div>

        <div className="text-left md:text-right space-y-1 text-xs text-slate-300 font-mono">
          <div className="font-semibold text-white">&copy; {currentYear} EngelsizForum &middot; Tüm hakları saklıdır.</div>
          <div className="text-xs text-slate-400">
            Aria &bull; Bora &bull; Felix &bull; MiracBirben &bull; TEKNOFEST 2027
          </div>
        </div>

      </div>

    </footer>
  );
}
