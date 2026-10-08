'use client';

import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Info, 
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface DegreeInfo {
  degree: number;
  name: string;
  minRate: number;
  officialDiscount2026: number; // TL / ay
  desc: string;
}

const DEGREES: DegreeInfo[] = [
  {
    degree: 1,
    name: '1. Derece Engelli (%80 ve Üzeri)',
    minRate: 80,
    officialDiscount2026: 9900,
    desc: 'Çalışma gücünün en az %80\'ini kaybetmiş bulunan çalışanlar.',
  },
  {
    degree: 2,
    name: '2. Derece Engelli (%60 - %79 Arası)',
    minRate: 60,
    officialDiscount2026: 5600,
    desc: 'Çalışma gücünün %60\'ı ile %79\'u arasında kayıp yaşamış çalışanlar.',
  },
  {
    degree: 3,
    name: '3. Derece Engelli (%40 - %59 Arası)',
    minRate: 40,
    officialDiscount2026: 2400,
    desc: 'Çalışma gücünün %40\'ı ile %59\'u arasında kayıp yaşamış çalışanlar.',
  },
];

const TAX_BRACKETS = [
  { rate: 15, label: '%15 (1. Dilim - Yıl Başı)' },
  { rate: 20, label: '%20 (2. Dilim)' },
  { rate: 27, label: '%27 (3. Dilim)' },
  { rate: 35, label: '%35 (4. Dilim)' },
  { rate: 40, label: '%40 (5. Dilim - Yüksek Gelir)' },
];

export default function VergiIndirimiPage() {
  const [grossSalary, setGrossSalary] = useState<number>(45000);
  const [selectedDegree, setSelectedDegree] = useState<number>(2);
  const [taxRate, setTaxRate] = useState<number>(20);
  const [customDiscount, setCustomDiscount] = useState<string>('');

  const formatCurrency = (val: number) => {
    return Math.round(val).toLocaleString('tr-TR') + ' ₺';
  };

  const degreeObj = useMemo(() => {
    return DEGREES.find(d => d.degree === selectedDegree) || DEGREES[1];
  }, [selectedDegree]);

  const discountAmount = useMemo(() => {
    const custom = parseFloat(customDiscount);
    if (!isNaN(custom) && custom > 0) return custom;
    return degreeObj.officialDiscount2026;
  }, [customDiscount, degreeObj]);

  // =========================================================================
  // MATEMATİKSEL BORDRO VE VERGİ MATRAHI HESAP MOTORU (193 SAYILI GVK 31)
  // =========================================================================
  const calculation = useMemo(() => {
    const gross = Math.max(0, grossSalary);

    // 1. SGK İşçi Primi (%14) ve İşsizlik Sigortası (%1) = Toplam %15
    const sgkIsci = gross * 0.14;
    const issizlikIsci = gross * 0.01;
    const toplamSgkKesintisi = sgkIsci + issizlikIsci;

    // 2. Standart Gelir Vergisi Matrahı
    const standartMatrah = Math.max(0, gross - toplamSgkKesintisi);

    // 3. İndirimli Gelir Vergisi Matrahı (Engellilik İndirimi Matrahtan Düşülür)
    const indirimliMatrah = Math.max(0, standartMatrah - discountAmount);

    // 4. Standart Gelir Vergisi Tutarı
    const standartGelirVergisi = standartMatrah * (taxRate / 100);

    // 5. İndirimli Gelir Vergisi Tutarı
    const indirimliGelirVergisi = indirimliMatrah * (taxRate / 100);

    // 6. Personele Yansıyan Net Aylık Kazanç (Cepte Kalan Nakit)
    const aylikNetKazanc = Math.min(standartGelirVergisi, discountAmount * (taxRate / 100));

    // 7. Yıllık Toplam Net Avantaj
    const yillikToplamKazanc = aylikNetKazanc * 12;

    // Damga Vergisi (Binde 7,59)
    const damgaVergisi = gross * 0.00759;

    return {
      gross,
      sgkKesintisi: toplamSgkKesintisi,
      standartMatrah,
      indirimliMatrah,
      standartGelirVergisi,
      indirimliGelirVergisi,
      aylikNetKazanc,
      yillikToplamKazanc,
      damgaVergisi,
      uygulananIndirim: discountAmount,
    };
  }, [grossSalary, discountAmount, taxRate]);

  return (
    <div className="space-y-6">
      
      {/* Üst Başlık & Mevzuat Dayanağı */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                2026 Engelli Gelir Vergisi İndirimi ve Net Maaş Hesaplama
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Dayanak: 193 sayılı Gelir Vergisi Kanunu 31. Madde ve GİB Tebliğleri
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
            {degreeObj.name.split(' (')[0]}
          </div>
        </div>

        {/* Girdi Parametreleri */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Aylık Brüt Maaş */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Aylık Brüt Maaş (TL)
            </label>
            <div className="relative">
              <input
                type="number"
                min="20000"
                max="1000000"
                step="500"
                value={grossSalary || ''}
                onChange={(e) => setGrossSalary(Math.max(0, parseInt(e.target.value, 10) || 0))}
                placeholder="Örn: 45000"
                className="w-full px-3.5 py-2.5 rounded border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:outline-none focus:border-sky-600"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                TL
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Bordronuzdaki sigortaya tabi brüt ücret
            </span>
          </div>

          {/* 2. Engellilik Derecesi */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Engellilik Derecesi
            </label>
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2.5 rounded border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-600"
            >
              {DEGREES.map((deg) => (
                <option key={deg.degree} value={deg.degree}>
                  {deg.name} — ({formatCurrency(deg.officialDiscount2026)}/ay)
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              GİB Vergi Dairesi onaylı resmi derece
            </span>
          </div>

          {/* 3. Gelir Vergisi Dilimi */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Bulunulan Gelir Vergisi Dilimi
            </label>
            <select
              value={taxRate}
              onChange={(e) => setTaxRate(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2.5 rounded border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-600"
            >
              {TAX_BRACKETS.map((tb) => (
                <option key={tb.rate} value={tb.rate}>
                  {tb.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Kümülatif matraha göre cari vergi dilimi
            </span>
          </div>

        </div>

        {/* İsteğe Bağlı Özel İndirim Tutarı */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-400" />
            <span>2026 Resmi Matrah İndirim Tutarı: <strong>{formatCurrency(degreeObj.officialDiscount2026)} / ay</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Farklı Tutar Gir:</span>
            <input
              type="number"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
              placeholder={degreeObj.officialDiscount2026.toString()}
              className="w-28 px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-sky-600"
            />
          </div>
        </div>
      </div>

      {/* NET KAZANÇ VE AVANTAJ KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Aylık Net Kazanç Kartı */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-600 tracking-wider">
              Aylık Net Maaşa Yansıyan Kazanç
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Cepte Kalan Net Para
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black text-emerald-900 my-2">
            +{formatCurrency(calculation.aylikNetKazanc)}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Maaşınızdan kesilecek gelir vergisi bu tutar kadar azalır ve doğrudan banka hesabınıza yatırılan net maaşa eklenir.
          </p>
        </div>

        {/* Yıllık Toplam Tasarruf Kartı */}
        <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-600 tracking-wider">
              Yıllık Toplam Vergi Avantajı
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
              12 Aylık Tasarruf
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black text-indigo-900 my-2">
            +{formatCurrency(calculation.yillikToplamKazanc)}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            12 ay boyunca kesilmeyen gelir vergilerinin kümülatif toplamıdır.
          </p>
        </div>

      </div>

      {/* KARŞILAŞTIRMALI BOR DRO VE VERGİ MATRAHI TABLOSU */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <FileSpreadsheet className="w-4 h-4 text-blue-200" />
            <span>STANDART BOR DRO İLE ENGELLİ İNDİRİMLİ BOR DRO KARŞILAŞTIRMASI</span>
          </div>
          <span className="text-xs text-blue-200">
            %{taxRate} Vergi Dilimi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">Bordro Kalemi</th>
                <th className="p-3">Açıklama / Yasal Kural</th>
                <th className="p-3 text-right">Standart Çalışan</th>
                <th className="p-3 text-right text-emerald-800 bg-emerald-50/60 font-bold">
                  Engelli İndirimli
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td className="p-3 font-semibold text-slate-800">1. Aylık Brüt Ücret</td>
                <td className="p-3 text-slate-500">Sözleşmeli brüt hak ediş</td>
                <td className="p-3 text-right font-medium text-slate-700">{formatCurrency(calculation.gross)}</td>
                <td className="p-3 text-right font-bold text-emerald-800 bg-emerald-50/60">{formatCurrency(calculation.gross)}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">2. SGK + İşsizlik İşçi Primi (%15)</td>
                <td className="p-3 text-slate-500">%14 SGK + %1 İşsizlik kesintisi</td>
                <td className="p-3 text-right text-rose-700">-{formatCurrency(calculation.sgkKesintisi)}</td>
                <td className="p-3 text-right text-rose-700 bg-emerald-50/60">-{formatCurrency(calculation.sgkKesintisi)}</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-3 font-semibold text-slate-800">3. Engellilik İndirimi (GVK 31)</td>
                <td className="p-3 text-slate-500">Vergi matrahından düşülen yasal tutar</td>
                <td className="p-3 text-right text-slate-400">0 ₺</td>
                <td className="p-3 text-right font-bold text-emerald-700 bg-emerald-100">
                  -{formatCurrency(calculation.uygulananIndirim)}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">4. Gelir Vergisi Matrahı</td>
                <td className="p-3 text-slate-500">Vergi hesaplanacak baz tutar</td>
                <td className="p-3 text-right font-medium text-slate-700">{formatCurrency(calculation.standartMatrah)}</td>
                <td className="p-3 text-right font-bold text-emerald-800 bg-emerald-50/60">
                  {formatCurrency(calculation.indirimliMatrah)}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">5. Kesilen Gelir Vergisi (%{taxRate})</td>
                <td className="p-3 text-slate-500">Matrah × %{taxRate}</td>
                <td className="p-3 text-right text-rose-700 font-medium">-{formatCurrency(calculation.standartGelirVergisi)}</td>
                <td className="p-3 text-right font-bold text-emerald-800 bg-emerald-50/60">
                  -{formatCurrency(calculation.indirimliGelirVergisi)}
                </td>
              </tr>
              <tr className="bg-sky-50 dark:bg-sky-950/40 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="p-3">NET MAAŞA YANSIYAN AYLIK FARK</td>
                <td className="p-3 text-slate-600 text-[11px]">
                  Gelir vergisi tasarrufu = {formatCurrency(calculation.uygulananIndirim)} × %{taxRate}
                </td>
                <td className="p-3 text-right text-slate-500">Standart</td>
                <td className="p-3 text-right text-emerald-900 bg-emerald-100 text-sm font-black">
                  +{formatCurrency(calculation.aylikNetKazanc)} / ay
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* BAŞVURU REHBERİ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-700 dark:text-sky-400" />
          <span>Gelir İdaresi Başkanlığı Vergi İndirimi Başvuru Süreci</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">1. Başvuru Makamı</span>
            İkametinizin veya işyerinizin bağlı olduğu Vergi Dairesi Başkanlığına (veya Defterdarlığa / e-Devlet İnteraktif Vergi Dairesi üzerinden) müracaat edilir.
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">2. Gerekli Evraklar</span>
            İşyerinden alınmış aktif çalıştığınıza dair imzalı-kaşeli çalışma belgesi, geçerli Erişkin Sağlık Kurulu Raporu ve dilekçe gerekmektedir.
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">3. Erken Emekliliğe Etkisi</span>
            01.10.2008 öncesi SSK (4A) sigortalılar için vergi indirim belgesi almak, <strong>erken emeklilik hakkının kazanılmasında yasal bir ön şarttır</strong>.
          </div>
        </div>
      </div>

    </div>
  );
}
