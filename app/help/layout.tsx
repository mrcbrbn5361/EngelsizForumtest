import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yardım Merkezi & Sıkça Sorulan Sorular | Engelsiz Forum',
  description: 'Engelsiz Forum kullanımı, sağlık kurulu raporu itirazları, ÖTV muafiyeti ve topluluk kuralları hakkında sıkça sorulan soruların yanıtları.',
  alternates: {
    canonical: 'https://engelsizforum.com/help',
  },
  openGraph: {
    title: 'Yardım Merkezi & Sıkça Sorulan Sorular | Engelsiz Forum',
    description: 'Engelsiz Forum kullanımı ve engelli hakları mevzuatı hakkında sıkça sorulan sorular.',
    url: 'https://engelsizforum.com/help',
    type: 'website',
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
