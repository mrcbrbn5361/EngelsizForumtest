import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'EngelsizForum misyonu, vizyonu ve topluluğumuzun hikayesi. Erişilebilirlik yolculuğumuz hakkında bilgi edinin.',
  alternates: {
    canonical: 'https://engelsizforum.miracdeveloper.com.tr/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
