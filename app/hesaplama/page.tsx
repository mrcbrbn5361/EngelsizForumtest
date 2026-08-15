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
      <div className="vibe-container py-10 space-y-10">
        
        {/* Header Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-md text-primary font-bold text-xs uppercase tracking-widest">
            <Calculator size={14} /> Resmi Mevzuat Hesaplama Araçları
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Engelli Hakları & Hesaplama Robotu
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed">
            Resmi mevzuata uygun Balthazard engel oranı, ÖTV muafiyetli araç üst sınırı ve engelli erken emeklilik şartlarınızı saniyeler içinde hesaplayın.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto" role="tablist" aria-label="Hesaplama Araçları">
          {[
            { id: 'balthazard', label: 'Balthazard Formülü', icon: Percent },
            { id: 'otv', label: 'ÖTV Muafiyetli Araç', icon: Car },
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
                className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-card text-muted-foreground hover:bg-muted border border-border/60'
                }`}
              >
                <Icon size={18} />
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-7 forum-card p-6 sm:p-8 space-y-6">
              <div className="space-y-2 border-b border-border pb-4">
                <h2 className="text-xl font-black text-foreground">Balthazard Formülü ile Engel Oranı</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Birden fazla engel durumunda oranlar doğrudan toplanmaz; Balthazard formülüne göre vücut fonksiyon kaybı kalan kapasite üzerinden düşülür.
                </p>
              </div>

              <div className="space-y-4">
                {rates.map((rate, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                    <span className="font-bold text-xs text-muted-foreground w-20">
                      {idx + 1}. Engel Oranı:
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        value={rate}
                        onChange={(e) => updateRate(idx, parseInt(e.target.value) || 0)}
                        className="vibe-input !h-10 !py-1 text-center font-bold text-foreground w-24"
                        aria-label={`${idx + 1}. engel oranı yüzdesi`}
                      />
                      <span className="font-bold text-foreground">%</span>
                    </div>
                    {rates.length > 1 && (
                      <button 
                        onClick={() => removeRate(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                        aria-label={`${idx + 1}. engel oranını sil`}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}

                <button 
                  onClick={addRateInput}
                  disabled={rates.length >= 8}
                  className="vibe-button-secondary w-full justify-center !py-2.5"
                >
                  <Plus size={16} /> Başka Engel Oranı Ekle
                </button>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-foreground">
                  <input 
                    type="checkbox"
                    checked={isOver60}
                    onChange={(e) => setIsOver60(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span>Kullanıcı 60 Yaş ve Üzerinde (Ek %10 Puan)</span>
                </label>
              </div>
            </div>

            {/* Balthazard Result Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="forum-card p-6 sm:p-8 bg-primary/5 border-primary/20 space-y-6 text-center">
                <div className="inline-flex p-3 bg-primary/10 rounded-full text-primary">
                  <Award size={32} />
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    HESAPLANAN BÜTÜNSEL ENGEL ORANI
                  </div>
                  <div className="text-5xl font-black text-primary">
                    %{balthazardResult}
                  </div>
                </div>

                <div className="p-4 bg-background border border-border rounded-lg text-left text-xs space-y-2">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <Info size={14} className="text-primary" /> Yasal Değerlendirme:
                  </div>
                  {balthazardResult >= 40 ? (
                    <p className="text-emerald-600 font-semibold">
                      ✓ %40 ve üzeri engel oranı ile Engelli Kimlik Kartı, Vergi İndirimi, Erken Emeklilik ve Toplu Taşıma muafiyetlerinden yararlanabilirsiniz.
                    </p>
                  ) : (
                    <p className="text-amber-600 font-semibold">
                      ⚠ %40 altında kalan oranlarda resmi engelli haklarının birçoğu kapsama girmemektedir.
                    </p>
                  )}
                  {balthazardResult >= 90 && (
                    <p className="text-blue-600 font-bold border-t border-border pt-2 mt-2">
                      ⭐ %90 ve üzeri oran ile koşulsuz ÖTV muafiyetli araç alım hakkı bulunmaktadır.
                    </p>
                  )}
                </div>
              </div>

              <div className="forum-card p-5 space-y-3 text-xs text-muted-foreground leading-relaxed">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <HelpCircle size={16} className="text-primary" /> Balthazard Nasıl Çalışır?
                </h3>
                <p>
                  Balthazard formülünde en yüksek engel oranı baz alınır. Kalan vücut fonksiyon oranı belirlenir ve ikinci engel oranı bu kalan miktar üzerinden hesaplanarak ilave edilir.
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-7 forum-card p-6 sm:p-8 space-y-6">
              <div className="space-y-2 border-b border-border pb-4">
                <h2 className="text-xl font-black text-foreground">ÖTV Muafiyetli Araç Hesaplama (2026 Mevzuatı)</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  %90 ve üzeri engelli raporu veya ortopedik engelli ehliyet kodları olan vatandaşlar için araç alım hesaplayıcısı.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="font-bold text-sm text-foreground">Aracın Anahtar Teslim Satış Fiyatı (TL):</span>
                  <input 
                    type="number"
                    value={carPrice}
                    onChange={(e) => setCarPrice(Number(e.target.value) || 0)}
                    className="vibe-input text-lg font-bold text-foreground"
                    step="10000"
                  />
                </label>

                <div className="p-4 bg-muted/60 rounded-lg border border-border text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold text-foreground">
                    <span>2026 Yılı Resmi ÖTV Üst Limiti:</span>
                    <span className="text-primary">{otvLimit2026.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <p className="text-muted-foreground">
                    Vergiler dahil satış fiyatı bu limitin üzerinde olan araçlar ÖTV muafiyeti kapsamında alınamaz.
                  </p>
                </div>
              </div>
            </div>

            {/* ÖTV Result Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className={`forum-card p-6 sm:p-8 space-y-6 border-2 ${
                otvResult.isEligible ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
              }`}>
                <div className="flex items-center gap-3">
                  {otvResult.isEligible ? (
                    <CheckCircle2 className="text-emerald-600 w-8 h-8" />
                  ) : (
                    <ShieldAlert className="text-rose-600 w-8 h-8" />
                  )}
                  <div>
                    <h3 className="font-black text-foreground text-lg">
                      {otvResult.isEligible ? 'ÖTV Muafiyetine Uygun' : 'Üst Limit Aşıldı'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {otvResult.isEligible ? 'Araç 2026 mevzuat limitleri içerisindedir.' : 'Araç fiyatı mevzuat üst sınırını geçmektedir.'}
                    </p>
                  </div>
                </div>

                {otvResult.isEligible && (
                  <div className="space-y-3 border-t border-border/80 pt-4 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Ham Fiyat (Vergisiz):</span>
                      <span className="font-mono font-bold text-foreground">{otvResult.taxFreePrice.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Muaf Tutulan ÖTV (%80):</span>
                      <span className="font-mono font-bold text-rose-600">-{otvResult.otvAmount.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Ödenecek KDV (%20):</span>
                      <span className="font-mono font-bold text-foreground">+{otvResult.kdvAmount.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between items-end">
                      <span className="font-black text-foreground">ÖDENECEK NET FİYAT:</span>
                      <span className="text-2xl font-black text-primary font-mono">{otvResult.exemptPrice.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-xs text-emerald-700 dark:text-emerald-400 font-bold text-center">
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-7 forum-card p-6 sm:p-8 space-y-6">
              <div className="space-y-2 border-b border-border pb-4">
                <h2 className="text-xl font-black text-foreground">Engelli Erken Emeklilik Hesaplama Robotu</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sigorta başlangıç yılınıza ve engel derecenize göre yaş şartı aranmaksızın emeklilik prim ve yıl durumunuz.
                </p>
              </div>

              <div className="space-y-5">
                <label className="block space-y-2">
                  <span className="font-bold text-sm text-foreground">İlk Sigorta / SGK Başlangıç Yılınız:</span>
                  <input 
                    type="number"
                    min="1980"
                    max="2026"
                    value={entryYear}
                    onChange={(e) => setEntryYear(Number(e.target.value) || 2010)}
                    className="vibe-input font-bold text-foreground"
                  />
                </label>

                <div className="space-y-2">
                  <span className="font-bold text-sm text-foreground">Engel Dereceniz / Rapor Oranı:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'heavy', label: '%60 ve Üzeri (1. Derece)' },
                      { id: 'medium', label: '%50 - %59 (2. Derece)' },
                      { id: 'light', label: '%40 - %49 (3. Derece)' },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setDisabilityLevel(lvl.id as any)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center ${
                          disabilityLevel === lvl.id 
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                            : 'bg-card text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block space-y-2">
                  <span className="font-bold text-sm text-foreground">Mevcut Ödenmiş Prim Gün Sayınız:</span>
                  <input 
                    type="number"
                    min="0"
                    max="10000"
                    value={currentDays}
                    onChange={(e) => setCurrentDays(Number(e.target.value) || 0)}
                    className="vibe-input font-bold text-foreground"
                  />
                </label>
              </div>
            </div>

            {/* Retirement Result Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="forum-card p-6 sm:p-8 space-y-6 bg-card border-primary/20">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">EMEKLİLİK ŞARTLARI ÖZETİ</div>
                  <div className="text-2xl font-black text-foreground">
                    {retirementResult.isEligible ? (
                      <span className="text-emerald-600 flex items-center gap-2">
                        <CheckCircle2 /> Emeklilik Şartlarını Sağlıyorsunuz!
                      </span>
                    ) : (
                      <span className="text-primary">
                        {retirementResult.daysRemaining} Gün Prim Eksik
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-4 text-sm">
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

                <div className="p-4 bg-muted rounded-lg border border-border text-xs text-muted-foreground leading-relaxed">
                  💡 Engelli emekliliğinde yaş şartı aranmaz. Vergi indirimi veya engelli raporu ile kurum sevki yeterlidir.
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </SiteLayout>
  );
}
