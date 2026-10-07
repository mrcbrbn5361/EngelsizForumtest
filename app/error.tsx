'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error caught by boundary:', error);
  }, [error]);

  return (
    <div
      id="route-error-boundary"
      role="alert"
      aria-live="assertive"
      className="w-full min-h-[60vh] flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-xs">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mb-2 tracking-tight">
          Bir Şeyler Ters Gitti
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed font-medium">
          İşleminiz gerçekleştirilirken beklenmeyen bir aksaklık oluştu. Sayfayı tekrar deneyebilir veya ana sayfaya dönebilirsiniz.
        </p>

        {error?.digest && (
          <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 break-all">
            Hata Kodu: <span className="text-sky-600 font-semibold">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            onClick={() => reset()}
            variant="primary"
            size="default"
            className="w-full sm:w-auto gap-2 font-bold"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Tekrar Dene</span>
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="default"
              className="w-full gap-2 font-semibold"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Ana Sayfaya Dön</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
