'use client';

import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  Receipt, 
  FileSpreadsheet,
  HelpCircle,
  ShieldCheck
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
      <div className="bg-sky-50 dark:bg-sky-950/40 border-l-4 border-sky-600 dark:border-sky-500 p-4 rounded-r-md shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-950 leading-relaxed">
            <h2 className="font-bold text-sm text-sky-700 dark:text-sky-400 mb-1">
              Engelli Çalışanın Sağlık Raporuyla Haklı Fesih Hakkı (4857 Sayılı İş Kanunu m.24/I-a)
            </h2>
            <p>
              Engelli bir çalışan, yapmakta olduğu işin sağlığı veya bedensel varlığı için tehlike oluşturduğunu <strong>tam teşekküllü devlet hastanesi sağlık kurulu raporuyla</strong> belgelendirdiği takdirde, iş sözleşmesini tek taraflı feshederek <strong>tüm kıdem tazminatını alarak istifa edebilir</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Başlık ve Girdi Formu */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-teal-50 text-teal-700 flex items-center justify-center font-black">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                2026 Kıdem ve İhbar Tazminatı Hesaplama Robotu
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Dayanak: 1475 sayılı İş Kanunu 14. Madde ve 4857 sayılı İş Kanunu
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            2026 Kıdem Tavanı: <strong>{formatCurrency(KIDEM_TAVANI_2026)}</strong>
          </div>
        </div>

        {/* Çalışma Süresi */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            İşyerindeki Toplam Çalışma / Hizmet Süresi
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-slate-500 block mb-1">Yıl</span>
              <input
                type="number"
                min="0"
                max="50"
                value={years || ''}
                onChange={(e) => setYears(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 rounded border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:border-sky-600"
              />
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-1">Ay</span>
              <input
                type="number"
                min="0"
                max="11"
                value={months || ''}
                onChange={(e) => setMonths(Math.min(11, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="w-full px-3 py-2 rounded border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:border-sky-600"
              />
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-1">Gün</span>
              <input
                type="number"
                min="0"
                max="29"
                value={days || ''}
                onChange={(e) => setDays(Math.min(29, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="w-full px-3 py-2 rounded border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:border-sky-600"
              />
            </div>
          </div>
        </div>

        {/* Maaş ve Yan Haklar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Aylık Çıplak Brüt Maaş (TL)
            </label>
            <div className="relative">
              <input
                type="number"
                min="20000"
                max="1000000"
                step="500"
                value={grossSalary || ''}
                onChange={(e) => setGrossSalary(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3.5 py-2.5 rounded border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:outline-none focus:border-sky-600"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                TL
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Bordrodaki asıl çıplak sözleşme ücreti
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Aylık Düzenli Yan Haklar (Yol, Yemek, Prim vb.)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="500000"
                step="100"
                value={regularPerks || ''}
                onChange={(e) => setRegularPerks(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3.5 py-2.5 rounded border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:outline-none focus:border-sky-600"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                TL / Ay
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              1 yıllık ikramiye/yakacak/primlerin 1 aya düşen payı
            </span>
          </div>
        </div>

        {/* Fesih Türü ve Seçenekler */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
          <label className="flex items-start gap-3 cursor-pointer select-none p-2.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={isHealthResignation}
              onChange={(e) => setIsHealthResignation(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-sky-700 dark:text-sky-400 focus:ring-sky-600 border-slate-300"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">
                Sağlık Sebebiyle Haklı Fesih mi? (İş Kanunu 24/I-a Raporlu İstifa)
              </span>
              <span className="text-slate-600 block mt-0.5">
                İşçi kendi istifa ettiği için ihbar tazminatı talep edemez ancak kıdem tazminatının tamamını eksiksiz alır.
              </span>
            </div>
          </label>

          {!isHealthResignation && (
            <label className="flex items-start gap-3 cursor-pointer select-none p-2.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={includeIhbar}
                onChange={(e) => setIncludeIhbar(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-sky-700 dark:text-sky-400 focus:ring-sky-600 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">
                  İşveren Bildirimsiz İşten Çıkardı (İhbar Tazminatı Hesaba Katılsın)
                </span>
                <span className="text-slate-600 block mt-0.5">
                  İhbar süresi kullandırılmadan derhal iş akdi feshedildiğinde ödenmesi gereken yasal tazminat.
                </span>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* TAVAN BİLGİSİ VE SONUÇ KARTLARI */}
      {calculation.isTavanAsildi && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-md text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Kıdem Tazminatı Tavan Uyarısı:</strong> Giydirilmiş brüt ücretiniz ({formatCurrency(calculation.giydirilmisBrut)}), 2026 yılı tavan tutarı olan <strong>{formatCurrency(KIDEM_TAVANI_2026)}</strong> üzerinde olduğu için kıdem tazminatınız yasal tavan üzerinden hesaplanmıştır.
          </div>
        </div>
      )}

      {/* NET ELE GEÇEN TUTAR KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Net Kıdem */}
        <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/50 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-600 tracking-wider">
              Net Kıdem Tazminatı
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
              Sadece Damga Vergisi Kesildi
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-950 my-2">
            {formatCurrency(calculation.netKidem)}
          </div>
          <p className="text-xs text-slate-600">
            {calculation.isKidemHakEdildi 
              ? `${calculation.toplamYil.toFixed(2)} yıllık hizmet karşılığı net kıdem tutarı.` 
              : 'En az 1 tam yıl doldurulmadığı için kıdem hakkı doğmaz.'}
          </p>
        </div>

        {/* Net İhbar */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-600 tracking-wider">
              Net İhbar Tazminatı
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {calculation.ihbarHaftasi} Hafta ({calculation.ihbarHaftasi * 7} Gün)
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 my-2">
            {formatCurrency(calculation.netIhbar)}
          </div>
          <p className="text-xs text-slate-600">
            {isHealthResignation 
              ? 'İşçi haklı sebeple istifa ettiğinde ihbar ödenmez.' 
              : includeIhbar 
              ? 'Gelir vergisi ve damga vergisi kesintileri düşülmüştür.' 
              : 'İhbar tazminatı hariç tutuldu.'}
          </p>
        </div>

        {/* Toplam Ele Geçecek Tutar */}
        <div className="p-5 rounded-2xl border border-sky-600/30 bg-sky-50 dark:bg-sky-950/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-600 tracking-wider">
              TOPLAM NET ELE GEÇECEK
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-700 text-white">
              Banka Hesabına
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-700 dark:text-sky-400 my-2">
            {formatCurrency(calculation.toplamNetEleGecen)}
          </div>
          <p className="text-xs text-slate-600">
            Kıdem ve ihbar tazminatının kesintiler sonrası net nakit toplamıdır.
          </p>
        </div>

      </div>

      {/* DETAYLI KALEM VE KESİNTİ DÖKÜM TABLOSU */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <FileSpreadsheet className="w-4 h-4 text-blue-200" />
            <span>TAZMİNAT BRÜT HESABI VE YASAL KESİNTİ DÖKÜMÜ</span>
          </div>
          <span className="text-xs text-blue-200">
            Hizmet: {years} Yıl {months} Ay {days} Gün
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">Tazminat Türü</th>
                <th className="p-3">Esas Alınan Aylık Ücret</th>
                <th className="p-3 text-right">Brüt Tutar</th>
                <th className="p-3 text-right text-rose-700">Gelir Vergisi</th>
                <th className="p-3 text-right text-rose-700">Damga Vergisi</th>
                <th className="p-3 text-right text-teal-800 bg-teal-50/60 font-bold">Net Ödenecek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td className="p-3 font-semibold text-slate-800">Kıdem Tazminatı</td>
                <td className="p-3 text-slate-600">
                  {formatCurrency(calculation.kidemBazUcret)} {calculation.isTavanAsildi ? '(Tavan)' : ''}
                </td>
                <td className="p-3 text-right font-medium text-slate-800">{formatCurrency(calculation.brutKidem)}</td>
                <td className="p-3 text-right text-slate-400">0 ₺ (Muaf)</td>
                <td className="p-3 text-right text-rose-700 font-medium">-{formatCurrency(calculation.kidemDamgaVergisi)}</td>
                <td className="p-3 text-right font-bold text-teal-800 bg-teal-50/60">{formatCurrency(calculation.netKidem)}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">İhbar Tazminatı</td>
                <td className="p-3 text-slate-600">{formatCurrency(calculation.giydirilmisBrut)} (Tavansız)</td>
                <td className="p-3 text-right font-medium text-slate-800">{formatCurrency(calculation.brutIhbar)}</td>
                <td className="p-3 text-right text-rose-700 font-medium">-{formatCurrency(calculation.ihbarGelirVergisi)}</td>
                <td className="p-3 text-right text-rose-700 font-medium">-{formatCurrency(calculation.ihbarDamgaVergisi)}</td>
                <td className="p-3 text-right font-bold text-teal-800 bg-teal-50/60">{formatCurrency(calculation.netIhbar)}</td>
              </tr>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="p-3" colSpan={2}>GENEL TOPLAMLAR</td>
                <td className="p-3 text-right text-sm">{formatCurrency(calculation.toplamBrutTazminat)}</td>
                <td className="p-3 text-right text-rose-700">-{formatCurrency(calculation.ihbarGelirVergisi)}</td>
                <td className="p-3 text-right text-rose-700">-{formatCurrency(calculation.kidemDamgaVergisi + calculation.ihbarDamgaVergisi)}</td>
                <td className="p-3 text-right text-teal-950 bg-teal-100 text-sm font-black">
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
