import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

/**
 * Modern, fully accessible 404 page.
 * Implemented as a clean, responsive server component to guarantee zero hydration/context errors.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12 text-center" role="main">
      <div className="w-full max-w-2xl mx-auto space-y-12">
        {/* Visual Element */}
        <div className="relative inline-block mx-auto">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" aria-hidden="true" />
          <div className="relative z-10 flex h-24 w-24 md:h-32 md:w-32 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-xl shadow-primary/5 mx-auto">
            <FileQuestion size={48} className="md:size-64" aria-hidden="true" />
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-6">
          <h1 className="text-8xl md:text-9xl font-black text-foreground tracking-tighter" id="error-title">
            404
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight" aria-describedby="error-desc">
            Bu sayfa engellerimize takıldı!
          </p>
          <p id="error-desc" className="max-w-md mx-auto text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
            Gitmek istediğiniz sayfa silinmiş, taşınmış veya henüz inşa edilmemiş olabilir. Panik yapmayın, birlikte aşarız.
          </p>
        </div>

        {/* Action Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/"
            className="w-full sm:w-auto vibe-button-primary h-14 px-10 text-base"
            aria-label="Ana Sayfaya Dön"
          >
            <Home size={20} className="mr-3" aria-hidden="true" /> Ana Sayfa
          </Link>
          <Link 
            href="/discussions"
            className="w-full sm:w-auto flex items-center justify-center rounded-2xl bg-muted hover:bg-muted/80 text-foreground px-8 h-14 font-black text-sm uppercase tracking-widest border border-border transition-all active:scale-95"
            aria-label="Tartışmalar sayfasına dön"
          >
            <ArrowLeft size={18} className="mr-3" aria-hidden="true" /> Tartışmalara Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
