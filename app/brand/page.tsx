import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import Image from 'next/image';
import { Download, ExternalLink, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Marka & Görsel Varlıklar | EngelsizForum',
  description: 'EngelsizForum kurumsal logo, favicon, sosyal medya banner ve görsel marka varlıkları.',
};

export default function BrandPage() {
  const assets = [
    {
      name: 'Kurumsal Logo (512x512)',
      file: '/logo.png',
      desc: 'Yüksek çözünürlüklü mavi degrade logo amblemi.',
      width: 512,
      height: 512,
      displaySize: 'w-24 h-24 sm:w-32 sm:h-32',
    },
    {
      name: 'Sosyal Medya OG Banner (1200x630)',
      file: '/og-image.png',
      desc: 'Twitter, WhatsApp, Facebook ve Telegram link önizleme bannerı.',
      width: 1200,
      height: 630,
      displaySize: 'w-full max-w-lg aspect-[1200/630]',
    },
    {
      name: 'Apple Touch Icon (180x180)',
      file: '/apple-icon.png',
      desc: 'iOS ve iPadOS ana ekran ikonu.',
      width: 180,
      height: 180,
      displaySize: 'w-20 h-20 sm:w-24 sm:h-24',
    },
    {
      name: 'PWA Web App Icon (192x192)',
      file: '/icon.png',
      desc: 'Android ve PWA mobil uygulama ikonu.',
      width: 192,
      height: 192,
      displaySize: 'w-20 h-20 sm:w-24 sm:h-24',
    },
    {
      name: 'Favicon PNG (48x48)',
      file: '/favicon.png',
      desc: 'Modern tarayıcı sekmeleri için optimize edilmiş kristal ikon.',
      width: 48,
      height: 48,
      displaySize: 'w-12 h-12',
    },
  ];

  return (
    <SiteLayout>
      <div className="vibe-container py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Sparkles size={14} />
            <span>Marka Varlıkları & İkonlar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            EngelsizForum Görsel Kimlik ve Varlık Rehberi
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Tüm logolar, faviconlar ve sosyal medya kartları 32-bit Truecolor RGBA formatında ve kurumsal fütüristik elektrik mavisi paletinde üretilmiştir.
          </p>
        </div>

        {/* Live Asset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.file}
              className="p-5 sm:p-6 bg-[#111726]/90 backdrop-blur-md rounded-2xl border border-white/[0.08] shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-sky-400" />
                    {asset.name}
                  </h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.06]">
                    {asset.width}x{asset.height}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{asset.desc}</p>
              </div>

              {/* Preview Container */}
              <div className="p-4 rounded-xl bg-[#090a0f] border border-white/[0.06] flex items-center justify-center min-h-[140px] overflow-hidden">
                <div className={`relative ${asset.displaySize} rounded-lg overflow-hidden flex items-center justify-center bg-slate-900/50`}>
                  <Image
                    src={asset.file}
                    alt={asset.name}
                    width={asset.width}
                    height={asset.height}
                    className="object-contain w-full h-full"
                    unoptimized
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={asset.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-semibold transition-colors"
                >
                  <ExternalLink size={14} />
                  Yeni Sekmede Aç
                </a>
                <a
                  href={asset.file}
                  download
                  className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-xs font-medium transition-colors"
                >
                  <Download size={14} />
                  İndir
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
