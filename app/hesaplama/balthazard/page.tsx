'use client';

import React, { useState, useMemo } from 'react';
import { 
  Percent, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  Award,
  RefreshCw,
  FileText
} from 'lucide-react';

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
    if (rates.length < 15) {
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

  // =========================================================================
  // MATEMATİK MOTORU: 20 Şubat 2019 / 30692 R.G. Ek-2 Balthazard Formülü
  // =========================================================================
  const calculation = useMemo(() => {
    const validRates = rates.filter(r => r > 0).sort((a, b) => b - a);

    if (validRates.length === 0) {
      return {
        rawScore: 0,
        finalScore: 0,
        ageBonusAdded: 0,
        steps: [] as CalculationStep[],
        isTamBagimli: false,
        isKismiBagimli: false,
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
        formula: `${currentScore - addedValue >= 0 ? (currentScore - addedValue).toFixed(2) : 0} + [${nextRate} × (100 - ${(currentScore - addedValue).toFixed(2)}) / 100]`,
        subtotal: currentScore,
      });
    }

    let ageBonus = 0;
    if (isOver65) {
      ageBonus = (10 * (100 - currentScore)) / 100;
      currentScore = currentScore + ageBonus;
      steps.push({
        step: steps.length + 1,
        addedRate: 10,
        formula: `65 Yaş İlavesi: ${(currentScore - ageBonus).toFixed(2)} + [10 × (100 - ${(currentScore - ageBonus).toFixed(2)}) / 100]`,
        subtotal: currentScore,
      });
    }

    const decimalPart = currentScore - Math.floor(currentScore);
    const finalScore = decimalPart >= 0.50 ? Math.ceil(currentScore) : Math.floor(currentScore);

    let degree = 0;
    if (finalScore >= 80) degree = 1;
    else if (finalScore >= 60) degree = 2;
    else if (finalScore >= 40) degree = 3;

    const isTamBagimli = finalScore >= 80;
    const isKismiBagimli = finalScore >= 40 && finalScore < 80;

    return {
      rawScore: currentScore,
      finalScore: Math.min(100, finalScore),
      ageBonusAdded: ageBonus,
      steps,
      isTamBagimli,
      isKismiBagimli,
      degree,
    };
  }, [rates, isOver65]);

  return (
    <div className="space-y-6">
      
      {/* 1. 18 YAŞ ALTI VE ÇÖZ-GER YASAL UYARI KUTUSU */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <h2 className="font-bold text-sm text-amber-950 mb-1">
              18 Yaş Altı Çocuklar İçin Önemli Mevzuat Uyarısı (ÇÖZ-GER Zorunluluğu)
            </h2>
            <p>
              <strong>18 yaş altı çocuklar için sağlık kurullarında oran hesabı ve Balthazard formülü uygulanmaz.</strong> 20 Şubat 2019 tarihli ve 30692 sayılı Resmî Gazete&apos;de yayımlanan yönetmelik gereği, çocuklar için <strong>ÇÖZ-GER (Çocuklar İçin Özel Gereksinim Raporu)</strong> düzenlenir ve raporda yüzde (%) yerine özel gereksinim kategorileri yer alır.
            </p>
          </div>
        </div>
      </div>

      {/* Başlık ve Mevzuat Dayanağı */}
      <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-[#eef4f9] text-[#185886] flex items-center justify-center font-black">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                2026 Balthazard Formülü Hesaplama Robotu
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Dayanak: 20 Şubat 2019 / 30692 sayılı R.G. Ek-2 Cetveli
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Formu Sıfırla</span>
          </button>
        </div>

        {/* Oran Giriş Alanı */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Branş ve Teşhis Engellilik Oranları (%)
            </label>
            <span className="text-xs text-slate-500">
              {rates.length} adet oran girildi (En fazla 15)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rates.map((rate, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-2.5 bg-slate-50 rounded border border-slate-200 focus-within:border-[#185886] focus-within:bg-white transition-all"
              >
                <span className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={rate === 0 ? '' : rate}
                    onChange={(e) => updateRate(index, parseInt(e.target.value, 10))}
                    placeholder="Örn: 40"
                    className="w-full bg-transparent text-slate-900 font-bold text-sm focus:outline-none pr-6"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    %
                  </span>
                </div>

                {rates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRate(index)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Oranı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Hızlı Ekleme Butonları */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => addRate(10)}
              disabled={rates.length >= 15}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#185886] text-white text-xs font-bold hover:bg-[#124d77] transition-colors disabled:opacity-50 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Oran Satırı Ekle</span>
            </button>

            <span className="text-xs text-slate-400 ml-1">Hızlı Ekle:</span>
            {[10, 20, 30, 40, 50].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => addRate(val)}
                disabled={rates.length >= 15}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
              >
                +%{val}
              </button>
            ))}
          </div>

          {/* 65 Yaş ve Üzeri Onay Kutusu */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-md bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition-colors">
              <input
                type="checkbox"
                checked={isOver65}
                onChange={(e) => setIsOver65(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#185886] focus:ring-[#185886] border-slate-300"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">
                  Birey 65 Yaş veya Üzerinde mi? (+%10 Balthazard Yaşlılık İlavesi)
                </span>
                <span className="text-slate-600 block mt-0.5 leading-relaxed">
                  20 Şubat 2019 tarihli mevzuat uyarınca; 65 yaşını doldurmuş bireylerin Balthazard formülü ile hesaplanan toplam engel oranına <strong>%10 yaşlılık payı</strong> formülle ilave edilir. [Sonuç + 10 × (100 - Sonuç) / 100].
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 2. HESAPLAMA SONUÇLARI KARTI */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-[#124d77] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Award className="w-4 h-4 text-blue-200" />
            <span>RESMİ BALTHAZARD KURUL HESAPLAMA SONUCU</span>
          </div>
          <span className="text-xs bg-blue-900/60 px-2.5 py-0.5 rounded text-blue-100 font-medium">
            2026 Mevzuatı
          </span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Nihai Oran Göstergesi */}
          <div className="text-center p-5 bg-[#eef4f9] rounded-md border border-[#cbd5e1]">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block">
              Nihai Sağlık Kurulu Oranı
            </span>
            <div className="text-4xl sm:text-5xl font-black text-[#185886] my-1">
              %{calculation.finalScore}
            </div>
            <span className="text-xs text-slate-600 block">
              Ham Küsurat: %{calculation.rawScore.toFixed(2)}
            </span>
            <div className="mt-2 text-[11px] text-slate-500 bg-white py-1 px-2 rounded border border-slate-200">
              {calculation.rawScore - Math.floor(calculation.rawScore) >= 0.50 
                ? '0.50 ve üzeri olduğu için yukarı tam sayıya yuvarlandı.'
                : '0.50 altı olduğu için aşağı tam sayıya yuvarlandı.'}
            </div>
          </div>

          {/* Yasal Sınıflandırma ve Derece */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                calculation.finalScore >= 80 
                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                  : calculation.finalScore >= 60 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                  : calculation.finalScore >= 40 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {calculation.degree > 0 ? `${calculation.degree}. Derece Engelli` : 'Engellilik Tanımı Altında'}
              </span>

              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                calculation.isTamBagimli 
                  ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                  : calculation.isKismiBagimli 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {calculation.isTamBagimli 
                  ? 'Tam Bağımlı Adayı (Mülga: Ağır Engelli)' 
                  : calculation.isKismiBagimli 
                  ? 'Kısmi Bağımlı Engelli' 
                  : '%40 Altı (Rapor Geçerli Değil)'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {calculation.finalScore >= 40 ? (
                <>
                  Hesaplanan <strong>%{calculation.finalScore}</strong> oran, Türkiye Cumhuriyeti mevzuatına göre yasal engelli statüsü ve sosyal haklardan (vergi indirimi, EKPSS, toplu taşıma vb.) yararlanmak için gerekli asgari %40 eşiğini sağlamaktadır.
                </>
              ) : (
                <>
                  Hesaplanan <strong>%{calculation.finalScore}</strong> oran, engelli haklarından faydalanmak için kanunen aranan %40 barajının altında kalmaktadır.
                </>
              )}
            </p>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
              <strong className="text-slate-800 block mb-0.5">Mevzuat Terim Uyarısı:</strong>
              2019 yönetmeliğiyle &quot;Ağır Engelli&quot; tanımı kaldırılmıştır. Artık sağlık kurullarınca kişinin günlük yaşam aktivitelerini kendi başına yapabilme kabiliyetine göre <strong>&quot;Tam Bağımlı&quot;</strong> veya <strong>&quot;Kısmi Bağımlı&quot;</strong> kararı verilir.
            </div>
          </div>

        </div>

        {/* 3. ADIM ADIM BALTHAZARD FORMÜL DÖKÜMÜ */}
        {calculation.steps.length > 0 && (
          <div className="border-t border-slate-200 p-5 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#185886]" />
              <span>Matematiksel Adım Adım Balthazard İşlem Tablosu</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200/70 text-slate-700 font-semibold border-b border-slate-300">
                    <th className="p-2 w-16">Adım</th>
                    <th className="p-2 w-28">Eklenen Oran</th>
                    <th className="p-2">Uygulanan Resmi Formül</th>
                    <th className="p-2 w-28 text-right">Ara Toplam (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {calculation.steps.map((step) => (
                    <tr key={step.step} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-700">{step.step}. Adım</td>
                      <td className="p-2 font-bold text-[#185886]">%{step.addedRate}</td>
                      <td className="p-2 font-mono text-[11px] text-slate-600">{step.formula}</td>
                      <td className="p-2 font-bold text-slate-800 text-right">%{step.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#eef4f9] font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={3} className="p-2 text-right">
                      Yuvarlanmış Nihai Kurul Kararı:
                    </td>
                    <td className="p-2 text-right text-[#185886] text-sm">
                      %{calculation.finalScore}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 4. KAZANILAN HAKLAR LİSTESİ */}
      <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#185886]" />
          <span>Bu Orana Göre Elde Edilebilecek Yasal Engelli Hakları</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              %40 ve Üzeri Temel Haklar
            </h4>
            <ul className="space-y-1 text-slate-600">
              <li>• Aile ve Sosyal Hizmetler Bakanlığı Engelli Kimlik Kartı</li>
              <li>• EKPSS ve engelli memur/işçi istihdam kontenjanı</li>
              <li>• Belediyelere bağlı şehir içi toplu taşıma araçlarında ücretsiz ulaşım</li>
              <li>• TCDD ana hat trenlerinde ücretsiz, YHT&apos;de indirimli seyahat</li>
              <li>• THY iç ve dış hat biletlerinde %20 - %25 indirim</li>
              <li>• Gelir vergisi indirimi (3. derece indirim)</li>
              <li>• Su faturası indirimi (Belediye meclis kararlarına göre en az %30-50)</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 text-blue-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              %60 - %90 ve Üzeri İleri Haklar
            </h4>
            <ul className="space-y-1 text-slate-600">
              <li>• <strong>%60+:</strong> SGK Malulen Emeklilik başvuru hakkı (Çalışma gücü kaybı şartıyla)</li>
              <li>• <strong>%60+:</strong> 2. Derece Gelir Vergisi İndirimi</li>
              <li>• <strong>%80+:</strong> 1. Derece Gelir Vergisi İndirimi</li>
              <li>• <strong>%90+:</strong> 2026 ÖTV Muafiyetli Sıfır Araç Alma Hakkı (Tertibat şartı aranmaksızın yakınları kullanabilir)</li>
              <li>• <strong>%90+:</strong> Motorlu Taşıtlar Vergisi (MTV) muafiyeti</li>
              <li>• <strong>Tam Bağımlı:</strong> Hane gelir kriteri sağlanırsa Evde Bakım Maaşı hakkı</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
