'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Clock,
  ShieldAlert,
  Info,
  ChevronRight,
  TrendingUp,
  History
} from 'lucide-react';

type InsuranceType = '4a' | '4b' | '4c'; // 4A: SSK, 4B: Bağ-Kur, 4C: Emekli Sandığı (Memur)

export default function ErkenEmeklilikPage() {
  const [startDate, setStartDate] = useState<string>('2005-04-15');
  const [disabilityDegree, setDisabilityDegree] = useState<number>(2); // 1, 2, 3
  const [currentPaidDays, setCurrentPaidDays] = useState<number>(4100);
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('4a');

  // =========================================================================
  // MATEMATİKSEL ERKEN EMEKLİLİK MOTORU (506 SK Geçici 18 / 5510 SK 28. Madde)
  // =========================================================================
  const calculation = useMemo(() => {
    if (!startDate) {
      return null;
    }

    const start = new Date(startDate);
    const milatDate = new Date('2008-10-01');
    const isBefore2008 = start < milatDate;

    let reqYears = 15;
    let reqDays = 3600;
    let isTaxDiscountMandatory = false;
    let note = '';

    // =========================================================================
    // 1. DÖNEM: 01.10.2008 ÖNCESİ SİGORTA GİRİŞLİLER (506 Sayılı Kanun Kademeli)
    // =========================================================================
    if (isBefore2008) {
      isTaxDiscountMandatory = insuranceType === '4a'; // 4A SSK için Maliye Vergi İndirimi Zorunludur

      const startYear = start.getFullYear();

      if (disabilityDegree === 1) {
        // 1. Derece (%80 ve üzeri)
        reqYears = 15;
        reqDays = 3600;
        note = '1. Derece engellilerde giriş tarihine bakılmaksızın 15 yıl ve 3600 prim günü sabittir.';
      } else if (disabilityDegree === 2) {
        // 2. Derece (%60 - %79)
        if (startYear <= 1997) {
          reqYears = 15;
          reqDays = 3600;
        } else if (startYear <= 2000) {
          reqYears = 16;
          reqDays = 3760;
        } else if (startYear <= 2003) {
          reqYears = 17;
          reqDays = 3920;
        } else {
          reqYears = 18;
          reqDays = 4000;
        }
        note = '2. Derece vergi indirimi ile kademeli geçiş tablosuna göre hesaplanmıştır.';
      } else {
        // 3. Derece (%40 - %59)
        if (startYear <= 1991) {
          reqYears = 15;
          reqDays = 3600;
        } else if (startYear <= 1994) {
          reqYears = 16;
          reqDays = 3760;
        } else if (startYear <= 1997) {
          reqYears = 17;
          reqDays = 3920;
        } else if (startYear <= 2000) {
          reqYears = 18;
          reqDays = 4080;
        } else if (startYear <= 2003) {
          reqYears = 19;
          reqDays = 4240;
        } else {
          reqYears = 20;
          reqDays = 4400;
        }
        note = '3. Derece vergi indirimi ile 506 sayılı Kanun kademeli tablosuna göre hesaplanmıştır.';
      }

    } else {
      // =======================================================================
      // 2. DÖNEM: 01.10.2008 SONRASI SİGORTA GİRİŞLİLER (5510 Sayılı Kanun 28. Madde)
      // =======================================================================
      isTaxDiscountMandatory = false; // 2008 sonrası vergi indirimi belgesi ARANMAZ; SGK Kurulu raporu esastır

      if (disabilityDegree === 1) {
        // Çalışma gücü kaybı %60 ve üzeri olanlar (Malul düzeyinde olup malullükten yararlanamayanlar)
        reqYears = 15;
        reqDays = 3960;
        note = '5510 sayılı Kanun m.28 uyarınca çalışma gücü kaybı %60 ve üzeri olanlar.';
      } else if (disabilityDegree === 2) {
        // %50 - %59 arası
        reqYears = 16;
        reqDays = 4320;
        note = '5510 sayılı Kanun m.28 uyarınca çalışma gücü kaybı %50 - %59 arasında olanlar.';
      } else {
        // %40 - %49 arası
        reqYears = 18;
        reqDays = 4680;
        note = '5510 sayılı Kanun m.28 uyarınca çalışma gücü kaybı %40 - %49 arasında olanlar.';
      }
    }

    // Sigortalılık Süresi Tamamlanma Tarihi: İlk Giriş Tarihi + Gerekli Yıl
    const completionDate = new Date(start);
    completionDate.setFullYear(start.getFullYear() + reqYears);

    const today = new Date();
    const isYearsSatisfied = today >= completionDate;
    const isDaysSatisfied = currentPaidDays >= reqDays;
    const isReadyForRetirement = isYearsSatisfied && isDaysSatisfied;

    const remainingDays = Math.max(0, reqDays - currentPaidDays);

    let remainingYearsText = '';
    if (!isYearsSatisfied) {
      const diffMs = completionDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const rYears = Math.floor(diffDays / 365);
      const rMonths = Math.floor((diffDays % 365) / 30);
      remainingYearsText = `${rYears} yıl ${rMonths} ay sonra`;
    } else {
      remainingYearsText = 'Süre Şartı Tamamlandı';
    }

    return {
      isBefore2008,
      reqYears,
      reqDays,
      isTaxDiscountMandatory,
      note,
      completionDate: completionDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      isYearsSatisfied,
      isDaysSatisfied,
      isReadyForRetirement,
      remainingDays,
      remainingYearsText,
    };
  }, [startDate, disabilityDegree, currentPaidDays, insuranceType]);

  return (
    <div className="space-y-6">
      
      {/* 01.10.2008 Milat Uyarısı */}
      <div className="bg-indigo-950/20 border border-indigo-800 p-5 rounded-lg shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-bold text-lg text-indigo-400 tracking-tight">
              Erken Emeklilikte 01.10.2008 Tarihi Neden Önemlidir?
            </h2>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              <strong>01.10.2008 öncesi SSK (4A) sigortalılar</strong> için emeklilikte yaş aranmaz ancak <strong>Gelir İdaresi Başkanlığı onaylı Vergi İndirim Belgesi</strong> almak zorunludur. 
              <strong>01.10.2008 sonrasında</strong> ise vergi indirimi aranmaz; müracaat doğrudan SGK&apos;ya yapılır.
            </p>
          </div>
        </div>
      </div>

      {/* Başlık ve Girdi Formu */}
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E293B] pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#18243A] text-indigo-400 flex items-center justify-center shadow-inner border border-[#1E293B]">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                Engelli Erken Emeklilik Şartları Hesaplama
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Info size={12} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">
                  506 SK Geçici 18. Madde ve 5510 SK 28. Madde Uyumluluğu
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-md bg-[#0B1220] text-emerald-400 border border-emerald-800/50 shadow-sm uppercase tracking-wider">
            YAŞ ŞARTI ARANMAZ
          </div>
        </div>

        {/* Girdi Formu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              İşe Giriş Tarihi
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-sm font-bold outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <span className="text-[10px] text-slate-500 italic block">İlk primin yattığı gün</span>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Sigorta Statüsü
            </label>
            <div className="relative">
              <select
                value={insuranceType}
                onChange={(e) => setInsuranceType(e.target.value as InsuranceType)}
                className="w-full pl-3 pr-10 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-xs font-bold appearance-none outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="4a">4A - SSK (Hizmet Akdi)</option>
                <option value="4b">4B - Bağ-Kur (Esnaf)</option>
                <option value="4c">4C - Emekli Sandığı (Memur)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 italic block">Son 2520 gün ağırlığı</span>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Engel Derecesi
            </label>
            <div className="relative">
              <select
                value={disabilityDegree}
                onChange={(e) => setDisabilityDegree(parseInt(e.target.value, 10))}
                className="w-full pl-3 pr-10 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-xs font-bold appearance-none outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value={1}>1. Derece (%80+)</option>
                <option value={2}>2. Derece (%60-79)</option>
                <option value={3}>3. Derece (%40-59)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 italic block">Kurulca saptanan oran</span>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Ödenmiş Prim Günü
            </label>
            <input
              type="number"
              min="0"
              max="15000"
              value={currentPaidDays || ''}
              onChange={(e) => setCurrentPaidDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-md text-white text-sm font-bold outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <span className="text-[10px] text-slate-500 italic block">Hizmet dökümü toplamı</span>
          </div>

        </div>
      </div>

      {/* HESAPLANAN ŞARTLAR VE EMEKLİLİK DURUMU */}
      {calculation && (
        <div className={`rounded-xl border p-6 shadow-xl animate-in zoom-in-95 duration-300 ${
          calculation.isReadyForRetirement 
            ? 'bg-emerald-950/10 border-emerald-900/50' 
            : 'bg-indigo-950/10 border-indigo-900/50'
        }`}>
          <div className="flex items-start gap-5">
            <div className="mt-1">
              {calculation.isReadyForRetirement ? (
                <div className="w-12 h-12 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center shadow-inner">
                  <CheckCircle2 size={28} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-900/30 text-indigo-400 flex items-center justify-center shadow-inner">
                  <Clock size={28} />
                </div>
              )}
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight">
                  {calculation.isReadyForRetirement 
                    ? 'TEBRİKLER: Emeklilik Şartlarını Eksiksiz Tamamladınız!' 
                    : 'EMEKLİLİK İÇİN GEREKLİ ŞARTLAR VE KALAN SÜRE'}
                </h2>

                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border ${
                  calculation.isReadyForRetirement 
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' 
                    : 'bg-indigo-950/40 text-indigo-400 border-indigo-800'
                }`}>
                  {calculation.isReadyForRetirement ? 'Hak Kazanıldı' : 'Süreç Devam Ediyor'}
                </span>
              </div>

              <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-4xl">
                {calculation.isReadyForRetirement ? (
                  <>
                    Hem <strong>{calculation.reqYears} yıllık</strong> sigortalılık süresini hem de aranan <strong>{calculation.reqDays} prim gününü</strong> başarıyla doldurdunuz. 
                    {calculation.isTaxDiscountMandatory && ' Vergi indirim belgeniz onaylıysa'} dilediğiniz zaman SGK Tahsis Servisi&apos;ne müracaat ederek emeklilik sürecinizi başlatabilirsiniz.
                  </>
                ) : (
                  <>
                    Sigorta giriş tarihinize ({startDate}) ve {disabilityDegree}. derece engel durumunuza göre 
                    emekli olabilmeniz için <strong>{calculation.reqYears} yıl sigortalılık süresi</strong> ve <strong>{calculation.reqDays} prim günü</strong> şartı aranmaktadır.
                  </>
                )}
              </p>

              {/* 4'lü İstatistik Paneli */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#1E293B]">
                
                <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] shadow-sm">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Sigorta Süresi</span>
                  <div className="text-xl font-black text-white">
                    {calculation.reqYears} Yıl
                  </div>
                  <div className={`text-[11px] mt-1 font-bold ${calculation.isYearsSatisfied ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {calculation.completionDate}
                  </div>
                </div>

                <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] shadow-sm">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Gereken Prim</span>
                  <div className="text-xl font-black text-indigo-400">
                    {calculation.reqDays} Gün
                  </div>
                  <div className={`text-[11px] mt-1 font-bold ${calculation.isDaysSatisfied ? 'text-emerald-400' : 'text-slate-400'}`}>
                    Mevcut: {currentPaidDays} gün
                  </div>
                </div>

                <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] shadow-sm">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Kalan İhtiyaç</span>
                  <div className={`text-xl font-black ${calculation.remainingDays === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {calculation.remainingDays === 0 ? 'TAMAM' : `${calculation.remainingDays} Gün`}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">
                    {calculation.remainingDays > 0 ? `~${(calculation.remainingDays / 30).toFixed(1)} ay kaldı` : 'Kriter sağlandı'}
                  </div>
                </div>

                <div className="p-4 bg-[#0B1220] rounded-lg border border-[#1E293B] shadow-sm">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Vergi İndirimi</span>
                  <div className={`text-xl font-black ${calculation.isTaxDiscountMandatory ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {calculation.isTaxDiscountMandatory ? 'ZORUNLU' : 'GEREKMEZ'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium italic">
                    {calculation.isTaxDiscountMandatory ? 'Maliye onayı şart' : 'SGK Kurul sevki'}
                  </div>
                </div>

              </div>

              <div className="flex items-center gap-2 p-3 bg-[#18243A]/50 rounded-lg border border-[#1E293B]/50">
                <History size={14} className="text-indigo-400" />
                <p className="text-[11px] text-slate-400 italic">
                  {calculation.note}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* YASAL MEVZUAT VE DETAY BİLGİLENDİRME BLOKLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-5 shadow-lg group hover:border-indigo-500/50 transition-colors">
          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              <Award size={14} />
            </div>
            <span>Malulen vs Erken Emeklilik</span>
          </h3>
          <ul className="text-xs text-[#CBD5E1] space-y-3 leading-relaxed font-medium">
            <li className="p-3 bg-[#0B1220] rounded border border-[#1E293B]">
              <strong className="text-indigo-300 block mb-1">Malulen Emeklilik:</strong> Sonradan %60+ kayıp yaşayanlara tanınır. Emekli olan kişi tekrar sigortalı çalışamaz, çalışırsa aylığı kesilir.
            </li>
            <li className="p-3 bg-[#0B1220] rounded border border-[#1E293B]">
              <strong className="text-indigo-300 block mb-1">Engelli Erken Emekliliği:</strong> Hem emekli maaşını alıp hem de Sosyal Güvenlik Destek Primi (SGDP) ödeyerek çalışmaya devam edebilirler.
            </li>
          </ul>
        </div>

        <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-5 shadow-lg group hover:border-indigo-500/50 transition-colors">
          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              <FileText size={14} />
            </div>
            <span>Başvuru Adımları</span>
          </h3>
          <div className="space-y-2">
            {[
              "01.10.2008 öncesi 4A'lı iseniz vergi dairesinden onaylı yazınızı alın.",
              "e-Devlet üzerinden 'Gelir, Aylık, Ödenek Talep Belgesi' ile online müracaat edin.",
              "İşyerinizden 'Emeklilik Nedeniyle İşten Ayrılış' (Kod 08) düzenlemesini isteyin.",
              "Başvuruyu takip eden ay başından itibaren emekli maaşınız birikmeye başlar."
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 bg-[#0B1220] rounded border border-[#1E293B]">
                <span className="text-indigo-400 font-black font-mono text-sm leading-none mt-0.5">{idx + 1}.</span>
                <p className="text-xs text-[#CBD5E1] font-medium leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
