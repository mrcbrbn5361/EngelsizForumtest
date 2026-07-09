import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda | EngelsizForum Hikayesi',
  description: 'EngelsizForum misyonu, vizyonu ve topluluğumuzun hikayesi. Erişilebilirlik yolculuğumuz ve değerlerimiz hakkında bilgi edinin.',
  alternates: {
    canonical: 'https://engelsizforum.com/about',
  },
  openGraph: {
    title: 'Hakkımızda | EngelsizForum',
    description: 'Bariyersiz bir topluluk vizyonu ile yola çıkan hikayemiz.',
    images: ['https://engelsizforum.com/og-image.png'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
