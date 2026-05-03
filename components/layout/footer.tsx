'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border py-12 md:py-20 bg-card w-full overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
        <div className="text-2xl md:text-3xl font-black tracking-tighter text-center md:text-left">
          ENGELSİZ<span className="text-primary">FORUM</span>
        </div>
        <div className="text-sm md:text-base font-bold text-muted-foreground text-center">
          © 2026 Herkes İçin Eşit İletişim.
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-xs md:text-sm font-black uppercase tracking-widest">
          <Link href="/about" className="hover:text-primary transition-colors min-h-[44px] flex items-center">Hakkımızda</Link>
          <Link href="/discussions" className="hover:text-primary transition-colors min-h-[44px] flex items-center">Tartışmalar</Link>
          <Link href="/communities" className="hover:text-primary transition-colors min-h-[44px] flex items-center">Topluluklar</Link>
        </div>
      </div>
    </footer>
  );
}
