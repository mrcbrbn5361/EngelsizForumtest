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
      <div className="bg-[#111726]/60 -mx-4 px-4 py-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-400 border-b border-white/[0.08] mb-4">
        <Link href="/" className="hover:text-sky-400 flex items-center gap-1 transition-colors">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <span className="font-semibold text-slate-200">Hesaplama Araçları</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
         {/* Sidebar Tabs */}
         <div className="w-full lg:w-64 shrink-0">
            <div className="xf-block border border-white/[0.08] rounded-sm overflow-hidden bg-[#111726]/40">
               <div className="xf-block-header bg-[#111726] border-b border-white/[0.08] text-slate-200 font-extrabold uppercase text-[12px] tracking-wider py-2.5 px-3">ARAÇLAR</div>
               <div className="bg-[#111726]/40 flex flex-col">
                  {tabsConfig.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`px-4 py-3.5 text-xs text-left border-b border-white/[0.04] last:border-0 transition-colors flex items-center gap-2.5 font-bold uppercase tracking-wider ${
                           activeTab === tab.id 
                           ? 'bg-sky-500/10 text-sky-400 border-l-4 border-l-sky-400' 
                           : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                        }`}
                     >
                        <tab.icon size={15} className={activeTab === tab.id ? 'text-sky-400' : 'text-slate-400'} />
                        {tab.label}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="flex-1 min-w-0">
            <div className="xf-block border border-white/[0.08] rounded-sm overflow-hidden bg-[#111726]/40">
               <div className="xf-block-header bg-[#111726] border-b border-white/[0.08] text-slate-200 font-extrabold uppercase text-[12px] tracking-wider py-2.5 px-3">
                  {tabsConfig.find(t => t.id === activeTab)?.label}
               </div>
               
               <div className="p-6 text-slate-200 bg-[#111726]/20">
                  {activeTab === 'balthazard' && (
                     <div className="space-y-6">
                        <div className="bg-blue-950/20 border-l-4 border-blue-400 p-4 text-xs font-semibold text-blue-300 rounded-r-md border border-white/[0.04] shadow-xs">
                           Birden fazla engel durumunda oranlar doğrudan toplanmaz; Balthazard formülü ile vücut fonksiyon kaybı hesaplanır.
                        </div>

                        <div className="space-y-3">
                           {rates.map((rate, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                 <label className="text-xs font-bold uppercase tracking-wider text-slate-400 w-32 shrink-0">{idx + 1}. Oran (%):</label>
                                 <input 
                                    type="number" 
                                    value={rate}
                                    onChange={(e) => updateRate(idx, Math.min(100, Math.max(0, Number(e.target.value))))}
                                    className="bg-slate-900 border border-white/[0.08] px-3 py-2 text-sm w-24 rounded-sm focus:outline-none focus:border-sky-500 text-slate-100 font-bold"
                                 />
                                 {rates.length > 1 && (
                                    <button onClick={() => removeRate(idx)} className="text-red-400 hover:bg-red-500/15 p-1.5 rounded transition-colors" title="Oranı sil">
                                       <Trash2 size={16} />
                                    </button>
                                 )}
                              </div>
                           ))}
                           <button 
                              onClick={addRateInput}
                              className="text-xs font-bold uppercase tracking-wider text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 transition-colors mt-2"
                           >
                              <Plus size={15} /> Yeni Oran Ekle
                           </button>
                        </div>

                        <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2">
                           <input 
                              type="checkbox" 
                              id="over60" 
                              checked={isOver60} 
                              onChange={(e) => setIsOver60(e.target.checked)}
                              className="rounded bg-slate-950 border-white/[0.08] text-sky-500 focus:ring-sky-500"
                           />
                           <label htmlFor="over60" className="text-xs text-slate-400 italic cursor-pointer select-none">Kişi 60 yaşın üzerindedir (Balthazard formülüne +%10 eklenir)</label>
                        </div>

                        <div className="mt-8 p-6 bg-[#111726]/40 border border-white/[0.08] rounded-sm text-center">
                           <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">HESAPLANAN TOPLAM ENGEL ORANI</h4>
                           <div className="text-5xl font-black text-sky-400">%{balthazardResult}</div>
                           <p className="mt-4 text-[11px] text-slate-500 leading-relaxed max-w-md mx-auto">
                              Bu hesaplama Balthazard formülü esas alınarak yapılmış olup, bilgilendirme amaçlıdır. Nihai karar sağlık kurulları heyeti tarafından verilir.
                           </p>
                        </div>
                     </div>
                  )}

                  {activeTab === 'otv' && (
                     <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Araç Liste Fiyatı (TL):</label>
                              <input 
                                 type="number"
                                 value={carPrice}
                                 onChange={(e) => setCarPrice(Number(e.target.value))}
                                 className="w-full bg-slate-900 border border-white/[0.08] p-2.5 text-sm rounded-sm focus:outline-none focus:border-sky-500 text-slate-100 font-bold"
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Motor Tipi:</label>
                              <select 
                                 value={engineType}
                                 onChange={(e) => setEngineType(e.target.value as any)}
                                 className="w-full bg-slate-900 border border-white/[0.08] p-2.5 text-sm rounded-sm focus:outline-none focus:border-sky-500 text-slate-100 font-bold"
                              >
                                 <option value="standard" className="bg-slate-950">Benzin/Dizel (%80 ÖTV)</option>
                                 <option value="electric_10" className="bg-slate-950">Elektrikli (%10 ÖTV)</option>
                                 <option value="electric_40" className="bg-slate-950">Elektrikli (%40 ÖTV)</option>
                                 <option value="hybrid" className="bg-slate-950">Hibrit (%80 ÖTV)</option>
                              </select>
                           </div>
                        </div>

                        <div className={`p-4 border rounded-sm text-xs font-semibold flex items-center gap-3 ${otvResult.isEligible ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-red-950/20 border-red-500/30 text-red-300'}`}>
                           {otvResult.isEligible ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                           {otvResult.isEligible 
                              ? 'Bu araç 2026 ÖTV muafiyet limitleri içerisindedir.' 
                              : `HATA: Araç fiyatı 2026 üst sınırı olan ${otvLimit2026.toLocaleString('tr-TR')} TL'yi aşmaktadır.`}
                        </div>

                        {otvResult.isEligible && (
                           <div className="bg-[#111726]/40 border border-white/[0.08] rounded-sm overflow-hidden">
                              <table className="w-full text-xs">
                                 <tbody>
                                    <tr className="border-b border-white/[0.04]">
                                       <td className="p-3.5 font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02] w-1/2">Ham Fiyat:</td>
                                       <td className="p-3.5 text-right text-slate-200 font-semibold">{otvResult.taxFreePrice.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                    <tr className="border-b border-white/[0.04]">
                                       <td className="p-3.5 font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02]">ÖTV Tutarı (%{otvResult.otvRatePercent}):</td>
                                       <td className="p-3.5 text-right text-rose-400 font-bold">-{otvResult.otvAmount.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                    <tr className="border-b border-white/[0.04]">
                                       <td className="p-3.5 font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02]">KDV Tutarı (%20):</td>
                                       <td className="p-3.5 text-right text-slate-200 font-semibold">+{otvResult.kdvAmount.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                    <tr className="bg-sky-500/10">
                                       <td className="p-4.5 font-extrabold text-sky-400 uppercase text-sm tracking-wider">Ödenecek Tutar:</td>
                                       <td className="p-4.5 text-right font-black text-sky-400 text-xl">{otvResult.exemptPrice.toLocaleString('tr-TR')} TL</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        )}
                        
                        <div className="p-4 bg-yellow-950/20 border border-yellow-500/20 text-[11px] text-yellow-300 rounded-sm leading-relaxed italic">
                           ÖTV muafiyetiyle edinilen araçlar 5 yıl süreyle satılamaz veya devredilemez. 5 yılın sonunda ek vergi ödemeden satış imkanı doğar.
                        </div>
                     </div>
                  )}

                  {activeTab !== 'balthazard' && activeTab !== 'otv' && (
                     <div className="p-10 text-center text-slate-400 italic bg-[#111726]/10 border border-dashed border-white/[0.08] rounded-sm text-xs">
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
