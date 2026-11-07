'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Info, 
  ShieldCheck,
  FileSpreadsheet,
  TrendingUp,
  ChevronRight,
  Calculator,
  Scale
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
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E293B] pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#18243A] text-indigo-400 flex items-center justify-center shadow-inner border border-[#1E293B]">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                Engelli Gelir Vergisi İndirimi Hesaplama (2026)
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Info size={12} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">
                  193 Sayılı GVK 31. Madde ve GİB Tebliğ Standartları
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-md bg-[#0B1220] text-indigo-300 border border-indigo-800/50 shadow-sm uppercase tracking-wider">
            {degreeObj.name.split(' (')[0]}
          </div>
        </div>

        {/* Girdi Parametreleri */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Aylık Brüt Maaş
            </label>
            <div className="relative">
              <input
                type="number"
                min="20000"
                max="1000000"
                step="500"
                value={grossSalary || ''}
                onChange={(e) => setGrossSalary(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-sm font-bold outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[10px]">TL</span>
            </div>
            <span className="text-[10px] text-slate-500 italic block">SGK&apos;ya tabi brüt ücret</span>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Engellilik Derecesi
            </label>
            <div className="relative">
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(parseInt(e.target.value, 10))}
                className="w-full pl-3 pr-10 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-xs font-bold appearance-none outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                {DEGREES.map((deg) => (
                  <option key={deg.degree} value={deg.degree}>
                    {deg.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 italic block">GİB onaylı resmi derece</span>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Vergi Dilimi
            </label>
            <div className="relative">
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseInt(e.target.value, 10))}
                className="w-full pl-3 pr-10 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-xs font-bold appearance-none outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                {TAX_BRACKETS.map((tb) => (
                  <option key={tb.rate} value={tb.rate}>
                    {tb.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 italic block">Kümülatif matrah dilimi</span>
          </div>

        </div>

        {/* İsteğe Bağlı Özel İndirim Tutarı */}
        <div className="mt-6 pt-4 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-[#CBD5E1]">
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>2026 Matrah İndirimi: <strong className="text-white">{formatCurrency(degreeObj.officialDiscount2026)} / ay</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Özel Tutar:</span>
            <input
              type="number"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
              placeholder={degreeObj.officialDiscount2026.toString()}
              className="w-28 px-3 py-1 bg-[#0B1220] border border-[#1E293B] rounded text-white text-xs font-bold outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* NET KAZANÇ VE AVANTAJ KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="p-6 rounded-xl border border-emerald-900/50 bg-emerald-950/10 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <span className="text-xs uppercase font-black text-slate-400 tracking-widest">
                Aylık Net Maaş Artışı
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-sm uppercase">
              Cepte Kalan
            </span>
          </div>

          <div className="text-4xl font-black text-emerald-400 mb-3 tracking-tighter">
            +{formatCurrency(calculation.aylikNetKazanc)}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Gelir verginiz bu tutar kadar azalır ve doğrudan net maaşınıza eklenir.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-indigo-900/50 bg-indigo-950/10 shadow-xl animate-in zoom-in-95 duration-300 delay-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-900/30 text-indigo-400 flex items-center justify-center">
                <Receipt size={18} />
              </div>
              <span className="text-xs uppercase font-black text-slate-400 tracking-widest">
                Yıllık Toplam Tasarruf
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#18243A] text-indigo-300 border border-[#1E293B] uppercase">
              12 Aylık
            </span>
          </div>

          <div className="text-4xl font-black text-indigo-400 mb-3 tracking-tighter">
            +{formatCurrency(calculation.yillikToplamKazanc)}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Bir takvim yılı boyunca sağlanan kümülatif net vergi muafiyeti toplamıdır.
          </p>
        </div>

      </div>

      {/* KARŞILAŞTIRMALI BOR DRO VE VERGİ MATRAHI TABLOSU */}
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] overflow-hidden shadow-xl">
        <div className="bg-[#18243A] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Karşılaştırmalı Bordro Simülasyonu</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/50 border border-indigo-800/60 px-2 py-0.5 rounded">
            %{taxRate} VERGİ DİLİMİ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B1220] text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-[#1E293B]">
                <th className="p-4">Bordro Kalemi</th>
                <th className="p-4">Yasal Dayanak</th>
                <th className="p-4 text-right">Standart Çalışan</th>
                <th className="p-4 text-right text-emerald-400 bg-emerald-950/20 font-black">
                  Engelli İndirimli
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-[#CBD5E1]">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-[#F8FAFC]">1. Aylık Brüt Ücret</td>
                <td className="p-4 text-slate-500 italic">Sözleşme Tutarı</td>
                <td className="p-4 text-right font-medium">{formatCurrency(calculation.gross)}</td>
                <td className="p-4 text-right font-black text-emerald-400 bg-emerald-950/20">{formatCurrency(calculation.gross)}</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-[#F8FAFC]">2. SGK + İşsizlik Payı (%15)</td>
                <td className="p-4 text-slate-500 italic">Zorunlu Kesinti</td>
                <td className="p-4 text-right text-rose-400">-{formatCurrency(calculation.sgkKesintisi)}</td>
                <td className="p-4 text-right text-rose-400 bg-emerald-950/20">-{formatCurrency(calculation.sgkKesintisi)}</td>
              </tr>
              <tr className="bg-[#18243A]/50 transition-colors border-y border-indigo-500/20">
                <td className="p-4 font-bold text-indigo-400">3. Engellilik İndirimi (GVK 31)</td>
                <td className="p-4 text-indigo-500 italic font-mono text-[10px]">Matrahtan Düşülen</td>
                <td className="p-4 text-right text-slate-600">0 ₺</td>
                <td className="p-4 text-right font-black text-indigo-300">
                  -{formatCurrency(calculation.uygulananIndirim)}
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-[#F8FAFC]">4. Gelir Vergisi Matrahı</td>
                <td className="p-4 text-slate-500 italic">Vergi Matrahı</td>
                <td className="p-4 text-right font-medium">{formatCurrency(calculation.standartMatrah)}</td>
                <td className="p-4 text-right font-black text-emerald-400 bg-emerald-950/20">
                  {formatCurrency(calculation.indirimliMatrah)}
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-[#F8FAFC]">5. Gelir Vergisi (%{taxRate})</td>
                <td className="p-4 text-slate-500 italic">Kesilen Vergi</td>
                <td className="p-4 text-right text-rose-400 font-medium">-{formatCurrency(calculation.standartGelirVergisi)}</td>
                <td className="p-4 text-right font-black text-emerald-400 bg-emerald-950/20">
                  -{formatCurrency(calculation.indirimliGelirVergisi)}
                </td>
              </tr>
              <tr className="bg-[#18243A] font-black text-[#F8FAFC] border-t border-indigo-500/30">
                <td className="p-4 text-sm uppercase">NET MAAŞA YANSIYAN FARK</td>
                <td className="p-4 text-indigo-300 font-mono text-[10px] uppercase">
                  AYLIK TASARRUF
                </td>
                <td className="p-4 text-right text-slate-500 italic">Baz Alınan</td>
                <td className="p-4 text-right text-sm text-emerald-400 bg-emerald-500/10 shadow-inner">
                  +{formatCurrency(calculation.aylikNetKazanc)} / ay
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* BAŞVURU REHBERİ */}
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-6 shadow-md">
        <h3 className="text-xs font-black text-[#F8FAFC] uppercase tracking-widest mb-5 flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck size={16} />
          </div>
          <span>Vergi İndirimi Başvuru Süreci</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] space-y-2 group hover:border-indigo-500/30 transition-colors">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">1. Başvuru Makamı</span>
            <p className="text-xs text-[#CBD5E1] leading-relaxed font-medium">
              İşyerinizin bağlı olduğu Vergi Dairesi Başkanlığına veya e-Devlet İnteraktif Vergi Dairesi üzerinden müracaat edilir.
            </p>
          </div>
          <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] space-y-2 group hover:border-indigo-500/30 transition-colors">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">2. Gerekli Evraklar</span>
            <p className="text-xs text-[#CBD5E1] leading-relaxed font-medium">
              İşyerinden alınmış çalışma belgesi, geçerli Erişkin Sağlık Kurulu Raporu ve dilekçe gerekmektedir.
            </p>
          </div>
          <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] space-y-2 group hover:border-indigo-500/30 transition-colors">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">3. Emekliliğe Etkisi</span>
            <p className="text-xs text-[#CBD5E1] leading-relaxed font-medium">
              01.10.2008 öncesi 4A&apos;lılar için vergi indirim belgesi almak, <strong>erken emeklilik hakkı için yasal bir ön şarttır</strong>.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
