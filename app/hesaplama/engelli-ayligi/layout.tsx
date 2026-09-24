import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2022 Engelli Aylığı Muhtaçlık Testi ve Maaş Hesabı (2026) | Engelsiz Forum',
  description: '2022 Sayılı Kanun kapsamında hane kişi başı 1/3 asgari ücret muhtaçlık sınırını denetleyin, %40-%69 ve %70 üzeri güncel 2026 engelli aylığı tutarlarını görün.',
  alternates: {
    canonical: 'https://engelsizforum.com/hesaplama/engelli-ayligi',
  },
  openGraph: {
    title: '2022 Engelli Aylığı Muhtaçlık Testi ve Maaş Hesabı (2026) | Engelsiz Forum',
    description: '2022 Sayılı Kanun kapsamında hane kişi başı 1/3 asgari ücret muhtaçlık sınırını denetleyin, 2026 engelli aylığı tutarlarını görün.',
    url: 'https://engelsizforum.com/hesaplama/engelli-ayligi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2022 Engelli Aylığı Muhtaçlık Testi ve Maaş Hesabı (2026)',
    description: '2022 Sayılı Kanun kapsamında kişi başı gelir sınırını denetleyin, güncel maaş tutarını öğrenin.',
  },
};

export default function EngelliAyligiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
