'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calculator, Car, Award, ShieldAlert, CheckCircle2, 
  HelpCircle, Plus, Trash2, Info, Calendar, Percent,
  Coins, Home, Users, Briefcase, Loader2
} from 'lucide-react';
import Link from 'next/link';

type TabType = 'balthazard' | 'otv' | 'vergi' | 'evde_bakim' | 'engelli_maasi' | 'kidem' | 'emeklilik';

export default function DisabilityCalculatorsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('balthazard');

  // =========================================================================
  // 1. BALTHAZARD FORMÜLÜ STATE & HESAPLAMA
  // =========================================================================
  const [rates, setRates] = useState<number[]>([40, 20]);
  const [isOver60, setIsOver60] = useState<boolean>(false);

  const addRateInput = () => {
    if (rates.length < 10) {
      setRates([...rates, 10]);
    }
  };

  const updateRate = (index: number, val: number) => {
    const newRates = [...rates];
    newRates[index] = Math.min(100, Math.max(0, val));
    setRates(newRates);
  };

  const removeRate = (index: number) => {
    if (rates.length > 1) {
      setRates(rates.filter((_, i) => i !== index));
    }
  };

  const balthazardResult = useMemo(() => {
    const validRates = rates.filter(r => r > 0).sort((a, b) => b - a);
    if (validRates.length === 0) return 0;

    let remaining = 100;
    let totalScore = 0;

    for (const rate of validRates) {
      const lost = (remaining * rate) / 100;
      totalScore += lost;
      remaining -= lost;
    }

    if (isOver60) {
      const bonus = ((100 - totalScore) * 10) / 100;
      totalScore += bonus;
    }

    return Math.min(100, Math.round(totalScore));
  }, [rates, isOver60]);

  // =========================================================================
  // 2. 2026 ÖTV MUAFİYETLİ ARAÇ HESAPLAMA
  // =========================================================================
  const [carPrice, setCarPrice] = useState<number>(1850000);
  const [engineType, setEngineType] = useState<'standard' | 'electric_10' | 'electric_40' | 'hybrid'>('standard');
  const otvLimit2026 = 2247100;

  const otvResult = useMemo(() => {
    let otvRate = 0.80;
    if (engineType === 'electric_10') otvRate = 0.10;
    else if (engineType === 'electric_40') otvRate = 0.40;
    else if (engineType === 'hybrid') otvRate = 0.80;

    const kdvRate = 0.20;
    const multiplier = (1 + otvRate) * (1 + kdvRate);
    const taxFreePrice = carPrice / multiplier;
    const otvAmount = taxFreePrice * otvRate;
    const kdvAmount = taxFreePrice * kdvRate;
    const exemptPrice = taxFreePrice * (1 + kdvRate);
    const savings = carPrice - exemptPrice;
    const isEligible = carPrice <= otvLimit2026;

    return {
      taxFreePrice: Math.round(taxFreePrice),
      otvRatePercent: Math.round(otvRate * 100),
      otvAmount: Math.round(otvAmount),
      kdvAmount: Math.round(kdvAmount),
      exemptPrice: Math.round(exemptPrice),
      savings: Math.round(savings),
      isEligible
    };
  }, [carPrice, engineType]);

  const tabsConfig = [
    { id: 'balthazard', label: 'Balthazard Formülü', icon: Percent },
    { id: 'otv', label: '2026 ÖTV Araç', icon: Car },
    { id: 'vergi', label: 'Gelir Vergisi İndirimi', icon: Coins },
    { id: 'evde_bakim', label: 'Evde Bakım Maaşı', icon: Home },
    { id: 'engelli_maasi', label: '2022 Engelli Aylığı', icon: Users },
    { id: 'kidem', label: 'Kıdem & İhbar', icon: Briefcase },
    { id: 'emeklilik', label: 'Erken Emeklilik', icon: Calendar },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <div className="bg-[#eef2f7] -mx-4 px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border-b border-slate-200 mb-4">
        <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 transition-colors">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <span className="font-bold text-slate-800">Hesaplama Araçları</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
         {/* Sidebar Tabs */}
         <div className="w-full lg:w-64 shrink-0">
            <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm">
               <div className="xf-block-header bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[12px] tracking-wider py-2.5 px-3">ARAÇLAR</div>
               <div className="bg-white flex flex-col">
                  {tabsConfig.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`px-4 py-3.5 text-xs text-left border-b border-slate-100 last:border-0 transition-colors flex items-center gap-2.5 font-bold uppercase tracking-wider ${
                           activeTab === tab.id 
                           ? 'bg-slate-50 text-[#185886] border-l-4 border-l-[#185886]' 
                           : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                     >
                        <tab.icon size={15} className={activeTab === tab.id ? 'text-[#185886]' : 'text-slate-400'} />
                        {tab.label}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="flex-1 min-w-0">
            <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm">
               <div className="xf-block-header bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[12px] tracking-wider py-2.5 px-3">
                  {tabsConfig.find(t => t.id === activeTab)?.label}
               </div>
               
               <div className="p-6 text-slate-700 bg-white">
                  {activeTab === 'balthazard' && (
                     <div className="space-y-6">
                        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-xs font-semibold text-blue-800 rounded-r-md border border-blue-100 shadow-xs">
                           Birden fazla engel durumunda oranlar doğrudan toplanmaz; Balthazard formülü ile vücut fonksiyon kaybı hesaplanır.
                        </div>
 
                        <div className="space-y-3">
                           {rates.map((rate, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                 <label className="text-xs font-bold uppercase tracking-wider text-slate-500 w-32 shrink-0">{idx + 1}. Oran (%):</label>
                                 <input 
                                    type="number" 
                                    value={rate}
                                    onChange={(e) => updateRate(idx, Math.min(100, Math.max(0, Number(e.target.value))))}
                                    className="bg-slate-50 border border-slate-300 px-3 py-2 text-sm w-24 rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
                                 />
                                 {rates.length > 1 && (
                                    <button onClick={() => removeRate(idx)} className="text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors" title="Oranı sil">
                                       <Trash2 size={16} />
                                    </button>
                                 )}
                              </div>
                           ))}
                           <button 
                              onClick={addRateInput}
                              className="text-xs font-bold uppercase tracking-wider text-[#185886] hover:text-[#104f75] hover:underline flex items-center gap-1 transition-colors mt-2"
                           >
                              <Plus size={15} /> Yeni Oran Ekle
                           </button>
                        </div>
 
                        <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                           <input 
                              type="checkbox" 
                              id="over60" 
                              checked={isOver60} 
                              onChange={(e) => setIsOver60(e.target.checked)}
                              className="rounded bg-white border-slate-300 text-[#185886] focus:ring-[#185886]"
                           />
                           <label htmlFor="over60" className="text-xs text-slate-500 italic cursor-pointer select-none">Kişi 60 yaşın üzerindedir (Balthazard formülüne +%10 eklenir)</label>
                        </div>
 
                        <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-sm text-center">
                           <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">HESAPLANAN TOPLAM ENGEL ORANI</h4>
                           <div className="text-5xl font-black text-[#185886]">%{balthazardResult}</div>
                           <p className="mt-4 text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto">
                              Bu hesaplama Balthazard formülü esas alınarak yapılmış olup, bilgilendirme amaçlıdır. Nihai karar sağlık kurulları heyeti tarafından verilir.
                           </p>
                        </div>
                     </div>
                  )}
 
                  {activeTab === 'otv' && (
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Araç Liste Fiyatı (TL):</label>
                              <input 
                                 type="number"
                                 value={carPrice}
                                 onChange={(e) => setCarPrice(Number(e.target.value))}
                                 className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Motor Tipi:</label>
                              <select 
                                 value={engineType}
                                 onChange={(e) => setEngineType(e.target.value as any)}
                                 className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
                              >
                                 <option value="standard" className="bg-white">Benzin/Dizel (%80 ÖTV)</option>
                                 <option value="electric_10" className="bg-white">Elektrikli (%10 ÖTV)</option>
                                 <option value="electric_40" className="bg-white">Elektrikli (%40 ÖTV)</option>
                                 <option value="hybrid" className="bg-white">Hibrit (%80 ÖTV)</option>
                              </select>
                           </div>
                        </div>
 
                        <div className={`p-4 border rounded-sm text-xs font-semibold flex items-center gap-3 ${otvResult.isEligible ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                           {otvResult.isEligible ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                           {otvResult.isEligible 
                              ? 'Bu araç 2026 ÖTV muafiyet limitleri içerisindedir.' 
                              : `HATA: Araç fiyatı 2026 üst sınırı olan ${otvLimit2026.toLocaleString('tr-TR')} TL'yi aşmaktadır.`}
                        </div>
 
                        {otvResult.isEligible && (
                           <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
                              <table className="w-full text-xs">
                                 <tbody>
                                    <tr className="border-b border-slate-100">
                                       <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 w-1/2">Ham Fiyat:</td>
                                       <td className="p-3.5 text-right text-slate-700 font-semibold">{otvResult.taxFreePrice.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                       <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">ÖTV Tutarı (%{otvResult.otvRatePercent}):</td>
                                       <td className="p-3.5 text-right text-rose-600 font-bold">-{otvResult.otvAmount.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                       <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">KDV Tutarı (%20):</td>
                                       <td className="p-3.5 text-right text-slate-700 font-semibold">+{otvResult.kdvAmount.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                    <tr className="bg-[#eef2f7]">
                                       <td className="p-4.5 font-extrabold text-[#185886] uppercase text-sm tracking-wider">Ödenecek Tutar:</td>
                                       <td className="p-4.5 text-right font-black text-[#185886] text-xl">{otvResult.exemptPrice.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        )}
                        
                        <div className="p-4 bg-amber-50 border border-amber-100 text-[11px] text-amber-800 rounded-sm leading-relaxed italic">
                           ÖTV muafiyetiyle edinilen araçlar 5 yıl süreyle satılamaz veya devredilemez. 5 yılın sonunda ek vergi ödemeden satış imkanı doğar.
                        </div>
                     </div>
                  )}

                  {activeTab === 'vergi' && (
                     <TaxDiscountCalculator />
                  )}

                  {activeTab === 'evde_bakim' && (
                     <HomeCareAllowanceCalculator />
                  )}

                  {activeTab === 'engelli_maasi' && (
                     <DisabilityPension2022Calculator />
                  )}

                  {activeTab === 'kidem' && (
                     <SeveranceAndNoticeCalculator />
                  )}

                  {activeTab === 'emeklilik' && (
                     <EarlyRetirementCalculator />
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. TAX DISCOUNT CALCULATOR COMPONENT
// =========================================================================
function TaxDiscountCalculator() {
  const [degree, setDegree] = useState<1 | 2 | 3>(3);
  const [taxRate, setTaxRate] = useState<number>(15);

  const baseDiscount = useMemo(() => {
    if (degree === 1) return 6900;
    if (degree === 2) return 3000;
    return 1200;
  }, [degree]);

  const monthlySavings = useMemo(() => {
    return Math.round((baseDiscount * taxRate) / 100);
  }, [baseDiscount, taxRate]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-xs font-semibold text-blue-800 rounded-r-md border border-blue-100 shadow-xs">
        Engelli vergi indirimi, ücretli çalışanların veya serbest meslek erbabının gelir vergisi matrahından düşülerek net maaşlarına yansıtılır. (2026 Değerleri)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Engel Derecesi:</label>
          <select 
            value={degree}
            onChange={(e) => setDegree(Number(e.target.value) as any)}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          >
            <option value={3}>3. Derece (%40 - %59)</option>
            <option value={2}>2. Derece (%60 - %79)</option>
            <option value={1}>1. Derece (%80 ve üzeri)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Vergi Diliminiz (%):</label>
          <select 
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          >
            <option value={15}>%15 (Başlangıç Dilimi)</option>
            <option value={20}>%20</option>
            <option value={27}>%27</option>
            <option value={35}>%35</option>
            <option value={40}>%40</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        <table className="w-full text-xs">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 w-1/2">Aylık Matrah İndirimi:</td>
              <td className="p-3.5 text-right text-slate-700 font-semibold">{baseDiscount.toLocaleString('tr-TR')} TL</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">Uygulanan Gelir Vergisi Oranı:</td>
              <td className="p-3.5 text-right text-slate-700 font-semibold">%{taxRate}</td>
            </tr>
            <tr className="bg-[#eef2f7]">
              <td className="p-4.5 font-extrabold text-[#185886] uppercase text-sm tracking-wider">Aylık Net Maaş Artışı (Kazanç):</td>
              <td className="p-4.5 text-right font-black text-emerald-600 text-xl">+{monthlySavings.toLocaleString('tr-TR')} TL</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 text-[11px] text-amber-800 rounded-sm leading-relaxed">
        Vergi indiriminden faydalanmak için çalışılan iş yerinden alınacak belgelerle Vergi Dairesi Başkanlığına başvuruda bulunulması ve heyet raporunun onaylanması gerekmektedir.
      </div>
    </div>
  );
}

// =========================================================================
// 4. HOME CARE ALLOWANCE CALCULATOR COMPONENT
// =========================================================================
function HomeCareAllowanceCalculator() {
  const [income, setIncome] = useState<number>(30000);
  const [members, setMembers] = useState<number>(4);
  const [isDependent, setIsDependent] = useState<boolean>(true);

  const limitPerPerson = 13333; // 2/3 of estimated minimum wage
  const perPersonIncome = useMemo(() => {
    return Math.round(income / Math.max(1, members));
  }, [income, members]);

  const isEligible = useMemo(() => {
    return isDependent && perPersonIncome <= limitPerPerson;
  }, [isDependent, perPersonIncome]);

  const monthlyAllowance = 10800; // 2026 home care allowance amount

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-xs font-semibold text-blue-800 rounded-r-md border border-blue-100 shadow-xs">
        Evde Bakım Maaşı alabilmek için hem gelir kriterine (hane içi kişi başı gelir limitinin altında kalmak) hem de sağlık kurulu raporu kriterine uygunluk şarttır. (2026 Değerleri)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Hane Toplam Aylık Net Geliri (TL):</label>
          <input 
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Hanede Yaşayan Kişi Sayısı:</label>
          <input 
            type="number"
            value={members}
            onChange={(e) => setMembers(Math.max(1, Number(e.target.value)))}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Rapor Bağımlılık Durumu:</label>
          <select 
            value={isDependent ? 'yes' : 'no'}
            onChange={(e) => setIsDependent(e.target.value === 'yes')}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          >
            <option value="yes">Tam Bağımlı / Ağır Engelli (Evet)</option>
            <option value="no">Kısmi Bağımlı / Ağır Engelli (Hayır)</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        <table className="w-full text-xs">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 w-1/2">Hane Kişi Başına Düşen Gelir:</td>
              <td className="p-3.5 text-right text-slate-700 font-semibold">{perPersonIncome.toLocaleString('tr-TR')} TL</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">Yasal Kişi Başı Limit Sınırı (2026):</td>
              <td className="p-3.5 text-right text-slate-700 font-semibold">{limitPerPerson.toLocaleString('tr-TR')} TL</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">Gelir Kriteri Uygunluğu:</td>
              <td className={`p-3.5 text-right font-bold ${perPersonIncome <= limitPerPerson ? 'text-emerald-600' : 'text-rose-600'}`}>
                {perPersonIncome <= limitPerPerson ? 'UYGUN (Sınırın Altında)' : 'UYGUN DEĞİL (Sınırı Aşıyor)'}
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">Sağlık Kurulu Raporu Uygunluğu:</td>
              <td className={`p-3.5 text-right font-bold ${isDependent ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isDependent ? 'UYGUN (Tam Bağımlı)' : 'UYGUN DEĞİL (Tam Bağımlı Şartı Gerekli)'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={`p-5 rounded-sm border text-center ${isEligible ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
        <h4 className="text-xs font-extrabold uppercase tracking-widest mb-1">BAŞVURU UYGUNLUK DURUMU</h4>
        <div className="text-2xl font-black">{isEligible ? 'BAŞVURU YAPABİLİRSİNİZ' : 'ŞARTLAR KARŞILANMIYOR'}</div>
        {isEligible ? (
          <p className="mt-2 text-xs font-normal">Tahmini Aylık Evde Bakım Maaşı Ödemesi: <span className="font-bold text-[#185886]">{monthlyAllowance.toLocaleString('tr-TR')} TL</span></p>
        ) : (
          <p className="mt-2 text-xs font-normal">Maaş alabilmek için hem kişi başı gelirin {limitPerPerson.toLocaleString('tr-TR')} TL limitinin altında olması hem de raporun "Tam Bağımlı" olarak onaylanmış olması gerekmektedir.</p>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 5. 2022 DISABILITY PENSION CALCULATOR COMPONENT
// =========================================================================
function DisabilityPension2022Calculator() {
  const [income, setIncome] = useState<number>(20000);
  const [members, setMembers] = useState<number>(4);
  const [rate, setRate] = useState<number>(55);

  const limitPerPerson = 6666; // 1/3 of net min wage (approximate)
  const perPersonIncome = useMemo(() => {
    return Math.round(income / Math.max(1, members));
  }, [income, members]);

  const isEligible = useMemo(() => {
    return rate >= 40 && perPersonIncome <= limitPerPerson;
  }, [rate, perPersonIncome]);

  const estimatedPension = useMemo(() => {
    if (!isEligible) return 0;
    if (rate >= 70) return 6700; // 2026 70%+ disability pension
    return 4500; // 2026 40%-69% disability pension
  }, [rate, isEligible]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-xs font-semibold text-blue-800 rounded-r-md border border-blue-100 shadow-xs">
        2022 sayılı kanun kapsamında ödenen Engelli Aylığı hane içi kişi başına düşen gelirin, net asgari ücretin 3'te 1'inden az olan muhtaç durumdaki vatandaşlara ödenir. (2026 Tahmini Değerleri)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Hane Toplam Net Aylık Geliri (TL):</label>
          <input 
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Hanede Yaşayan Kişi Sayısı:</label>
          <input 
            type="number"
            value={members}
            onChange={(e) => setMembers(Math.max(1, Number(e.target.value)))}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Engel Oranı (%):</label>
          <input 
            type="number"
            value={rate}
            onChange={(e) => setRate(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        <table className="w-full text-xs">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 w-1/2">Hane Kişi Başına Düşen Gelir:</td>
              <td className="p-3.5 text-right text-slate-700 font-semibold">{perPersonIncome.toLocaleString('tr-TR')} TL</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">Yasal Muhtaçlık Kişi Başı Sınırı (2026):</td>
              <td className="p-3.5 text-right text-slate-700 font-semibold">{limitPerPerson.toLocaleString('tr-TR')} TL</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">Gelir Kriteri Uygunluğu:</td>
              <td className={`p-3.5 text-right font-bold ${perPersonIncome <= limitPerPerson ? 'text-emerald-600' : 'text-rose-600'}`}>
                {perPersonIncome <= limitPerPerson ? 'UYGUN (Sınırın Altında)' : 'UYGUN DEĞİL (Sınırı Aşıyor)'}
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">Engel Oranı Uygunluğu:</td>
              <td className={`p-3.5 text-right font-bold ${rate >= 40 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {rate >= 40 ? `UYGUN (%${rate})` : `UYGUN DEĞİL (%${rate} - En az %40 gerekli)`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={`p-5 rounded-sm border text-center ${isEligible ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
        <h4 className="text-xs font-extrabold uppercase tracking-widest mb-1">ENGELLİ MAAŞI BAŞVURU DURUMU</h4>
        <div className="text-2xl font-black">{isEligible ? 'MAAŞ ALABİLİRSİNİZ' : 'ŞARTLAR KARŞILANMIYOR'}</div>
        {isEligible ? (
          <p className="mt-2 text-xs font-normal">Kategori: <span className="font-bold">{rate >= 70 ? 'Ağır Engelli Aylığı (%70+)' : 'Engelli Aylığı (%40-%69)'}</span> • Tahmini Aylık Ödeme: <span className="font-bold text-[#185886]">{estimatedPension.toLocaleString('tr-TR')} TL</span></p>
        ) : (
          <p className="mt-2 text-xs font-normal">Başvuru şartları arasında hane kişi başı gelirin muhtaçlık sınırının altında olması ve en az %40 onaylı engelli raporunun bulunması yer almaktadır.</p>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 6. SEVERANCE & NOTICE COMPENSATION CALCULATOR
// =========================================================================
function SeveranceAndNoticeCalculator() {
  const [years, setYears] = useState<number>(3);
  const [months, setMonths] = useState<number>(6);
  const [grossSalary, setGrossSalary] = useState<number>(35000);

  const results = useMemo(() => {
    const totalServiceInMonths = (years * 12) + months;
    const severanceGross = (grossSalary * totalServiceInMonths) / 12;
    const stampTaxSeverance = severanceGross * 0.00759;
    const severanceNet = severanceGross - stampTaxSeverance;

    let noticeWeeks = 8;
    if (totalServiceInMonths < 6) noticeWeeks = 2;
    else if (totalServiceInMonths >= 6 && totalServiceInMonths < 18) noticeWeeks = 4;
    else if (totalServiceInMonths >= 18 && totalServiceInMonths < 36) noticeWeeks = 6;

    const dailySalary = grossSalary / 30;
    const noticeGross = dailySalary * (noticeWeeks * 7);
    const incomeTaxNotice = noticeGross * 0.15;
    const stampTaxNotice = noticeGross * 0.00759;
    const noticeNet = noticeGross - incomeTaxNotice - stampTaxNotice;

    return {
      totalMonths: totalServiceInMonths,
      severanceGross: Math.round(severanceGross),
      severanceNet: Math.round(severanceNet),
      noticeWeeks,
      noticeGross: Math.round(noticeGross),
      noticeNet: Math.round(noticeNet),
      totalNetPay: Math.round(severanceNet + noticeNet)
    };
  }, [years, months, grossSalary]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-xs font-semibold text-blue-800 rounded-r-md border border-blue-100 shadow-xs">
        Kıdem Tazminatı, çalışanın iş yerindeki her tam yılı için 30 günlük son brüt maaşı üzerinden hesaplanır. İhbar tazminatı ise ihbar sürelerine uymadan yapılan işten çıkarmalarda ödenir.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Çalışılan Yıl:</label>
          <input 
            type="number"
            value={years}
            onChange={(e) => setYears(Math.max(0, Number(e.target.value)))}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Eklenen Ay Sayısı:</label>
          <input 
            type="number"
            value={months}
            onChange={(e) => setMonths(Math.min(11, Math.max(0, Number(e.target.value))))}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Aylık Brüt Maaş (TL):</label>
          <input 
            type="number"
            value={grossSalary}
            onChange={(e) => setGrossSalary(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <th className="p-3 text-left">Tazminat Türü</th>
              <th className="p-3 text-right">Brüt Tutar</th>
              <th className="p-3 text-right">Net Tutar (Vergi ve Kesintiler Sonrası)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold text-slate-700">Kıdem Tazminatı ({years} Yıl {months} Ay):</td>
              <td className="p-3.5 text-right text-slate-600 font-semibold">{results.severanceGross.toLocaleString('tr-TR')} TL</td>
              <td className="p-3.5 text-right text-emerald-600 font-bold">{results.severanceNet.toLocaleString('tr-TR')} TL</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-3.5 font-bold text-slate-700">İhbar Tazminatı ({results.noticeWeeks} Hafta):</td>
              <td className="p-3.5 text-right text-slate-600 font-semibold">{results.noticeGross.toLocaleString('tr-TR')} TL</td>
              <td className="p-3.5 text-right text-emerald-600 font-bold">{results.noticeNet.toLocaleString('tr-TR')} TL</td>
            </tr>
            <tr className="bg-[#eef2f7]">
              <td className="p-4.5 font-black text-[#185886] uppercase text-sm tracking-wider">Toplam Alınacak Net Ödeme:</td>
              <td className="p-4.5"></td>
              <td className="p-4.5 text-right font-black text-[#185886] text-xl">{results.totalNetPay.toLocaleString('tr-TR')} TL</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 text-[11px] text-amber-800 rounded-sm leading-relaxed italic">
        Kıdem tazminatı tavan ücreti her yıl Ocak ve Temmuz aylarında güncellenir. Hesaplanan miktar tavan sınırını aşamaz.
      </div>
    </div>
  );
}

// =========================================================================
// 7. EARLY RETIREMENT CALCULATOR COMPONENT
// =========================================================================
function EarlyRetirementCalculator() {
  const [startYear, setStartYear] = useState<string>('2003-2008');
  const [rate, setRate] = useState<number>(55);
  const [earnedDays, setEarnedDays] = useState<number>(3600);

  const retirementDetails = useMemo(() => {
    let degree = 3;
    if (rate >= 80) degree = 1;
    else if (rate >= 60) degree = 2;
    else if (rate < 40) degree = 0;

    if (degree === 0) {
      return {
        degreeStr: 'Derece Yok',
        requiredYears: 0,
        requiredDays: 0,
        status: 'Yetersiz',
        message: 'Erken emeklilik hakkından yararlanabilmek için en az %40 engel oranı gerekmektedir.'
      };
    }

    let requiredYears = 18;
    let requiredDays = 4000;

    if (startYear === 'before-1997') {
      if (degree === 1) { requiredYears = 15; requiredDays = 3600; }
      else if (degree === 2) { requiredYears = 16; requiredDays = 3760; }
      else { requiredYears = 17; requiredDays = 3920; }
    } else if (startYear === '1997-2003') {
      if (degree === 1) { requiredYears = 15; requiredDays = 3600; }
      else if (degree === 2) { requiredYears = 17; requiredDays = 3840; }
      else { requiredYears = 19; requiredDays = 4240; }
    } else if (startYear === '2003-2008') {
      if (degree === 1) { requiredYears = 15; requiredDays = 3600; }
      else if (degree === 2) { requiredYears = 18; requiredDays = 4000; }
      else { requiredYears = 20; requiredDays = 4400; }
    } else { // After 2008
      if (degree === 1) { requiredYears = 15; requiredDays = 3600; }
      else if (degree === 2) { requiredYears = 16; requiredDays = 3700; }
      else { requiredYears = 18; requiredDays = 4100; }
    }

    const missingDays = Math.max(0, requiredDays - earnedDays);
    const isEligible = earnedDays >= requiredDays;

    return {
      degreeStr: `${degree}. Derece Engelli`,
      requiredYears,
      requiredDays,
      missingDays,
      isEligible,
      message: isEligible 
        ? `Tebrikler! Gerekli olan ${requiredDays} günlük prim ödeme şartını karşılıyorsunuz.` 
        : `Gerekli olan prim süresini doldurmak için ${missingDays} gün daha prim ödemeniz gerekmektedir.`
    };
  }, [startYear, rate, earnedDays]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-xs font-semibold text-blue-800 rounded-r-md border border-blue-100 shadow-xs">
        Engelli sigortalılar için erken emeklilik sistemi yaş şartı aranmaksızın, sigortalılık süresi ve prim günü esasına göre çalışır. (SGK Güncel Mevzuatı)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">İlk İşe Giriş Tarihi:</label>
          <select 
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          >
            <option value="before-1997">01.10.1997 Öncesi</option>
            <option value="1997-2003">1997 - 2003 Arası</option>
            <option value="2003-2008">2003 - 2008 Arası</option>
            <option value="after-2008">01.10.2008 Sonrası (5510 Sayılı Kanun)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Engel Oranı (%):</label>
          <input 
            type="number"
            value={rate}
            onChange={(e) => setRate(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Toplam Ödenmiş Prim Günü:</label>
          <input 
            type="number"
            value={earnedDays}
            onChange={(e) => setEarnedDays(Math.max(0, Number(e.target.value)))}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-bold"
          />
        </div>
      </div>

      {rate >= 40 ? (
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 w-1/2">Engel Sınıfı Derecesi:</td>
                <td className="p-3.5 text-right text-[#185886] font-bold">{retirementDetails.degreeStr}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">Zorunlu Sigortalılık Süresi (Yıl):</td>
                <td className="p-3.5 text-right text-slate-700 font-semibold">{retirementDetails.requiredYears} Yıl</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">Gerekli Minimum Prim Günü:</td>
                <td className="p-3.5 text-right text-slate-700 font-semibold">{retirementDetails.requiredDays} Gün</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3.5 font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">Mevcut Prim Gününüz:</td>
                <td className="p-3.5 text-right text-slate-700 font-bold">{earnedDays} Gün</td>
              </tr>
              <tr className="bg-[#eef2f7]">
                <td className="p-4.5 font-extrabold text-[#185886] uppercase text-sm tracking-wider">Eksik Kalan Prim Günü:</td>
                <td className="p-4.5"></td>
                <td className={`p-4.5 text-right font-black text-xl ${retirementDetails.isEligible ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {retirementDetails.missingDays === 0 ? 'TAMAMLANDI' : `${retirementDetails.missingDays} GÜN`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}

      <div className={`p-5 rounded-sm border text-center ${rate >= 40 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
        <h4 className="text-xs font-extrabold uppercase tracking-widest mb-1">ERKEN EMEKLİLİK ANALİZİ</h4>
        <div className="text-xl font-black">{retirementDetails.message}</div>
        <p className="mt-2 text-xs font-normal">Bu hesaplama, vergi indirim belgesine veya SGK tarafından onaylanmış engelli çalışma tespitine sahip olan kişilerin erken emeklilik koşullarını içerir.</p>
      </div>
    </div>
  );
}

