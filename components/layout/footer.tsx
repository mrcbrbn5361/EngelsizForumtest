import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border py-12 md:py-16 pb-24 md:pb-16 bg-card w-full overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 md:gap-12">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="text-2xl md:text-3xl font-black tracking-tighter">
            ENGELSİZ<span className="text-primary">FORUM</span>
          </div>
          <div className="text-sm font-bold text-muted-foreground">
            © 2026 Herkes İçin Eşit İletişim.
          </div>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-x-8 gap-y-4 md:gap-10 text-xs font-black uppercase tracking-widest text-center md:text-right">
          <Link href="/about" className="hover:text-primary transition-colors py-2 whitespace-nowrap">Hakkımızda</Link>
          <Link href="/discussions" className="hover:text-primary transition-colors py-2 whitespace-nowrap">Tartışmalar</Link>
          <Link href="/communities" className="hover:text-primary transition-colors py-2 whitespace-nowrap">Topluluklar</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors py-2 whitespace-nowrap">Gizlilik</Link>
        </div>
      </div>
    </footer>
  );
}
