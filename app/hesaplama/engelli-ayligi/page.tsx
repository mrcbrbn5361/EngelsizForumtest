'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  FileCheck
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
      <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-amber-50 text-amber-700 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                2026 Yılı 2022 Engelli Aylığı Muhtaçlık ve Gelir Testi
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Dayanak: 2022 sayılı 65 Yaşını Doldurmuş Muhtaç, Güçsüz ve Kimsesiz Türk Vatandaşlarına Aylık Bağlanması Hakkında Kanun
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
            2026 Muhtaçlık Sınırı: <strong>{formatCurrency(kisiBasiSinir)}</strong>
          </div>
        </div>

        {/* Girdi Formu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Hanedeki Kişi Sayısı */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Hanedeki Birey Sayısı
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
          </div>

          {/* Hanenin Aylık Net Geliri */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Hanenin Aylık Toplam Geliri
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
                TL
              </span>
            </div>
          </div>

          {/* Engel Oranı */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Sağlık Kurulu Engel Oranı
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={disabilityRate || ''}
                onChange={(e) => setDisabilityRate(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="w-full px-3.5 py-2.5 rounded border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:outline-none focus:border-[#185886]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                %
              </span>
            </div>
          </div>

        </div>

        {/* İlave Şart Onay Kutuları */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
          
          <label className="flex items-start gap-3 cursor-pointer select-none p-2.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={hasSgk}
              onChange={(e) => setHasSgk(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">
                Engelli Birey Üzerine Aktif SGK (4A, 4B, 4C) Kaydı veya Emekli Aylığı Var mı?
              </span>
              <span className="text-slate-600 block mt-0.5">
                2022 sayılı Kanun kapsamında engelli aylığı yalnızca SGK kapsamında aktif sigortalı olmayan ve SGK&apos;dan herhangi bir gelir/aylık almayan muhtaç kişilere bağlanır.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none p-2.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={receivesEvdeBakim}
              onChange={(e) => setReceivesEvdeBakim(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#185886] focus:ring-[#185886] border-slate-300"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">
                Hanede Evde Bakım Maaşı Alan Başka Bir Birey Var mı? (+11.400 TL Hane Gelirine Eklenir)
              </span>
              <span className="text-slate-600 block mt-0.5">
                SYDV muhtaçlık testinde, haneye giren evde bakım yardımları da resmi gelir kabul edilerek kişi başına paylaştırılır.
              </span>
            </div>
          </label>

        </div>
      </div>

      {/* SONUÇ KARTLARI */}
      <div className={`rounded-md border p-6 shadow-xs ${
        calculation.isApproved 
          ? 'bg-emerald-50/70 border-emerald-300' 
          : 'bg-amber-50/70 border-amber-300'
      }`}>
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {calculation.isApproved ? (
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
                calculation.isApproved ? 'text-emerald-950' : 'text-amber-950'
              }`}>
                {calculation.isApproved 
                  ? 'ŞARTLAR UYGUN: 2022 Engelli Aylığı Almaya Hak Kazanıyorsunuz' 
                  : 'ENGEL DURUMU VEYA GELİR KRİTERİ AŞILDI'}
              </h2>

              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                calculation.isApproved 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {calculation.isApproved ? 'Aylık Bağlanabilir' : 'Başvuru Reddedilebilir'}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {calculation.isApproved ? (
                <>
                  Hane içi kişi başı net geliriniz <strong>{formatCurrency(calculation.kisiBasiGelir)}</strong> olup, kanuni muhtaçlık sınırı olan <strong>{formatCurrency(calculation.kisiBasiSinir)}</strong> tutarının altındadır. 
                  İkamet ettiğiniz ilçedeki <strong>Sosyal Yardımlaşma ve Dayanışma Vakfı&apos;na (SYDV)</strong> müracaat ederek aylık <strong>{formatCurrency(calculation.aylikTutar)}</strong> 2022 engelli aylığı alabilirsiniz.
                </>
              ) : (
                <>
                  {hasSgk && (
                    <span className="block text-red-800 font-semibold mb-1">
                      • Aktif Sigorta Engeli: Birey adına SGK primi yatırıldığı veya emekli aylığı bulunduğu için 2022 aylığı bağlanamaz.
                    </span>
                  )}
                  {!calculation.isIncomeEligible && (
                    <span className="block text-red-800 font-semibold mb-1">
                      • Gelir Kriteri Aşıldı: Hanede kişi başı düşen gelir ({formatCurrency(calculation.kisiBasiGelir)}), kanuni sınır olan {formatCurrency(calculation.kisiBasiSinir)} tutarından {formatCurrency(-calculation.fark)} fazladır.
                    </span>
                  )}
                  {disabilityRate < 40 && (
                    <span className="block text-amber-900 font-semibold mb-1">
                      • Rapor Oranı Yetersiz: Engelli aylığı bağlanabilmesi için resmi sağlık kurulu oranının en az %40 olması zorunludur.
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
                  {formatCurrency(calculation.kisiBasiGelir)}
                </span>
              </div>

              <div className="p-2 bg-white/80 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">1/3 Asgari Ücret Sınırı</span>
                <span className="font-black text-[#185886] text-sm">
                  {formatCurrency(calculation.kisiBasiSinir)}
                </span>
              </div>

              <div className="p-2 bg-white/80 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Engel Kapsamı</span>
                <span className="font-black text-purple-800 text-sm">
                  %{disabilityRate} ({calculation.kategori.split(' ')[0]})
                </span>
              </div>

              <div className="p-2 bg-white/80 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Bağlanacak Aylık Tutarı</span>
                <span className="font-black text-emerald-800 text-sm">
                  {formatCurrency(calculation.aylikTutar)} / ay
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2026 KADEMELİ AY LIK TUTARLARI TABLOSU */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-[#124d77] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <Receipt className="w-4 h-4 text-blue-200" />
            <span>2026 YILI 2022 SAYILI KANUN GÜNCEL MAAŞ KADEMELERİ</span>
          </div>
          <span className="text-xs text-blue-200">
            Hazine ve Maliye Bakanlığı Katsayıları
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">Yardım Türü</th>
                <th className="p-3">Engel Oranı / Kapsam</th>
                <th className="p-3">Muhtaçlık Kriteri</th>
                <th className="p-3 text-right">2026 Aylık Tutarı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr className={disabilityRate >= 40 && disabilityRate < 70 ? 'bg-amber-50/80 font-bold' : ''}>
                <td className="p-3 font-semibold text-slate-800">%40 - %69 Engelli Aylığı</td>
                <td className="p-3 text-slate-600">%40 ile %69 arasında raporu olanlar</td>
                <td className="p-3 text-slate-600">Kişi başı &lt; {formatCurrency(kisiBasiSinir)}</td>
                <td className="p-3 text-right font-black text-emerald-800 text-sm">
                  {formatCurrency(MAAS_40_69)}
                </td>
              </tr>
              <tr className={disabilityRate >= 70 ? 'bg-emerald-50/80 font-bold' : ''}>
                <td className="p-3 font-semibold text-slate-800">%70 ve Üzeri Başkasına Muhtaç Aylığı</td>
                <td className="p-3 text-slate-600">%70 ve üzeri ağır kayıp yaşayanlar</td>
                <td className="p-3 text-slate-600">Kişi başı &lt; {formatCurrency(kisiBasiSinir)}</td>
                <td className="p-3 text-right font-black text-emerald-800 text-sm">
                  {formatCurrency(MAAS_70_USTU)}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">18 Yaş Altı Engelli Yakını Aylığı</td>
                <td className="p-3 text-slate-600">ÇÖZ-GER raporlu çocuğun sigortasız ebeveyni</td>
                <td className="p-3 text-slate-600">Kişi başı &lt; {formatCurrency(kisiBasiSinir)}</td>
                <td className="p-3 text-right font-black text-emerald-800 text-sm">
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
