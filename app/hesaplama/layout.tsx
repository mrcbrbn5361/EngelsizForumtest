import type { Metadata } from 'next';
import HesaplamaNav from '@/components/hesaplama/hesaplama-nav';

export const metadata: Metadata = {
  title: '2026 Engelli Hesaplama Robotları & Hakları | Engelsiz Forum',
  description: 'Bilgi amaçlı Balthazard özür oranı, ÖTV araç muafiyeti, kıdem tazminatı ve evde bakım hesaplayıcıları; rakamlar doğrulanıyor.',
  alternates: {
    canonical: 'https://engelsizforum.com/hesaplama',
  },
  openGraph: {
    title: '2026 Engelli Hesaplama Robotları & Hakları | Engelsiz Forum',
    description: 'Bilgi amaçlı Balthazard özür oranı, ÖTV araç muafiyeti, kıdem tazminatı ve evde bakım hesaplayıcıları; rakamlar doğrulanıyor.',
    url: 'https://engelsizforum.com/hesaplama',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2026 Engelli Hesaplama Robotları & Hakları | Engelsiz Forum',
    description: 'Bilgi amaçlı Balthazard özür oranı, ÖTV araç muafiyeti, kıdem tazminatı ve evde bakım hesaplayıcıları; rakamlar doğrulanıyor.',
  },
};

export default function HesaplamaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HesaplamaNav>{children}</HesaplamaNav>;
}
