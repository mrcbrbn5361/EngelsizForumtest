import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evde Bakım Maaşı Gelir Kriteri Hesaplama (2026) | Engelsiz Forum',
  description: 'Hane fert sayısı ve toplam gelirleri karşılaştırarak kişi başı 2/3 net asgari ücret gelir testini uygulayın, evde bakım maaşı bağlanma şartlarını öğrenin.',
  alternates: {
    canonical: 'https://engelsizforum.com/hesaplama/evde-bakim',
  },
  openGraph: {
    title: 'Evde Bakım Maaşı Gelir Kriteri Hesaplama (2026) | Engelsiz Forum',
    description: '2828 Sayılı Kanun kapsamında hane kişi başı gelir sınırını test edin, evde bakım maaşı şartlarını öğrenin.',
    url: 'https://engelsizforum.com/hesaplama/evde-bakim',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evde Bakım Maaşı Gelir Kriteri Hesaplama (2026)',
    description: 'Hane fert sayısı ve toplam gelirleri karşılaştırarak evde bakım maaşı gelir testi yapın.',
  },
};

export default function EvdeBakimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
