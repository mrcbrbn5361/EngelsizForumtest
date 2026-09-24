import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engelli Gelir Vergisi İndirimi Hesaplama (2026) | Engelsiz Forum',
  description: '1., 2. ve 3. derece engelli çalışanlar için 193 Sayılı GVK 31. maddeye göre net maaşa yansıyacak 2026 aylık ve yıllık nakit vergi kazancını hesaplayın.',
  alternates: {
    canonical: 'https://engelsizforum.com/hesaplama/vergi-indirimi',
  },
  openGraph: {
    title: 'Engelli Gelir Vergisi İndirimi Hesaplama (2026) | Engelsiz Forum',
    description: '193 Sayılı GVK 31. maddeye göre 1., 2. ve 3. derece engelli çalışanların maaşlarına yansıyacak vergi indirimini hesaplayın.',
    url: 'https://engelsizforum.com/hesaplama/vergi-indirimi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engelli Gelir Vergisi İndirimi Hesaplama (2026)',
    description: '193 Sayılı GVK 31. maddeye göre 1., 2. ve 3. derece engelli çalışanların maaşlarına yansıyacak vergi indirimini hesaplayın.',
  },
};

export default function VergiIndirimiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
