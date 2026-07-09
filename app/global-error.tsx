'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Bir şeyler yanlış gitti!</h2>
      <button onClick={() => reset()}>Tekrar Dene</button>
    </div>
  );
}
