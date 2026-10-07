import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border-2 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-5 shadow-sm">
        <FileQuestion size={32} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-slate-950 dark:text-white">
        404 - Sayfa Bulunamadı
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
        Ulaşmaya çalıştığınız forum başlığı veya kategori taşınmış ya da silinmiş olabilir.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Link href="/" className="w-full sm:w-auto">
          <Button variant="primary" size="default" className="w-full gap-2 font-bold">
            <Home size={15} />
            <span>Ana Sayfaya Dön</span>
          </Button>
        </Link>
        <Link href="/hesaplama" className="w-full sm:w-auto">
          <Button variant="secondary" size="default" className="w-full gap-2 font-semibold">
            <ArrowLeft size={15} />
            <span>Hesaplama Robotları</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
