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
    <footer id="xf-site-footer" className="w-full bg-[#0e273c] text-white border-t-2 border-[#185886] mt-auto text-xs" role="contentinfo">
      
      {/* XenForo Classic Top Navigation Bar */}
      <div className="bg-[#123652] border-b border-[#1b4d73] py-2 px-4">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-white">
          
          {/* Quick links left */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <Link href="/hesaplama" className="hover:text-sky-200 text-white font-extrabold flex items-center gap-1.5 px-2 py-1.5 min-h-[36px] rounded transition-colors">
              <Calculator size={14} className="text-sky-300" />
              <span>Engelli Hesaplama Araçları</span>
            </Link>
            <span className="text-sky-300/40 select-none">•</span>
            <Link href="/about" className="hover:text-sky-200 text-white px-2 py-1.5 min-h-[36px] flex items-center rounded transition-colors">
              <span>Bize Ulaşın</span>
            </Link>
            <span className="text-sky-300/40 select-none">•</span>
            <Link href="/terms" className="hover:text-sky-200 text-white px-2 py-1.5 min-h-[36px] flex items-center rounded transition-colors">
              <span>Şartlar &amp; Kurallar</span>
            </Link>
            <span className="text-sky-300/40 select-none">•</span>
            <Link href="/privacy" className="hover:text-sky-200 text-white px-2 py-1.5 min-h-[36px] flex items-center rounded transition-colors">
              <span>Gizlilik Politikası</span>
            </Link>
            <span className="text-sky-300/40 select-none">•</span>
            <Link href="/help" className="hover:text-sky-200 text-white px-2 py-1.5 min-h-[36px] flex items-center rounded transition-colors">
              <span>Yardım / SSS</span>
            </Link>
            <span className="text-sky-300/40 select-none">•</span>
            <Link href="/developers" className="text-amber-300 hover:text-amber-200 font-extrabold flex items-center gap-1.5 px-2 py-1.5 min-h-[36px] rounded transition-colors">
              <Code2 size={14} className="text-amber-300" />
              <span>Geliştirici Portalı (API)</span>
            </Link>
          </div>

          {/* Quick links right (Home & Back to Top) */}
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/" className="hover:text-sky-200 text-white px-2 py-1.5 min-h-[36px] flex items-center transition-colors">
              <span>Ana Sayfa</span>
            </Link>
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] bg-black/30 hover:bg-black/50 text-white rounded transition-colors cursor-pointer border border-white/20"
              aria-label="Sayfa Başına Dön"
              title="Sayfanın En Üstüne Çık"
            >
              <ChevronUp size={14} />
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
            <h3 className="text-base font-black tracking-tight text-white flex items-center gap-1.5 select-none m-0">
              <span>ENGELSİZ</span>
              <span className="text-sky-400 font-light">FORUM</span>
            </h3>
            <p className="text-slate-200 text-xs leading-relaxed">
              Türkiye&apos;nin ilk ve tek tam erişilebilir (%100 WCAG 2.1 AAA), açık veri ve hak temelli engelli dayanışma platformu. Balthazard, ÖTV 2026 ve erken emeklilik robotları ile hak kaybını önler.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] rounded-xs bg-[#091a27] border border-[#1b4d73] text-[11px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tüm Servisler Operasyonel</span>
              </div>
            </div>
          </div>

          {/* Column 2: Legal & Calculations */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-300 pb-1.5 border-b border-[#1b4d73] m-0">
              Hesaplama Robotları &amp; Haklar
            </h3>
            <ul className="space-y-1 text-xs text-white">
              <li>
                <Link href="/hesaplama" className="hover:text-sky-300 text-white transition-colors flex items-center gap-2 py-1.5 min-h-[36px] font-bold">
                  <Calculator size={14} className="text-sky-400 shrink-0" />
                  <span>Engelli Hesaplama Araçları (Tümü)</span>
                </Link>
              </li>
              <li>
                <Link href="/hesaplama/balthazard" className="hover:text-sky-300 text-white transition-colors flex items-center gap-2 py-1.5 min-h-[36px]">
                  <Calculator size={14} className="text-sky-400 shrink-0" />
                  <span>Balthazard Özür Oranı Hesabı</span>
                </Link>
              </li>
              <li>
                <Link href="/hesaplama/otv" className="hover:text-sky-300 text-white transition-colors flex items-center gap-2 py-1.5 min-h-[36px]">
                  <Car size={14} className="text-emerald-400 shrink-0" />
                  <span>2026 ÖTV Muafiyet Üst Limiti (2.29M ₺)</span>
                </Link>
              </li>
              <li>
                <Link href="/hesaplama/erken-emeklilik" className="hover:text-sky-300 text-white transition-colors flex items-center gap-2 py-1.5 min-h-[36px]">
                  <Calendar size={14} className="text-amber-400 shrink-0" />
                  <span>Erken Emeklilik ve Prim Günü Sorgu</span>
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-sky-300 text-white transition-colors flex items-center gap-2 py-1.5 min-h-[36px]">
                  <FileText size={14} className="text-slate-300 shrink-0" />
                  <span>Sağlık Kurulu Raporu Kılavuzu</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Developers & Standards */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-300 pb-1.5 border-b border-[#1b4d73] m-0">
              Geliştirici &amp; Açık Standartlar
            </h3>
            <ul className="space-y-1 text-xs text-white">
              <li>
                <Link href="/developers" className="hover:text-sky-300 text-white transition-colors flex items-center gap-2 py-1.5 min-h-[36px]">
                  <Code2 size={14} className="text-sky-400 shrink-0" />
                  <span>OAuth 2.0 İstemci Yönetimi (RFC 6749)</span>
                </Link>
              </li>
              <li>
                <Link href="/developers" className="hover:text-sky-300 text-white transition-colors flex items-center gap-2 py-1.5 min-h-[36px]">
                  <Activity size={14} className="text-sky-400 shrink-0" />
                  <span>REST API Başvuru Dokümantasyonu</span>
                </Link>
              </li>
              <li>
                <Link href="/developers" className="hover:text-sky-300 text-white transition-colors flex items-center gap-2 py-1.5 min-h-[36px]">
                  <Sparkles size={14} className="text-amber-400 shrink-0" />
                  <span>WebMCP Model Context Protocol Entegrasyonu</span>
                </Link>
              </li>
              <li>
                <Link href="/yardim/erisilebilirlik" className="hover:text-sky-300 text-white transition-colors flex items-center gap-2 py-1.5 min-h-[36px]">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span>Erişilebilirlik Bildirimi (WCAG 2.1 AAA)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Community */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-300 pb-1.5 border-b border-[#1b4d73] m-0">
              İletişim &amp; Topluluk
            </h3>
            <ul className="space-y-2 text-xs text-white">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-sky-400 shrink-0 mt-0.5" />
                <span className="text-slate-200">Bağcılar / İstanbul, Türkiye</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-sky-400 shrink-0" />
                <a href="mailto:miracbirben@engelsizforum.com" className="text-sky-300 hover:text-white transition-colors font-medium break-all py-1 min-h-[36px] flex items-center">
                  miracbirben@engelsizforum.com
                </a>
              </li>
              <li className="pt-1 text-[11px] text-slate-300 leading-normal">
                Nefret söylemine ve ayrımcılığa sıfır tolerans ilkesiyle yönetilmektedir.
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* XenForo Classic Bottom Copyright Bar */}
      <div className="bg-[#081724] border-t border-[#123652] py-3.5 px-4">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-slate-200">
          
          <div className="text-center sm:text-left">
            Forum Yazılımı: <strong>XenForo® Tarzı EngelsizForum Motoru</strong> © {currentYear} EngelsizForum. Tüm hakları saklıdır.
            <span className="mx-2 text-slate-500">|</span>
            Sponsor: <a href="https://goldhost.com.tr" target="_blank" rel="noopener noreferrer" className="hover:text-white text-sky-300 font-bold hover:underline px-1 py-1 min-h-[32px] inline-flex items-center" id="sponsor-link">goldhost.com.tr</a>
          </div>

          <div className="flex items-center gap-4 text-slate-200">
            <span className="flex items-center gap-1 text-sky-200 font-bold">
              <Globe size={13} />
              Türkçe (TR)
            </span>
            <span>•</span>
            <span className="text-white font-semibold">
              WCAG 2.1 Level AAA
            </span>
            <span>•</span>
            <span className="text-slate-300 font-mono text-[11px]">
              v2.4.0-oauth
            </span>
          </div>

        </div>
      </div>

    </footer>
  );
}
