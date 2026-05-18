import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'EngelsizForum gizlilik politikası ve veri güvenliği ilkelerimiz hakkında bilgi edinin.',
  alternates: {
    canonical: 'https://engelsizforum.miracdeveloper.com.tr/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
