import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Topluluklar ve İlgi Grupları',
  description: 'Erişilebilirlik, teknoloji ve sosyal yaşam konularında özelleşmiş topluluklarımıza katılın.',
  alternates: {
    canonical: 'https://engelsizforum.miracdeveloper.com.tr/communities',
  },
};

export default function CommunitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
