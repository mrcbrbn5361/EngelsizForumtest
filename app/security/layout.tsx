import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Güvenlik Politikası & Veri Koruma | Engelsiz Forum',
  description: 'Engelsiz Forum altyapı güvenliği, Row Level Security (RLS), SSL/TLS şifreleme ve güvenlik zafiyeti bildirim süreçleri.',
  alternates: {
    canonical: 'https://engelsizforum.com/security',
  },
  openGraph: {
    title: 'Güvenlik Politikası & Veri Koruma | Engelsiz Forum',
    description: 'Engelsiz Forum güvenlik standartları ve veri koruma önlemleri.',
    url: 'https://engelsizforum.com/security',
    type: 'website',
  },
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
