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
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 font-sans">
          <h2 className="text-2xl font-bold mb-4">Bir Hata Oluştu</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Sistemde beklenmeyen bir hata meydana geldi. Lütfen tekrar deneyin.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Yeniden Dene
          </button>
        </div>
      </body>
    </html>
  );
}
