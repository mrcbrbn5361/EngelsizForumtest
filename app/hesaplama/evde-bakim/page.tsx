'use client';

import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Building
} from 'lucide-react';

const NET_ASGARI_UCRET_2026 = 22104; // 2026 Tahmini / Gösterge Net Asgari Ücret
const EVDE_BAKIM_MAASI_2026 = 11400; // 2026 Memur Katsayılı Evde Bakım Aylığı

export default function EvdeBakimPage() {
  const [householdSize, setHouseholdSize] = useState<number>(4);
  const [totalIncome, setTotalIncome] = useState<number>(45000);
  const [isTamBagimli, setIsTamBagimli] = useState<boolean>(true);
  const [hasReport, setHasReport] = useState<boolean>(true);

  const formatCurrency = (val: number) => {
    return Math.round(val).toLocaleString('tr-TR') + ' ₺';
  };

  // 2828 Sayılı Kanun Ek 7. Madde: Net Asgari Ücretin 2/3'ü
  const kisiBasiGelirSiniri = (NET_ASGARI_UCRET_2026 * 2) / 3;

  // =========================================================================
  // MATEMATİKSEL GELİR TESTİ VE KRİTER DEĞERLENDİRME MOTORU
  // =========================================================================
  const calculation = useMemo(() => {
    const size = Math.max(1, householdSize);
    const income = Math.max(0, totalIncome);

    const kisiBasiDusenGelir = income / size;
    const isIncomeEligible = kisiBasiDusenGelir <= kisiBasiGelirSiniri;
    const isMedicallyEligible = isTamBagimli && hasReport;
    const isFullyApproved = isIncomeEligible && isMedicallyEligible;

    const fark = kisiBasiGelirSiniri - kisiBasiDusenGelir;

    return {
      householdSize: size,
      totalIncome: income,
      kisiBasiDusenGelir,
      kisiBasiGelirSiniri,
      isIncomeEligible,
      isMedicallyEligible,
      isFullyApproved,
      fark,
      aylikTutar: EVDE_BAKIM_MAASI_2026,
    };
  }, [householdSize, totalIncome, isTamBagimli, hasReport, kisiBasiGelirSiniri]);

  return (
    <div className="space-y-6">
      
      {/* Üst Başlık & Mevzuat Dayanağı */}
      <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-rose-50 text-rose-700 flex items-center justify-center font-black">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                2026 Evde Bakım Maaşı Gelir Kriteri ve Şart Hesaplama
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Dayanak: 2828 sayılı Sosyal Hizmetler Kanunu Ek 7. Madde
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200">
            Kişi Başı Sınır: <strong>{formatCurrency(kisiBasiGelirSiniri)}</strong>
          </div>
        </div>

        {/* Girdi Formu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Hanedeki Kişi Sayısı */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Aynı Hanede İkamet Eden Kişi Sayısı
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="20"
                value={householdSize || ''}
                onChange={(e) => setHouseholdSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3.5 py-2.5 rounded border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:outline-none focus:border-[#185886]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                Kişi
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Aynı adreste MERNİS kayıtlı olan tüm bireyler
            </span>
          </div>

          {/* Hanenin Aylık Net Toplam Geliri */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Hanenin Aylık Toplam Net Geliri (TL)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="500000"
                step="500"
                value={totalIncome || ''}
                onChange={(e) => setTotalIncome(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3.5 py-2.5 rounded border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:outline-none focus:border-[#185886]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                TL / Ay
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Maaşlar, emekli aylıkları, kira ve ticari net gelirler
            </span>
          </div>

        </div>

        {/* Sağlık ve Rapor Şartları */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={isTamBagimli}
              onChange={(e) => setIsTamBagimli(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#185886] focus:ring-[#185886] border-slate-300"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">
                Sağlık Kurulu Raporunda &quot;Tam Bağımlı Engelli Birey&quot; İbaresi Var mı?
              </span>
              <span className="text-slate-600 block mt-0.5">
                20 Şubat 2019 sonrası raporlarda &quot;Tam Bağımlı&quot;, eski raporlarda ise &quot;Ağır Engelli: EVET&quot; ibaresi kanunen zorunludur. &quot;Kısmi Bağımlı&quot; raporlara evde bakım maaşı bağlanmaz.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={hasReport}
              onChange={(e) => setHasReport(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#185886] focus:ring-[#185886] border-slate-300"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">
                Rapor Süresi Geçerli ve e-Rapor Sisteminde Kayıtlı mı?
              </span>
              <span className="text-slate-600 block mt-0.5">
                Sağlık Bakanlığı veri tabanında teyit edilebilen süresiz veya süresi devam eden resmi kurul raporu.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* SONUÇ VE DEĞERLENDİRME KARTI */}
      <div className={`rounded-md border p-6 shadow-xs ${
        calculation.isFullyApproved 
          ? 'bg-emerald-50/70 border-emerald-300' 
          : 'bg-amber-50/70 border-amber-300'
      }`}>
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {calculation.isFullyApproved ? (
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={`text-base font-bold ${
                calculation.isFullyApproved ? 'text-emerald-950' : 'text-amber-950'
              }`}>
                {calculation.isFullyApproved 
                  ? 'TEBRİKLER: Evde Bakım Maaşı Gelir ve Rapor Şartlarını Sağlıyorsunuz' 
                  : 'DİKKAT: Bazı Kriterler Sağlanamıyor'}
              </h2>

              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                calculation.isFullyApproved 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {calculation.isFullyApproved ? 'Şartlar Uygun' : 'Eksik Kriter Var'}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {calculation.isFullyApproved ? (
                <>
                  Hane içi kişi başı aylık geliriniz <strong>{formatCurrency(calculation.kisiBasiDusenGelir)}</strong> olup, 2026 yılı yasal sınırı olan <strong>{formatCurrency(calculation.kisiBasiGelirSiniri)}</strong> tutarının altındadır. 
                  Tam bağımlı raporunuzla birlikte Aile ve Sosyal Hizmetler İl/İlçe Müdürlüğüne müracaat ederek aylık <strong>{formatCurrency(calculation.aylikTutar)}</strong> bakım yardımından yararlanabilirsiniz.
                </>
              ) : (
                <>
                  {!calculation.isIncomeEligible && (
                    <span className="block text-red-800 font-semibold mb-1">
                      • Gelir Kriteri Aşıldı: Hanede kişi başı düşen gelir ({formatCurrency(calculation.kisiBasiDusenGelir)}), kanuni sınır olan {formatCurrency(calculation.kisiBasiGelirSiniri)} tutarından {formatCurrency(-calculation.fark)} fazladır.
                    </span>
                  )}
                  {!calculation.isMedicallyEligible && (
                    <span className="block text-amber-900 font-semibold mb-1">
                      • Sağlık Raporu Uyarısı: Evde bakım maaşı için raporda &quot;Tam Bağımlı Engelli Birey&quot; (Çocuklar için ÇÖZ-GER Çok İleri Düzeyde ÖGV/Belirgin ÖGV) ibaresi zorunludur.
                    </span>
                  )}
                </>
              )}
            </p>

            {/* İstatistikler */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/80 text-xs">
              <div className="p-2 bg-white/80 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Kişi Başı Gelir</span>
                <span className="font-black text-slate-900 text-sm">
                  {formatCurrency(calculation.kisiBasiDusenGelir)}
                </span>
              </div>

              <div className="p-2 bg-white/80 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">2026 Yasal Sınırı</span>
                <span className="font-black text-[#185886] text-sm">
                  {formatCurrency(calculation.kisiBasiGelirSiniri)}
                </span>
              </div>

              <div className="p-2 bg-white/80 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Kalan Güvenli Limit</span>
                <span className={`font-black text-sm ${calculation.fark >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {calculation.fark >= 0 ? '+' + formatCurrency(calculation.fark) : formatCurrency(calculation.fark)}
                </span>
              </div>

              <div className="p-2 bg-white/80 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">2026 Aylık Tutar</span>
                <span className="font-black text-rose-700 text-sm">
                  {formatCurrency(calculation.aylikTutar)} / ay
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BAŞVURU ŞARTLARI VE KİMLER BAKICI OLABİLİR? */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="bg-white rounded-md border border-slate-200 p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-[#185886]" />
            <span>Kimler Bakıcı Olarak Gösterilebilir?</span>
          </h3>
          <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <li>• Eş, anne, baba, çocuk, kardeş, torun, dede, nine</li>
            <li>• Amca, hala, teyze, dayı ve bunların çocukları</li>
            <li>• Gelin, damat, kayınvalide, kayınpeder, görümce, bacanak</li>
            <li>• Bakıcının haftada en az 8 saat günlük bakımı aksatmayacak şekilde engelliyle fiilen ilgilenmesi zorunludur.</li>
          </ul>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Başvuru ve İnceleme Prosedürü</span>
          </h3>
          <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <li>• Başvuru, engellinin ikamet ettiği yerdeki <strong>Sosyal Hizmet Merkezi Müdürlüğüne</strong> veya <strong>e-Devlet</strong> üzerinden yapılır.</li>
            <li>• Bakım Hizmetleri Değerlendirme Heyeti haneyi yerinde ziyaret ederek bakım raporu tanzim eder.</li>
            <li>• Evde bakım maaşı haczedilemez, hiçbir vergi veya harca tabi tutulamaz.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
