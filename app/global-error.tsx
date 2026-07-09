'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className="bg-background text-foreground min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-card p-6 rounded-xl border border-border shadow-lg">
          <h2 className="text-2xl font-bold tracking-tight text-destructive">Kritik Bir Hata Oluştu!</h2>
          <p className="text-muted-foreground text-sm">
            Sistemde beklenmeyen bir hata meydana geldi. Uygulamayı yeniden yüklemeyi deneyebilirsiniz.
          </p>
          <button
            onClick={() => reset()}
            className="w-full vibe-button-primary py-3 px-4 rounded-lg font-semibold"
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}
