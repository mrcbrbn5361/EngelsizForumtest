import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | Veri Güvenliği',
  description: 'EngelsizForum gizlilik politikası, KVKK uyumluluğu ve veri güvenliği ilkelerimiz hakkında detaylı bilgi edinin.',
  alternates: {
    canonical: 'https://engelsizforum.com/privacy',
  },
  openGraph: {
    title: 'EngelsizForum Gizlilik Politikası',
    description: 'Verilerinizin güvenliği ve gizliliğiniz bizim için önceliktir.',
    images: ['https://engelsizforum.com/og-image.png'],
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
