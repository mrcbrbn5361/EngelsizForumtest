'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 md:p-12" role="main">
        <div className="vibe-card max-w-xl w-full text-center p-8 sm:p-12 space-y-6">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto border-2 border-primary/20 shadow-lg">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
              Sayfa Bulunamadı
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
              Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı kalmış olabilir.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/"
              className="vibe-button-primary inline-flex items-center justify-center gap-2"
            >
              <Home size={18} /> Ana Sayfaya Dön
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-6 py-3.5 text-xs font-black uppercase tracking-widest text-foreground hover:bg-muted transition-all"
            >
              <Search size={18} /> Arama Yap
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
