'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Car, 
  Calendar, 
  Code2, 
  ShieldCheck, 
  HelpCircle, 
  Mail, 
  MapPin, 
  ChevronUp, 
  Globe, 
  Sparkles,
  HeartHandshake,
  Activity,
  FileText
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="xf-site-footer" className="w-full bg-[#0e273c] text-slate-200 border-t-2 border-[#185886] mt-auto text-xs" role="contentinfo">
      
      {/* XenForo Classic Top Navigation Bar */}
      <div className="bg-[#123652] border-b border-[#1b4d73] py-2 px-4">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-sky-100">
          
          {/* Quick links left */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <Link href="/hesaplama" className="hover:text-white transition-colors text-sky-200 font-extrabold flex items-center gap-1">
              <Calculator size={13} />
              Engelli Hesaplama Araçları
            </Link>
            <span className="text-white/20 select-none">•</span>
            <Link href="/about" className="hover:text-white transition-colors">
              Bize Ulaşın
            </Link>
            <span className="text-white/20 select-none">•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Şartlar &amp; Kurallar
            </Link>
            <span className="text-white/20 select-none">•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Gizlilik Politikası
            </Link>
            <span className="text-white/20 select-none">•</span>
            <Link href="/help" className="hover:text-white transition-colors">
              Yardım / SSS
            </Link>
            <span className="text-white/20 select-none">•</span>
            <Link href="/developers" className="text-amber-300 hover:text-amber-200 font-extrabold flex items-center gap-1 transition-colors">
              <Code2 size={13} />
              Geliştirici Portalı (API)
            </Link>
          </div>

          {/* Quick links right (Home & Back to Top) */}
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/" className="hover:text-white transition-colors">
              Ana Sayfa
            </Link>
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-1 px-2 py-0.5 bg-black/20 hover:bg-black/35 text-sky-200 hover:text-white rounded-xs transition-colors cursor-pointer border border-white/10"
              aria-label="Sayfa Başına Dön"
              title="Sayfanın En Üstüne Çık"
            >
              <ChevronUp size={13} />
              <span>Üste Dön</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 4-Column Section */}
      <div className="max-w-[1280px] mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: About EngelsizForum */}
          <div className="space-y-3">
            <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5 select-none">
              <span>ENGELSİZ</span>
              <span className="text-sky-400 font-light">FORUM</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Türkiye&apos;nin ilk ve tek tam erişilebilir (%100 WCAG 2.1 AAA), açık veri ve hak temelli engelli dayanışma platformu. Balthazard, ÖTV 2026 ve erken emeklilik robotları ile hak kaybını önler.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#091a27] border border-[#1b4d73] text-[11px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tüm Servisler Operasyonel</span>
              </div>
            </div>
          </div>

          {/* Column 2: Legal & Calculations */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-300 pb-1 border-b border-[#1b4d73]">
              Hesaplama Robotları &amp; Haklar
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/hesaplama" className="hover:text-sky-300 transition-colors flex items-center gap-1.5 font-bold text-sky-200">
                  <Calculator size={13} className="text-sky-400 shrink-0" />
                  <span>Engelli Hesaplama Araçları (Tümü)</span>
                </Link>
              </li>
              <li>
                <Link href="/hesaplama/balthazard" className="hover:text-sky-300 transition-colors flex items-center gap-1.5">
                  <Calculator size={13} className="text-sky-400 shrink-0" />
                  <span>Balthazard Özür Oranı Hesabı</span>
                </Link>
              </li>
              <li>
                <Link href="/hesaplama/otv" className="hover:text-sky-300 transition-colors flex items-center gap-1.5">
                  <Car size={13} className="text-emerald-400 shrink-0" />
                  <span>2026 ÖTV Muafiyet Üst Limiti (2.29M ₺)</span>
                </Link>
              </li>
              <li>
                <Link href="/hesaplama/erken-emeklilik" className="hover:text-sky-300 transition-colors flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-400 shrink-0" />
                  <span>Erken Emeklilik ve Prim Günü Sorgu</span>
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-sky-300 transition-colors flex items-center gap-1.5">
                  <FileText size={13} className="text-slate-400 shrink-0" />
                  <span>Sağlık Kurulu Raporu Kılavuzu</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Developers & Standards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-300 pb-1 border-b border-[#1b4d73]">
              Geliştirici &amp; Açık Standartlar
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/developers" className="hover:text-sky-300 transition-colors flex items-center gap-1.5">
                  <Code2 size={13} className="text-sky-400 shrink-0" />
                  <span>OAuth 2.0 İstemci Yönetimi (RFC 6749)</span>
                </Link>
              </li>
              <li>
                <Link href="/developers" className="hover:text-sky-300 transition-colors flex items-center gap-1.5">
                  <Activity size={13} className="text-sky-400 shrink-0" />
                  <span>REST API Başvuru Dokümantasyonu</span>
                </Link>
              </li>
              <li>
                <Link href="/developers" className="hover:text-sky-300 transition-colors flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400 shrink-0" />
                  <span>WebMCP Model Context Protocol Entegrasyonu</span>
                </Link>
              </li>
              <li>
                <Link href="/yardim/erisilebilirlik" className="hover:text-sky-300 transition-colors flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  <span>Erişilebilirlik Bildirimi (WCAG 2.1 AAA)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Community */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-300 pb-1 border-b border-[#1b4d73]">
              İletişim &amp; Topluluk
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-sky-400 shrink-0 mt-0.5" />
                <span>Bağcılar / İstanbul, Türkiye</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-sky-400 shrink-0" />
                <a href="mailto:miracbirben@engelsizforum.com" className="hover:text-sky-300 transition-colors font-medium break-all">
                  miracbirben@engelsizforum.com
                </a>
              </li>
              <li className="pt-1 text-[11px] text-slate-400 leading-normal">
                Nefret söylemine ve ayrımcılığa sıfır tolerans ilkesiyle yönetilmektedir.
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* XenForo Classic Bottom Copyright Bar */}
      <div className="bg-[#081724] border-t border-[#123652] py-3 px-4">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-400">
          
          <div className="text-center sm:text-left">
            Forum Yazılımı: <strong>XenForo® Tarzı EngelsizForum Motoru</strong> © {currentYear} EngelsizForum. Tüm hakları saklıdır.
            <span className="mx-2 text-slate-600">|</span>
            Sponsor: <a href="https://goldhost.com.tr" target="_blank" rel="noopener noreferrer" className="hover:text-white text-sky-400 font-bold hover:underline" id="sponsor-link">goldhost.com.tr</a>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 text-sky-300 font-bold">
              <Globe size={12} />
              Türkçe (TR)
            </span>
            <span>•</span>
            <span className="text-slate-300 font-semibold">
              WCAG 2.1 Level AAA
            </span>
            <span>•</span>
            <span className="text-slate-500 font-mono text-[10px]">
              v2.4.0-oauth
            </span>
          </div>

        </div>
      </div>

    </footer>
  );
}
