import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tartışmalar',
  description: 'Erişilebilirlik, teknoloji ve engelli hakları konularında topluluk tartışmalarına katılın.',
  alternates: {
    canonical: 'https://engelsizforum.miracdeveloper.com.tr/discussions',
  },
};

export default function DiscussionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
