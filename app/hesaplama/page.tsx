'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { 
  Calculator, Car, Award, ShieldAlert, CheckCircle2, 
  HelpCircle, Plus, Trash2, Info, Calendar, Percent
} from 'lucide-react';
import { motion } from 'motion/react';

export default function DisabilityCalculatorsPage() {
  const [activeTab, setActiveTab] = useState<'balthazard' | 'otv' | 'emeklilik'>('balthazard');

  // --- 1. BALTHAZARD STATE & LOGIC ---
  const [rates, setRates] = useState<number[]>([40, 20]);
  const [isOver60, setIsOver60] = useState<boolean>(false);

  const addRateInput = () => {
    if (rates.length < 8) {
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

  const calculateBalthazard = () => {
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
  };

  const balthazardResult = calculateBalthazard();

  // --- 2. ÖTV STATE & LOGIC ---
  const [carPrice, setCarPrice] = useState<number>(1800000);
  const otvLimit2026 = 2247100; // 2026 ÖTV Exemption Upper Limit in TL

  const calculateOtv = () => {
    // List Price = Tax Free Price * 1.80 * 1.20 = Tax Free * 2.16
    const taxFreePrice = carPrice / 2.16;
    const otvAmount = taxFreePrice * 0.80;
    const kdvAmount = taxFreePrice * 0.20;
    const exemptPrice = taxFreePrice * 1.20;
    const savings = carPrice - exemptPrice;
    const isEligible = carPrice <= otvLimit2026;

    return {
      taxFreePrice: Math.round(taxFreePrice),
      otvAmount: Math.round(otvAmount),
      kdvAmount: Math.round(kdvAmount),
      exemptPrice: Math.round(exemptPrice),
      savings: Math.round(savings),
      isEligible
    };
  };

  const otvResult = calculateOtv();

  // --- 3. EMEKLİLİK STATE & LOGIC ---
  const [entryYear, setEntryYear] = useState<number>(2010);
  const [disabilityLevel, setDisabilityLevel] = useState<'heavy' | 'medium' | 'light'>('medium');
  const [currentDays, setCurrentDays] = useState<number>(3200);

  const calculateRetirement = () => {
    let reqYears = 18;
    let reqDays = 4000;

    if (disabilityLevel === 'heavy') {
      if (entryYear < 2000) { reqYears = 15; reqDays = 3600; }
      else if (entryYear <= 2008) { reqYears = 16; reqDays = 3700; }
      else { reqYears = 15; reqDays = 3900; }
    } else if (disabilityLevel === 'medium') {
      if (entryYear < 2000) { reqYears = 16; reqDays = 3760; }
      else if (entryYear <= 2008) { reqYears = 18; reqDays = 4000; }
      else { reqYears = 16; reqDays = 4300; }
    } else {
      if (entryYear < 2000) { reqYears = 17; reqDays = 3920; }
      else if (entryYear <= 2008) { reqYears = 20; reqDays = 4400; }
      else { reqYears = 18; reqDays = 4600; }
    }

    const currentYear = new Date().getFullYear();
    const completedYears = Math.max(0, currentYear - entryYear);
    const yearsRemaining = Math.max(0, reqYears - completedYears);
    const daysRemaining = Math.max(0, reqDays - currentDays);
    const isEligible = completedYears >= reqYears && currentDays >= reqDays;

    return { reqYears, reqDays, completedYears, yearsRemaining, daysRemaining, isEligible };
  };

  const retirementResult = calculateRetirement();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-5xl space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
            <Calculator size={13} /> Resmi Mevzuat Hesaplama Modülleri
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Engelli Hakları ve Hesaplama Robotu
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Resmi mevzuata uygun Balthazard engel oranı, 2026 ÖTV muafiyetli araç üst sınırı ve engelli erken emeklilik şartlarınızı anında hesaplayın.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto" role="tablist" aria-label="Hesaplama Araçları">
          {[
            { id: 'balthazard', label: 'Balthazard Formülü', icon: Percent },
            { id: 'otv', label: '2026 ÖTV Muafiyetli Araç', icon: Car },
            { id: 'emeklilik', label: 'Erken Emeklilik Robotu', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                role="tab"
                aria-selected={isActive}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all whitespace-nowrap cursor-pointer border ${
                  isActive 
                    ? 'bg-sky-600 text-white border-sky-500 shadow-sm' 
                    : 'bg-[#111726]/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-white/[0.06]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- TAB 1: BALTHAZARD CALCULATOR --- */}
        {activeTab === 'balthazard' && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
              <div className="space-y-1 border-b border-white/[0.06] pb-3">
                <h2 className="text-base font-bold text-slate-100">Balthazard Formülü ile Bütünsel Oran</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Birden fazla engel durumunda oranlar doğrudan toplanmaz; vücut fonksiyon kaybı kalan kapasite üzerinden hesaplanır.
                </p>
              </div>

              <div className="space-y-2.5">
                {rates.map((rate, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-white/[0.06]">
                    <span className="font-semibold text-xs text-slate-300 w-28">
                      {idx + 1}. Engel Oranı:
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        value={rate}
                        onChange={(e) => updateRate(idx, parseInt(e.target.value) || 0)}
                        className="p-1.5 rounded-lg border border-white/[0.08] bg-slate-950 text-center font-bold text-slate-100 w-20 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                        aria-label={`${idx + 1}. engel oranı yüzdesi`}
                      />
                      <span className="font-bold text-slate-300 text-xs">%</span>
                    </div>
                    {rates.length > 1 && (
                      <button 
                        onClick={() => removeRate(idx)}
                        className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        aria-label={`${idx + 1}. engel oranını sil`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}

                <button 
                  onClick={addRateInput}
                  disabled={rates.length >= 8}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-white/[0.12] hover:border-sky-500/40 text-sky-400 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-sky-500/5 disabled:opacity-40"
                >
                  <Plus size={14} /> Başka Engel Oranı Ekle
                </button>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                  <input 
                    type="checkbox"
                    checked={isOver60}
                    onChange={(e) => setIsOver60(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                  <span>Kişi 60 Yaş ve Üzerinde (Ek %10 Balthazard Puanı)</span>
                </label>
              </div>
            </div>

            {/* Balthazard Result Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#111726]/80 border border-sky-500/30 rounded-2xl p-6 space-y-4 text-center backdrop-blur-md">
                <div className="inline-flex p-3 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20">
                  <Award size={24} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">
                    Hesaplanan Bütünsel Engel Oranı
                  </div>
                  <div className="text-4xl font-bold text-sky-400 font-mono">
                    %{balthazardResult}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 border border-white/[0.06] rounded-xl text-left text-xs space-y-1.5">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Info size={13} className="text-sky-400" /> Mevzuat Değerlendirmesi:
                  </div>
                  {balthazardResult >= 40 ? (
                    <p className="text-emerald-400 font-normal leading-relaxed text-[11px]">
                      ✓ %40 ve üzeri oran ile Engelli Kimlik Kartı, Vergi İndirimi, Erken Emeklilik ve Ücretsiz Toplu Taşıma haklarından yararlanabilirsiniz.
                    </p>
                  ) : (
                    <p className="text-amber-400 font-normal leading-relaxed text-[11px]">
                      ⚠ %40 altında kalan oranlarda resmi engelli mevzuatı haklarının büyük kısmı geçerli olmamaktadır.
                    </p>
                  )}
                  {balthazardResult >= 90 && (
                    <p className="text-sky-400 font-semibold border-t border-white/[0.06] pt-1.5 mt-1.5 leading-relaxed text-[11px]">
                      ★ %90 ve üzeri oran ile koşulsuz ÖTV muafiyetli araç alım hakkınız bulunmaktadır.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-[#111726]/60 border border-white/[0.06] rounded-2xl p-4 space-y-1.5 text-xs text-slate-400 leading-relaxed">
                <h3 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-sky-400" /> Balthazard Nasıl Hesaplanır?
                </h3>
                <p className="text-[11px]">
                  En yüksek oran baz alınır; 100&apos;den çıkarılarak kalan sağlam vücut yüzdesi bulunur. Sonraki engel oranları bu kalan yüzde ile çarpılarak eklenir.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 2: ÖTV CALCULATOR --- */}
        {activeTab === 'otv' && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
              <div className="space-y-1 border-b border-white/[0.06] pb-3">
                <h2 className="text-base font-bold text-slate-100">ÖTV Muafiyetli Araç Alım Hesaplama (2026)</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  %90 ve üzeri engelli raporu veya ortopedik engelli ehliyet kodları olan vatandaşlar için resmi mevzuat hesaplayıcısı.
                </p>
              </div>

              <div className="space-y-3.5">
                <label className="block space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Aracın Anahtar Teslim Satış Fiyatı (TL):</span>
                  <input 
                    type="number"
                    value={carPrice}
                    onChange={(e) => setCarPrice(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                    step="10000"
                  />
                </label>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/[0.06] text-xs space-y-1">
                  <div className="flex justify-between items-center font-semibold text-slate-200">
                    <span>2026 Yılı Resmi ÖTV Üst Limiti:</span>
                    <span className="text-sky-400 font-mono">{otvLimit2026.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Vergiler dahil satış fiyatı bu limitin üzerinde olan araçlar ÖTV muafiyeti kapsamında satın alınamaz.
                  </p>
                </div>
              </div>
            </div>

            {/* ÖTV Result Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`bg-[#111726]/80 rounded-2xl p-6 space-y-4 border backdrop-blur-md ${
                otvResult.isEligible ? 'border-emerald-500/30' : 'border-rose-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  {otvResult.isEligible ? (
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                      <CheckCircle2 size={20} />
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 border border-rose-500/20">
                      <ShieldAlert size={20} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">
                      {otvResult.isEligible ? 'ÖTV Muafiyetine Uygun' : 'Üst Limit Aşıldı'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {otvResult.isEligible ? 'Araç 2026 mevzuat limitleri içerisindedir.' : 'Araç fiyatı mevzuat üst sınırını geçmektedir.'}
                    </p>
                  </div>
                </div>

                {otvResult.isEligible && (
                  <div className="space-y-2 border-t border-white/[0.06] pt-3 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Ham Fiyat (Vergisiz):</span>
                      <span className="font-mono font-semibold text-slate-200">{otvResult.taxFreePrice.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Muaf Tutulan ÖTV (%80):</span>
                      <span className="font-mono font-semibold text-rose-400">-{otvResult.otvAmount.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Ödenecek KDV (%20):</span>
                      <span className="font-mono font-semibold text-slate-200">+{otvResult.kdvAmount.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="border-t border-white/[0.06] pt-2 flex justify-between items-end">
                      <span className="font-bold text-slate-200">ÖDENECEK NET FİYAT:</span>
                      <span className="text-lg font-bold text-sky-400 font-mono">{otvResult.exemptPrice.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 font-semibold text-center mt-2">
                      Toplam Vergi Kazancınız: {otvResult.savings.toLocaleString('tr-TR')} TL
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 3: RETIREMENT ROBOT --- */}
        {activeTab === 'emeklilik' && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
              <div className="space-y-1 border-b border-white/[0.06] pb-3">
                <h2 className="text-base font-bold text-slate-100">Engelli Erken Emeklilik Hesaplama Robotu</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sigorta başlangıç yılınıza ve engel derecenize göre yaş şartı aranmaksızın emeklilik prim ve yıl şartları.
                </p>
              </div>

              <div className="space-y-3.5">
                <label className="block space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">İlk SGK / Sigorta Başlangıç Yılınız:</span>
                  <input 
                    type="number"
                    min="1980"
                    max="2026"
                    value={entryYear}
                    onChange={(e) => setEntryYear(Number(e.target.value) || 2010)}
                    className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </label>

                <div className="space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Engel Dereceniz / Rapor Oranı:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'heavy', label: '%60+ (1. Derece)' },
                      { id: 'medium', label: '%50 - %59 (2. Derece)' },
                      { id: 'light', label: '%40 - %49 (3. Derece)' },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setDisabilityLevel(lvl.id as any)}
                        className={`p-2 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                          disabilityLevel === lvl.id 
                            ? 'bg-sky-600 text-white border-sky-500 shadow-sm' 
                            : 'bg-slate-900/80 text-slate-400 border-white/[0.06] hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Mevcut Ödenmiş Prim Gün Sayınız:</span>
                  <input 
                    type="number"
                    min="0"
                    max="10000"
                    value={currentDays}
                    onChange={(e) => setCurrentDays(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </label>
              </div>
            </div>

            {/* Retirement Result Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#111726]/80 border border-sky-500/30 rounded-2xl p-6 space-y-4 backdrop-blur-md">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400">Emeklilik Şartları Özeti</div>
                  <div className="text-base font-bold text-slate-100">
                    {retirementResult.isEligible ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 size={18} /> Emeklilik Şartlarını Sağlıyorsunuz!
                      </span>
                    ) : (
                      <span className="text-sky-400">
                        {retirementResult.daysRemaining} Gün Prim Eksik
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/[0.06] pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gerekli Sigortalılık Süresi:</span>
                    <span className="font-semibold text-slate-200">{retirementResult.reqYears} Yıl</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tamamlanan Süre:</span>
                    <span className="font-semibold text-slate-200">{retirementResult.completedYears} Yıl</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gerekli Prim Gün Sayısı:</span>
                    <span className="font-semibold text-slate-200">{retirementResult.reqDays} Gün</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mevcut Prim Gününüz:</span>
                    <span className="font-semibold text-slate-200">{currentDays} Gün</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/[0.06] text-[11px] text-slate-400 leading-relaxed">
                  💡 Engelli erken emekliliğinde yaş şartı aranmaz. Vergi indirimi veya engelli sağlık kurulu raporu ile SGK sevki yeterlidir.
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </main>
      <Footer />
    </div>
  );
}
