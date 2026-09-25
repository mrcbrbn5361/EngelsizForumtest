import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marka Varlıkları & Logo Kullanım Rehberi | Engelsiz Forum',
  description: 'Engelsiz Forum resmi logoları, renk paleti, tipografi ve "EngelsizForum ile Giriş Yap" buton tasarım kuralları.',
  alternates: {
    canonical: 'https://engelsizforum.com/brand',
  },
  openGraph: {
    title: 'Marka Varlıkları & Logo Kullanım Rehberi | Engelsiz Forum',
    description: 'Engelsiz Forum resmi logoları, renk paleti ve marka varlıkları.',
    url: 'https://engelsizforum.com/brand',
    type: 'website',
  },
};

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
