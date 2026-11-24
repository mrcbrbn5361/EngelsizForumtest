import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kıdem & İhbar Tazminatı Hesaplayıcısı | Engelsiz Forum',
  description: 'Hizmet süresi, brüt maaş ve yan haklar üzerinden bilgi amaçlı tazminat hesabı ve 4857 K. 24/I-a engelli haklı fesih rehberi.',
  alternates: {
    canonical: 'https://engelsizforum.com/hesaplama/kidem-ihbar',
  },
  openGraph: {
    title: 'Kıdem & İhbar Tazminatı Hesaplayıcısı | Engelsiz Forum',
    description: 'Brüt ve net tazminatı bilgi amaçlı hesaplayın. Engelli çalışanların haklı fesih haklarını öğrenin.',
    url: 'https://engelsizforum.com/hesaplama/kidem-ihbar',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kıdem & İhbar Tazminatı Hesaplayıcısı',
    description: 'Brüt ve net tazminatı bilgi amaçlı hesaplayın.',
  },
};

export default function KidemIhbarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
