import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-[70vh] items-center justify-center p-6 text-center bg-[#090A0F] text-slate-100">
      <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-6">
        <FileQuestion size={32} />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">404 - Sayfa Bulunamadı</h1>
      <p className="text-slate-400 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        Ulaşmaya çalıştığınız forum başlığı veya sayfa taşınmış veya silinmiş olabilir.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-xs"
        >
          <Home size={16} /> Ana Sayfaya Dön
        </Link>
        <Link 
          href="/discussions" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111726] hover:bg-[#161f33] border border-white/[0.08] text-slate-200 font-semibold text-sm transition-all"
        >
          <ArrowLeft size={16} /> Tartışmalara Göz At
        </Link>
      </div>
    </div>
  );
}
