'use client';

import React, { useState } from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { 
  Calculator, Car, Award, ShieldAlert, CheckCircle2, 
  HelpCircle, ArrowRight, Plus, Trash2, RefreshCw, Info, Calendar, Percent
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

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
    // Standard vehicle pricing formula in Turkey (Roughly 80% OTV + 20% KDV)
    // List Price = Tax Free Price * 1.80 * 1.20 = Tax Free * 2.16
    const taxFreePrice = carPrice / 2.16;
    const otvAmount = taxFreePrice * 0.80;
    const kdvAmount = taxFreePrice * 0.20;
    const exemptPrice = taxFreePrice * 1.20; // Only KDV applied
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
    // Pension requirements based on Disability Level & Insurance Entry Year (Mevzuat)
    let reqYears = 18;
    let reqDays = 4000;

    if (disabilityLevel === 'heavy') { // 60%+
      if (entryYear < 2000) { reqYears = 15; reqDays = 3600; }
      else if (entryYear <= 2008) { reqYears = 16; reqDays = 3700; }
      else { reqYears = 15; reqDays = 3900; }
    } else if (disabilityLevel === 'medium') { // 50%-59%
      if (entryYear < 2000) { reqYears = 16; reqDays = 3760; }
      else if (entryYear <= 2008) { reqYears = 18; reqDays = 4000; }
      else { reqYears = 16; reqDays = 4300; }
    } else { // 40%-49%
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
    <SiteLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6">
        
        {/* Header Section */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 shadow-xs space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold uppercase tracking-wider">
            <Calculator size={13} /> Resmi Mevzuat Hesaplama Araçları
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Engelli Hakları & Hesaplama Robotu
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm font-normal leading-relaxed max-w-3xl">
            Resmi mevzuata uygun Balthazard engel oranı, 2026 ÖTV muafiyetli araç üst sınırı ve engelli erken emeklilik şartlarınızı anında hesaplayın.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-3 overflow-x-auto scrollbar-none" role="tablist" aria-label="Hesaplama Araçları">
          {[
            { id: 'balthazard', label: 'Balthazard Formülü', icon: Percent },
            { id: 'otv', label: 'ÖTV Muafiyetli Araç (2026)', icon: Car },
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-sky-500 text-white shadow-xs' 
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/80'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- TAB 1: BALTHAZARD CALCULATOR --- */}
        {activeTab === 'balthazard' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-card border border-border/80 rounded-2xl p-5 sm:p-7 space-y-5">
              <div className="space-y-1.5 border-b border-border/60 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-foreground">Balthazard Formülü ile Bütünsel Engel Oranı</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Birden fazla engel durumunda oranlar doğrudan toplanmaz; Balthazard formülüne göre vücut fonksiyon kaybı kalan kapasite üzerinden hesaplanır.
                </p>
              </div>

              <div className="space-y-3">
                {rates.map((rate, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/60">
                    <span className="font-semibold text-xs text-muted-foreground w-24">
                      {idx + 1}. Engel Oranı:
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        value={rate}
                        onChange={(e) => updateRate(idx, parseInt(e.target.value) || 0)}
                        className="h-9 w-20 rounded-xl border border-border/80 bg-background px-2 text-center font-bold text-foreground text-sm outline-none focus:border-sky-500"
                        aria-label={`${idx + 1}. engel oranı yüzdesi`}
                      />
                      <span className="font-bold text-foreground text-sm">%</span>
                    </div>
                    {rates.length > 1 && (
                      <button 
                        onClick={() => removeRate(idx)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        aria-label={`${idx + 1}. engel oranını sil`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                <button 
                  onClick={addRateInput}
                  disabled={rates.length >= 8}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-border/80 hover:border-sky-500/40 text-sky-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-sky-500/5 disabled:opacity-40"
                >
                  <Plus size={14} /> Başka Engel Oranı Ekle
                </button>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-foreground">
                  <input 
                    type="checkbox"
                    checked={isOver60}
                    onChange={(e) => setIsOver60(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>Kişi 60 Yaş ve Üzerinde (Ek %10 Balthazard Puanı)</span>
                </label>
              </div>
            </div>

            {/* Balthazard Result Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-card border border-sky-500/30 rounded-2xl p-6 sm:p-8 space-y-5 text-center shadow-xs">
                <div className="inline-flex p-3 bg-sky-500/10 rounded-2xl text-sky-400">
                  <Award size={28} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Hesaplanan Bütünsel Engel Oranı
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-sky-400 font-mono">
                    %{balthazardResult}
                  </div>
                </div>

                <div className="p-4 bg-background/80 border border-border/80 rounded-xl text-left text-xs space-y-2">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Info size={14} className="text-sky-400" /> Mevzuat Değerlendirmesi:
                  </div>
                  {balthazardResult >= 40 ? (
                    <p className="text-emerald-400 font-medium leading-relaxed">
                      ✓ %40 ve üzeri oran ile Engelli Kimlik Kartı, Vergi İndirimi, Erken Emeklilik ve Ücretsiz Toplu Taşıma haklarından yararlanabilirsiniz.
                    </p>
                  ) : (
                    <p className="text-amber-400 font-medium leading-relaxed">
                      ⚠ %40 altında kalan oranlarda resmi engelli mevzuatı haklarının büyük kısmı geçerli olmamaktadır.
                    </p>
                  )}
                  {balthazardResult >= 90 && (
                    <p className="text-sky-400 font-bold border-t border-border/60 pt-2 mt-2 leading-relaxed">
                      ★ %90 ve üzeri oran ile koşulsuz ÖTV muafiyetli araç alım hakkınız bulunmaktadır.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-2 text-xs text-muted-foreground leading-relaxed">
                <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-sky-400" /> Balthazard Nasıl Hesaplanır?
                </h3>
                <p>
                  En yüksek oran baz alınır; 100&apos;den çıkarılarak kalan sağlam vücut yüzdesi bulunur. Sonraki engel oranları bu kalan yüzde ile çarpılarak eklenir.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 2: ÖTV CALCULATOR --- */}
        {activeTab === 'otv' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-card border border-border/80 rounded-2xl p-5 sm:p-7 space-y-5">
              <div className="space-y-1.5 border-b border-border/60 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-foreground">ÖTV Muafiyetli Araç Alım Hesaplama (2026)</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  %90 ve üzeri engelli raporu veya ortopedik engelli ehliyet kodları olan vatandaşlar için resmi mevzuat hesaplayıcısı.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-foreground">Aracın Anahtar Teslim Satış Fiyatı (TL):</span>
                  <input 
                    type="number"
                    value={carPrice}
                    onChange={(e) => setCarPrice(Number(e.target.value) || 0)}
                    className="w-full h-11 rounded-xl border border-border/80 bg-background px-3.5 text-base font-bold text-foreground outline-none focus:border-sky-500"
                    step="10000"
                  />
                </label>

                <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 text-xs space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-foreground">
                    <span>2026 Yılı Resmi ÖTV Üst Limiti:</span>
                    <span className="text-sky-400 font-mono">{otvLimit2026.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Vergiler dahil satış fiyatı bu limitin üzerinde olan araçlar ÖTV muafiyeti kapsamında satın alınamaz.
                  </p>
                </div>
              </div>
            </div>

            {/* ÖTV Result Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`bg-card rounded-2xl p-5 sm:p-7 space-y-5 border ${
                otvResult.isEligible ? 'border-emerald-500/40 bg-emerald-500/[0.02]' : 'border-rose-500/40 bg-rose-500/[0.02]'
              }`}>
                <div className="flex items-center gap-3">
                  {otvResult.isEligible ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                      <ShieldAlert size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      {otvResult.isEligible ? 'ÖTV Muafiyetine Uygun' : 'Üst Limit Aşıldı'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {otvResult.isEligible ? 'Araç 2026 mevzuat limitleri içerisindedir.' : 'Araç fiyatı mevzuat üst sınırını geçmektedir.'}
                    </p>
                  </div>
                </div>

                {otvResult.isEligible && (
                  <div className="space-y-2.5 border-t border-border/60 pt-3 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Ham Fiyat (Vergisiz):</span>
                      <span className="font-mono font-bold text-foreground">{otvResult.taxFreePrice.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Muaf Tutulan ÖTV (%80):</span>
                      <span className="font-mono font-bold text-rose-400">-{otvResult.otvAmount.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Ödenecek KDV (%20):</span>
                      <span className="font-mono font-bold text-foreground">+{otvResult.kdvAmount.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="border-t border-border/60 pt-2.5 flex justify-between items-end">
                      <span className="font-extrabold text-foreground">ÖDENECEK NET FİYAT:</span>
                      <span className="text-xl font-black text-sky-400 font-mono">{otvResult.exemptPrice.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 font-bold text-center">
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
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-card border border-border/80 rounded-2xl p-5 sm:p-7 space-y-5">
              <div className="space-y-1.5 border-b border-border/60 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-foreground">Engelli Erken Emeklilik Hesaplama Robotu</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sigorta başlangıç yılınıza ve engel derecenize göre yaş şartı aranmaksızın emeklilik prim ve yıl şartları.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-foreground">İlk SGK / Sigorta Başlangıç Yılınız:</span>
                  <input 
                    type="number"
                    min="1980"
                    max="2026"
                    value={entryYear}
                    onChange={(e) => setEntryYear(Number(e.target.value) || 2010)}
                    className="w-full h-11 rounded-xl border border-border/80 bg-background px-3.5 font-bold text-foreground text-sm outline-none focus:border-sky-500"
                  />
                </label>

                <div className="space-y-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-foreground">Engel Dereceniz / Rapor Oranı:</span>
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
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer min-h-[40px] flex items-center justify-center ${
                          disabilityLevel === lvl.id 
                            ? 'bg-sky-500 text-white border-sky-500 shadow-xs' 
                            : 'bg-card text-muted-foreground border-border/80 hover:bg-muted/60 hover:text-foreground'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block space-y-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-foreground">Mevcut Ödenmiş Prim Gün Sayınız:</span>
                  <input 
                    type="number"
                    min="0"
                    max="10000"
                    value={currentDays}
                    onChange={(e) => setCurrentDays(Number(e.target.value) || 0)}
                    className="w-full h-11 rounded-xl border border-border/80 bg-background px-3.5 font-bold text-foreground text-sm outline-none focus:border-sky-500"
                  />
                </label>
              </div>
            </div>

            {/* Retirement Result Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-card border border-sky-500/30 rounded-2xl p-5 sm:p-7 space-y-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Emeklilik Şartları Özeti</div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {retirementResult.isEligible ? (
                      <span className="text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 size={20} /> Emeklilik Şartlarını Sağlıyorsunuz!
                      </span>
                    ) : (
                      <span className="text-sky-400">
                        {retirementResult.daysRemaining} Gün Prim Eksik
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gerekli Sigortalılık Süresi:</span>
                    <span className="font-bold text-foreground">{retirementResult.reqYears} Yıl</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tamamlanan Süre:</span>
                    <span className="font-bold text-foreground">{retirementResult.completedYears} Yıl</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gerekli Prim Gün Sayısı:</span>
                    <span className="font-bold text-foreground">{retirementResult.reqDays} Gün</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mevcut Prim Gününüz:</span>
                    <span className="font-bold text-foreground">{currentDays} Gün</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/20 rounded-xl border border-border/60 text-xs text-muted-foreground leading-relaxed">
                  💡 Engelli erken emekliliğinde yaş şartı aranmaz. Vergi indirimi veya engelli raporu ile SGK sevki yeterlidir.
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </SiteLayout>
  );
}
