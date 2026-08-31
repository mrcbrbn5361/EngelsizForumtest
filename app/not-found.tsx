import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-[70vh] items-center justify-center p-6 text-center bg-[#f4f6f9] text-slate-800">
      <div className="w-16 h-16 rounded-2xl bg-[#eef2f7] border border-[#cbd5e1] text-[#185886] flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion size={32} />
      </div>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 text-[#185886]">404 - Sayfa Bulunamadı</h1>
      <p className="text-slate-500 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        Ulaşmaya çalıştığınız forum başlığı veya sayfa taşınmış veya silinmiş olabilir.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#185886] hover:bg-[#104f75] text-white font-bold text-sm transition-all shadow-sm"
        >
          <Home size={16} /> Ana Sayfaya Dön
        </Link>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-sm transition-all shadow-sm"
        >
          <ArrowLeft size={16} /> Tartışmalara Göz At
        </Link>
      </div>
    </div>
  );
}
