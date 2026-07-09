import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Topluluklar ve İlgi Grupları',
  description: 'Erişilebilirlik, teknoloji ve sosyal yaşam konularında özelleşmiş topluluklarımıza katılın. Deneyimsel uzmanlıklarla bariyersiz bir gelecek inşa ediyoruz.',
  alternates: {
    canonical: 'https://engelsizforum.com/communities',
  },
  openGraph: {
    title: 'EngelsizForum Toplulukları',
    description: 'Bariyersiz bir gelecek için özelleşmiş ilgi gruplarına katılın.',
    images: ['https://engelsizforum.com/og-image.png'],
  },
};

export default function CommunitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
