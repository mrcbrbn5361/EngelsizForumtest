'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Building,
  TrendingDown,
  Wallet,
  LayoutDashboard
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
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E293B] pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#18243A] text-indigo-400 flex items-center justify-center shadow-inner border border-[#1E293B]">
              <Home className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                Evde Bakım Maaşı Gelir Testi (2026)
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Info size={12} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">
                  2828 Sayılı Kanun Ek 7. Madde Standardı
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-md bg-[#0B1220] text-indigo-300 border border-indigo-800/50 shadow-sm uppercase tracking-wider">
            2026 SINIRI: {formatCurrency(kisiBasiGelirSiniri)}
          </div>
        </div>

        {/* Girdi Formu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Hanedeki Kişi Sayısı
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="20"
                value={householdSize || ''}
                onChange={(e) => setHouseholdSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-sm font-bold outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[10px] uppercase tracking-tighter">KİŞİ</span>
            </div>
            <span className="text-[10px] text-slate-500 italic block">İkameti aynı olan herkes</span>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Aylık Net Toplam Gelir
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="500000"
                step="500"
                value={totalIncome || ''}
                onChange={(e) => setTotalIncome(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-sm font-bold outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[10px] uppercase">TL</span>
            </div>
            <span className="text-[10px] text-slate-500 italic block">Maaş, kira, ticari gelir toplamı</span>
          </div>

        </div>

        {/* Sağlık ve Rapor Şartları */}
        <div className="mt-6 pt-6 border-t border-[#1E293B] space-y-3">
          <label className="flex items-start gap-4 cursor-pointer select-none p-4 rounded-lg bg-[#0B1220] border border-[#1E293B] hover:bg-[#18243A]/50 transition-all group">
            <div className="mt-1">
              <input
                type="checkbox"
                checked={isTamBagimli}
                onChange={(e) => setIsTamBagimli(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-500 focus:ring-indigo-500 border-[#1E293B] bg-[#111B2E]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#F8FAFC] block uppercase tracking-wide group-hover:text-indigo-400 transition-colors">
                Raporunuzda &quot;Tam Bağımlı&quot; İbaresi Var mı?
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed block">
                2019 öncesi raporlarda &quot;Ağır Engelli: EVET&quot; ibaresi olması şarttır.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer select-none p-4 rounded-lg bg-[#0B1220] border border-[#1E293B] hover:bg-[#18243A]/50 transition-all group">
            <div className="mt-1">
              <input
                type="checkbox"
                checked={hasReport}
                onChange={(e) => setHasReport(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-500 focus:ring-indigo-500 border-[#1E293B] bg-[#111B2E]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#F8FAFC] block uppercase tracking-wide group-hover:text-indigo-400 transition-colors">
                Rapor e-Rapor Sisteminde Kayıtlı mı?
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed block">
                Sağlık Bakanlığı veri tabanında teyit edilebilir geçerli rapor durumu.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* SONUÇ VE DEĞERLENDİRME KARTI */}
      <div className={`rounded-xl border p-6 shadow-xl animate-in zoom-in-95 duration-300 ${
        calculation.isFullyApproved 
          ? 'bg-emerald-950/10 border-emerald-900/50' 
          : 'bg-indigo-950/10 border-indigo-900/50'
      }`}>
        <div className="flex items-start gap-5">
          <div className="mt-1">
            {calculation.isFullyApproved ? (
              <div className="w-12 h-12 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center shadow-inner">
                <CheckCircle2 size={28} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-900/30 text-indigo-400 flex items-center justify-center shadow-inner">
                <AlertTriangle size={28} />
              </div>
            )}
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight uppercase">
                {calculation.isFullyApproved 
                  ? 'ŞARTLAR UYGUN: Bakım Maaşı Alabilirsiniz' 
                  : 'GELİR VEYA RAPOR KRİTERİ EKSİK'}
              </h2>

              <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border ${
                calculation.isFullyApproved 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' 
                  : 'bg-indigo-950/40 text-indigo-400 border-indigo-800'
              }`}>
                {calculation.isFullyApproved ? 'Kriter Onaylı' : 'Şartlar Sağlanamadı'}
              </span>
            </div>

            <div className="text-sm text-[#CBD5E1] leading-relaxed max-w-4xl">
              {calculation.isFullyApproved ? (
                <>
                  Hane içi kişi başı aylık geliriniz <strong>{formatCurrency(calculation.kisiBasiDusenGelir)}</strong> olup, yasal sınırın altındadır. 
                  İlçenizdeki <strong>Aile ve Sosyal Hizmetler Müdürlüğüne</strong> müracaat ederek aylık <strong>{formatCurrency(calculation.aylikTutar)}</strong> ödeme alabilirsiniz.
                </>
              ) : (
                <div className="space-y-2">
                  {!calculation.isIncomeEligible && (
                    <div className="flex items-center gap-2 text-rose-400 font-bold">
                      <TrendingDown size={14} />
                      <span>GELİR KRİTERİ: Kişi başı gelir sınırı {formatCurrency(-calculation.fark)} aşıldı.</span>
                    </div>
                  )}
                  {!calculation.isMedicallyEligible && (
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <ShieldAlert size={14} />
                      <span>SAĞLIK RAPORU: Evde bakım için &quot;Tam Bağımlı&quot; ibaresi zorunludur.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#1E293B]">
              <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] shadow-sm">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Kişi Başı Gelir</span>
                <div className="text-xl font-black text-white">
                  {formatCurrency(calculation.kisiBasiDusenGelir)}
                </div>
              </div>

              <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] shadow-sm">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Yasal Sınır</span>
                <div className="text-xl font-black text-indigo-400">
                  {formatCurrency(calculation.kisiBasiGelirSiniri)}
                </div>
              </div>

              <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] shadow-sm">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Kalan Limit</span>
                <div className={`text-xl font-black ${calculation.fark >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {calculation.fark >= 0 ? '+' + formatCurrency(calculation.fark) : formatCurrency(calculation.fark)}
                </div>
              </div>

              <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] shadow-sm">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Bakım Aylığı</span>
                <div className="text-xl font-black text-indigo-300">
                  {formatCurrency(calculation.aylikTutar)} <span className="text-[10px] text-slate-500">/ AY</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BAŞVURU ŞARTLARI VE KİMLER BAKICI OLABİLİR? */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-5 shadow-lg group hover:border-indigo-500/50 transition-colors">
          <h3 className="text-xs font-black text-[#F8FAFC] uppercase tracking-widest mb-4 flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Building size={14} />
            </div>
            <span>Kimler Bakıcı Olabilir?</span>
          </h3>
          <ul className="text-xs text-[#CBD5E1] space-y-2 leading-relaxed font-medium">
            <li className="flex gap-2"><span>•</span> <span>Eş, anne, baba, çocuk, kardeş, torun, dede, nine.</span></li>
            <li className="flex gap-2"><span>•</span> <span>Amca, hala, teyze, dayı ve çocukları.</span></li>
            <li className="flex gap-2"><span>•</span> <span>Gelin, damat, kayınvalide, kayınpeder, görümce.</span></li>
            <li className="flex gap-2 text-indigo-300"><span>•</span> <span>Bakıcının haftada en az 8 saat fiilen engelliyle ilgilenmesi zorunludur.</span></li>
          </ul>
        </div>

        <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-5 shadow-lg group hover:border-indigo-500/50 transition-colors">
          <h3 className="text-xs font-black text-[#F8FAFC] uppercase tracking-widest mb-4 flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldAlert size={14} />
            </div>
            <span>Başvuru Prosedürü</span>
          </h3>
          <ul className="text-xs text-[#CBD5E1] space-y-2 leading-relaxed font-medium">
            <li className="flex gap-2"><span>•</span> <span>Başvuru Sosyal Hizmet Merkezi Müdürlüğüne veya e-Devlet üzerinden yapılır.</span></li>
            <li className="flex gap-2"><span>•</span> <span>Değerlendirme heyeti haneyi yerinde ziyaret ederek rapor tanzim eder.</span></li>
            <li className="flex gap-2"><span>•</span> <span>Maaş hiçbir şekilde haczedilemez ve vergiye tabi tutulamaz.</span></li>
          </ul>
        </div>

      </div>

    </div>
  );
}
