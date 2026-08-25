'use client';

import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { 
  Calculator, Car, Award, ShieldAlert, CheckCircle2, 
  HelpCircle, Plus, Trash2, Info, Calendar, Percent,
  Coins, Home, Users, Briefcase, FileText, ArrowRight,
  TrendingUp, Sparkles, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const otvLimit2026 = 2247100; // 2026 Resmi ÖTV Üst Sınırı

  const otvResult = useMemo(() => {
    let otvRate = 0.80; // Standart benzin/dizel %80
    if (engineType === 'electric_10') otvRate = 0.10;
    else if (engineType === 'electric_40') otvRate = 0.40;
    else if (engineType === 'hybrid') otvRate = 0.80;

    const kdvRate = 0.20;
    // Satış Fiyatı = Ham Fiyat * (1 + OTV) * (1 + KDV)
    const multiplier = (1 + otvRate) * (1 + kdvRate);
    const taxFreePrice = carPrice / multiplier;
    const otvAmount = taxFreePrice * otvRate;
    const kdvAmount = taxFreePrice * kdvRate;
    const exemptPrice = taxFreePrice * (1 + kdvRate); // Engelli vatandaşın ödeyeceği (Ham + KDV)
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

  // =========================================================================
  // 3. ENGELLİ GELİR VERGİSİ İNDİRİMİ HESAPLAMA
  // =========================================================================
  const [taxDegree, setTaxDegree] = useState<1 | 2 | 3>(1);
  const [grossSalary, setGrossSalary] = useState<number>(55000);
  const [taxBracket, setTaxBracket] = useState<number>(15); // %15, %20, %27

  const taxDiscountResult = useMemo(() => {
    // 2026 Gelir Vergisi Matrah İndirim Tutarları
    let deduction = 6900; // 1. Derece (%80+)
    if (taxDegree === 2) deduction = 4000; // 2. Derece (%60-%79)
    if (taxDegree === 3) deduction = 1700; // 3. Derece (%40-%59)

    const monthlyBenefit = Math.round((deduction * taxBracket) / 100);
    const annualBenefit = monthlyBenefit * 12;

    return {
      deduction,
      monthlyBenefit,
      annualBenefit,
    };
  }, [taxDegree, taxBracket]);

  // =========================================================================
  // 4. EVDE BAKIM MAAŞI GELİR KRİTERİ & UYGUNLUK TESTİ
  // =========================================================================
  const [householdMembers, setHouseholdMembers] = useState<number>(4);
  const [totalHouseholdIncome, setTotalHouseholdIncome] = useState<number>(36000);
  const [isFullyDependent, setIsFullyDependent] = useState<boolean>(true);

  const homeCareResult = useMemo(() => {
    // 2026 Kişi başı gelir sınırı (Net asgari ücretin 2/3'ü referansı)
    const perCapitaLimit2026 = 15300;
    const monthlyAllowance2026 = 10125; // 2026 tahmini evde bakım aylığı

    const members = Math.max(1, householdMembers);
    const perCapitaIncome = Math.round(totalHouseholdIncome / members);
    const isIncomeEligible = perCapitaIncome <= perCapitaLimit2026;
    const isEligible = isIncomeEligible && isFullyDependent;

    return {
      perCapitaIncome,
      perCapitaLimit: perCapitaLimit2026,
      difference: perCapitaLimit2026 - perCapitaIncome,
      isIncomeEligible,
      isEligible,
      monthlyAllowance: monthlyAllowance2026
    };
  }, [householdMembers, totalHouseholdIncome, isFullyDependent]);

  // =========================================================================
  // 5. 2022 ENGELLİ AYLIĞI & 65 YAŞ MAAŞI HESAPLAMA
  // =========================================================================
  const [disabilityRateTier, setDisabilityRateTier] = useState<'tier_40_69' | 'tier_70_plus' | 'elderly_65'>('tier_40_69');
  const [allowanceHouseholdMembers, setAllowanceHouseholdMembers] = useState<number>(3);
  const [allowanceHouseholdIncome, setAllowanceHouseholdIncome] = useState<number>(18000);

  const disabilityAllowanceResult = useMemo(() => {
    // 2026 Kişi Başı Sınırı (Net asgari ücretin 1/3'ü referansı)
    const perCapitaLimit = 7650;
    const members = Math.max(1, allowanceHouseholdMembers);
    const perCapitaIncome = Math.round(allowanceHouseholdIncome / members);
    const isIncomeEligible = perCapitaIncome <= perCapitaLimit;

    let monthlyAmount = 3750; // %40 - %69 engelli aylığı
    let tierName = '%40 - %69 Engelli Aylığı';

    if (disabilityRateTier === 'tier_70_plus') {
      monthlyAmount = 5625;
      tierName = '%70 ve Üzeri (Ağır Engelli) Aylığı';
    } else if (disabilityRateTier === 'elderly_65') {
      monthlyAmount = 3500;
      tierName = '65 Yaş Yaşlılık Aylığı';
    }

    return {
      perCapitaIncome,
      perCapitaLimit,
      isIncomeEligible,
      monthlyAmount,
      tierName,
      difference: perCapitaLimit - perCapitaIncome
    };
  }, [disabilityRateTier, allowanceHouseholdMembers, allowanceHouseholdIncome]);

  // =========================================================================
  // 6. KIDEM VE İHBAR TAZMİNATI HESAPLAMA
  // =========================================================================
  const [severanceSalary, setSeveranceSalary] = useState<number>(45000);
  const [workedYears, setWorkedYears] = useState<number>(4);
  const [workedMonths, setWorkedMonths] = useState<number>(6);

  const severanceResult = useMemo(() => {
    const severanceCeiling2026 = 46500; // 2026 Kıdem Tazminatı Tavanı
    const baseSalary = Math.min(severanceSalary, severanceCeiling2026);
    const totalWorkingDurationYears = workedYears + (workedMonths / 12);

    const grossSeverance = Math.round(baseSalary * totalWorkingDurationYears);
    const stampTaxSeverance = Math.round(grossSeverance * 0.00759); // Binde 7.59 damga vergisi
    const netSeverance = grossSeverance - stampTaxSeverance;

    // İhbar Tazminatı (Süreye göre 2, 4, 6, 8 hafta)
    let noticeWeeks = 2;
    if (totalWorkingDurationYears >= 0.5 && totalWorkingDurationYears < 1.5) noticeWeeks = 4;
    else if (totalWorkingDurationYears >= 1.5 && totalWorkingDurationYears < 3) noticeWeeks = 6;
    else if (totalWorkingDurationYears >= 3) noticeWeeks = 8;

    const grossNotice = Math.round((severanceSalary / 30) * (noticeWeeks * 7));
    const incomeTaxNotice = Math.round(grossNotice * 0.15);
    const stampTaxNotice = Math.round(grossNotice * 0.00759);
    const netNotice = grossNotice - incomeTaxNotice - stampTaxNotice;

    return {
      baseSalary,
      isCeilingApplied: severanceSalary > severanceCeiling2026,
      severanceCeiling: severanceCeiling2026,
      grossSeverance,
      stampTaxSeverance,
      netSeverance,
      noticeWeeks,
      grossNotice,
      netNotice,
      totalNetBenefit: netSeverance + netNotice
    };
  }, [severanceSalary, workedYears, workedMonths]);

  // =========================================================================
  // 7. ENGELLİ ERKEN EMEKLİLİK HESAPLAMA
  // =========================================================================
  const [entryYear, setEntryYear] = useState<number>(2010);
  const [disabilityLevel, setDisabilityLevel] = useState<'heavy' | 'medium' | 'light'>('medium');
  const [currentDays, setCurrentDays] = useState<number>(3400);

  const retirementResult = useMemo(() => {
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
  }, [entryYear, disabilityLevel, currentDays]);

  const tabsConfig = [
    { id: 'balthazard', label: 'Balthazard Formülü', icon: Percent },
    { id: 'otv', label: '2026 ÖTV Muafiyetli Araç', icon: Car },
    { id: 'vergi', label: 'Gelir Vergisi İndirimi', icon: Coins },
    { id: 'evde_bakim', label: 'Evde Bakım Maaşı', icon: Home },
    { id: 'engelli_maasi', label: '2022 Engelli Aylığı', icon: Users },
    { id: 'kidem', label: 'Kıdem & İhbar Tazminatı', icon: Briefcase },
    { id: 'emeklilik', label: 'Erken Emeklilik Robotu', icon: Calendar },
  ];

  return (
    <div id="calculators-page-container" className="min-h-screen flex flex-col bg-[#090A0F] text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
            <Calculator size={14} /> 2026 Resmi Mevzuat & Engelli Hakları Hesaplama Merkezi
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
            Engelli Hakları, Vergi & Ödenek Hesaplama Robotu
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Türkiye Cumhuriyeti güncel Resmi Gazete mevzuatına uygun Balthazard formülü, 2026 ÖTV araç üst limiti, gelir vergisi indirimi, evde bakım gelir kriteri, 2022 engelli aylığı ve erken emeklilik şartlarınızı kurumsal doğrulukla hesaplayın.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-white/[0.08] pb-3 overflow-x-auto no-scrollbar" role="tablist" aria-label="Hesaplama Modülleri">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as TabType)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap cursor-pointer border ${
                  isActive 
                    ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/20' 
                    : 'bg-[#111726]/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-white/[0.06]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: BALTHAZARD FORMÜLÜ */}
        {/* ========================================================================= */}
        {activeTab === 'balthazard' && (
          <motion.div 
            key="balthazard"
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            id="panel-balthazard"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
              <div className="space-y-1 border-b border-white/[0.06] pb-3">
                <h2 className="text-base font-bold text-slate-100">Balthazard Formülü ile Bütünsel Engel Oranı</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Birden fazla engel durumunda oranlar doğrudan toplanmaz; vücut fonksiyon kaybı kalan kapasite üzerinden katlanarak hesaplanır.
                </p>
              </div>

              <div className="space-y-2.5">
                {rates.map((rate, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-900/70 rounded-xl border border-white/[0.06]">
                    <span className="font-semibold text-xs text-slate-300 w-32">
                      {idx + 1}. Engel Oranı:
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        value={rate === 0 ? '' : rate}
                        onChange={(e) => updateRate(idx, e.target.value === '' ? 0 : Number(e.target.value))}
                        className="p-1.5 rounded-lg border border-white/[0.08] bg-slate-950 text-center font-bold text-slate-100 w-20 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                        aria-label={`${idx + 1}. engel oranı yüzdesi`}
                      />
                      <span className="font-bold text-slate-300 text-xs">%</span>
                    </div>
                    {rates.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeRate(idx)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        aria-label={`${idx + 1}. engel oranını sil`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}

                <button 
                  type="button"
                  onClick={addRateInput}
                  disabled={rates.length >= 10}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-white/[0.12] hover:border-sky-500/40 text-sky-400 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-sky-500/5 disabled:opacity-40"
                >
                  <Plus size={14} /> Başka Engel Oranı Ekle (Maks 10)
                </button>
              </div>

              <div className="pt-3 border-t border-white/[0.06]">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-300">
                  <input 
                    type="checkbox"
                    checked={isOver60}
                    onChange={(e) => setIsOver60(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                  <span>Kişi 60 Yaş ve Üzerinde (Mevzuat gereği son orana ek %10 Balthazard puanı eklenir)</span>
                </label>
              </div>
            </div>

            {/* Balthazard Result Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#111726]/80 border border-sky-500/30 rounded-2xl p-6 space-y-4 text-center backdrop-blur-md">
                <div className="inline-flex p-3 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20">
                  <Award size={26} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                    Hesaplanan Nihai Engel Oranı
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-sky-400 font-mono tracking-tight">
                    %{balthazardResult}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 border border-white/[0.06] rounded-xl text-left text-xs space-y-2">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Info size={13} className="text-sky-400" /> Resmi Hak Değerlendirmesi:
                  </div>
                  {balthazardResult >= 40 ? (
                    <p className="text-emerald-400 font-normal leading-relaxed text-[11px]">
                      ✓ %40 ve üzeri oran ile Engelli Kimlik Kartı, Gelir Vergisi İndirimi, EKPSS, Erken Emeklilik ve Şehir İçi Ücretsiz Toplu Taşıma haklarına sahipsiniz.
                    </p>
                  ) : (
                    <p className="text-amber-400 font-normal leading-relaxed text-[11px]">
                      ⚠ %40 altında kalan oranlarda engelli mevzuatı muafiyet haklarının büyük kısmı geçerli olmamaktadır.
                    </p>
                  )}
                  {balthazardResult >= 90 && (
                    <p className="text-sky-300 font-semibold border-t border-white/[0.06] pt-1.5 leading-relaxed text-[11px]">
                      ★ %90 ve üzeri oran ile özel tertibat aranmaksızın koşulsuz ÖTV muafiyetli araç alım hakkınız mevcuttur.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-[#111726]/60 border border-white/[0.06] rounded-2xl p-4 space-y-1.5 text-xs text-slate-400 leading-relaxed">
                <h3 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-sky-400" /> Balthazard Matematik Mantığı
                </h3>
                <p className="text-[11px]">
                  En yüksek oran baz alınarak 100&apos;den çıkarılır (kalan sağlam vücut yüzdesi). Sonraki engel oranı kalan bu yüzdeyle çarpılarak kümülatif eklenir.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 2026 ÖTV MUAFİYETLİ ARAÇ */}
        {/* ========================================================================= */}
        {activeTab === 'otv' && (
          <motion.div 
            key="otv"
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            id="panel-otv"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
              <div className="space-y-1 border-b border-white/[0.06] pb-3">
                <h2 className="text-base font-bold text-slate-100">ÖTV Muafiyetli Sıfır Araç Alım Hesaplayıcısı (2026)</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  %90 ve üzeri engelli raporu veya ortopedik engelli ehliyet kodları bulunan bireyler için güncel 2026 tavan limitli hesaplayıcı.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Motor & Yakıt Türü (ÖTV Oranı):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'standard', label: 'Standart Benzin / Dizel (%80 ÖTV)', sub: 'Binek otomobiller' },
                      { id: 'electric_10', label: '%100 Elektrikli (%10 ÖTV)', sub: '≤ 160 kW motor gücü' },
                      { id: 'electric_40', label: '%100 Elektrikli (%40 ÖTV)', sub: '> 160 kW motor gücü' },
                      { id: 'hybrid', label: 'Hibrit Araç (%80 ÖTV)', sub: 'Benzin + Elektrik motor' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEngineType(item.id as any)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          engineType === item.id 
                            ? 'bg-sky-600/20 text-sky-200 border-sky-500/60 shadow-sm' 
                            : 'bg-slate-900/80 text-slate-400 border-white/[0.06] hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-semibold text-slate-200">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Aracın Vergiler Dahil Anahtar Teslim Liste Fiyatı (TL):</span>
                  <input 
                    type="number"
                    value={carPrice === 0 ? '' : carPrice}
                    onChange={(e) => setCarPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                    step="10000"
                  />
                </label>

                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/[0.06] text-xs space-y-1.5">
                  <div className="flex justify-between items-center font-semibold text-slate-200">
                    <span>2026 Resmi ÖTV Üst Muafiyet Limiti:</span>
                    <span className="text-sky-400 font-mono font-bold">{otvLimit2026.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Vergiler dahil anahtar teslim satış fiyatı bu limitin üzerinde olan araçlar mevzuat gereği ÖTV muafiyeti kapsamında satın alınamaz.
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
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                      <CheckCircle2 size={22} />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 border border-rose-500/20">
                      <ShieldAlert size={22} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">
                      {otvResult.isEligible ? '2026 ÖTV Muafiyetine Uygun' : 'Üst Limit Aşıldı'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {otvResult.isEligible ? 'Araç fiyatı mevzuat üst sınırının altındadır.' : 'Araç fiyatı 2.247.100 TL sınırını aşmaktadır.'}
                    </p>
                  </div>
                </div>

                {otvResult.isEligible && (
                  <div className="space-y-2.5 border-t border-white/[0.06] pt-3 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Ham Araç Bedeli (Vergisiz):</span>
                      <span className="font-mono font-semibold text-slate-200">{otvResult.taxFreePrice.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Muaf Tutulan ÖTV (%{otvResult.otvRatePercent}):</span>
                      <span className="font-mono font-semibold text-rose-400">-{otvResult.otvAmount.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Ödenecek KDV (%20):</span>
                      <span className="font-mono font-semibold text-slate-200">+{otvResult.kdvAmount.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="border-t border-white/[0.06] pt-2.5 flex justify-between items-end">
                      <span className="font-bold text-slate-200 text-xs">ÖDENECEK NET FİYAT:</span>
                      <span className="text-xl font-bold text-sky-400 font-mono">{otvResult.exemptPrice.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-semibold text-center mt-2">
                      Toplam Vergi Tasarrufunuz: {otvResult.savings.toLocaleString('tr-TR')} TL
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#111726]/60 border border-white/[0.06] rounded-2xl p-4 space-y-1 text-[11px] text-slate-400 leading-relaxed">
                <div className="font-semibold text-slate-200 flex items-center gap-1">
                  <Info size={13} className="text-sky-400" /> Mevzuat Hatırlatması:
                </div>
                ÖTV muafiyetiyle alınan sıfır araçlar 5 yıl boyunca satılamaz veya devredilemez. 5 yılın sonunda ÖTV ödemeksizin normal piyasa koşullarında satılabilir.
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GELİR VERGİSİ İNDİRİMİ */}
        {/* ========================================================================= */}
        {activeTab === 'vergi' && (
          <motion.div 
            key="vergi"
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            id="panel-vergi"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
              <div className="space-y-1 border-b border-white/[0.06] pb-3">
                <h2 className="text-base font-bold text-slate-100">Engellilik Gelir Vergisi İndirimi Hesaplayıcısı</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Çalışan veya serbest meslek erbabı engellilerin brüt gelir vergisi matrahından düşülen yasal indirim ve net maaşa katkısı.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Engellilik Derecesi (Vergi İndirimi Belgesi):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { degree: 1, label: '1. Derece (%80+)', matrah: '6.900 TL/ay' },
                      { degree: 2, label: '2. Derece (%60-%79)', matrah: '4.000 TL/ay' },
                      { degree: 3, label: '3. Derece (%40-%59)', matrah: '1.700 TL/ay' },
                    ].map((item) => (
                      <button
                        key={item.degree}
                        type="button"
                        onClick={() => setTaxDegree(item.degree as any)}
                        className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          taxDegree === item.degree 
                            ? 'bg-sky-600 text-white border-sky-500 shadow-sm' 
                            : 'bg-slate-900/80 text-slate-400 border-white/[0.06] hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">Matrah: {item.matrah}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Aylık Brüt Maaşınız (TL):</span>
                  <input 
                    type="number"
                    value={grossSalary === 0 ? '' : grossSalary}
                    onChange={(e) => setGrossSalary(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                    step="1000"
                  />
                </label>

                <div className="space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Bulunduğunuz Gelir Vergisi Dilimi:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { rate: 15, label: '%15 (İlk Dilim)' },
                      { rate: 20, label: '%20 (İkinci Dilim)' },
                      { rate: 27, label: '%27 (Üçüncü Dilim)' },
                    ].map((b) => (
                      <button
                        key={b.rate}
                        type="button"
                        onClick={() => setTaxBracket(b.rate)}
                        className={`p-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          taxBracket === b.rate 
                            ? 'bg-sky-600/30 text-sky-200 border-sky-500' 
                            : 'bg-slate-900/80 text-slate-400 border-white/[0.06]'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Vergi İndirimi Sonuç Paneli */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#111726]/80 border border-sky-500/30 rounded-2xl p-6 space-y-4 backdrop-blur-md">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Net Maaşa Aylık Yansıma
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-sky-400 font-mono">
                    +{taxDiscountResult.monthlyBenefit.toLocaleString('tr-TR')} TL <span className="text-xs font-normal text-slate-400">/ ay</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/[0.06] pt-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Aylık Düşülen Vergi Matrahı:</span>
                    <span className="font-semibold text-slate-200">{taxDiscountResult.deduction.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Geçerli Vergi Oranı:</span>
                    <span className="font-semibold text-slate-200">%{taxBracket}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/[0.06] pt-2">
                    <span className="font-bold text-slate-200">Yıllık Toplam Net Kazanç:</span>
                    <span className="font-bold text-emerald-400 font-mono">+{taxDiscountResult.annualBenefit.toLocaleString('tr-TR')} TL</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/[0.06] text-[11px] text-slate-400 leading-relaxed">
                  💡 Gelir vergisi indirimi alan engelli çalışanlar aynı zamanda yaş şartı aranmaksızın <strong>Erken Emeklilik</strong> hakkına da hak kazanırlar.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: EVDE BAKIM MAAŞI */}
        {/* ========================================================================= */}
        {activeTab === 'evde_bakim' && (
          <motion.div 
            key="evde_bakim"
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            id="panel-evde_bakim"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
              <div className="space-y-1 border-b border-white/[0.06] pb-3">
                <h2 className="text-base font-bold text-slate-100">Evde Bakım Maaşı Gelir Kriteri & Uygunluk Testi</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aile ve Sosyal Hizmetler Bakanlığı evde bakım yardımı için hane içi kişi başına düşen gelir kriteri denetimi.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Hanede İkamet Eden Toplam Kişi Sayısı:</span>
                  <input 
                    type="number"
                    min="1"
                    max="15"
                    value={householdMembers === 0 ? '' : householdMembers}
                    onChange={(e) => setHouseholdMembers(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Haneye Giren Toplam Aylık Net Gelir (TL):</span>
                  <input 
                    type="number"
                    value={totalHouseholdIncome === 0 ? '' : totalHouseholdIncome}
                    onChange={(e) => setTotalHouseholdIncome(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                    step="1000"
                  />
                  <span className="text-[10px] text-slate-500 block">Tüm maaşlar, emekli aylıkları, kira gelirleri ve diğer düzenli kazançlar dahildir.</span>
                </label>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-300">
                    <input 
                      type="checkbox"
                      checked={isFullyDependent}
                      onChange={(e) => setIsFullyDependent(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                    <span>Engelli sağlık kurulu raporunda <strong>&ldquo;Tam Bağımlı&rdquo;</strong> veya <strong>&ldquo;Ağır Engelli&rdquo;</strong> ifadesi mevcut</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Evde Bakım Sonuç Paneli */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`bg-[#111726]/80 rounded-2xl p-6 space-y-4 border backdrop-blur-md ${
                homeCareResult.isEligible ? 'border-emerald-500/30' : 'border-rose-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  {homeCareResult.isEligible ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                      <CheckCircle2 size={22} />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 border border-rose-500/20">
                      <ShieldAlert size={22} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">
                      {homeCareResult.isEligible ? 'Evde Bakım Maaşına Uygun' : 'Şartlar Sağlanmıyor'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {homeCareResult.isEligible 
                        ? 'Gelir kriteri ve rapor şartı evde bakım yardımı için uygundur.' 
                        : !homeCareResult.isIncomeEligible 
                          ? 'Kişi başı düşen gelir 2026 üst sınırını aşmaktadır.'
                          : 'Raporun "Tam Bağımlı" olması zorunludur.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/[0.06] pt-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Hane İçi Kişi Başı Gelir:</span>
                    <span className="font-mono font-semibold text-slate-200">{homeCareResult.perCapitaIncome.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>2026 Kişi Başı Üst Sınır:</span>
                    <span className="font-mono font-semibold text-sky-400">{homeCareResult.perCapitaLimit.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between items-end">
                    <span className="font-bold text-slate-200">Tahmini Aylık Ödenek:</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">~{homeCareResult.monthlyAllowance.toLocaleString('tr-TR')} TL</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111726]/60 border border-white/[0.06] rounded-2xl p-4 space-y-1 text-[11px] text-slate-400 leading-relaxed">
                <div className="font-semibold text-slate-200 flex items-center gap-1">
                  <Info size={13} className="text-sky-400" /> Başvuru Süreci:
                </div>
                Başvurular ikamet edilen ilçedeki <strong>Sosyal Yardımlaşma ve Dayanışma Vakfı (SYDV)</strong> veya <strong>Aile ve Sosyal Hizmetler İl/İlçe Müdürlüğü</strong>ne bizzat yapılır.
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: 2022 ENGELLİ AYLIĞI */}
        {/* ========================================================================= */}
        {activeTab === 'engelli_maasi' && (
          <motion.div 
            key="engelli_maasi"
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            id="panel-engelli_maasi"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
              <div className="space-y-1 border-b border-white/[0.06] pb-3">
                <h2 className="text-base font-bold text-slate-100">2022 Sayılı Yasa Engelli Aylığı & 65 Yaş Maaşı</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sosyal güvencesi bulunmayan ihtiyaç sahibi engelli ve yaşlı vatandaşlara ödenen aylık tutarlar ve muhtaçlık sınırı denetimi.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Aylık Türü / Engel Durumu:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'tier_40_69', label: '%40 - %69 Engelli', amount: '3.750 TL/ay' },
                      { id: 'tier_70_plus', label: '%70+ Ağır Engelli', amount: '5.625 TL/ay' },
                      { id: 'elderly_65', label: '65 Yaş Yaşlılık', amount: '3.500 TL/ay' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDisabilityRateTier(item.id as any)}
                        className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          disabilityRateTier === item.id 
                            ? 'bg-sky-600 text-white border-sky-500 shadow-sm' 
                            : 'bg-slate-900/80 text-slate-400 border-white/[0.06] hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{item.amount}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Hanedeki Toplam Kişi Sayısı:</span>
                  <input 
                    type="number"
                    min="1"
                    max="15"
                    value={allowanceHouseholdMembers === 0 ? '' : allowanceHouseholdMembers}
                    onChange={(e) => setAllowanceHouseholdMembers(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Haneye Giren Toplam Aylık Net Gelir (TL):</span>
                  <input 
                    type="number"
                    value={allowanceHouseholdIncome === 0 ? '' : allowanceHouseholdIncome}
                    onChange={(e) => setAllowanceHouseholdIncome(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                    step="1000"
                  />
                </label>
              </div>
            </div>

            {/* 2022 Aylık Sonuç Paneli */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`bg-[#111726]/80 rounded-2xl p-6 space-y-4 border backdrop-blur-md ${
                disabilityAllowanceResult.isIncomeEligible ? 'border-emerald-500/30' : 'border-rose-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  {disabilityAllowanceResult.isIncomeEligible ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                      <CheckCircle2 size={22} />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 border border-rose-500/20">
                      <ShieldAlert size={22} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">
                      {disabilityAllowanceResult.isIncomeEligible ? '2022 Aylığı Kriterine Uygun' : 'Muhtaçlık Sınırı Aşıldı'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {disabilityAllowanceResult.isIncomeEligible 
                        ? 'Hane içi kişi başı gelir yasal muhtaçlık sınırının altındadır.' 
                        : 'Kişi başı düşen gelir 7.650 TL sınırının üzerindedir.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/[0.06] pt-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Hane İçi Kişi Başı Gelir:</span>
                    <span className="font-mono font-semibold text-slate-200">{disabilityAllowanceResult.perCapitaIncome.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>2026 Muhtaçlık Gelir Sınırı:</span>
                    <span className="font-mono font-semibold text-sky-400">{disabilityAllowanceResult.perCapitaLimit.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between items-end">
                    <span className="font-bold text-slate-200">Aylık Net Maaş:</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">{disabilityAllowanceResult.monthlyAmount.toLocaleString('tr-TR')} TL</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: KIDEM & İHBAR TAZMİNATI */}
        {/* ========================================================================= */}
        {activeTab === 'kidem' && (
          <motion.div 
            key="kidem"
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            id="panel-kidem"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
              <div className="space-y-1 border-b border-white/[0.06] pb-3">
                <h2 className="text-base font-bold text-slate-100">Kıdem ve İhbar Tazminatı Hesaplayıcısı (4857 Sayılı Kanun)</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  2026 yılı yasal kıdem tazminatı tavanı ve damga vergisi kesintileri dikkate alınarak net hak ediş hesabı.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">Aylık Brüt Giydirilmiş Ücret (TL):</span>
                  <input 
                    type="number"
                    value={severanceSalary === 0 ? '' : severanceSalary}
                    onChange={(e) => setSeveranceSalary(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                    step="1000"
                  />
                  <span className="text-[10px] text-slate-500 block">Maaş, yol, yemek, ikramiye ve düzenli yan haklar dahildir.</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1.5">
                    <span className="font-semibold text-xs text-slate-300">Çalışılan Yıl:</span>
                    <input 
                      type="number"
                      min="0"
                      max="50"
                      value={workedYears === 0 ? '' : workedYears}
                      onChange={(e) => setWorkedYears(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="font-semibold text-xs text-slate-300">Çalışılan Ay:</span>
                    <input 
                      type="number"
                      min="0"
                      max="11"
                      value={workedMonths === 0 ? '' : workedMonths}
                      onChange={(e) => setWorkedMonths(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                  </label>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/[0.06] text-xs space-y-1">
                  <div className="flex justify-between items-center font-semibold text-slate-200">
                    <span>2026 Kıdem Tazminatı Tavanı:</span>
                    <span className="text-sky-400 font-mono font-bold">{severanceResult.severanceCeiling.toLocaleString('tr-TR')} TL</span>
                  </div>
                  {severanceResult.isCeilingApplied && (
                    <p className="text-amber-400 text-[11px]">
                      ⚠ Brüt maaşınız yasal kıdem tavanını aştığı için hesaplama 46.500 TL tavan üzerinden sınırlandırılmıştır.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Kıdem Sonuç Paneli */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#111726]/80 border border-sky-500/30 rounded-2xl p-6 space-y-4 backdrop-blur-md">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Ödenecek Toplam Net Tazminat
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-sky-400 font-mono">
                    {severanceResult.totalNetBenefit.toLocaleString('tr-TR')} TL
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/[0.06] pt-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Brüt Kıdem Tazminatı:</span>
                    <span className="font-semibold text-slate-200">{severanceResult.grossSeverance.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Damga Vergisi Kesintisi (‰7.59):</span>
                    <span className="font-semibold text-rose-400">-{severanceResult.stampTaxSeverance.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between border-t border-white/[0.06] pt-2 text-slate-300">
                    <span className="font-semibold">Net Kıdem Tazminatı:</span>
                    <span className="font-bold text-slate-100 font-mono">{severanceResult.netSeverance.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="font-semibold">Net İhbar Tazminatı ({severanceResult.noticeWeeks} Hafta):</span>
                    <span className="font-bold text-slate-100 font-mono">{severanceResult.netNotice.toLocaleString('tr-TR')} TL</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/[0.06] text-[11px] text-slate-400 leading-relaxed">
                  💡 Engelli çalışanlar, sağlık kurulu raporu ve vergi indirimi ile erken emeklilik hakkı kazandıklarında kendi istekleriyle işten ayrılsalar dahi <strong>kıdem tazminatlarını eksiksiz alma hakkına</strong> sahiptirler.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: ENGELLİ ERKEN EMEKLİLİK ROBOTU */}
        {/* ========================================================================= */}
        {activeTab === 'emeklilik' && (
          <motion.div 
            key="emeklilik"
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            id="panel-emeklilik"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
              <div className="space-y-1 border-b border-white/[0.06] pb-3">
                <h2 className="text-base font-bold text-slate-100">Engelli Erken Emeklilik Hesaplama Robotu</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sigorta başlangıç yılınıza ve engel derecenize göre yaş şartı aranmaksızın emeklilik prim ve yıl şartları.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="font-semibold text-xs text-slate-300">İlk SGK / Sigorta Başlangıç Yılınız:</span>
                  <input 
                    type="number"
                    min="1980"
                    max="2026"
                    value={entryYear === 0 ? '' : entryYear}
                    onChange={(e) => setEntryYear(e.target.value === '' ? 0 : Number(e.target.value))}
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
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
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
                    max="12000"
                    value={currentDays === 0 ? '' : currentDays}
                    onChange={(e) => setCurrentDays(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/90 font-bold text-slate-100 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </label>
              </div>
            </div>

            {/* Emeklilik Sonuç Paneli */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#111726]/80 border border-sky-500/30 rounded-2xl p-6 space-y-4 backdrop-blur-md">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Emeklilik Şartları Özeti</div>
                  <div className="text-base font-bold text-slate-100">
                    {retirementResult.isEligible ? (
                      <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                        <CheckCircle2 size={20} /> Emeklilik Şartlarını Tamamladınız!
                      </span>
                    ) : (
                      <span className="text-sky-400 font-bold">
                        {retirementResult.daysRemaining > 0 
                          ? `${retirementResult.daysRemaining} Gün Prim Eksik` 
                          : `${retirementResult.yearsRemaining} Yıl Süre Eksik`}
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
                    <span className="text-slate-400">Tamamlanan Sigortalılık Süresi:</span>
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
