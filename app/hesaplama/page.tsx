'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { 
  Percent, 
  Car, 
  Receipt, 
  Home, 
  Calendar, 
  ArrowRight
} from 'lucide-react';
import ClassicSidebar from '@/components/forum/classic-sidebar';

interface ToolItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  tag: string;
  legislation: string;
  description: string;
  keyPoints: string[];
}

const TOOLS: ToolItem[] = [
  {
    title: 'Balthazard Formülü Robotu',
    href: '/hesaplama/balthazard',
    icon: Percent,
    tag: 'Sağlık Kurulu',
    legislation: '20 Şubat 2019 / 30692 R.G. Ek-2',
    description: 'Farklı branşlardan alınan birden çok engellilik oranını resmi sıralı Balthazard formülüyle birleştirerek nihai kurul oranınızı hesaplar.',
    keyPoints: [
      'Sınırsız dinamik oran girişi (1-99%)',
      '65 yaş ve üzeri için +%10 yaşlılık payı opsiyonu',
      'Tam Bağımlı / Kısmi Bağımlı yasal hak kontrolü',
    ],
  },
  {
    title: '2026 ÖTV Muafiyetli Araç Hesaplama',
    href: '/hesaplama/otv',
    icon: Car,
    tag: '2.873.972 ₺ Tavan',
    legislation: '4760 Sayılı ÖTVK m.7 & GİB Tebliği',
    description: 'Sıfır kilometre araçların güncel bayi liste fiyatından KDV ve ÖTV ters matematik hesaplamasıyla muafiyetli engelli fiyatını ve toplam vergi kazancını çıkarır.',
    keyPoints: [
      '2.873.972 TL 2026 istisna tavanı otomatik denetimi',
      'Benzin/Dizel, Hibrit ve Elektrikli (EV) motor vergi dilimleri',
      '%90 üstü yakın kullanımı ve 5 yıl satış kısıtı rehberi',
    ],
  },
  {
    title: 'Engelli Erken Emeklilik Hesaplama',
    href: '/hesaplama/erken-emeklilik',
    icon: Calendar,
    tag: '5510 & 506 K.',
    legislation: '506 K. Geçici 18 & 5510 K. m.28',
    description: 'İlk sigorta tescil tarihiniz ve engel derecenize göre doldurmanız gereken sigortalılık süresini, prim gününü ve emeklilik şartlarını hesaplar.',
    keyPoints: [
      '01.10.2008 öncesi Vergi İndirimi kademeli geçiş tablosu',
      '01.10.2008 sonrası 5510 sayılı Kanun 28. Madde prim günleri',
      '4A (SSK), 4B (Bağ-Kur) ve 4C (Emekli Sandığı) mevzuat ayrımı',
    ],
  },
  {
    title: 'Gelir Vergisi Sakatlık İndirimi',
    href: '/hesaplama/vergi-indirimi',
    icon: Receipt,
    tag: 'GVK m.31',
    legislation: 'Gelir Vergisi Genel Tebliği Seri No: 324',
    description: '1., 2. ve 3. derece engelli çalışanlar ve serbest meslek erbabı için 2026 aylık bordro matrah indirimini ve net maaş artışını simüle eder.',
    keyPoints: [
      '1. Derece (%80+), 2. Derece (%60-79), 3. Derece (%40-59)',
      'Aylık bordroda vergi matrahı muafiyeti',
      'Net maaşa net yansıma formülü',
    ],
  },
  {
    title: '2022 Engelli Maaşı Gelir Kriteri',
    href: '/hesaplama/engelli-ayligi',
    icon: Home,
    tag: 'SYDV / 2022 K.',
    legislation: '2022 Sayılı Muhtaçlık Kanunu',
    description: 'Hane içindeki kişi başı net aylık geliri asgari ücretin 1/3 muhtaçlık sınırı ile karşılaştırarak 2022 maaşı hak sahipliğini test eder.',
    keyPoints: [
      'Asgari ücretin 1/3 kişi başı muhtaçlık tavanı',
      'Hane geliri hesaplama kriterleri ve istisnalar',
      'Rapor derecesine göre aylık ödeme miktarları',
    ],
  },
];

export default function HesaplamaIndexPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
        <Link href="/" className="hover:text-indigo-400 transition-colors">
          Forum
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-200 font-semibold">Hesaplama Robotları</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="pb-4 border-b border-[#1E293B]">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading">
              Resmi Mevzuat Hesaplama Robotları (2026)
            </h1>
            <p className="text-sm text-slate-300 mt-1 font-normal">
              Resmî Gazete ve SGK yönergeleriyle uyumlu, matematiksel ters hesaplama algoritmaları.
            </p>
          </div>

          {/* Tools List */}
          <div className="divide-y divide-[#1E293B]/80 bg-[#111B2E] border border-[#1E293B] rounded-lg p-5">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.href} className="py-5 first:pt-0 last:pb-0 space-y-2 group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="w-8 h-8 rounded-md bg-[#18243A] border border-[#1E293B] flex items-center justify-center text-indigo-400 shrink-0">
                          <Icon size={16} />
                        </div>
                        <Link 
                          href={tool.href}
                          className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-400 transition-colors font-heading"
                        >
                          {tool.title}
                        </Link>
                        <span className="text-[11px] font-mono font-medium text-indigo-300 bg-indigo-950/50 border border-indigo-800/60 px-2 py-0.5 rounded">
                          {tool.tag}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        {tool.legislation}
                      </div>
                    </div>

                    <Link
                      href={tool.href}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#18243A] border border-[#1E293B] hover:bg-indigo-600 hover:border-indigo-500 hover:text-white text-xs font-medium text-slate-200 shrink-0 transition-colors"
                    >
                      <span>Hesapla</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
                    {tool.description}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-slate-400">
                    {tool.keyPoints.map((pt, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span className="text-slate-300">{pt}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <ClassicSidebar />
        </div>
      </div>
    </div>
  );
}
