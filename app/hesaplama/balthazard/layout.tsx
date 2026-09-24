import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '% Balthazard Hesaplama Robotu (2026 Sağlık Kurulu Raporu) | Engelsiz Forum',
  description: 'Birden fazla engel oranını 20 Şubat 2019 / 30692 R.G. Ek-2 Balthazard formülü ile birleştirerek nihai heyet raporu oranınızı ve engel derecenizi hesaplayın.',
  alternates: {
    canonical: 'https://engelsizforum.com/hesaplama/balthazard',
  },
  openGraph: {
    title: '% Balthazard Hesaplama Robotu (2026 Sağlık Kurulu Raporu) | Engelsiz Forum',
    description: 'Resmi Balthazard formülü ile birden fazla engellilik oranını birleştirin, heyet raporu nihai yüzdesini öğrenin.',
    url: 'https://engelsizforum.com/hesaplama/balthazard',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '% Balthazard Hesaplama Robotu (2026 Sağlık Kurulu Raporu)',
    description: 'Resmi Balthazard formülü ile birden fazla engellilik oranını birleştirin, heyet raporu nihai yüzdesini öğrenin.',
  },
};

export default function BalthazardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
