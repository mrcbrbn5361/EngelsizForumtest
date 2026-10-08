import HelpPage from '@/app/help/page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yardım ve Sıkça Sorulan Sorular | EngelsizForum',
  description: 'Erişilebilirlik ayarları, hesaplama robotları, topluluk kuralları ve destek masası hakkında kapsamlı yardım rehberi.',
  alternates: {
    canonical: 'https://engelsizforum.com/help',
  },
};

export default function YardimPage() {
  return <HelpPage />;
}
