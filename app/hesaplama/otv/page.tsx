'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Receipt, 
  FileCheck2,
  Info,
  ChevronRight,
  TrendingDown,
  Scale,
  Sparkles
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
        <div className="bg-rose-950/20 border border-rose-800 p-5 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-900/50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-bold text-lg text-rose-400 tracking-tight">
                2026 Yılı Resmi ÖTV İstisna Tavanı Aşılmıştır!
              </h2>
              <p className="text-sm text-rose-200/80 leading-relaxed">
                Girdiğiniz anahtar teslim fiyat ({formatCurrency(listPrice)}), 2026 yılı için belirlenen <strong className="text-rose-300">2.873.972 TL</strong> üst sınırını <strong className="text-rose-300">{formatCurrency(listPrice - OTV_LIMIT_2026)}</strong> aşmaktadır.
                Kanun gereğince bu limiti 1 TL dahi aşan araçlar için ÖTV muafiyeti uygulanamaz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Başlık ve Kontroller */}
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E293B] pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#18243A] text-indigo-400 flex items-center justify-center shadow-inner border border-[#1E293B]">
              <Car className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                Engelli ÖTV İndirimli Araç Hesaplama (2026)
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Info size={12} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">
                  4760 Sayılı ÖTVK m.7 ve GİB Tebliği Standardı
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-md bg-[#0B1220] text-indigo-300 border border-[#1E293B] shadow-sm">
            2026 ÜST LİMİT: {OTV_LIMIT_2026.toLocaleString('tr-TR')} ₺
          </div>
        </div>

        {/* Girdi Formu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Fiyat Girdisi */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
              Araç Anahtar Teslim Liste Fiyatı
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Receipt size={18} />
              </div>
              <input
                type="number"
                min="100000"
                max="10000000"
                step="5000"
                value={listPrice || ''}
                onChange={(e) => setListPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                placeholder="Örn: 1850000"
                className={`w-full pl-11 pr-12 py-3 rounded-lg border text-lg font-bold transition-all outline-hidden focus:ring-2 focus:ring-indigo-500/30 ${
                  calculation.isExceeded 
                    ? 'border-rose-800 bg-rose-950/20 text-rose-200' 
                    : 'border-[#1E293B] bg-[#0B1220] text-white'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                TL
              </span>
            </div>

            {/* Hızlı Seçim Butonları */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase self-center tracking-wider mr-1">Presets:</span>
              {[1400000, 1850000, 2100000, OTV_LIMIT_2026].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setListPrice(p)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border font-bold transition-all cursor-pointer ${
                    listPrice === p 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                      : 'bg-[#18243A] text-slate-400 border-[#1E293B] hover:text-white hover:bg-[#1E293B]'
                  }`}
                >
                  {p === OTV_LIMIT_2026 ? '2026 TAVAN' : formatCurrency(p)}
                </button>
              ))}
            </div>
          </div>

          {/* Motor Tipi Seçimi */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
              Motor Tipi ve Vergi Dilimi
            </label>
            <div className="relative">
              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-lg border border-[#1E293B] bg-[#0B1220] text-white text-sm font-bold appearance-none outline-hidden focus:ring-2 focus:ring-indigo-500/30 transition-all"
              >
                {ENGINE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-[#111B2E]">
                    {opt.name} ({opt.badge})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronRight size={18} className="rotate-90" />
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-[#18243A]/50 rounded-lg border border-[#1E293B]/50">
              <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                {currentEngine.desc}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* SONUÇ KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Sol Kart: Engelli Bireyin Ödeyeceği Tutar */}
        <div className={`p-6 rounded-xl border shadow-lg transition-all animate-in zoom-in-95 duration-300 ${
          calculation.isExceeded 
            ? 'bg-rose-950/10 border-rose-900/50' 
            : 'bg-emerald-950/10 border-emerald-900/50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${calculation.isExceeded ? 'bg-rose-900/30 text-rose-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                <FileCheck2 size={18} />
              </div>
              <span className="text-xs uppercase font-black text-slate-400 tracking-widest">
                Muafiyetli Net Fiyat
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800">
              ÖTV MUAF (%0)
            </span>
          </div>

          <div className={`text-4xl font-black mb-3 tracking-tighter ${calculation.isExceeded ? 'text-rose-500' : 'text-emerald-400'}`}>
            {calculation.isExceeded ? 'GEÇERSİZ' : formatCurrency(calculation.engelliOdenecekTutar)}
          </div>

          <div className="text-xs text-slate-400 leading-relaxed font-medium">
            {calculation.isExceeded ? (
              <span className="text-rose-400 flex items-center gap-1.5">
                <AlertTriangle size={12} />
                Araç fiyatı istisna üst sınırını aşıyor.
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Fabrika çıkış bedeli + %20 KDV dahil anahtar teslim tutardır.
              </span>
            )}
          </div>
        </div>

        {/* Sağ Kart: Sağlanan Toplam Vergi Avantajı */}
        <div className="p-6 rounded-xl border border-indigo-900/50 bg-indigo-950/10 shadow-lg animate-in zoom-in-95 duration-300 delay-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-900/30 text-indigo-400 flex items-center justify-center">
                <TrendingDown size={18} />
              </div>
              <span className="text-xs uppercase font-black text-slate-400 tracking-widest">
                Toplam Vergi Kazancı
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-sm">
                -%{calculation.indirimYuzdesi} TASARRUF
              </span>
            </div>
          </div>

          <div className="text-4xl font-black text-indigo-400 mb-3 tracking-tighter">
            {calculation.isExceeded ? '0 ₺' : formatCurrency(calculation.toplamVergiAvantaji)}
          </div>

          <div className="text-xs text-slate-400 leading-relaxed font-medium flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400" />
            ÖTV muafiyeti sayesinde ödemediğiniz toplam vergi tutarıdır.
          </div>
        </div>

      </div>

      {/* DETAYLI VERGİ VE FİYAT DAĞILIM TABLOSU */}
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] overflow-hidden shadow-xl">
        <div className="bg-[#18243A] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Resmi Ters Matematik Dağılımı</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/50 border border-indigo-800/60 px-2 py-0.5 rounded">
            {currentEngine.badge}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B1220] text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-[#1E293B]">
                <th className="p-4">Mali Kalem</th>
                <th className="p-4">Hesaplama Mantığı</th>
                <th className="p-4 text-right">Standart Bayi Satışı</th>
                <th className="p-4 text-right text-emerald-400 bg-emerald-950/20 font-black">
                  Engelli Birey İçin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-[#CBD5E1]">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-[#F8FAFC]">1. Ham Fabrika Bedeli</td>
                <td className="p-4 text-slate-500 font-mono text-[10px]">
                  KDV Hariç / (1 + ÖTV Oranı)
                </td>
                <td className="p-4 text-right font-medium">
                  {formatCurrency(calculation.hamFabrikaFiyati)}
                </td>
                <td className="p-4 text-right font-black text-emerald-400 bg-emerald-950/20">
                  {formatCurrency(calculation.hamFabrikaFiyati)}
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-[#F8FAFC]">
                  2. Özel Tüketim Vergisi (ÖTV)
                </td>
                <td className="p-4 text-slate-500 font-mono text-[10px]">
                  Ham Bedel × %{currentEngine.rate}
                </td>
                <td className="p-4 text-right font-medium text-rose-400">
                  +{formatCurrency(calculation.normalOtvTutari)}
                </td>
                <td className="p-4 text-right font-black text-emerald-500 bg-emerald-950/20">
                  0 ₺ (İSTİSNA)
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-[#F8FAFC]">
                  3. Katma Değer Vergisi (%20 KDV)
                </td>
                <td className="p-4 text-slate-500 font-mono text-[10px]">
                  KDV Matrahı × 0.20
                </td>
                <td className="p-4 text-right font-medium">
                  +{formatCurrency(calculation.normalKdvTutari)}
                </td>
                <td className="p-4 text-right font-black text-emerald-400 bg-emerald-950/20">
                  +{formatCurrency(calculation.engelliKdvTutari)}
                </td>
              </tr>
              <tr className="bg-[#18243A] font-black text-[#F8FAFC] border-t border-indigo-500/30">
                <td className="p-4 text-sm uppercase">Anahtar Teslim Toplam</td>
                <td className="p-4 text-indigo-300 font-mono text-[10px] uppercase">
                  Nihai Satış Fiyatı
                </td>
                <td className="p-4 text-right text-sm">
                  {formatCurrency(listPrice)}
                </td>
                <td className="p-4 text-right text-sm text-emerald-400 bg-emerald-500/10 shadow-inner">
                  {calculation.isExceeded ? 'TAVAN AŞILDI' : formatCurrency(calculation.engelliOdenecekTutar)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* YASAL MEVZUAT BLOKLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-5 shadow-lg group hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-xs uppercase mb-3 tracking-wider">
            <div className="p-1.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              <FileCheck2 size={14} />
            </div>
            <span>%90 Üzeri Engellilik</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Sağlık kurulu raporu %90 ve üzeri olan bireylerde <strong>özel tertibat aranmaz</strong>. Aracı engelli bireyin kendisi, eşi ve tescil belgesinde kayıtlı yakınları kullanabilir.
          </p>
        </div>

        <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-5 shadow-lg group hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-xs uppercase mb-3 tracking-wider">
            <div className="p-1.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              <ShieldCheck size={14} />
            </div>
            <span>Ortopedik Engel</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Ortopedik engellilerde <strong>oran şartı yoktur</strong>. Raporda &quot;Özel tertibatlı araç kullanır&quot; ibaresi ve ehliyet kodları şarttır. Aracı bizzat hak sahibi kullanmalıdır.
          </p>
        </div>

        <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-5 shadow-lg group hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs uppercase mb-3 tracking-wider">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={14} />
            </div>
            <span>5 Yıl Satış Kısıtı</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Muafiyetli araç <strong>5 yıl boyunca</strong> satılamaz. 5 yıl dolmadan satılırsa istisna edilen ÖTV geri ödenir. Süre dolunca ÖTV&apos;siz satış ve yeni araç hakkı doğar.
          </p>
        </div>

      </div>

    </div>
  );
}
