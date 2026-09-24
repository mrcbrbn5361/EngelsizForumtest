import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engelli Erken Emeklilik ve Prim Günü Hesaplama (2026) | Engelsiz Forum',
  description: 'İlk sigorta başlangıç tarihi ve engel oranına göre 4A SSK, 4B Bağ-Kur, 4C Memur kademeli erken emeklilik şartlarını, sigortalılık süresini hesaplayın.',
  alternates: {
    canonical: 'https://engelsizforum.com/hesaplama/erken-emeklilik',
  },
  openGraph: {
    title: 'Engelli Erken Emeklilik ve Prim Günü Hesaplama (2026) | Engelsiz Forum',
    description: 'İlk sigorta başlangıç tarihi ve engel oranına göre 4A SSK, 4B Bağ-Kur, 4C Memur kademeli erken emeklilik şartlarını, sigortalılık süresini hesaplayın.',
    url: 'https://engelsizforum.com/hesaplama/erken-emeklilik',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engelli Erken Emeklilik ve Prim Günü Hesaplama (2026)',
    description: 'İlk sigorta başlangıç tarihi ve engel oranına göre kademeli erken emeklilik prim günlerini ve kalan sürenizi hesaplayın.',
  },
};

export default function ErkenEmeklilikLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
