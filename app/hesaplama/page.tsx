'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Percent, 
  Car, 
  Receipt, 
  Home, 
  Users, 
  Briefcase, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Calculator,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ClassicSidebar from '@/components/forum/classic-sidebar';

interface ToolCard {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  tagColor: string;
  legislation: string;
  description: string;
  features: string[];
}

const TOOLS: ToolCard[] = [
  {
    title: '% Balthazard Formülü Robotu',
    href: '/hesaplama/balthazard',
    icon: Percent,
    tag: 'Sağlık Kurulu',
    tagColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    legislation: '20 Şubat 2019 / 30692 R.G. Ek-2',
    description: 'Farklı branşlardan alınan birden çok engellilik oranını resmi sıralı Balthazard formülüyle birleştirerek nihai kurul oranınızı hesaplar.',
    features: [
      'Sınırsız dinamik oran ekleme & çıkarma (1-99%)',
      '65 yaş ve üzeri için +%10 yaşlılık payı opsiyonu',
      'Tam Bağımlı / Kısmi Bağımlı yasal hak kontrolü',
    ],
  },
  {
    title: '2026 ÖTV Muafiyetli Araç Hesaplama',
    href: '/hesaplama/otv',
    icon: Car,
    tag: '2.247.100 ₺ Tavan',
    tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    legislation: '4760 Sayılı ÖTVK m.7 & GİB Tebliği',
    description: 'Sıfır kilometre araçların güncel bayi liste fiyatından KDV ve ÖTV ters matematik hesaplamasıyla muafiyetli engelli fiyatını ve toplam vergi kazancını çıkarır.',
    features: [
      '2.247.100 TL 2026 istisna tavanı otomatik denetimi',
      'Benzin/Dizel, Hibrit, PHEV ve EV elektrikli motor seçenekleri',
      '%90 üstü yakın kullanımı ve 5 yıl satış yasağı rehberi',
    ],
  },
  {
    title: 'Engelli Erken Emeklilik Hesaplama',
    href: '/hesaplama/erken-emeklilik',
    icon: Calendar,
    tag: '5510 & 506 K.',
    tagColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    legislation: '506 K. Geçici 18 & 5510 K. m.28',
    description: 'İlk sigorta tescil tarihiniz ve engel derecenize göre doldurmanız gereken sigortalılık süresini, prim gününü ve emeklilik için kalan süreyi hesaplar.',
    features: [
      '01.10.2008 öncesi Maliye Vergi İndirimi kademeli geçiş tablosu',
      '01.10.2008 sonrası 5510 sayılı Kanun 28. Madde prim günleri',
      '4A (SSK), 4B (Bağ-Kur) ve 4C (Memur) mevzuat ayrımı',
    ],
  },
  {
    title: 'Gelir Vergisi Sakatlık İndirimi',
    href: '/hesaplama/vergi-indirimi',
    icon: Receipt,
    tag: 'GVK m.31',
    tagColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    legislation: 'Gelir Vergisi Genel Tebliği Seri No: 324',
    description: '1., 2. ve 3. derece engelli çalışanlar ve serbest meslek erbabı için 2026 aylık bordro matrah indirimini ve net maaş artışını simüle eder.',
    features: [
      '1. Derece (%80+), 2. Derece (%60-79), 3. Derece (%40-59)',
      'Asgari geçim ve gelir vergisi dilimi matrah kesintisi',
      'Bordroda net maaşa yansıma simülasyonu',
    ],
  },
  {
    title: '2022 Engelli Maaşı Gelir Kriteri',
    href: '/hesaplama/engelli-ayligi',
    icon: Home,
    tag: 'SYDV / 2022 K.',
    tagColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    legislation: '2022 Sayılı 65 Yaşını Doldurmuş Muhtaç... Kanunu',
    description: 'Hane içindeki kişi başı net aylık geliri asgari ücretin 1/3 muhtaçlık sınırı ile karşılaştırarak 2022 maaşı hak sahipliğini test eder.',
    features: [
      '2026 asgari ücret net 1/3 muhtaçlık eşiği kontrolü',
      '%40-69 arası ile %70 üzeri kademeli aylık tutarları',
      'GSS prim muafiyeti ve gelir testi sonucu',
    ],
  },
  {
    title: 'Evde Bakım Maaşı Gelir Testi',
    href: '/hesaplama/evde-bakim',
    icon: Users,
    tag: '2828 K. / ASHB',
    tagColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-800',
    legislation: '2828 Sayılı Sosyal Hizmetler Kanunu Ek m.7',
    description: 'Tam Bağımlı engelli yakınına bakan aile bireyleri için kişi başına düşen aylık net gelir kriterini ve hak sahipliğini inceler.',
    features: [
      'Kişi başı aylık gelirin net asgari ücretin 2/3 sınırını aşmaması',
      'Heyet raporunda &quot;Tam Bağımlı&quot; ibaresi zorunluluğu',
      'Evde bakım maaşının 2022 aylığına kritik etkisi uyarısı',
    ],
  },
  {
    title: 'Kıdem & İhbar Tazminatı Robotu',
    href: '/hesaplama/kidem-ihbar',
    icon: Briefcase,
    tag: 'İş K. 24/I-a',
    tagColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    legislation: '1475 K. m.14 & 4857 K. m.17, 24',
    description: 'Hizmet süresi, brüt maaş ve yan haklar üzerinden 2026 kıdem tavanına uygun brüt ve net tazminat hesaplar. Engelli çalışanların haklı fesih haklarını sunar.',
    features: [
      '2026 resmi kıdem tazminatı tavanı otomatik kırpma kontrolü',
      'Kıdemden sadece %0,759 damga vergisi kesintisi hesabı',
      '4857 K. 24/I-a sağlık raporuyla istifada kıdem hakkı rehberi',
    ],
  }
];

export default function HesaplamaHubPage() {
  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="font-extrabold text-slate-950 dark:text-white">Resmi Hesaplama Robotları</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Hero Tanıtım Kartı */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-black uppercase tracking-wider mb-3">
              <Calculator className="w-3.5 h-3.5" />
              <span>Resmi Hesaplama Motorları</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              2026 Engelli Hakları ve Resmi Hesaplama Robotları
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed font-medium">
              Türkiye Cumhuriyeti Resmî Gazete&apos;sinde yayımlanan güncel engellilik mevzuatı, 
              Sağlık Bakanlığı e-Rapor kriterleri, Gelir İdaresi Başkanlığı tebliğleri ve 5510 sayılı SGK Kanunu 
              esas alınarak hazırlanmış 7 adet profesyonel hesaplama aracımız aşağıda kullanımınıza sunulmuştur.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold pt-4 border-t-2 border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                %100 Doğrulanmış Matematik Motoru
              </span>
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                <ShieldCheck className="w-4 h-4" />
                Gizlilik Odaklı (Tarayıcıda Çalışır)
              </span>
            </div>
          </div>

          {/* Araç Kartları Grid Listesi (7 Adet Araç) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div 
                  key={tool.href}
                  className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-sky-500/60 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-800 group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm font-extrabold text-slate-950 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                            {tool.title}
                          </h2>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {tool.legislation}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-2xl border shrink-0 ${tool.tagColor}`}>
                        {tool.tag}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {tool.description}
                    </p>

                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                      {tool.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Ücretsiz &bull; Anlık
                    </span>
                    <Link href={tool.href}>
                      <Button variant="primary" size="sm" className="gap-1.5 font-bold">
                        <span>Hesapla</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sıkça Sorulan Sorular / Bilgilendirme Kutusu */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-950 dark:text-white font-black text-sm">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>2026 Mevzuatında Kritik Kurallar</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white mb-1">1. &quot;Ağır Engelli&quot; İbaresi Kaldırılmıştır</h3>
                <p>
                  20 Şubat 2019 tarihli yönetmelikle &quot;Ağır Engelli&quot; tanımı kaldırılmıştır. 
                  Yerine <strong>&quot;Tam Bağımlı&quot;</strong> ve <strong>&quot;Kısmi Bağımlı&quot;</strong> kavramları getirilmiştir.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white mb-1">2. 18 Yaş Altında ÇÖZ-GER Zorunluluğu</h3>
                <p>
                  18 yaşını doldurmamış çocuklar için yüzde (%) oranı verilmez ve Balthazard işletilmez. 
                  Çocuklar için ÇÖZ-GER raporu düzenlenir.
                </p>
              </div>
            </div>
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
