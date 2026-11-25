'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Percent, 
  Plus, 
  Trash2, 
  RotateCcw
} from 'lucide-react';
import ClassicSidebar from '@/components/forum/classic-sidebar';

interface CalculationStep {
  step: number;
  addedRate: number;
  formula: string;
  subtotal: number;
}

export default function BalthazardPage() {
  const [rates, setRates] = useState<number[]>([40, 20]);
  const [isOver65, setIsOver65] = useState<boolean>(false);

  const addRate = (defaultVal = 10) => {
    if (rates.length < 12) {
      setRates([...rates, defaultVal]);
    }
  };

  const updateRate = (index: number, val: number) => {
    const newRates = [...rates];
    const clamped = Math.min(99, Math.max(0, isNaN(val) ? 0 : val));
    newRates[index] = clamped;
    setRates(newRates);
  };

  const removeRate = (index: number) => {
    if (rates.length > 1) {
      setRates(rates.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    setRates([40, 20]);
    setIsOver65(false);
  };

  const calculation = useMemo(() => {
    const validRates = rates.filter(r => r > 0).sort((a, b) => b - a);

    if (validRates.length === 0) {
      return {
        rawScore: 0,
        finalScore: 0,
        steps: [] as CalculationStep[],
        isTamBagimli: false,
        degree: 0,
      };
    }

    const steps: CalculationStep[] = [];
    let currentScore = validRates[0];

    steps.push({
      step: 1,
      addedRate: validRates[0],
      formula: `En yüksek birinci oran doğrudan baz alınır: %${validRates[0]}`,
      subtotal: currentScore,
    });

    for (let i = 1; i < validRates.length; i++) {
      const nextRate = validRates[i];
      const addedValue = (nextRate * (100 - currentScore)) / 100;
      currentScore = currentScore + addedValue;

      steps.push({
        step: i + 1,
        addedRate: nextRate,
        formula: `${(currentScore - addedValue).toFixed(2)} + [${nextRate} × (100 - ${(currentScore - addedValue).toFixed(2)}) / 100]`,
        subtotal: currentScore,
      });
    }

    if (isOver65) {
      const ageBonus = (10 * (100 - currentScore)) / 100;
      currentScore = currentScore + ageBonus;
      steps.push({
        step: steps.length + 1,
        addedRate: 10,
        formula: `65 Yaş Ek Payı (+%10)`,
        subtotal: currentScore,
      });
    }

    const finalScore = Math.min(100, Math.round(currentScore));
    let degree = 0;
    if (finalScore >= 80) degree = 1;
    else if (finalScore >= 60) degree = 2;
    else if (finalScore >= 40) degree = 3;

    return {
      rawScore: currentScore,
      finalScore,
      steps,
      isTamBagimli: finalScore >= 80,
      degree,
    };
  }, [rates, isOver65]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-fg-4 font-mono">
        <Link href="/" className="hover:text-fg transition-colors">
          Forum
        </Link>
        <span>/</span>
        <Link href="/hesaplama" className="hover:text-fg transition-colors">
          Hesaplama
        </Link>
        <span>/</span>
        <span className="text-fg font-semibold">Balthazard Robotu</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Tool */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="pb-4 border-b border-line">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-0 flex items-center gap-2.5">
              <Percent size={24} className="text-indigo-400 light:text-indigo-700" />
              <span>Balthazard Oran Birleştirme Robotu</span>
            </h1>
            <p className="text-sm text-fg-3 mt-1 font-medium">
              20 Şubat 2019 tarih ve 30692 sayılı Resmî Gazete Erişkinler İçin Engellilik Değerlendirmesi Ek-2 Cetveli.
            </p>
          </div>

          {/* Form & Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-fg text-xs">
                Branş Engellilik Oranları (%1 - %99)
              </span>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-fg-4 hover:text-fg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} /> Sıfırla
              </button>
            </div>

            <div className="space-y-2.5">
              {rates.map((rate, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-fg-4 w-20 shrink-0">
                    Branş {idx + 1}:
                  </span>
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={rate === 0 ? '' : rate}
                      onChange={(e) => updateRate(idx, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full h-10 pl-3.5 pr-8 bg-surface-hover border border-line rounded-md text-base font-mono font-bold text-fg focus:outline-none focus:border-indigo-400 light:focus:border-indigo-700"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-fg-4">%</span>
                  </div>
                  {rates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRate(idx)}
                      className="p-2 text-fg-4 hover:text-rose-400 light:hover:text-rose-700 transition-colors cursor-pointer"
                      title="Bu oranı sil"
                      aria-label="Oranı sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => addRate(10)}
                disabled={rates.length >= 12}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-surface-hover border border-line hover:bg-line text-xs font-bold text-fg transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Plus size={15} />
                <span>Yeni Branş Oranı Ekle</span>
              </button>

              <label className="flex items-center gap-2 text-xs font-semibold text-fg-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isOver65}
                  onChange={(e) => setIsOver65(e.target.checked)}
                  className="rounded border-line bg-surface-raised text-indigo-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>65 Yaş ve Üzeri (+%10 Yaşlılık Payı Ekle)</span>
              </label>
            </div>
          </div>

          {/* Result Output - Large, High-Contrast */}
          <div className="p-6 bg-surface-raised border-2 border-line rounded-xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-line">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-fg-4">
                  Nihai Kurul Sağlık Raporu Oranı
                </div>
                <div className="text-5xl sm:text-6xl font-mono font-black text-fg tracking-tight mt-1">
                  %{calculation.finalScore}
                </div>
                <div className="text-xs text-fg-5 font-mono mt-1 font-semibold">
                  Ham matematiksel değer: %{calculation.rawScore.toFixed(3)}
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="text-sm font-bold text-indigo-300 light:text-indigo-700">
                  {calculation.degree > 0 ? `${calculation.degree}. Derece Engelli` : 'Derece Dışı (%40 Altı)'}
                </div>
                <div className="text-xs text-fg-3 font-medium">
                  {calculation.finalScore >= 90 && 'ÖTV Muafiyeti Şartsız Geçerli (%90+)'}
                  {calculation.finalScore >= 40 && calculation.finalScore < 90 && 'Engelli Kimlik Kartı & Vergi İndirimi Şartı Sağlandı'}
                  {calculation.finalScore < 40 && 'Yasal haklar için asgari %40 oranı gereklidir'}
                </div>
              </div>
            </div>

            {/* Step-by-step breakdown */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-fg">
                Adım Adım Balthazard Çözümü
              </div>
              <div className="space-y-1.5 font-mono text-xs text-fg-3 divide-y divide-line/60">
                {calculation.steps.map((st) => (
                  <div key={st.step} className="pt-2 flex items-center justify-between">
                    <span>Adım {st.step}: {st.formula}</span>
                    <span className="text-fg font-bold">%{st.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legal Notes */}
          <div className="text-xs text-fg-3 space-y-2 leading-relaxed bg-surface-raised p-4 rounded-md border border-line">
            <div className="font-bold text-fg">Önemli Yasal Hatırlatma:</div>
            <p>
              Balthazard formülünde oranlar büyükten küçüğe sıralanır. En büyük oran temel alınır, kalan vücut fonksiyon kaybı yüzdesi üzerinden diğer oranlar sırayla eklenir. Raporunuzdaki tüm oranları sisteme tek tek girerek resmi heyet sonucunuzu doğrulayabilirsiniz.
            </p>
          </div>


        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <ClassicSidebar />
        </div>
      </div>
    </div>
  );
}
