import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Erken Emeklilik Hesaplayıcısı (Geçici Olarak Kapalı) | Engelsiz Forum',
  description: 'Erken emeklilik hesaplayıcısı mevzuatla doğrulanana kadar kapalıdır.',
  robots: { index: false, follow: true },
};

export default function ErkenEmeklilikLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
