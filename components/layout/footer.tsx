import React from 'react';
import Link from 'next/link';
import { MessageSquare, Users, Info, Shield, HelpCircle, Mail, MapPin, Calculator, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-footer" className="border-t border-white/[0.08] bg-[#090a0f] text-slate-200 w-full mt-auto" role="contentinfo">
      <div className="vibe-container py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4 text-left">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex items-center justify-center h-8 w-8 bg-sky-500 text-slate-950 font-bold rounded-xl text-base shadow-xs group-hover:scale-105 transition-transform">
                E
              </div>
              <div className="text-xl font-bold tracking-tight text-slate-100">
                Engelsiz<span className="text-sky-400">Forum</span>
              </div>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Türkiye&apos;nin erişilebilir, yapay zeka destekli kapsayıcı topluluk platformu. Engelli bireyler ve aileleri için güncel mevzuat, dayanışma ve rehberlik alanı.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Canlı Prototip &amp; Demo Sürümü
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3.5 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Topluluk &amp; Platform
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/discussions" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-2">
                  <MessageSquare size={15} className="text-slate-400 dark:text-slate-500" /> Tartışma Başlıkları
                </Link>
              </li>
              <li>
                <Link href="/communities" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-2">
                  <Users size={15} className="text-slate-400 dark:text-slate-500" /> İlgi &amp; Tanı Toplulukları
                </Link>
              </li>
              <li>
                <Link href="/hesaplama" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-2">
                  <Calculator size={15} className="text-slate-400 dark:text-slate-500" /> Hak &amp; Maaş Hesaplama
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-2">
                  <Info size={15} className="text-slate-400 dark:text-slate-500" /> Hakkımızda &amp; Misyon
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-2">
                  <HelpCircle size={15} className="text-slate-400 dark:text-slate-500" /> Yardım Merkezi &amp; SSS
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Safety */}
          <div className="space-y-3.5 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Erişilebilirlik &amp; Hukuk
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/accessibility" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-2">
                  <Shield size={15} className="text-slate-400 dark:text-slate-500" /> Erişilebilirlik Beyanı (WCAG 2.1)
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-2">
                  <Shield size={15} className="text-slate-400 dark:text-slate-500" /> Bilgi Güvenliği Politikası
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-2">
                  <Shield size={15} className="text-slate-400 dark:text-slate-500" /> KVKK &amp; Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-2">
                  <Info size={15} className="text-slate-400 dark:text-slate-500" /> Kullanım &amp; Topluluk Şartları
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3.5 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              İletişim &amp; Destek
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm">Bağcılar / İstanbul, Türkiye</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
                <a href="mailto:miracbirben@engelsizforum.com" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-xs sm:text-sm break-all">
                  miracbirben@engelsizforum.com
                </a>
              </li>
              <li className="pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Erişilebilirlik önceliği ile tasarlandı</span>
                  <Heart size={13} className="text-rose-500 fill-rose-500 inline" />
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            © {currentYear} EngelsizForum. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Sistem Aktif
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-400 dark:text-slate-500">v1.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
