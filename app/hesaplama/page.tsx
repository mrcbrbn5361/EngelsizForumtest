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

                  {activeTab !== 'balthazard' && activeTab !== 'otv' && (
                     <div className="p-10 text-center text-slate-500 italic bg-slate-50/50 border border-dashed border-slate-200 rounded-sm text-xs">
                        Bu hesaplama modülü şu an tasarım aşamasındadır. Çok yakında hizmetinizde olacaktır.
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
