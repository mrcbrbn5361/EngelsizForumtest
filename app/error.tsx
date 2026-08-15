'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * Route-level Error Boundary component for EngelsizForum.
 * Provides accessible recovery options and clear feedback.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client/server errors for diagnostics
    console.error('Unhandled app error caught by boundary:', error);
  }, [error]);

  return (
    <div
      id="route-error-boundary"
      role="alert"
      aria-live="assertive"
      className="w-full min-h-[70vh] flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 sm:p-8 text-center shadow-lg">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
          Bir Şeyler Ters Gitti
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
          İşleminiz gerçekleştirilirken beklenmeyen bir aksaklık oluştu. Sayfayı yeniden deneyebilir veya ana sayfaya dönebilirsiniz.
        </p>

        {error?.digest && (
          <div className="mb-6 p-3 rounded-lg bg-muted text-xs font-mono text-muted-foreground break-all">
            Hata Kodu: <span className="text-foreground font-semibold">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="retry-error-button"
            type="button"
            onClick={() => reset()}
            className="vibe-button-primary w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Tekrar Dene</span>
          </button>

          <Link
            id="home-error-button"
            href="/"
            className="vibe-button-secondary w-full sm:w-auto"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

