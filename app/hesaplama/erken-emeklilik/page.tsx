'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Clock,
  ShieldAlert
} from 'lucide-react';

type InsuranceType = '4a' | '4b' | '4c'; // 4A: SSK, 4B: Bağ-Kur, 4C: Emekli Sandığı (Memur)

interface RetirementCondition {
  sigortalilikSuresiYil: number;
  primGunu: number;
  aciklama: string;
  vergiIndirimiZorunlu: boolean;
}

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
      <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-md shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs text-purple-950 leading-relaxed">
            <h2 className="font-bold text-sm text-purple-900 mb-1">
              Erken Emeklilikte 01.10.2008 Tarihi Neden Hayati Önem Taşır?
            </h2>
            <p>
              <strong>01.10.2008 öncesi SSK (4A) sigortalılar</strong> için emeklilikte yaş aranmaz ancak <strong>Gelir İdaresi Başkanlığı onaylı Vergi İndirim Belgesi</strong> almak kanunen zorunludur. 
              <strong>01.10.2008 sonrasında</strong> ilk defa sigortalı olanlarda ise vergi indirimi aranmaz; emeklilik müracaatı doğrudan SGK&apos;ya yapılır ve SGK Sağlık Kurulunca çalışma gücü kaybı tespiti yapılır.
            </p>
          </div>
        </div>
      </div>

      {/* Başlık ve Girdi Formu */}
      <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-purple-50 text-purple-700 flex items-center justify-center font-black">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Engelli Erken Emeklilik Şartları ve Kalan Süre Hesaplama
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Dayanak: 506 SK Geçici 18. Madde ve 5510 SK 28. Madde
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Yaş Şartı Yoktur
          </div>
        </div>

        {/* Girdi Formu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* İlk Sigorta Tescil Tarihi */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              İlk İşe Giriş / Sigorta Tarihi
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:outline-none focus:border-[#185886]"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Adınıza ilk primin yattığı gün
            </span>
          </div>

          {/* Sigorta Statüsü */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Sigorta Kolu (Statü)
            </label>
            <select
              value={insuranceType}
              onChange={(e) => setInsuranceType(e.target.value as InsuranceType)}
              className="w-full px-3 py-2.5 rounded border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#185886]"
            >
              <option value="4a">4A - SSK (Hizmet Akdiyle Çalışanlar)</option>
              <option value="4b">4B - Bağ-Kur (Esnaf / Kendi Adına Çalışanlar)</option>
              <option value="4c">4C - Emekli Sandığı (Kamu Görevlileri / Memurlar)</option>
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Son 2520 günün çoğunluğunun geçtiği statü
            </span>
          </div>

          {/* Engel Derecesi */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Engel Derecesi / Oranı
            </label>
            <select
              value={disabilityDegree}
              onChange={(e) => setDisabilityDegree(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2.5 rounded border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#185886]"
            >
              <option value={1}>1. Derece (%80 ve Üzeri)</option>
              <option value={2}>2. Derece (%60 - %79 Arası)</option>
              <option value={3}>3. Derece (%40 - %59 Arası)</option>
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Kurulca saptanan kayıp oranı
            </span>
          </div>

          {/* Mevcut Prim Günü */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Mevcut Ödenmiş Prim Günü
            </label>
            <input
              type="number"
              min="0"
              max="15000"
              value={currentPaidDays || ''}
              onChange={(e) => setCurrentPaidDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-3.5 py-2 rounded border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:outline-none focus:border-[#185886]"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              SGK hizmet dökümündeki toplam gün
            </span>
          </div>

        </div>
      </div>

      {/* HESAPLANAN ŞARTLAR VE EMEKLİLİK DURUMU */}
      {calculation && (
        <div className={`rounded-md border p-6 shadow-xs ${
          calculation.isReadyForRetirement 
            ? 'bg-emerald-50/70 border-emerald-300' 
            : 'bg-[#eef4f9] border-blue-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {calculation.isReadyForRetirement ? (
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#185886] text-white flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className={`text-base font-bold ${
                  calculation.isReadyForRetirement ? 'text-emerald-950' : 'text-slate-900'
                }`}>
                  {calculation.isReadyForRetirement 
                    ? 'TEBRİKLER: Engelli Erken Emeklilik Şartlarını Eksiksiz Tamamladınız!' 
                    : 'ERKEN EMEKLİLİK İÇİN GEREKLİ ŞARTLAR VE KALAN SÜRE'}
                </h2>

                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  calculation.isReadyForRetirement 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-blue-100 text-[#185886] border-blue-200'
                }`}>
                  {calculation.isReadyForRetirement ? 'Emekliliğe Hak Kazanıldı' : 'Şartlar Devam Ediyor'}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {calculation.isReadyForRetirement ? (
                  <>
                    Hem <strong>{calculation.reqYears} yıllık</strong> sigortalılık süresini hem de aranan <strong>{calculation.reqDays} prim gününü</strong> başarıyla doldurdunuz. 
                    {calculation.isTaxDiscountMandatory && ' Vergi indirim belgeniz onaylıysa'} dilediğiniz zaman SGK Tahsis Servisi&apos;ne veya e-Devlet üzerinden Gelir/Aylık/Ödenek Talep Belgesi ile emeklilik başvurusu yapabilirsiniz.
                  </>
                ) : (
                  <>
                    Sigorta giriş tarihinize ({startDate}) ve {disabilityDegree}. derece engel durumunuza göre 
                    emekli olabilmeniz için <strong>{calculation.reqYears} yıl sigortalılık süresi</strong> ve <strong>{calculation.reqDays} prim günü</strong> şartı aranmaktadır.
                  </>
                )}
              </p>

              {/* 4'lü İstatistik Paneli */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/80 text-xs">
                
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Gereken Sigorta Süresi</span>
                  <span className="font-black text-slate-900 text-sm">
                    {calculation.reqYears} Yıl
                  </span>
                  <span className={`text-[10px] block mt-0.5 font-semibold ${calculation.isYearsSatisfied ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {calculation.completionDate} ({calculation.remainingYearsText})
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Gereken Prim Günü</span>
                  <span className="font-black text-[#185886] text-sm">
                    {calculation.reqDays} Gün
                  </span>
                  <span className={`text-[10px] block mt-0.5 font-semibold ${calculation.isDaysSatisfied ? 'text-emerald-700' : 'text-amber-700'}`}>
                    Mevcut: {currentPaidDays} gün
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Kalan Prim İhtiyacı</span>
                  <span className={`font-black text-sm ${calculation.remainingDays === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {calculation.remainingDays === 0 ? 'Tamamlandı (0 Gün)' : `${calculation.remainingDays} Gün Kaldı`}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {calculation.remainingDays > 0 ? `Yaklaşık ${(calculation.remainingDays / 30).toFixed(1)} ay` : 'Prim yeterli'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Vergi İndirimi Şartı</span>
                  <span className={`font-black text-sm ${calculation.isTaxDiscountMandatory ? 'text-purple-800' : 'text-slate-700'}`}>
                    {calculation.isTaxDiscountMandatory ? 'ZORUNLU (4A Öncesi)' : 'Aranmaz (5510 K.)'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {calculation.isTaxDiscountMandatory ? 'Maliye onayı gerekir' : 'SGK Kurulu sevk eder'}
                  </span>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* YASAL MEVZUAT VE DETAY BİLGİLENDİRME BLOKLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="bg-white rounded-md border border-slate-200 p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#185886]" />
            <span>Engelli Erken Emekliliği ile Malulen Emeklilik Farkı</span>
          </h3>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li>
              • <strong>Malulen Emeklilik:</strong> Çalışma gücünün en az %60&apos;ını sigortalı olduktan sonra kaybeden ve 10 yıl sigortalılık + 1800 gün primi olanlara bağlanır. Başkasının bakımına muhtaç ise 10 yıl şartı aranmaz. Ancak malul maaşı alan kişi tekrar sigortalı çalışamaz, çalışırsa aylığı kesilir!
            </li>
            <li>
              • <strong>Engelli Erken Emekliliği:</strong> Doğuştan veya sonradan engelli olanlara tanınır. Emekli olduktan sonra <strong>Sosyal Güvenlik Destek Primi (SGDP) ödeyerek hem emekli maaşını alıp hem de çalışmaya devam edebilir</strong> (Aylığı kesilmez).
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-purple-700" />
            <span>Emeklilik Başvurusunda İzlenecek Adımlar</span>
          </h3>
          <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <li>• 1. 01.10.2008 öncesi SSK&apos;lı iseniz vergi dairesinden onaylı vergi indirimi yazınızın çıktısını alın.</li>
            <li>• 2. e-Devlet Kapısı üzerinden &quot;Gelir, Aylık, Ödenek Talep Belgesi&quot; doldurarak doğrudan online müracaat edin.</li>
            <li>• 3. İşyerinizden &quot;Emeklilik Nedeniyle İşten Ayrılış Bildirgesi&quot; (Kod 08) düzenlenmesini talep edin.</li>
            <li>• 4. Başvurunuzu takip eden ay başından itibaren emekli maaşınız birikmeye ve hesaplanmaya başlar.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
