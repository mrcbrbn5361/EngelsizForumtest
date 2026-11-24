import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026 ÖTV Muafiyetli Araç Hesaplama Robotu | Engelsiz Forum',
  description: 'Sıfır araçlar için ÖTV muafiyetli engelli araç fiyatını, KDV ve ÖTV vergi tasarrufunu ters matematikle hesaplayın.',
  alternates: {
    canonical: 'https://engelsizforum.com/hesaplama/otv',
  },
  openGraph: {
    title: '2026 ÖTV Muafiyetli Araç Hesaplama Robotu | Engelsiz Forum',
    description: 'Sıfır araçlar için ÖTV muafiyetli engelli araç fiyatını, KDV ve ÖTV vergi tasarrufunu ters matematikle hesaplayın.',
    url: 'https://engelsizforum.com/hesaplama/otv',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2026 ÖTV Muafiyetli Araç Hesaplama Robotu',
    description: 'Sıfır araçlar için ÖTV muafiyetli engelli araç fiyatını ve vergi tasarrufunu hesaplayın.',
  },
};

export default function OtvLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
