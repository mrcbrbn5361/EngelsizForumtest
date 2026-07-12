import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Sayfa Bulunamadı</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Aradığınız sayfaya ulaşılamıyor. URL'yi yanlış yazmış olabilir veya sayfa kaldırılmış olabilir.
      </p>
      <Link 
        href="/"
        className="vibe-button vibe-button-primary"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
