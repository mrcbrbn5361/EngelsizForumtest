import React from 'react';
import Link from 'next/link';
import { MessageSquare, Users, Info, Shield, HelpCircle, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card w-full" role="contentinfo">
      <div className="vibe-container py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-8 text-center md:text-left">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-blue-600 text-white font-black rounded-2xl text-xl shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">E</div>
                <div className="text-2xl font-black tracking-tighter uppercase">
                  ENGELSİZ<span className="text-blue-600 dark:text-blue-400">FORUM</span>
                </div>
              </div>
            </Link>
            <p className="text-muted-foreground text-base font-medium leading-relaxed max-w-xs mx-auto md:mx-0">
              Türkiye&apos;nin ilk tam erişilebilir, yapay zeka destekli topluluk platformunun <span className="text-primary font-bold">Prototip ve Demo Sürümü</span>. Tüm özellikler tam işlevseldir.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-8 text-center md:text-left">
            <h3 className="vibe-label ml-0">PLATFORM</h3>
            <ul className="space-y-4 text-sm font-black text-muted-foreground uppercase tracking-widest">
              <li><Link href="/discussions" className="hover:text-primary transition-colors flex items-center justify-center md:justify-start gap-3"><MessageSquare size={18} className="text-primary" /> TARTIŞMALAR</Link></li>
              <li><Link href="/communities" className="hover:text-primary transition-colors flex items-center justify-center md:justify-start gap-3"><Users size={18} className="text-primary" /> TOPLULUKLAR</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors flex items-center justify-center md:justify-start gap-3"><Info size={18} className="text-primary" /> HAKKIMIZDA</Link></li>
              <li><Link href="/help" className="hover:text-primary transition-colors flex items-center justify-center md:justify-start gap-3"><HelpCircle size={18} className="text-primary" /> YARDIM MERKEZİ</Link></li>
            </ul>
          </div>

          {/* Legal / Safety */}
          <div className="space-y-8 text-center md:text-left">
            <h3 className="vibe-label ml-0">GÜVENLİK</h3>
            <ul className="space-y-4 text-sm font-black text-muted-foreground uppercase tracking-widest">
              <li><Link href="/security" className="hover:text-primary transition-colors flex items-center justify-center md:justify-start gap-3"><Shield size={18} className="text-primary" /> BİLGİ GÜVENLİĞİ</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors flex items-center justify-center md:justify-start gap-3"><Shield size={18} className="text-primary" /> GİZLİLİK POLİTİKASI</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors flex items-center justify-center md:justify-start gap-3"><Info size={18} className="text-primary" /> KULLANIM ŞARTLARI</Link></li>
              <li><Link href="/accessibility" className="hover:text-primary transition-colors flex items-center justify-center md:justify-start gap-3"><HelpCircle size={18} className="text-primary" /> ERİŞİLEBİLİRLİK BEYANI</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-8 text-center md:text-left">
            <h3 className="vibe-label ml-0">İLETİŞİM</h3>
            <ul className="space-y-6 text-sm font-black text-muted-foreground uppercase tracking-widest">
              <li className="flex items-start justify-center md:justify-start gap-4">
                <MapPin size={22} className="text-primary shrink-0" />
                <span className="text-xs leading-relaxed">Bağcılar / İstanbul, Türkiye</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-4">
                <Mail size={22} className="text-primary shrink-0" />
                <a href="mailto:miracbirben@engelsizforum.com" className="hover:text-primary transition-colors text-xs">miracbirben@engelsizforum.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.3em] text-center">
            © {currentYear} ENGELSİZFORUM • PROTOTİP & DEMO SÜRÜMÜ
          </div>
          <div className="flex items-center gap-6 text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> PROTOTİP & DEMO</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> TAM İŞLEVSEL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
