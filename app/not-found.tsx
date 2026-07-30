import Link from 'next/link';
import { SiteLayout } from '@/components/layout/site-layout';

export default function NotFound() {
  return (
    <SiteLayout>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16">
        <h1 className="text-4xl font-black mb-4 tracking-tight">404 - Sayfa Bulunamadı</h1>
        <p className="text-muted-foreground mb-8 max-w-md font-medium">
          Aradığınız sayfaya ulaşılamıyor. URL'yi yanlış yazmış olabilir veya sayfa kaldırılmış olabilir.
        </p>
        <Link 
          href="/"
          className="vibe-button-primary h-12 px-6 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </SiteLayout>
  );
}
