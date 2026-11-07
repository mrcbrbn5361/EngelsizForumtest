'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  AlertCircle,
  Receipt,
  FileCheck,
  Info,
  Wallet,
  TrendingDown,
  LayoutDashboard
} from 'lucide-react';

const NET_ASGARI_UCRET_2026 = 22104; // 2026 Gösterge Net Asgari Ücret

// 2026 Yılı 2022 Sayılı Kanun Kapsamındaki Aylıklar (Memur maaş katsayısına endeksli)
const MAAS_40_69 = 3750; // %40 - %69 Arası Aylık
const MAAS_70_USTU = 5625; // %70 ve Üzeri Aylık
const MAAS_18_YAS_ALTI = 3750; // 18 Yaş Altı Engelli Yakını Aylığı

export default function EngelliAyligiPage() {
  const [householdSize, setHouseholdSize] = useState<number>(3);
  const [totalIncome, setTotalIncome] = useState<number>(18000);
  const [disabilityRate, setDisabilityRate] = useState<number>(55);
  const [hasSgk, setHasSgk] = useState<boolean>(false);
  const [receivesEvdeBakim, setReceivesEvdeBakim] = useState<boolean>(false);

  const formatCurrency = (val: number) => {
    return Math.round(val).toLocaleString('tr-TR') + ' ₺';
  };

  // 2022 Sayılı Kanun Gereği: Kişi başı gelir Net Asgari Ücretin 1/3'ünü aşamaz
  const kisiBasiSinir = NET_ASGARI_UCRET_2026 / 3;

  // =========================================================================
  // MATEMATİKSEL MUHTAÇLIK VE ŞART HESAP MOTORU
  // =========================================================================
  const calculation = useMemo(() => {
    const size = Math.max(1, householdSize);
    
    // Evde bakım maaşı alınıyorsa hane gelirine dahil edilir mi? 
    // 2022 yönetmeliği gereği haneye giren her türlü resmi gelir (evde bakım dahil) hesaplamaya katılır!
    const effectiveIncome = totalIncome + (receivesEvdeBakim ? 11400 : 0);
    const kisiBasiGelir = effectiveIncome / size;

    const isIncomeEligible = kisiBasiGelir < kisiBasiSinir;
    const isSgkEligible = !hasSgk; // SGK'lı olmamak şart
    const isRateEligible = disabilityRate >= 40;

    const isApproved = isIncomeEligible && isSgkEligible && isRateEligible;

    let aylikTutar = 0;
    let kategori = '';

    if (disabilityRate >= 70) {
      aylikTutar = MAAS_70_USTU;
      kategori = '%70 ve Üzeri Başkasının Yardımı Olmaksızın Yaşayamayacak Engelli';
    } else if (disabilityRate >= 40) {
      aylikTutar = MAAS_40_69;
      kategori = '%40 - %69 Arası Engelli Aylığı';
    } else {
      aylikTutar = 0;
      kategori = '%40 Altı (Aylık Bağlanmaz)';
    }

    const fark = kisiBasiSinir - kisiBasiGelir;

    return {
      size,
      effectiveIncome,
      kisiBasiGelir,
      kisiBasiSinir,
      isIncomeEligible,
      isSgkEligible,
      isRateEligible,
      isApproved,
      aylikTutar,
      kategori,
      fark,
    };
  }, [householdSize, totalIncome, disabilityRate, hasSgk, receivesEvdeBakim, kisiBasiSinir]);

  return (
    <div className="space-y-6">
      
      {/* Üst Başlık & Mevzuat Dayanağı */}
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E293B] pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#18243A] text-indigo-400 flex items-center justify-center shadow-inner border border-[#1E293B]">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                2022 Engelli Aylığı Muhtaçlık Testi (2026)
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Info size={12} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">
                  2022 Sayılı Kanun ve SYDV Muhtaçlık Kriterleri Standardı
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-md bg-[#0B1220] text-indigo-300 border border-indigo-800/50 shadow-sm uppercase tracking-wider">
            2026 SINIRI: {formatCurrency(kisiBasiSinir)}
          </div>
        </div>

        {/* Girdi Formu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Hanedeki Birey Sayısı
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
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[10px] uppercase">KİŞİ</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Hanenin Aylık Net Geliri
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
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Engelli Rapor Oranı
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={disabilityRate || ''}
                onChange={(e) => setDisabilityRate(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-sm font-bold outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">%</span>
            </div>
          </div>

        </div>

        {/* İlave Şart Onay Kutuları */}
        <div className="mt-6 pt-6 border-t border-[#1E293B] space-y-3">
          
          <label className="flex items-start gap-4 cursor-pointer select-none p-4 rounded-lg bg-[#0B1220] border border-[#1E293B] hover:bg-[#18243A]/50 transition-all group">
            <div className="mt-1">
              <input
                type="checkbox"
                checked={hasSgk}
                onChange={(e) => setHasSgk(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-500 focus:ring-indigo-500 border-[#1E293B] bg-[#111B2E]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#F8FAFC] block uppercase tracking-wide group-hover:text-indigo-400 transition-colors">
                Aktif SGK Kaydı veya Emekli Aylığı Var mı?
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed block">
                2022 aylığı yalnızca SGK kapsamında aktif sigortalı olmayan ve sosyal güvencesi bulunmayan muhtaç kişilere bağlanır.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer select-none p-4 rounded-lg bg-[#0B1220] border border-[#1E293B] hover:bg-[#18243A]/50 transition-all group">
            <div className="mt-1">
              <input
                type="checkbox"
                checked={receivesEvdeBakim}
                onChange={(e) => setReceivesEvdeBakim(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-500 focus:ring-indigo-500 border-[#1E293B] bg-[#111B2E]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#F8FAFC] block uppercase tracking-wide group-hover:text-indigo-400 transition-colors">
                Hanede Evde Bakım Maaşı Alan Var mı? (+11.400 TL Gelire Eklenir)
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed block">
                SYDV muhtaçlık testinde, haneye giren evde bakım yardımları da resmi gelir kabul edilerek kişi başına paylaştırılır.
              </span>
            </div>
          </label>

        </div>
      </div>

      {/* SONUÇ KARTLARI */}
      <div className={`rounded-xl border p-6 shadow-xl animate-in zoom-in-95 duration-300 ${
        calculation.isApproved 
          ? 'bg-emerald-950/10 border-emerald-900/50' 
          : 'bg-indigo-950/10 border-indigo-900/50'
      }`}>
        <div className="flex items-start gap-5">
          <div className="mt-1">
            {calculation.isApproved ? (
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
                {calculation.isApproved 
                  ? 'GELİR KRİTERİ UYGUN: Aylık Bağlanabilir' 
                  : 'YASAL ŞARTLAR VEYA GELİR KRİTERİ AŞILDI'}
              </h2>

              <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border ${
                calculation.isApproved 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' 
                  : 'bg-indigo-950/40 text-indigo-400 border-indigo-800'
              }`}>
                {calculation.isApproved ? 'Muhtaçlık Onaylı' : 'Ret Gerekçesi Var'}
              </span>
            </div>

            <div className="text-sm text-[#CBD5E1] leading-relaxed max-w-4xl">
              {calculation.isApproved ? (
                <>
                  Hane içi kişi başı net geliriniz <strong>{formatCurrency(calculation.kisiBasiGelir)}</strong> olup, kanuni muhtaçlık sınırı olan <strong>{formatCurrency(calculation.kisiBasiSinir)}</strong> tutarının altındadır. 
                  İlçenizdeki <strong>SYDV&apos;ye</strong> müracaat ederek aylık <strong>{formatCurrency(calculation.aylikTutar)}</strong> ödeme alabilirsiniz.
                </>
              ) : (
                <div className="space-y-2">
                  {hasSgk && (
                    <div className="flex items-center gap-2 text-rose-400 font-bold">
                      <TrendingDown size={14} />
                      <span>AKTİF SİGORTA: Birey sigortalı olduğu için 2022 aylığı bağlanamaz.</span>
                    </div>
                  )}
                  {!calculation.isIncomeEligible && (
                    <div className="flex items-center gap-2 text-rose-400 font-bold">
                      <TrendingDown size={14} />
                      <span>GELİR AŞIMI: Kişi başı gelir ({formatCurrency(calculation.kisiBasiGelir)}), sınırı {formatCurrency(-calculation.fark)} aşıyor.</span>
                    </div>
                  )}
                  {disabilityRate < 40 && (
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <AlertCircle size={14} />
                      <span>RAPOR ORANI: Aylık için en az %40 sağlık kurulu raporu zorunludur.</span>
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
                  {formatCurrency(calculation.kisiBasiGelir)}
                </div>
              </div>

              <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] shadow-sm">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Muhtaçlık Sınırı</span>
                <div className="text-xl font-black text-indigo-400">
                  {formatCurrency(calculation.kisiBasiSinir)}
                </div>
              </div>

              <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] shadow-sm">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Rapor Durumu</span>
                <div className="text-xl font-black text-indigo-300">
                  %{disabilityRate} Oran
                </div>
              </div>

              <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] shadow-sm">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Bağlanacak Maaş</span>
                <div className="text-xl font-black text-emerald-400">
                  {formatCurrency(calculation.aylikTutar)} <span className="text-[10px] text-slate-500">/ AY</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2026 KADEMELİ AY LIK TUTARLARI TABLOSU */}
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] overflow-hidden shadow-xl">
        <div className="bg-[#18243A] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-indigo-400" />
            <span>2026 GÜNCEL 2022 AYLIĞI KADEMELERİ</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/50 border border-indigo-800/60 px-2 py-0.5 rounded">
            MEMUR KATSAYISI ENDEKSLİ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B1220] text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-[#1E293B]">
                <th className="p-4">Yardım Türü</th>
                <th className="p-4">Engel Kapsamı</th>
                <th className="p-4">Gelir Kriteri</th>
                <th className="p-4 text-right">2026 Aylık Tutarı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-[#CBD5E1]">
              <tr className={`hover:bg-white/5 transition-colors ${disabilityRate >= 40 && disabilityRate < 70 ? 'bg-indigo-950/20' : ''}`}>
                <td className="p-4 font-bold text-[#F8FAFC]">%40 - %69 Engelli Aylığı</td>
                <td className="p-4 text-slate-400 font-medium">%40 ile %69 arası raporu olanlar</td>
                <td className="p-4 text-slate-500 font-mono text-[10px]">Kişi başı &lt; {formatCurrency(kisiBasiSinir)}</td>
                <td className="p-4 text-right font-black text-indigo-400 text-sm">
                  {formatCurrency(MAAS_40_69)}
                </td>
              </tr>
              <tr className={`hover:bg-white/5 transition-colors ${disabilityRate >= 70 ? 'bg-emerald-950/20' : ''}`}>
                <td className="p-4 font-bold text-[#F8FAFC]">%70 ve Üzeri Bakıma Muhtaç</td>
                <td className="p-4 text-slate-400 font-medium">%70 ve üzeri ağır engelli bireyler</td>
                <td className="p-4 text-slate-500 font-mono text-[10px]">Kişi başı &lt; {formatCurrency(kisiBasiSinir)}</td>
                <td className="p-4 text-right font-black text-emerald-400 text-sm">
                  {formatCurrency(MAAS_70_USTU)}
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-[#F8FAFC]">18 Yaş Altı Engelli Yakını</td>
                <td className="p-4 text-slate-400 font-medium">Özel gereksinimli çocuk ebeveyni</td>
                <td className="p-4 text-slate-500 font-mono text-[10px]">Kişi başı &lt; {formatCurrency(kisiBasiSinir)}</td>
                <td className="p-4 text-right font-black text-indigo-400 text-sm">
                  {formatCurrency(MAAS_18_YAS_ALTI)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
