'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Car, 
  Calendar, 
  Code2, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  ChevronUp, 
  Globe, 
  Sparkles,
  Accessibility,
  Heart,
  ExternalLink
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="site-footer" className="w-full bg-slate-900 text-slate-200 border-t-2 border-slate-800 mt-12 text-xs" role="contentinfo">
      
      {/* Top Utility Links */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/hesaplama" className="hover:text-amber-300 text-white font-extrabold flex items-center gap-1.5 px-2 py-1 rounded transition-colors">
              <Calculator size={14} className="text-sky-400" />
              <span>Hesaplama Robotları</span>
            </Link>
            <span className="text-slate-600 select-none">•</span>
            <Link href="/about" className="hover:text-white text-slate-300 px-2 py-1 rounded transition-colors">
              <span>Hakkımızda &bull; TEKNOFEST</span>
            </Link>
            <span className="text-slate-600 select-none">•</span>
            <Link href="/terms" className="hover:text-white text-slate-300 px-2 py-1 rounded transition-colors">
              <span>Kullanım Kuralları</span>
            </Link>
            <span className="text-slate-600 select-none">•</span>
            <Link href="/privacy" className="hover:text-white text-slate-300 px-2 py-1 rounded transition-colors">
              <span>Gizlilik Politikası</span>
            </Link>
            <span className="text-slate-600 select-none">•</span>
            <Link href="/help" className="hover:text-white text-slate-300 px-2 py-1 rounded transition-colors">
              <span>Yardım &amp; SSS</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
            aria-label="Sayfanın Başına Dön"
          >
            <span>Yukarı Çık</span>
            <ChevronUp size={15} />
          </button>

        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand info */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black">
              <Accessibility size={18} />
            </div>
            <span className="text-base font-black text-white tracking-tight">
              ENGELSİZ<span className="text-sky-400">FORUM</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            TEKNOFEST 2027 Engelsiz Yaşam Teknolojileri vizyonu doğrultusunda geliştirilen EngelsizForum; engelli bireylerin haklarına, rapor hesaplamalarına ve güncel mevzuata kolayca erişmesini hedefleyen bağımsız ve erişilebilir dijital platformdur.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-amber-300 font-bold">
            <Sparkles size={13} />
            <span>WCAG 2.1 AAA Standartlarına Uyumlu Tasarım</span>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">
            Hesaplama Robotları
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>
              <Link href="/hesaplama" className="hover:text-white transition-colors">
                Balthazard Oranı Hesaplama
              </Link>
            </li>
            <li>
              <Link href="/hesaplama" className="hover:text-white transition-colors">
                2026-2027 ÖTV Araç Üst Limiti
              </Link>
            </li>
            <li>
              <Link href="/hesaplama" className="hover:text-white transition-colors">
                Erken Emeklilik ve Prim Tablosu
              </Link>
            </li>
            <li>
              <Link href="/hesaplama" className="hover:text-white transition-colors">
                E-KPSS ve Gelir Vergisi İndirimi
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Standards */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">
            Erişilebilirlik &amp; Standartlar
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>OpenDyslexic Disleksi Desteği</li>
            <li>Web Speech API Sesli Ekran Okuma</li>
            <li>Döteranopi / Protanopi Renk Filtreleri</li>
            <li>İşitme Engelli Görsel Flaş Uyarıları</li>
            <li>Klavyeden Tam Kontrol (Alt+A)</li>
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800/80 py-4 px-4 sm:px-6 bg-slate-950 text-center text-[11px] text-slate-500 font-medium">
        &copy; {currentYear} EngelsizForum. Tüm hakları saklıdır. TEKNOFEST 2027 Engelsiz Yaşam Teknolojileri için hazırlanmıştır.
      </div>

    </footer>
  );
}
