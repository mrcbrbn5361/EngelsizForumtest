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
      <div className="bg-[#eceff3] -mx-4 px-4 py-2 flex flex-wrap items-center gap-2 text-[12px] text-[#4b5563] border-b border-[#d8dee4] mb-4">
        <Link href="/" className="hover:text-[#18587a] flex items-center gap-1">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <span className="font-semibold text-[#212529]">Hesaplama Araçları</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
         {/* Sidebar Tabs */}
         <div className="w-full lg:w-64 shrink-0">
            <div className="xf-block rounded-sm overflow-hidden">
               <div className="xf-block-header">ARAÇLAR</div>
               <div className="bg-white flex flex-col">
                  {tabsConfig.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`px-4 py-3 text-sm text-left border-b border-[#d8dee4] last:border-0 transition-colors flex items-center gap-2 ${
                           activeTab === tab.id 
                           ? 'bg-[#eceff3] text-[#18587a] font-bold border-l-4 border-l-[#18587a]' 
                           : 'text-[#212529] hover:bg-[#f8fafc]'
                        }`}
                     >
                        <tab.icon size={16} className={activeTab === tab.id ? 'text-[#18587a]' : 'text-slate-600'} />
                        {tab.label}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="flex-1 min-w-0">
            <div className="xf-block rounded-sm overflow-hidden">
               <div className="xf-block-header uppercase">
                  {tabsConfig.find(t => t.id === activeTab)?.label}
               </div>
               
               <div className="p-6 bg-white">
                  {activeTab === 'balthazard' && (
                     <div className="space-y-6">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-700">
                           Birden fazla engel durumunda oranlar doğrudan toplanmaz; Balthazard formülü ile vücut fonksiyon kaybı hesaplanır.
                        </div>

                        <div className="space-y-3">
                           {rates.map((rate, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                 <label className="text-sm font-bold text-[#204060] w-32 shrink-0">{idx + 1}. Oran (%):</label>
                                 <input 
                                    type="number" 
                                    value={rate}
                                    onChange={(e) => updateRate(idx, Number(e.target.value))}
                                    className="border border-[#d8dee4] p-2 text-sm w-24 focus:outline-none focus:border-[#18587a]"
                                 />
                                 {rates.length > 1 && (
                                    <button onClick={() => removeRate(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                       <Trash2 size={16} />
                                    </button>
                                 )}
                              </div>
                           ))}
                           <button 
                              onClick={addRateInput}
                              className="text-sm font-bold text-[#18587a] hover:underline flex items-center gap-1"
                           >
                              <Plus size={16} /> Yeni Oran Ekle
                           </button>
                        </div>

                        <div className="pt-4 border-t border-[#d8dee4] flex items-center gap-2">
                           <input 
                              type="checkbox" 
                              id="over60" 
                              checked={isOver60} 
                              onChange={(e) => setIsOver60(e.target.checked)}
                           />
                           <label htmlFor="over60" className="text-sm text-slate-700 italic">Kişi 60 yaşın üzerindedir (+%10)</label>
                        </div>

                        <div className="mt-8 p-6 bg-[#f8fafc] border border-[#d8dee4] rounded text-center">
                           <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">HESAPLANAN ENGEL ORANI</h4>
                           <div className="text-5xl font-black text-[#18587a]">%{balthazardResult}</div>
                           <p className="mt-4 text-xs text-slate-700 leading-relaxed">
                              Bu hesaplama bilgilendirme amaçlıdır. Nihai karar sağlık kurulları tarafından verilir.
                           </p>
                        </div>
                     </div>
                  )}

                  {activeTab === 'otv' && (
                     <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-bold text-[#204060] mb-1">Araç Liste Fiyatı (TL):</label>
                              <input 
                                 type="number"
                                 value={carPrice}
                                 onChange={(e) => setCarPrice(Number(e.target.value))}
                                 className="w-full border border-[#d8dee4] p-2 text-sm focus:outline-none focus:border-[#18587a]"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-[#204060] mb-1">Motor Tipi:</label>
                              <select 
                                 value={engineType}
                                 onChange={(e) => setEngineType(e.target.value as any)}
                                 className="w-full border border-[#d8dee4] p-2 text-sm focus:outline-none focus:border-[#18587a]"
                              >
                                 <option value="standard">Benzin/Dizel (%80 ÖTV)</option>
                                 <option value="electric_10">Elektrikli (%10 ÖTV)</option>
                                 <option value="electric_40">Elektrikli (%40 ÖTV)</option>
                                 <option value="hybrid">Hibrit (%80 ÖTV)</option>
                              </select>
                           </div>
                        </div>

                        <div className={`p-4 border ${otvResult.isEligible ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} text-sm flex items-center gap-3`}>
                           {otvResult.isEligible ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
                           {otvResult.isEligible 
                              ? 'Bu araç 2026 ÖTV muafiyet limitleri içerisindedir.' 
                              : `HATA: Araç fiyatı 2026 üst sınırı olan ${otvLimit2026.toLocaleString('tr-TR')} TL'yi aşmaktadır.`}
                        </div>

                        {otvResult.isEligible && (
                           <div className="bg-white border border-[#d8dee4] rounded overflow-hidden">
                              <table className="w-full text-sm">
                                 <tbody>
                                    <tr className="border-b border-[#d8dee4]">
                                       <td className="p-3 font-bold text-[#204060] bg-[#f8fafc] w-1/2">Ham Fiyat:</td>
                                       <td className="p-3 text-right">{otvResult.taxFreePrice.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                    <tr className="border-b border-[#d8dee4]">
                                       <td className="p-3 font-bold text-[#204060] bg-[#f8fafc]">ÖTV Tutarı (%{otvResult.otvRatePercent}):</td>
                                       <td className="p-3 text-right text-red-600">-{otvResult.otvAmount.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                    <tr className="border-b border-[#d8dee4]">
                                       <td className="p-3 font-bold text-[#204060] bg-[#f8fafc]">KDV Tutarı (%20):</td>
                                       <td className="p-3 text-right">+{otvResult.kdvAmount.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                    <tr className="bg-[#eceff3]">
                                       <td className="p-4 font-bold text-[#18587a] text-lg uppercase">Ödenecek Tutar:</td>
                                       <td className="p-4 text-right font-black text-[#18587a] text-2xl">{otvResult.exemptPrice.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        )}
                        
                        <div className="p-4 bg-yellow-50 border border-yellow-200 text-xs text-yellow-800 leading-relaxed italic">
                           ÖTV muafiyetli alınan araçlar 5 yıl süreyle satılamaz. 5 yılın sonunda vergisiz satış imkanı doğar.
                        </div>
                     </div>
                  )}

                  {activeTab !== 'balthazard' && activeTab !== 'otv' && (
                     <div className="p-10 text-center text-slate-700 italic bg-[#f8fafc] border border-dashed border-[#d8dee4] rounded">
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
