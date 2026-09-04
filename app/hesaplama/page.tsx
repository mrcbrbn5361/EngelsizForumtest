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
  Calculator
} from 'lucide-react';

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
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
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
    tag: '2.290.200 ₺ Tavan',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    legislation: '4760 Sayılı ÖTVK m.7 & GİB Tebliği',
    description: 'Sıfır kilometre araçların güncel bayi liste fiyatından KDV ve ÖTV ters matematik hesaplamasıyla muafiyetli engelli fiyatını ve toplam vergi kazancını çıkarır.',
    features: [
      '2.290.200 TL 2026 istisna tavanı otomatik denetimi',
      'Benzin/Dizel, Hibrit, PHEV ve EV elektrikli motor seçenekleri',
      '%90 üstü yakın kullanımı ve 5 yıl satış yasağı rehberi',
    ],
  },
  {
    title: 'Engelli Gelir Vergisi İndirimi',
    href: '/hesaplama/vergi-indirimi',
    icon: Receipt,
    tag: 'GVK 31. Madde',
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    legislation: '193 Sayılı GVK & 2026 GİB Tebliği',
    description: '1., 2. ve 3. derece engelli çalışanların brüt ücretinden düşülen vergi matrah indirimi sayesinde maaşlarına yansıyacak net aylık ve yıllık nakit kazancı hesaplar.',
    features: [
      '2026 yılı 1., 2. ve 3. derece güncel resmi indirim tutarları',
      '%15\'ten %40\'a kadar kademeli vergi dilimi hesaplama',
      'Net maaşa yansıyan aylık ve yıllık toplam vergi avantajı',
    ],
  },
  {
    title: 'Evde Bakım Maaşı Gelir Kriteri',
    href: '/hesaplama/evde-bakim',
    icon: Home,
    tag: '2/3 Asgari Ücret',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    legislation: '2828 Sayılı SHK Ek Madde 7',
    description: 'Hanede yaşayan fert sayısı ve aylık toplam resmi net gelirleri karşılaştırarak kişi başı sınırın aşılıp aşılmadığını ve aylık bağlanma kriterini test eder.',
    features: [
      '2026 güncel net asgari ücretin 2/3 kişi başı tavan denetimi',
      'Tam Bağımlı Engelli Birey zorunlu ibaresi kontrolü',
      'Bağlanacak 2026 aylık tutarı ve başvuru kılavuzu',
    ],
  },
  {
    title: '2022 Engelli Aylığı Muhtaçlık Testi',
    href: '/hesaplama/engelli-ayligi',
    icon: Users,
    tag: '1/3 Asgari Ücret',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    legislation: '2022 Sayılı Kanun & SYD Tebliği',
    description: 'Sosyal Güvenlik Kurumu kapsamında aktif sigortası bulunmayan bireyler için hane kişi başı net gelirinin asgari ücretin üçte birini aşıp aşmadığını hesaplar.',
    features: [
      'Kişi başı 1/3 net asgari ücret gelir sınırı kontrolü',
      '%40-%69 ve %70 üzeri kademeli aylık tutarı gösterimi',
      'Evde bakım maaşının 2022 aylığına kritik etkisi uyarısı',
    ],
  },
  {
    title: 'Kıdem & İhbar Tazminatı Robotu',
    href: '/hesaplama/kidem-ihbar',
    icon: Briefcase,
    tag: 'İş K. 24/I-a',
    tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
    legislation: '1475 K. m.14 & 4857 K. m.17, 24',
    description: 'Hizmet süresi, brüt maaş ve yan haklar üzerinden 2026 kıdem tavanına uygun brüt ve net tazminat hesaplar. Engelli çalışanların haklı fesih haklarını sunar.',
    features: [
      '2026 resmi kıdem tazminatı tavanı otomatik kırpma kontrolü',
      'Kıdemden sadece %0,759 damga vergisi kesintisi hesabı',
      '4857 K. 24/I-a sağlık raporuyla istifada kıdem hakkı rehberi',
    ],
  },
  {
    title: 'Engelli Erken Emeklilik Hesaplama',
    href: '/hesaplama/erken-emeklilik',
    icon: Calendar,
    tag: '5510 & 506 K.',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    legislation: '506 K. Geçici 18 & 5510 K. m.28',
    description: 'İlk sigorta tescil tarihiniz ve engel derecenize göre doldurmanız gereken sigortalılık süresini, prim gününü ve emeklilik için kalan süreyi hesaplar.',
    features: [
      '01.10.2008 öncesi Maliye Vergi İndirimi kademeli geçiş tablosu',
      '01.10.2008 sonrası 5510 sayılı Kanun 28. Madde prim günleri',
      '4A (SSK), 4B (Bağ-Kur) ve 4C (Memur) mevzuat ayrımı',
    ],
  },
];

export default function HesaplamaHubPage() {
  return (
    <div className="space-y-6">
      
      {/* Hero Tanıtım Kartı */}
      <div className="bg-white rounded-md border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#185886]/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#185886]/10 text-[#185886] text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>engelsizforum.com Resmi Araçlar Merkezi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            2026 Engelli Hakları ve Resmi Hesaplama Robotları
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
            Türkiye Cumhuriyeti Resmî Gazete&apos;sinde yayımlanan güncel engellilik mevzuatı, 
            Sağlık Bakanlığı e-Rapor kriterleri, Gelir İdaresi Başkanlığı tebliğleri ve 5510 sayılı SGK Kanunu 
            esas alınarak hazırlanmış 7 adet profesyonel hesaplama aracımız aşağıda kullanımınıza sunulmuştur.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              %100 Doğrulanmış Matematik Motoru
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Verileriniz Tarayıcınızda Kalır (Gizlilik Odaklı)
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              ÇÖZ-GER &amp; 2026 Tavan Limitleri Günceldir
            </span>
          </div>
        </div>
      </div>

      {/* Araç Kartları Grid Listesi (7 Adet Araç) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <div 
              key={tool.href}
              className="bg-white rounded-md border border-slate-200 p-5 shadow-xs hover:shadow-sm hover:border-[#185886]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Üst Satır: İkon, Başlık ve Etiket */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#eef4f9] text-[#185886] flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-[#185886] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-[#185886] transition-colors leading-snug">
                        {tool.title}
                      </h2>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {tool.legislation}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border shrink-0 ${tool.tagColor}`}>
                    {tool.tag}
                  </span>
                </div>

                {/* Açıklama */}
                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {tool.description}
                </p>

                {/* Madde İşaretleri */}
                <ul className="mt-3.5 space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                  {tool.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buton */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Ücretsiz &amp; Anlık
                </span>
                <Link
                  href={tool.href}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#185886] hover:bg-[#124d77] text-white text-xs font-bold transition-colors shadow-2xs group-hover:translate-x-0.5"
                >
                  <span>Hesaplamaya Başla</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sıkça Sorulan Sorular / Bilgilendirme Kutusu */}
      <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
          <HelpCircle className="w-4 h-4 text-[#185886]" />
          <span>2026 Mevzuatında Dikkat Edilmesi Gereken Kritik Kural Değişiklikleri</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
            <h3 className="font-bold text-slate-800 mb-1">1. &quot;Ağır Engelli&quot; İbaresi Kaldırılmıştır</h3>
            <p>
              20 Şubat 2019 tarihli yönetmelikle &quot;Ağır Engelli&quot; tanımı yürürlükten kalkmıştır. 
              Yerine <strong>&quot;Tam Bağımlı Engelli Birey&quot;</strong> ve <strong>&quot;Kısmi Bağımlı Engelli Birey&quot;</strong> kavramları getirilmiştir. 
              Evde bakım ve ÖTV gibi haklarda raporun bağımlılık durumu esas alınmaktadır.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
            <h3 className="font-bold text-slate-800 mb-1">2. 18 Yaş Altında ÇÖZ-GER Zorunluluğu</h3>
            <p>
              18 yaşını doldurmamış çocuklar için sağlık kurullarında yüzde (%) oranı verilmez ve Balthazard formülü işletilmez. 
              Çocuklar için &quot;Çocuklar İçin Özel Gereksinim Raporu&quot; (ÇÖZ-GER) düzenlenir ve kategorik gereksinim kodları verilir.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
            <h3 className="font-bold text-slate-800 mb-1">3. 2026 ÖTV Muafiyet Üst Sınırı</h3>
            <p>
              Özel Tüketim Vergisi muafiyetiyle alınabilecek sıfır kilometre binek araçlarda 2026 yılı için her şey dahil anahtar teslim üst sınır <strong>2.290.200 TL</strong> olarak belirlenmiştir. Bu tutarı 1 TL dahi aşan araçlarda kısmi indirim uygulanmaz; muafiyet tamamen düşer.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
            <h3 className="font-bold text-slate-800 mb-1">4. Erken Emeklilikte 01.10.2008 Miladı</h3>
            <p>
              01.10.2008 öncesi SSK (4A) girişliler için Gelir İdaresi onaylı <strong>Vergi İndirim Belgesi</strong> zorunludur. 
              01.10.2008 sonrası ilk defa sigortalı olanlarda ise vergi indirimi aranmaz; SGK Sağlık Kurulunca çalışma gücü kaybı tespiti yapılır.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
