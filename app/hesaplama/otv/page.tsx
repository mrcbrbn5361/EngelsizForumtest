'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Receipt, 
  FileCheck2 
} from 'lucide-react';

const OTV_LIMIT_2026 = 2873972; // 2026 Resmi ÖTV Üst Sınırı

interface EngineOption {
  id: string;
  name: string;
  rate: number;
  badge: string;
  desc: string;
}

const ENGINE_OPTIONS: EngineOption[] = [
  {
    id: 'ice_1600',
    name: '1600 cm³\'e Kadar Benzin / Dizel',
    rate: 80,
    badge: '%80 ÖTV',
    desc: 'Geleneksel içten yanmalı motorlar (En yaygın binek otomobiller).',
  },
  {
    id: 'hev_standard',
    name: 'Hibrit (HEV - Standart Kendi Şarj Eden)',
    rate: 80,
    badge: '%80 ÖTV',
    desc: '1.8L altı ve elektrik motoruyla desteklenen geleneksel hibrit araçlar.',
  },
  {
    id: 'phev_incentive',
    name: 'Plug-in Hibrit (PHEV - Kablolu Şarj Edilebilir)',
    rate: 30,
    badge: '%30 ÖTV',
    desc: '70 km üzeri elektrikli menzile sahip, emisyon değeri 25g altındaki çevre dostu PHEV araçlar.',
  },
  {
    id: 'ev_10',
    name: 'Tam Elektrikli (EV) - %10 Dilimi',
    rate: 10,
    badge: '%10 ÖTV',
    desc: 'Motor gücü 160 kW\'ı aşmayan ve vergisiz fabrika matrahı limit dahilindeki elektrikli araçlar.',
  },
  {
    id: 'ev_40',
    name: 'Tam Elektrikli (EV) - %40 Dilimi',
    rate: 40,
    badge: '%40 ÖTV',
    desc: 'Motor gücü 160 kW altı ancak matrahı üst dilime giren elektrikli araçlar.',
  },
  {
    id: 'ev_50',
    name: 'Tam Elektrikli (EV) - %50 Dilimi (Güçlü Motor)',
    rate: 50,
    badge: '%50 ÖTV',
    desc: 'Motor gücü 160 kW üzeri olan yüksek performanslı elektrikli otomobiller.',
  },
];

export default function OtvHesaplamaPage() {
  const [listPrice, setListPrice] = useState<number>(1850000);
  const [selectedEngine, setSelectedEngine] = useState<string>('ice_1600');

  const formatCurrency = (val: number) => {
    return Math.round(val).toLocaleString('tr-TR') + ' ₺';
  };

  const currentEngine = useMemo(() => {
    return ENGINE_OPTIONS.find(e => e.id === selectedEngine) || ENGINE_OPTIONS[0];
  }, [selectedEngine]);

  // =========================================================================
  // MATEMATİKSEL GERİYE DÖNÜK TERS HESAP MOTORU
  // =========================================================================
  const calculation = useMemo(() => {
    const isExceeded = listPrice > OTV_LIMIT_2026;
    const otvRate = currentEngine.rate;

    if (listPrice <= 0) {
      return {
        isExceeded,
        kdvHaricFiyat: 0,
        hamFabrikaFiyati: 0,
        normalOtvTutari: 0,
        normalKdvTutari: 0,
        engelliOdenecekTutar: 0,
        engelliKdvTutari: 0,
        toplamVergiAvantaji: 0,
        indirimYuzdesi: 0,
      };
    }

    // 1. KDV Hariç Satış Fiyatı: Liste Fiyatı / 1.20
    const kdvHaricFiyat = listPrice / 1.20;

    // 2. Ham Fabrika Bedeli: KDV Hariç / (1 + ÖTV Oranı / 100)
    const hamFabrikaFiyati = kdvHaricFiyat / (1 + (otvRate / 100));

    // 3. Normal Araç ÖTV Tutarı: Ham Bedel * (ÖTV Oranı / 100)
    const normalOtvTutari = hamFabrikaFiyati * (otvRate / 100);

    // 4. Normal Araç KDV Tutarı: (Ham Bedel + ÖTV) * 0.20
    const normalKdvTutari = (hamFabrikaFiyati + normalOtvTutari) * 0.20;

    // 5. Engelli Bireyin Ödeyeceği Tutar: Ham Fabrika Bedeli x 1.20 (ÖTV Sıfırlanır, %20 KDV ödenir)
    const engelliOdenecekTutar = hamFabrikaFiyati * 1.20;

    // 6. Engellinin Ödeyeceği KDV Tutarı: Ham Bedel * 0.20
    const engelliKdvTutari = hamFabrikaFiyati * 0.20;

    // 7. Toplam Sağlanan Vergi Avantajı: Liste Fiyatı - Engelli Fiyatı
    const toplamVergiAvantaji = listPrice - engelliOdenecekTutar;

    // İndirim Oranı (%)
    const indirimYuzdesi = (toplamVergiAvantaji / listPrice) * 100;

    return {
      isExceeded,
      kdvHaricFiyat,
      hamFabrikaFiyati,
      normalOtvTutari,
      normalKdvTutari,
      engelliOdenecekTutar,
      engelliKdvTutari,
      toplamVergiAvantaji,
      indirimYuzdesi: parseFloat(indirimYuzdesi.toFixed(1)),
    };
  }, [listPrice, currentEngine]);

  return (
    <div className="space-y-6">
      
      {/* 2026 Üst Limit Aşıldı Uyarısı */}
      {calculation.isExceeded && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-md shadow-xs animate-shake">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 leading-relaxed">
              <h2 className="font-bold text-sm text-red-950 mb-1">
                2026 Yılı Resmi ÖTV İstisna Tavanı Aşılmıştır!
              </h2>
              <p>
                Girdiğiniz anahtar teslim fiyat ({formatCurrency(listPrice)}), 2026 yılı için belirlenen <strong>2.873.972 TL</strong> üst sınırını <strong>{formatCurrency(listPrice - OTV_LIMIT_2026)}</strong> aşmaktadır.
                Kanun gereğince bu limiti 1 TL dahi aşan araçlar için ÖTV muafiyeti uygulanamaz; fark ödenerek indirim alınması hukuken mümkün değildir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Başlık ve Kontroller */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                2026 Engelli ÖTV İndirimli Sıfır Araç Fiyat Hesaplama
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Dayanak: 4760 sayılı ÖTVK 7. Madde ve 2026 Gelir İdaresi Başkanlığı Tebliği
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            2026 Tavanı: <strong>2.873.972 ₺</strong>
          </div>
        </div>

        {/* Girdi Formu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Fiyat Girdisi */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Aracın Güncel Liste Satış Fiyatı (KDV + ÖTV Dahil)
            </label>
            <div className="relative">
              <input
                type="number"
                min="100000"
                max="10000000"
                step="5000"
                value={listPrice || ''}
                onChange={(e) => setListPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                placeholder="Örn: 1850000"
                className={`w-full px-3.5 py-2.5 rounded border text-base font-bold transition-all focus:outline-none ${
                  calculation.isExceeded 
                    ? 'border-red-400 bg-red-50/40 text-red-900 focus:border-red-600' 
                    : 'border-slate-300 bg-white text-slate-900 focus:border-sky-600'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                TL
              </span>
            </div>

            {/* Hızlı Seçim Butonları */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="text-[11px] text-slate-400 self-center mr-1">Hızlı Fiyat:</span>
              {[1400000, 1850000, 2100000, OTV_LIMIT_2026].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setListPrice(p)}
                  className={`text-xs px-2 py-1 rounded border font-semibold transition-colors ${
                    listPrice === p 
                      ? 'bg-sky-700 text-white border-sky-600' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p === OTV_LIMIT_2026 ? '2026 Tavanı (2.873.972 ₺)' : formatCurrency(p)}
                </button>
              ))}
            </div>
          </div>

          {/* Motor Tipi Seçimi */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Motor Tipi, Gücü ve ÖTV Dilimi
            </label>
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="w-full px-3 py-2.5 rounded border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-600"
            >
              {ENGINE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name} — ({opt.badge})
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
              {currentEngine.desc}
            </p>
          </div>

        </div>
      </div>

      {/* SONUÇ KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Sol Kart: Engelli Bireyin Ödeyeceği Tutar */}
        <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
          calculation.isExceeded 
            ? 'bg-red-50/50 border-red-200' 
            : 'bg-emerald-50/50 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-600 tracking-wider">
              Muafiyetli Ödenecek Fiyat
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              ÖTV Sıfırlanır
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black text-emerald-900 my-2">
            {calculation.isExceeded ? 'Geçersiz (Tavan Aşıldı)' : formatCurrency(calculation.engelliOdenecekTutar)}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {calculation.isExceeded ? (
              <span className="text-red-700 font-semibold">
                Bu araç 2.873.972 TL üst sınırını aştığı için ÖTV muafiyetinden faydalanamazsınız.
              </span>
            ) : (
              <>
                Ham fabrika bedeli üzerine yalnızca <strong>%20 KDV</strong> eklenmiştir. ÖTV bedeli tamamen istisnadır.
              </>
            )}
          </p>
        </div>

        {/* Sağ Kart: Sağlanan Toplam Vergi Avantajı */}
        <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/50 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-600 tracking-wider">
              Toplam Sağlanan Tasarruf
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Net Vergi İndirimi: %{calculation.indirimYuzdesi}
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black text-sky-700 dark:text-sky-400 my-2">
            {calculation.isExceeded ? '0 ₺' : formatCurrency(calculation.toplamVergiAvantaji)}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Normal liste satış fiyatına kıyasla cebinizde kalan net nakit vergi muafiyeti tutarıdır.
          </p>
        </div>

      </div>

      {/* DETAYLI VERGİ VE FİYAT DAĞILIM TABLOSU */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <Receipt className="w-4 h-4 text-blue-200" />
            <span>2026 TERS MATEMATİK HESAPLAMA VE DAĞILIM TABLOSU</span>
          </div>
          <span className="text-xs text-blue-200">
            {currentEngine.badge}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">Mali Kalem</th>
                <th className="p-3">Resmi Hesaplama Formülü</th>
                <th className="p-3 text-right">Normal Bayi Satışı</th>
                <th className="p-3 text-right text-emerald-800 bg-emerald-50/60 font-bold">
                  Engelli Birey İçin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td className="p-3 font-semibold text-slate-800">1. Ham Fabrika Satış Bedeli</td>
                <td className="p-3 text-slate-500 font-mono text-[11px]">
                  KDV Hariç / (1 + ÖTV Oranı / 100)
                </td>
                <td className="p-3 text-right font-medium text-slate-700">
                  {formatCurrency(calculation.hamFabrikaFiyati)}
                </td>
                <td className="p-3 text-right font-bold text-emerald-800 bg-emerald-50/60">
                  {formatCurrency(calculation.hamFabrikaFiyati)}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">
                  2. Özel Tüketim Vergisi (ÖTV)
                </td>
                <td className="p-3 text-slate-500 font-mono text-[11px]">
                  Ham Bedel × %{currentEngine.rate}
                </td>
                <td className="p-3 text-right font-medium text-rose-700">
                  +{formatCurrency(calculation.normalOtvTutari)}
                </td>
                <td className="p-3 text-right font-bold text-emerald-700 bg-emerald-50/60">
                  0 ₺ (%100 Muaf)
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">
                  3. Katma Değer Vergisi (%20 KDV)
                </td>
                <td className="p-3 text-slate-500 font-mono text-[11px]">
                  Normalde (Ham + ÖTV) × 0.20 | Engellide Ham × 0.20
                </td>
                <td className="p-3 text-right font-medium text-slate-700">
                  +{formatCurrency(calculation.normalKdvTutari)}
                </td>
                <td className="p-3 text-right font-bold text-emerald-800 bg-emerald-50/60">
                  +{formatCurrency(calculation.engelliKdvTutari)}
                </td>
              </tr>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="p-3">TOPLAM ANAHTAR TESLİM</td>
                <td className="p-3 text-slate-600 text-[11px]">
                  Ham Fiyat + ÖTV + KDV
                </td>
                <td className="p-3 text-right text-slate-900 text-sm">
                  {formatCurrency(listPrice)}
                </td>
                <td className="p-3 text-right text-emerald-900 bg-emerald-100 text-sm font-black">
                  {calculation.isExceeded ? 'Tavan Aşıldı' : formatCurrency(calculation.engelliOdenecekTutar)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 ADET YASAL VE MEVZUAT BLOKLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Blok: %90 Üzeri Rapor Sahipleri */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-xs uppercase mb-2">
            <FileCheck2 className="w-4 h-4" />
            <span>%90 ve Üzeri Engelliler</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sağlık kurulu raporu %90 ve üzeri olan bireylerde <strong>araçta herhangi bir özel tertibat aranmaz</strong>. Aracı engelli bireyin kendisi, eşi, aynı il sınırlarında ikamet eden 1. dereceye kadar kan ve sıhri hısımları ile tescil belgesinde kayıtlı şoförü kullanabilir.
          </p>
        </div>

        {/* 2. Blok: Ortopedik Engelliler */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-xs uppercase mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Ortopedik Engelliler</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ortopedik engelli bireylerde <strong>%90 oran şartı aranmaz</strong> (Örn: %20 veya %40 ortopedik rapor yeterlidir). Raporda ve sürücü belgesinde &quot;Hareket ettirici aksamda özel tertibatlı araç kullanır&quot; ibaresi ve ehliyet tertibat kodları bulunmalıdır. Aracı bizzat hak sahibi kullanır.
          </p>
        </div>

        {/* 3. Blok: 5 Yıl Satış Yasağı */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-xs uppercase mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>5 Yıl Satış Kısıtlaması</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            ÖTV muafiyetiyle satın alınan araç <strong>5 yıl boyunca</strong> satılamaz, bağışlanamaz veya devredilemez. 5 yıl dolmadan satılmak istenirse istisna edilen ÖTV tutarı vergi dairesine geri ödenir. 5 yıl dolduktan sonra ÖTV ödenmeksizin serbestçe satılabilir ve yeni muafiyetli araç hakkı doğar.
          </p>
        </div>

      </div>

    </div>
  );
}
