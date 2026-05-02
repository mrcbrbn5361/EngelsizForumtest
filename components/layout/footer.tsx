'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t-4 border-border py-20 bg-card w-full overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="text-3xl font-black tracking-tighter">
          ENGELSİZ<span className="text-primary">FORUM</span>
        </div>
        <div className="text-lg font-bold text-muted-foreground">
          © 2026 Herkes İçin Eşit İletişim.
        </div>
        <div className="flex gap-10 text-sm font-black uppercase tracking-widest">
          <Link href="/about" className="hover:text-primary transition-colors">Hakkımızda</Link>
          <Link href="/discussions" className="hover:text-primary transition-colors">Tartışmalar</Link>
          <Link href="/communities" className="hover:text-primary transition-colors">Topluluklar</Link>
        </div>
      </div>
    </footer>
  );
}
