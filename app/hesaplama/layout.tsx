import type { Metadata } from 'next';
import HesaplamaNav from '@/components/hesaplama/hesaplama-nav';

export const metadata: Metadata = {
  title: '2026 Engelli Hesaplama Robotları & Hakları | Engelsiz Forum',
  description: 'Resmi mevzuata uygun Balthazard özür oranı cetveli, 2026 ÖTV araç muafiyeti, engelli erken emeklilik ve evde bakım maaşı hesaplama robotları.',
  alternates: {
    canonical: 'https://engelsizforum.com/hesaplama',
  },
  openGraph: {
    title: '2026 Engelli Hesaplama Robotları & Hakları | Engelsiz Forum',
    description: 'Resmi mevzuata uygun Balthazard özür oranı cetveli, 2026 ÖTV araç muafiyeti, engelli erken emeklilik ve evde bakım maaşı hesaplama robotları.',
    url: 'https://engelsizforum.com/hesaplama',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2026 Engelli Hesaplama Robotları & Hakları | Engelsiz Forum',
    description: 'Resmi mevzuata uygun Balthazard özür oranı cetveli, 2026 ÖTV araç muafiyeti, engelli erken emeklilik ve evde bakım maaşı hesaplama robotları.',
  },
};

export default function HesaplamaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HesaplamaNav>{children}</HesaplamaNav>;
}
