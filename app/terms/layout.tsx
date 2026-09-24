import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Şartları ve Topluluk Kuralları | Engelsiz Forum',
  description: 'Engelsiz Forum hizmet şartları, nefret söylemine sıfır tolerans ilkeleri ve üyelik sözleşmesi.',
  alternates: {
    canonical: 'https://engelsizforum.com/terms',
  },
  openGraph: {
    title: 'Kullanım Şartları ve Topluluk Kuralları | Engelsiz Forum',
    description: 'Engelsiz Forum hizmet şartları ve topluluk kuralları.',
    url: 'https://engelsizforum.com/terms',
    type: 'website',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
