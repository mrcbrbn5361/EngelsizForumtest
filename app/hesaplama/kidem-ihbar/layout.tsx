import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kıdem & İhbar Tazminatı Robotu (2026 Tavan) | Engelsiz Forum',
  description: 'Hizmet süresi, brüt maaş ve yan haklar üzerinden 2026 kıdem tavanına uygun net tazminat hesabı ve 4857 K. 24/I-a engelli haklı fesih rehberi.',
  alternates: {
    canonical: 'https://engelsizforum.com/hesaplama/kidem-ihbar',
  },
  openGraph: {
    title: 'Kıdem & İhbar Tazminatı Robotu (2026 Tavan) | Engelsiz Forum',
    description: '2026 kıdem tavanına uygun brüt ve net tazminat hesaplayın. Engelli çalışanların haklı fesih haklarını öğrenin.',
    url: 'https://engelsizforum.com/hesaplama/kidem-ihbar',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kıdem & İhbar Tazminatı Robotu (2026 Tavan)',
    description: '2026 kıdem tavanına uygun brüt ve net tazminat hesaplayın.',
  },
};

export default function KidemIhbarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
