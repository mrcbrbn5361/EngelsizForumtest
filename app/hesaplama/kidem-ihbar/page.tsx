'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  Receipt, 
  FileSpreadsheet,
  HelpCircle,
  ShieldCheck,
  Info,
  Scale,
  TrendingDown,
  Clock,
  History
} from 'lucide-react';

const KIDEM_TAVANI_2026 = 41828; // 2026 Resmi Kıdem Tazminatı Tavanı (TL / Yıl)
const DAMGA_VERGISI_ORANI = 0.00759; // Binde 7,59

export default function KidemIhbarPage() {
  const [years, setYears] = useState<number>(4);
  const [months, setMonths] = useState<number>(6);
  const [days, setDays] = useState<number>(15);
  const [grossSalary, setGrossSalary] = useState<number>(38000);
  const [regularPerks, setRegularPerks] = useState<number>(4500); // Yemek, yol, ikramiye giydirilmiş ek haklar
  const [includeIhbar, setIncludeIhbar] = useState<boolean>(true);
  const [isHealthResignation, setIsHealthResignation] = useState<boolean>(false);

  const formatCurrency = (val: number) => {
    return Math.round(val).toLocaleString('tr-TR') + ' ₺';
  };

  // =========================================================================
  // MATEMATİKSEL KIDEM VE İHBAR TAZMİNATI HESAP MOTORU (1475 K. 14 / 4857 K. 17)
  // =========================================================================
  const calculation = useMemo(() => {
    // Toplam Giydirilmiş Brüt Aylık Ücret
    const giydirilmisBrut = Math.max(0, grossSalary + regularPerks);

    // Kıdem Tavan Kontrolü: Giydirilmiş brüt ücret tavanı aşarsa tavan uygulanır
    const isTavanAsildi = giydirilmisBrut > KIDEM_TAVANI_2026;
    const kidemBazUcret = isTavanAsildi ? KIDEM_TAVANI_2026 : giydirilmisBrut;

    // Toplam Hizmet Süresi (Yıl Cinsinden Kesirli)
    const toplamGun = (years * 365) + (months * 30) + days;
    const toplamYil = toplamGun / 365;

    // 1 Yıl Şartı Denetimi: Kıdem için en az 365 gün çalışılmış olmalıdır
    const isKidemHakEdildi = toplamGun >= 365;

    // Brüt Kıdem Tazminatı: Her tam yıl için 30 günlük (1 aylık) baz ücret + artık süreler
    const brutKidem = isKidemHakEdildi ? (kidemBazUcret * toplamYil) : 0;

    // Kıdemden YALNIZCA Damga Vergisi Kesilir (%0,759). Gelir vergisi ve SGK KESİLMEZ!
    const kidemDamgaVergisi = brutKidem * DAMGA_VERGISI_ORANI;
    const netKidem = brutKidem - kidemDamgaVergisi;

    // =========================================================================
    // İHBAR TAZMİNATI HESABI (4857 SAYILI KANUN 17. MADDE)
    // =========================================================================
    let ihbarHaftasi = 0;
    if (toplamGun < 180) {
      ihbarHaftasi = 2; // 6 aydan az: 2 hafta
    } else if (toplamGun < 540) {
      ihbarHaftasi = 4; // 6 ay - 1.5 yıl: 4 hafta
    } else if (toplamGun < 1080) {
      ihbarHaftasi = 6; // 1.5 yıl - 3 yıl: 6 hafta
    } else {
      ihbarHaftasi = 8; // 3 yıldan fazla: 8 hafta
    }

    // İhbar tazminatında kıdem tavanı UYGULANMAZ; giydirilmiş brüt baz alınır!
    const gunlukBrut = giydirilmisBrut / 30;
    const brutIhbar = includeIhbar && !isHealthResignation ? (gunlukBrut * (ihbarHaftasi * 7)) : 0;

    // İhbardan Gelir Vergisi (%15-20 dilimi ortalama %15 baz alınır) ve Damga Vergisi kesilir
    const ihbarGelirVergisi = brutIhbar * 0.15;
    const ihbarDamgaVergisi = brutIhbar * DAMGA_VERGISI_ORANI;
    const netIhbar = brutIhbar - ihbarGelirVergisi - ihbarDamgaVergisi;

    // Genel Toplamlar
    const toplamBrutTazminat = brutKidem + brutIhbar;
    const toplamNetEleGecen = netKidem + netIhbar;
    const toplamKesinti = (brutKidem - netKidem) + (brutIhbar - netIhbar);

    return {
      giydirilmisBrut,
      kidemBazUcret,
      isTavanAsildi,
      toplamGun,
      toplamYil,
      isKidemHakEdildi,
      brutKidem,
      kidemDamgaVergisi,
      netKidem,
      ihbarHaftasi,
      brutIhbar,
      ihbarGelirVergisi,
      ihbarDamgaVergisi,
      netIhbar,
      toplamBrutTazminat,
      toplamNetEleGecen,
      toplamKesinti,
    };
  }, [years, months, days, grossSalary, regularPerks, includeIhbar, isHealthResignation]);

  return (
    <div className="space-y-6">
      
      {/* Engelli Çalışan İçin 24/I-a Bilgilendirme Kutusu */}
      <div className="bg-indigo-950/20 border border-indigo-800 p-5 rounded-lg shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-bold text-lg text-indigo-400 tracking-tight">
              Haklı Fesih Hakkı (4857 İş Kanunu m.24/I-a)
            </h2>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              Engelli çalışanlar, işin sağlıkları için tehlike oluşturduğunu <strong>sağlık kurulu raporuyla</strong> belgeledikleri takdirde, iş sözleşmesini feshederek <strong>kıdem tazminatını alıp istifa edebilirler</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Başlık ve Girdi Formu */}
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E293B] pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#18243A] text-indigo-400 flex items-center justify-center shadow-inner border border-[#1E293B]">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                Kıdem ve İhbar Tazminatı Hesaplama (2026)
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Info size={12} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">
                  1475 SK m.14 ve 4857 Sayılı İş Kanunu Standardı
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-md bg-[#0B1220] text-indigo-300 border border-indigo-800/50 shadow-sm uppercase tracking-wider">
            2026 TAVANI: {formatCurrency(KIDEM_TAVANI_2026)}
          </div>
        </div>

        {/* Hizmet Süresi */}
        <div className="space-y-3 mb-6">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Toplam Hizmet Süresi
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <input
                type="number"
                min="0"
                max="50"
                value={years || ''}
                onChange={(e) => setYears(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-sm font-bold outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all text-center"
              />
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter block text-center">YIL</span>
            </div>
            <div className="space-y-1">
              <input
                type="number"
                min="0"
                max="11"
                value={months || ''}
                onChange={(e) => setMonths(Math.min(11, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-sm font-bold outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all text-center"
              />
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter block text-center">AY</span>
            </div>
            <div className="space-y-1">
              <input
                type="number"
                min="0"
                max="29"
                value={days || ''}
                onChange={(e) => setDays(Math.min(29, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-sm font-bold outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all text-center"
              />
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter block text-center">GÜN</span>
            </div>
          </div>
        </div>

        {/* Maaş ve Yan Haklar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Aylık Çıplak Brüt Maaş
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
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[10px] uppercase">TL</span>
            </div>
            <span className="text-[10px] text-slate-500 italic block">Sözleşmedeki asıl ücret</span>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Aylık Düzenli Yan Haklar
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="500000"
                step="100"
                value={regularPerks || ''}
                onChange={(e) => setRegularPerks(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-sm font-bold outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[10px] uppercase">TL</span>
            </div>
            <span className="text-[10px] text-slate-500 italic block">Yol, yemek, ikramiye payı</span>
          </div>
        </div>

        {/* Fesih Türü ve Seçenekler */}
        <div className="mt-6 pt-6 border-t border-[#1E293B] space-y-3">
          <label className="flex items-start gap-4 cursor-pointer select-none p-4 rounded-lg bg-[#0B1220] border border-[#1E293B] hover:bg-[#18243A]/50 transition-all group">
            <div className="mt-1">
              <input
                type="checkbox"
                checked={isHealthResignation}
                onChange={(e) => setIsHealthResignation(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-500 focus:ring-indigo-500 border-[#1E293B] bg-[#111B2E]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#F8FAFC] block uppercase tracking-wide group-hover:text-indigo-400 transition-colors">
                Sağlık Sebebiyle Haklı Fesih / İstifa (m.24/I-a)
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed block">
                İhbar ödenmez ancak kıdem tazminatının tamamı yasal olarak alınabilir.
              </span>
            </div>
          </label>

          {!isHealthResignation && (
            <label className="flex items-start gap-4 cursor-pointer select-none p-4 rounded-lg bg-[#0B1220] border border-[#1E293B] hover:bg-[#18243A]/50 transition-all group">
              <div className="mt-1">
                <input
                  type="checkbox"
                  checked={includeIhbar}
                  onChange={(e) => setIncludeIhbar(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-500 focus:ring-indigo-500 border-[#1E293B] bg-[#111B2E]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#F8FAFC] block uppercase tracking-wide group-hover:text-indigo-400 transition-colors">
                  Bildirimsiz İşten Çıkarılma (İhbar Dahil)
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed block">
                  İhbar süresi kullandırılmadan işten çıkarılma durumunda ödenen tazminat.
                </span>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* TAVAN UYARISI */}
      {calculation.isTavanAsildi && (
        <div className="bg-amber-950/20 border border-amber-800/50 p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-1">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-200/80 leading-relaxed">
            <strong className="text-amber-400 block mb-0.5">Kıdem Tazminatı Tavan Uyarısı:</strong> 
            Giydirilmiş brüt ücretiniz ({formatCurrency(calculation.giydirilmisBrut)}), 2026 yılı tavan tutarı olan <strong className="text-white">{formatCurrency(KIDEM_TAVANI_2026)}</strong> üzerinde olduğu için yasal tavan uygulandı.
          </div>
        </div>
      )}

      {/* NET SONUÇ KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="p-6 rounded-xl border border-indigo-900/50 bg-indigo-950/10 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-black text-slate-400 tracking-widest">Net Kıdem</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#18243A] text-indigo-300 border border-[#1E293B]">-%0,759 DV</span>
          </div>
          <div className="text-3xl font-black text-white mb-2">{formatCurrency(calculation.netKidem)}</div>
          <p className="text-[11px] text-slate-500 font-medium">
            {calculation.isKidemHakEdildi ? `${calculation.toplamYil.toFixed(2)} yıllık hizmet karşılığı.` : '1 yıl dolmadığı için hak doğmaz.'}
          </p>
        </div>

        <div className="p-6 rounded-xl border border-[#1E293B] bg-[#111B2E] shadow-xl animate-in zoom-in-95 duration-300 delay-75">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-black text-slate-400 tracking-widest">Net İhbar</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0B1220] text-slate-400 border border-[#1E293B]">{calculation.ihbarHaftasi} Hafta</span>
          </div>
          <div className="text-3xl font-black text-white mb-2">{formatCurrency(calculation.netIhbar)}</div>
          <p className="text-[11px] text-slate-500 font-medium italic">
            {isHealthResignation ? 'İstifada ihbar ödenmez.' : includeIhbar ? 'Kesintiler düşülmüştür.' : 'Hesaplamaya katılmadı.'}
          </p>
        </div>

        <div className="p-6 rounded-xl border border-emerald-900/50 bg-emerald-950/10 shadow-xl animate-in zoom-in-95 duration-300 delay-150">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-black text-emerald-400 tracking-widest">Toplam Net</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm uppercase">ELE GEÇEN</span>
          </div>
          <div className="text-3xl font-black text-emerald-400 mb-2">{formatCurrency(calculation.toplamNetEleGecen)}</div>
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Tüm kesintiler sonrası net nakit.
          </p>
        </div>

      </div>

      {/* DETAYLI KALEM VE KESİNTİ DÖKÜM TABLOSU */}
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] overflow-hidden shadow-xl">
        <div className="bg-[#18243A] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <span>Tazminat ve Kesinti Detayları</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/50 border border-indigo-800/60 px-2 py-0.5 rounded">
            SÜRE: {years}Y {months}A {days}G
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B1220] text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-[#1E293B]">
                <th className="p-4">Kalem</th>
                <th className="p-4">Baz Ücret</th>
                <th className="p-4 text-right">Brüt Tutar</th>
                <th className="p-4 text-right text-rose-400">G. Vergisi</th>
                <th className="p-4 text-right text-rose-400">D. Vergisi</th>
                <th className="p-4 text-right text-emerald-400 bg-emerald-950/20 font-black">Net Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-[#CBD5E1]">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-[#F8FAFC]">Kıdem Tazminatı</td>
                <td className="p-4 text-slate-500 italic">{formatCurrency(calculation.kidemBazUcret)}</td>
                <td className="p-4 text-right font-medium">{formatCurrency(calculation.brutKidem)}</td>
                <td className="p-4 text-right text-slate-600">MUAF</td>
                <td className="p-4 text-right text-rose-400">-{formatCurrency(calculation.kidemDamgaVergisi)}</td>
                <td className="p-4 text-right font-black text-emerald-400 bg-emerald-950/20">{formatCurrency(calculation.netKidem)}</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-[#F8FAFC]">İhbar Tazminatı</td>
                <td className="p-4 text-slate-500 italic">{formatCurrency(calculation.giydirilmisBrut)}</td>
                <td className="p-4 text-right font-medium">{formatCurrency(calculation.brutIhbar)}</td>
                <td className="p-4 text-right text-rose-400">-{formatCurrency(calculation.ihbarGelirVergisi)}</td>
                <td className="p-4 text-right text-rose-400">-{formatCurrency(calculation.ihbarDamgaVergisi)}</td>
                <td className="p-4 text-right font-black text-emerald-400 bg-emerald-950/20">{formatCurrency(calculation.netIhbar)}</td>
              </tr>
              <tr className="bg-[#18243A] font-black text-[#F8FAFC] border-t border-indigo-500/30">
                <td className="p-4 text-sm uppercase" colSpan={2}>GENEL TOPLAMLAR</td>
                <td className="p-4 text-right text-sm">{formatCurrency(calculation.toplamBrutTazminat)}</td>
                <td className="p-4 text-right text-rose-400">-{formatCurrency(calculation.ihbarGelirVergisi)}</td>
                <td className="p-4 text-right text-rose-400">-{formatCurrency(calculation.toplamKesinti - calculation.ihbarGelirVergisi)}</td>
                <td className="p-4 text-right text-sm text-emerald-400 bg-emerald-500/10 shadow-inner font-black">
                  {formatCurrency(calculation.toplamNetEleGecen)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
