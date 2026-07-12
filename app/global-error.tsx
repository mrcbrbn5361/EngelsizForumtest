'use client';
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html lang="tr">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h2 className="text-2xl font-bold mb-4">Ciddi Bir Hata Oluştu!</h2>
          <button onClick={() => reset()} className="vibe-button vibe-button-primary">Tekrar Dene</button>
        </div>
      </body>
    </html>
  );
}
