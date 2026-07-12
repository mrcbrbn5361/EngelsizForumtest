'use client';
export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-2xl font-bold mb-4">Bir Hata Oluştu!</h2>
      <button onClick={() => reset()} className="vibe-button vibe-button-primary">Tekrar Dene</button>
    </div>
  );
}
