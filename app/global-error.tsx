'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

/**
 * Root Global Error Boundary for root layout crashes.
 * Renders own html/body structure according to Next.js App Router requirements.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error caught:', error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="bg-slate-950 text-slate-50 min-h-screen flex flex-col items-center justify-center p-4 font-sans antialiased">
        <div
          id="global-error-container"
          role="alert"
          aria-live="assertive"
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl"
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6">
            <AlertCircle className="w-7 h-7" aria-hidden="true" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Kritik Sistem Hatası
          </h1>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Uygulama çalıştırılırken kritik bir hata meydana geldi. Sayfayı yeniden başlatarak devam edebilirsiniz.
          </p>

          {error?.digest && (
            <div className="mb-6 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400 break-all">
              Hata Kimliği: <span className="text-slate-200 font-semibold">{error.digest}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="global-retry-button"
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-sky-500 text-slate-950 font-semibold text-sm hover:bg-sky-400 transition-colors active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Yeniden Başlat</span>
            </button>

            <a
              id="global-home-link"
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm hover:bg-slate-700 transition-colors active:scale-95"
            >
              <span>Ana Sayfa</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

