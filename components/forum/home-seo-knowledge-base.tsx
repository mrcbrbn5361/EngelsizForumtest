import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Calculator, 
  Car, 
  Calendar, 
  HeartHandshake, 
  Briefcase, 
  HelpCircle, 
  ShieldCheck, 
  Scale, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Award,
  AlertTriangle
} from 'lucide-react';

export default function HomeSeoKnowledgeBase() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Balthazard formülü nedir ve birden fazla engel oranı nasıl hesaplanır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Balthazard formülü, birden fazla hastalığı veya engeli bulunan bireylerin engel oranlarının doğrudan toplanması yerine, kalan sağlıklı vücut yüzdesi üzerinden kademeli olarak hesaplanmasını sağlayan resmi yöntemdir. Formül: A + [B * (100 - A) / 100] şeklinde uygulanır. En yüksek engel oranı temel alınarak diğer oranlar sırayla eklenir. Kişi 65 yaş ve üzerinde ise çıkan nihai Balthazard oranına ek olarak yüzde 10 ilave edilir."
        }
      },
      {
        "@type": "Question",
        "name": "2026 yılı ÖTV muafiyetli sıfır araç alım üst limiti ne kadardır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "2026 yılı için belirlenen ÖTV istisna üst limiti, her yıl Resmi Gazete'de yayımlanan Yeniden Değerleme Oranı (YDO) uyarınca 2.290.200 TL (2 milyon 290 bin 200 Türk Lirası) olarak uygulanmaktadır. Bu limit vergiler (ÖTV ve KDV) dahil azami anahtar teslim satış fiyatını kapsar."
        }
      },
      {
        "@type": "Question",
        "name": "Yüzde 90 altı engelliler ÖTV muafiyetinden nasıl yararlanabilir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yüzde 90'ın altında engel oranına sahip olanların ÖTV'siz araç alabilmesi için ortopedik engele (hareket ettirici aksamda kısıtlılık) sahip olması, engelli sağlık kurulu raporunda 'özel tertibatlı araç kullanması gerekir' veya 'sadece hareket ettirici aksamda özel tertibatlı taşıt kullanabilir' ibaresinin bulunması ve yeni tip engelli sürücü belgesinde ilgili tertibat kodlarının (10.02, 20.01, 35.03 vb.) yer alması zorunludur."
        }
      },
      {
        "@type": "Question",
        "name": "Engelli erken emeklilikte yaş şartı aranır mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır. 5510 Sayılı Kanunun 28. maddesi ve 506 Sayılı Kanunun mülga hükümlerine göre engellilik sebebiyle erken emeklilik hakkından yararlanan sigortalı çalışanlarda yaş şartı aranmaz. Yalnızca sigortalılık başlangıç tarihi, engel oranı (%40-%59, %60-%79, %80+) ve prim ödeme gün sayısı kriterlerinin tamamlanması yeterlidir."
        }
      },
      {
        "@type": "Question",
        "name": "Evde bakım maaşı bağlanabilmesi için hane gelir şartı nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "2828 Sayılı Sosyal Hizmetler Kanununa göre evde bakım yardımından yararlanabilmek için iki temel şart aranır: Birincisi, sağlık kurulu raporunda 'Tam Bağımlı' (çocuklar için ÇÖZGER'de Çok İleri Düzeyde veya Belirgin Özel Gereksinim) ibaresinin bulunması; ikincisi, hane içinde yaşayan tüm fertlerin toplam aylık net gelirinin kişi başına bölündüğünde net asgari ücretin 2/3'ünden az olması gerekmektedir."
        }
      },
      {
        "@type": "Question",
        "name": "2022 sayılı Kanun kapsamındaki engelli aylığı kimlere verilir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sosyal güvencesi (SGK, Bağ-Kur, Emekli Sandığı) bulunmayan veya SGK'dan gelir/aylık almayan, en az %40 engelli sağlık kurulu raporuna sahip ve Sosyal Yardımlaşma ve Dayanışma Vakfı (SYDV) muhtaçlık değerlendirmesinde hane içi kişi başı geliri net asgari ücretin 1/3'ünden az olan 18 yaşını doldurmuş Türkiye Cumhuriyeti vatandaşlarına verilir."
        }
      },
      {
        "@type": "Question",
        "name": "Engelli çalışanların gelir vergisi indirimi maaşa nasıl yansır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "193 Sayılı Gelir Vergisi Kanununun 31. maddesi gereğince yetkili vergi dairesinden onaylı vergi indirim belgesine sahip olan 1., 2. ve 3. derece engelli personelin brüt maaş matrahından ilgili dereceye ait indirim tutarı düşülür. Bu sayede çalışandan daha az gelir vergisi kesilir ve aradaki fark doğrudan net maaşa nakit kazanç olarak yansır."
        }
      },
      {
        "@type": "Question",
        "name": "Engelli kamu personeli ve işçilerin idari izin hakları nelerdir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Başbakanlık ve Cumhurbaşkanlığı genelgeleri uyarınca, olumsuz hava koşulları (kar yağışı, yoğun buzlanma, aşırı sıcak vb.) nedeniyle kamuda mülki amirler tarafından hamile ve engelli kamu çalışanlarına idari izin verilir. Ayrıca 3 Aralık Dünya Engelliler Günü ile 10-16 Mayıs Engelliler Haftasının ilk günü tüm engelli kamu personeli idari izinli sayılır."
        }
      }
    ]
  };

  return (
    <section 
      id="engelsiz-mevzuat-rehberi" 
      className="mt-8 space-y-6 text-slate-800 antialiased"
      aria-labelledby="mevzuat-portal-title"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Ana Başlık ve Giriş Alanı */}
      <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
        <div className="xf-block-header bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-black uppercase text-[13px] sm:text-sm tracking-wider py-3 px-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-amber-300 shrink-0" />
            <h2 id="mevzuat-portal-title" className="m-0 text-white font-black text-[13px] sm:text-sm tracking-wide">
              2026 ENGELLİ HAKLARI, MEVZUAT VE RESMİ HESAPLAMA KILAVUZU
            </h2>
          </div>
          <span className="text-[10px] bg-black/20 text-sky-200 font-bold px-2 py-0.5 rounded border border-white/10 hidden sm:inline-block">
            Resmi Gazete &amp; SGK Uyumlu
          </span>
        </div>

        <div className="p-4 sm:p-6 text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4">
          <p className="font-normal text-slate-700">
            <strong>EngelsizForum</strong>, Türkiye&apos;deki engelli bireylerin, hasta ve bakıma muhtaç yakınlarının, özel gereksinimli çocuk sahibi ailelerin (ÇÖZGER) sosyal güvenlik haklarını, vergi muafiyetlerini ve hukuki güvencelerini hiçbir hak kaybı yaşamadan öğrenebilmeleri için hazırlanmış bağımsız ve tam erişilebilir (%100 WCAG 2.1 AAA) başvuru merkezidir.
          </p>
          <p className="font-normal text-slate-700">
            Aşağıdaki kapsamlı rehberde; <strong>Balthazard formülü hesaplaması</strong>, <strong>2026 ÖTV araç istisnası üst limiti</strong>, <strong>engelli erken emeklilik tabloları</strong>, <strong>evde bakım maaşı gelir testi</strong>, <strong>2022 engelli aylığı şartları</strong>, <strong>E-KPSS atamaları</strong> ve <strong>Gelir Vergisi Kanunu 31. madde sakatlık indirimi</strong> hakkında güncel yasal düzenlemeler detaylı olarak açıklanmıştır.
          </p>
        </div>
      </div>

      {/* Bölüm 1 & 2: Balthazard + ÖTV 2026 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Kutu 1: Balthazard ve Sağlık Raporları */}
        <article className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="bg-[#123652] text-white py-2.5 px-3.5 border-b border-[#0f2e46] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator size={15} className="text-sky-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white m-0">
                  Balthazard Formülü ve Sağlık Kurulu Raporu (ESKR / ÇÖZGER)
                </h3>
              </div>
            </div>

            <div className="p-4 sm:p-5 text-xs text-slate-700 space-y-3 leading-relaxed">
              <p>
                20 Şubat 2019 tarih ve 30692 sayılı Resmî Gazete&apos;de yayımlanan <em>Erişkinler İçin Engellilik Değerlendirmesi Hakkında Yönetmelik</em> hükümleri gereğince birden fazla teşhisi bulunan bireylerin engel oranları aritmetik olarak doğrudan toplanamaz. Bunun yerine uluslararası tıp standartlarına dayanan <strong>Balthazard Formülü (Ek-2)</strong> uygulanır.
              </p>
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm font-mono text-[11px] text-slate-800">
                <strong>Formül Mantığı:</strong> A + [ B &times; (100 - A) / 100 ]<br />
                <em>Örnek:</em> %50 kardiyovasküler engel ve %40 ortopedik engel doğrudan %90 etmez; formüle göre 50 + [40 &times; (100 - 50) / 100] = <strong>%70 nihai oran</strong> olarak rapora yansır.
              </div>

              <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                <li><strong>65 Yaş Kuralı:</strong> Birey 65 yaşını doldurmuşsa hesaplanan nihai Balthazard oranına ilave %10 eklenir.</li>
                <li><strong>ÇÖZGER Dönemi:</strong> 18 yaş altı çocuklar için yüzde yerine özel gereksinim alanları (ÖKGV, ÇÖGV, BÖGV vb.) esas alınır.</li>
                <li><strong>Rapor İtirazı:</strong> Sağlık raporuna itiraz İl Sağlık Müdürlüğüne yapılır; hasta Hakem Hastaneye sevk edilir.</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <Link 
              href="/hesaplama/balthazard" 
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#185886] hover:text-[#104f75] hover:underline"
            >
              <span>Canlı Balthazard Hesaplama Robotunu Kullan</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </article>

        {/* Kutu 2: 2026 ÖTV ve MTV Muafiyetli Araç Alımı */}
        <article className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="bg-[#123652] text-white py-2.5 px-3.5 border-b border-[#0f2e46] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car size={15} className="text-emerald-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white m-0">
                  2026 ÖTV &amp; MTV Muafiyetli Araç Alım Şartları
                </h3>
              </div>
            </div>

            <div className="p-4 sm:p-5 text-xs text-slate-700 space-y-3 leading-relaxed">
              <p>
                4760 Sayılı Özel Tüketim Vergisi Kanununun 7. maddesi uyarınca engelli vatandaşlar sıfır kilometre otomobil alımlarında ÖTV muafiyetinden yararlanır. <strong>2026 yılı için belirlenen ÖTV istisna üst sınırı 2.290.200 TL</strong>&apos;dir.
              </p>

              <div className="space-y-2">
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-sm text-emerald-950 text-[11px]">
                  <strong>%90 ve Üzeri Engellilik Durumu:</strong> Raporda özel tertibat şartı aranmaksızın araç alınabilir. Araç sahibi engelli bireydir; kullanım için vasi ek kararı veya 1. dereceye kadar akrabalık/şoför kaydı uygulanır.
                </div>
                <div className="p-2.5 bg-sky-50/70 border border-sky-200 rounded-sm text-sky-950 text-[11px]">
                  <strong>%90 Altı Ortopedik Engellilik:</strong> Yalnızca hareket ettirici aksamda (sol/sağ kol veya bacak) fiziksel kısıtlılık bulunan ve ehliyetinde tertibat kodları bulunan bireyler bizzat kullanmak şartıyla ÖTV&apos;siz araç alabilir. Otomatik vites, sol bacak engellilerde mevzuat gereği doğrudan tertibat sayılır.
                </div>
              </div>

              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li><strong>5 Yıl Şerhi:</strong> Alınan araç 5 yıl dolmadan satılamaz veya devredilemez; devir halinde istisna edilen ÖTV tahsil edilir.</li>
                <li><strong>MTV İstisnası:</strong> ÖTV muafiyetli alınan veya sonradan tertibat takılan araçlar yıllık MTV&apos;den tamamen muaftır.</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <Link 
              href="/hesaplama/otv" 
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#185886] hover:text-[#104f75] hover:underline"
            >
              <span>2026 ÖTV Muafiyeti ve Fiyat İndirimi Hesaplayıcı</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </article>

      </div>

      {/* Bölüm 3 & 4: Emeklilik + Sosyal Yardımlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Kutu 3: Kademeli Erken Emeklilik */}
        <article className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="bg-[#123652] text-white py-2.5 px-3.5 border-b border-[#0f2e46] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-amber-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white m-0">
                  SGK Engelli Erken Emeklilik &amp; Malullük Kriterleri
                </h3>
              </div>
            </div>

            <div className="p-4 sm:p-5 text-xs text-slate-700 space-y-3 leading-relaxed">
              <p>
                Engelli çalışanlar, normal sigortalılara kıyasla <strong>yaş haddine tabi tutulmaksızın</strong> yalnızca sigortalılık süresi ve prim gün sayısı şartlarını tamamlayarak emekli olabilirler.
              </p>

              <div className="border border-slate-200 rounded-sm overflow-hidden text-[11px]">
                <table className="w-full text-left divide-y divide-slate-200">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2">Engel Derecesi</th>
                      <th className="p-2">Gerekli Süre</th>
                      <th className="p-2">Prim Gün Sayısı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-2 font-semibold">1. Derece (%80+)</td>
                      <td className="p-2">15 Yıl</td>
                      <td className="p-2">3600 - 3960 Gün</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">2. Derece (%60-%79)</td>
                      <td className="p-2">16 - 18 Yıl</td>
                      <td className="p-2">3680 - 4160 Gün</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">3. Derece (%40-%59)</td>
                      <td className="p-2">18 - 20 Yıl</td>
                      <td className="p-2">4000 - 4400 Gün</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-600">
                <strong>01.10.2008 Miladı:</strong> Bu tarihten önce işe başlayan 4A çalışanları için Vergi İndirimi Belgesi zorunludur; sonrasında başlayanlar için doğrudan SGK Sağlık Kurulu tespiti esas alınır.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <Link 
              href="/hesaplama/erken-emeklilik" 
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#185886] hover:text-[#104f75] hover:underline"
            >
              <span>Erken Emeklilik ve Prim Günü Sorgulama Robotu</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </article>

        {/* Kutu 4: Evde Bakım ve 2022 Maaşları */}
        <article className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="bg-[#123652] text-white py-2.5 px-3.5 border-b border-[#0f2e46] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake size={15} className="text-rose-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white m-0">
                  Evde Bakım Yardımı &amp; 2022 Engelli Maaşı
                </h3>
              </div>
            </div>

            <div className="p-4 sm:p-5 text-xs text-slate-700 space-y-3 leading-relaxed">
              <p>
                Aile ve Sosyal Hizmetler Bakanlığı tarafından ödenen sosyal yardımlarda başvuru kriterleri ve hane gelir testleri katı kurallara bağlanmıştır:
              </p>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[11px]">
                  <strong className="text-slate-900">Evde Bakım Maaşı (2828 Sayılı Kanun):</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-600">
                    <li>Raporda mutlaka <strong>&quot;Tam Bağımlı&quot;</strong> ibaresi aranır.</li>
                    <li>Hane içinde kişi başına düşen aylık net gelir, net asgari ücretin <strong>2/3&apos;ünden az</strong> olmalıdır.</li>
                    <li>Ödeme doğrudan bakımı üstlenen akraba veya yasal vasiye yapılır.</li>
                  </ul>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[11px]">
                  <strong className="text-slate-900">2022 Sayılı Kanun Engelli Aylığı:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-600">
                    <li>SGK güvencesi bulunmayan ve en az %40 oranlı raporu olan vatandaşlara ödenir.</li>
                    <li>Muhtaçlık Gelir Sınırı: Hane içinde kişi başına düşen aylık gelir net asgari ücretin <strong>1/3&apos;ünden az</strong> olmalıdır.</li>
                    <li>%40-%69 oranı ile %70 üzeri oranlar için farklı katsayılar uygulanır.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3">
            <Link 
              href="/hesaplama/evde-bakim" 
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#185886] hover:text-[#104f75] hover:underline"
            >
              <span>Evde Bakım Gelir Testi</span>
              <ArrowRight size={13} />
            </Link>
            <span className="text-slate-300">•</span>
            <Link 
              href="/hesaplama/engelli-ayligi" 
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#185886] hover:text-[#104f75] hover:underline"
            >
              <span>2022 Maaş Hesaplama</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </article>

      </div>

      {/* Bölüm 5: E-KPSS, Vergi İndirimi ve Kamuda İstihdam */}
      <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
        <div className="bg-[#123652] text-white py-2.5 px-3.5 border-b border-[#0f2e46] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={15} className="text-amber-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white m-0">
              E-KPSS, Kamuda İstihdam Kotası ve Çalışma Yaşamı Güvenceleri
            </h3>
          </div>
        </div>

        <div className="p-4 sm:p-6 text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-sm space-y-1.5">
              <h4 className="font-bold text-xs text-[#185886] uppercase m-0 flex items-center gap-1.5">
                <Award size={14} className="text-amber-600" />
                E-KPSS ve Kura Tercihleri
              </h4>
              <p className="text-xs text-slate-600 leading-normal">
                ÖSYM tarafından iki yılda bir düzenlenen E-KPSS; ortaöğretim, ön lisans ve lisans mezunları için merkezi sınavdır. İlkokul/ortaokul mezunları için kura usulü kamuda memur istihdamı sağlanır.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-sm space-y-1.5">
              <h4 className="font-bold text-xs text-[#185886] uppercase m-0 flex items-center gap-1.5">
                <Scale size={14} className="text-[#185886]" />
                İş Kanunu 30. Madde Kotası
              </h4>
              <p className="text-xs text-slate-600 leading-normal">
                50 veya daha fazla işçi çalıştıran özel sektör işyerlerinde %3, kamu işyerlerinde ise %4 oranında engelli işçi istihdamı yasal zorunluluktur. Kontenjan açığı için İŞKUR cezai yaptırım uygular.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-sm space-y-1.5">
              <h4 className="font-bold text-xs text-[#185886] uppercase m-0 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                İş Kanunu 24/I-a Haklı Fesih
              </h4>
              <p className="text-xs text-slate-600 leading-normal">
                Sağlık durumu işin niteliğinden ötürü işçinin sağlığını veya yaşamını tehlikeye düşürüyorsa, engelli işçi ihbar süresine uymaksızın iş sözleşmesini haklı nedenle feshedip kıdem tazminatını tam alır.
              </p>
            </div>

          </div>

          <p className="text-xs text-slate-600">
            <strong>GVK 31. Madde Gelir Vergisi İndirimi:</strong> Yetkili vergi dairelerine başvurarak 1. derece (en az %80), 2. derece (en az %60) ve 3. derece (en az %40) vergi indirimi alan ücretlilerin brüt matrahından ilgili tutar indirilerek her ay net maaşlarına doğrudan ek nakit kazanç sağlanır.
          </p>
        </div>
      </div>

      {/* Bölüm 6: Sıkça Sorulan Sorular (SSS) Accordion/Liste */}
      <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
        <div className="xf-block-header bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-black uppercase text-[12px] sm:text-xs tracking-wider py-2.5 px-3.5 flex items-center gap-2">
          <HelpCircle size={15} className="text-amber-300" />
          <h3 className="m-0 text-white font-black text-xs uppercase tracking-wide">
            ENGELLİ HAKLARI VE MEVZUATI HAKKINDA SIKÇA SORULAN SORULAR (SSS)
          </h3>
        </div>

        <div className="p-4 sm:p-6 divide-y divide-slate-200">
          
          <details className="py-3 group" open>
            <summary className="font-bold text-xs sm:text-sm text-[#185886] cursor-pointer flex items-center justify-between list-none">
              <span>1. Balthazard formülü nedir ve birden fazla engel oranı nasıl birleştirilir?</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-[#185886]">
              Balthazard formülü, birden fazla hastalığı bulunan bireylerin engel yüzdelerinin doğrudan toplanması yerine kalan sağlıklı vücut oranı üzerinden orantısal olarak eklenmesini sağlar. Formül: A + [B &times; (100 - A) / 100] şeklindedir. Birey 65 yaş ve üzerinde ise nihai orana ek %10 yaşlılık payı ilave edilir.
            </div>
          </details>

          <details className="py-3 group">
            <summary className="font-bold text-xs sm:text-sm text-[#185886] cursor-pointer flex items-center justify-between list-none">
              <span>2. 2026 yılı ÖTV muafiyetli sıfır araç alım üst limiti ne kadardır?</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-[#185886]">
              2026 takvim yılı için Resmi Gazete&apos;de yayımlanan yeniden değerleme oranına göre belirlenen ÖTV muafiyetli araç üst sınırı <strong>2.290.200 TL</strong>&apos;dir. Bu tavan tutar vergiler (ÖTV ve KDV) dahil azami brüt liste fiyatını temsil eder.
            </div>
          </details>

          <details className="py-3 group">
            <summary className="font-bold text-xs sm:text-sm text-[#185886] cursor-pointer flex items-center justify-between list-none">
              <span>3. %90 altı ortopedik engelliler nasıl ÖTV&apos;siz otomobil alabilir?</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-[#185886]">
              Engelli bireyin hareket ettirici aksamında (sağ/sol el, kol veya bacak) kalıcı bir ortopedik kısıtlılık bulunması, sağlık kurulu raporunda &quot;hareket ettirici aksamda özel tertibatlı taşıt kullanması gerekir&quot; ifadesinin yer alması ve sürücü belgesinde tertibat kodlarının (10.02, 20.01, 35.03 vb.) bulunması zorunludur. Sol bacak engellilerde otomatik vites doğrudan tertibat kabul edilir.
            </div>
          </details>

          <details className="py-3 group">
            <summary className="font-bold text-xs sm:text-sm text-[#185886] cursor-pointer flex items-center justify-between list-none">
              <span>4. Engelli erken emeklilikte yaş şartı var mıdır?</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-[#185886]">
              Hayır, engellilik gerekçesiyle kademeli erken emeklilikte yaş şartı tamamen aranmaz. Bireyin sigortalılık süresini (15 ila 20 yıl) ve gerekli prim gün sayısını (3600 ila 4400 gün) doldurması emeklilik hakkı kazanması için yeterlidir.
            </div>
          </details>

          <details className="py-3 group">
            <summary className="font-bold text-xs sm:text-sm text-[#185886] cursor-pointer flex items-center justify-between list-none">
              <span>5. Evde bakım aylığı için aranan gelir kriteri ne kadardır?</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-[#185886]">
              2828 Sayılı Kanun gereğince, hanede yaşayan tüm bireylerin toplam aylık net gelirinin kişi başına düşen miktarı, net asgari ücretin <strong>2/3&apos;ünden az</strong> olmalıdır. Ayrıca raporun &quot;Tam Bağımlı&quot; (ÇÖZGER&apos;de Çok İleri Düzeyde / Belirgin Özel Gereksinim) olması zorunludur.
            </div>
          </details>

          <details className="py-3 group">
            <summary className="font-bold text-xs sm:text-sm text-[#185886] cursor-pointer flex items-center justify-between list-none">
              <span>6. 2022 engelli maaşı kime bağlanır ve gelir sınırı nedir?</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-[#185886]">
              SGK kapsamında herhangi bir geliri veya emekli maaşı bulunmayan, en az %40 engelli raporu olan ve Sosyal Yardımlaşma ve Dayanışma Vakfı (SYDV) gelir tespitinde hane kişi başı geliri net asgari ücretin <strong>1/3&apos;ünden az</strong> olan 18 yaşını doldurmuş vatandaşlara bağlanır.
            </div>
          </details>

          <details className="py-3 group">
            <summary className="font-bold text-xs sm:text-sm text-[#185886] cursor-pointer flex items-center justify-between list-none">
              <span>7. Gelir vergisi indirimi alan çalışanın maaşı nasıl artar?</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-[#185886]">
              193 Sayılı Gelir Vergisi Kanununun 31. maddesine göre engelli çalışanın brüt bordro matrahından dereceye göre belirlenen sakatlık indirimi düşülür. Vergi matrahı küçüldüğü için kesilen gelir vergisi azalır ve oluşan net fark doğrudan çalışanın banka hesabına yansıtılır.
            </div>
          </details>

          <details className="py-3 group">
            <summary className="font-bold text-xs sm:text-sm text-[#185886] cursor-pointer flex items-center justify-between list-none">
              <span>8. Engelli vatandaşlara tanınan belediye ve ulaşım indirimleri nelerdir?</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-[#185886]">
              Şehir içi toplu taşıma araçları (otobüs, metro, tramvay, vapur) %40 ve üzeri engelliler ile refakatçilerine (Ağır Engelli / Tam Bağımlı ibareli raporlarda) ücretsizdir. TCDD trenlerinde biletler tamamen ücretsiz olup Türk Hava Yolları (THY) iç hatlarda %20, dış hatlarda %25 indirim sağlar. Belediyeler mesken su faturalarında en az %50 indirim uygulamaktadır.
            </div>
          </details>

        </div>
      </div>

      {/* Bölüm 7: Engelli Hakları & Mevzuat Terimler Sözlüğü (Semantic LSI Keywords) */}
      <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
        <div className="bg-[#123652] text-white py-2.5 px-3.5 border-b border-[#0f2e46] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-sky-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white m-0">
              Mevzuat ve Engellilik Terimler Sözlüğü (LSI &amp; Kısaltmalar)
            </h3>
          </div>
        </div>

        <div className="p-4 sm:p-5 text-xs text-slate-600 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">ESKR:</strong>
              Erişkinler İçin Engellilik Sağlık Kurulu Raporu.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">ÇÖZGER:</strong>
              Çocuklar İçin Özel Gereksinim Raporu (18 yaş altı).
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">Balthazard:</strong>
              Birden çok engel oranını birleştirme resmi formülü.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">ÖTV İstisnası:</strong>
              Özel Tüketim Vergisi 2026 sıfır araç alım muafiyeti.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">MTV Muafiyeti:</strong>
              Engelli araçları için Motorlu Taşıtlar Vergisi muafiyeti.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">GVK 31:</strong>
              193 Sayılı Gelir Vergisi Kanunu Sakatlık İndirimi maddesi.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">E-KPSS:</strong>
              Engelli Kamu Personeli Seçme Sınavı ve kura ataması.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">SYDV:</strong>
              Sosyal Yardımlaşma ve Dayanışma Vakfı muhtaçlık testi.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">SUT:</strong>
              SGK Sağlık Uygulama Tebliği ortez/protez geri ödemeleri.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">RAM Raporu:</strong>
              Rehberlik ve Araştırma Merkezi özel eğitim seans desteği.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">Tam Bağımlı:</strong>
              Evde bakım maaşı ve refakatçi kartı için aranan ibare.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-slate-900 block font-bold">WCAG AAA:</strong>
              Web İçeriği Erişilebilirlik Kılavuzu en üst uyum seviyesi.
            </div>
          </div>
        </div>
      </div>

      {/* Bölüm 8: Türkiye 81 İl Engelli Hizmetleri & Hakem Hastaneler Dizini */}
      <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
        <div className="bg-[#123652] text-white py-2.5 px-3.5 border-b border-[#0f2e46] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-amber-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white m-0">
              Türkiye 81 İl Engelli Hizmetleri, Yetkili Hakem Hastaneler &amp; SYDV Ağları
            </h3>
          </div>
          <span className="text-[10px] text-sky-200 font-semibold hidden sm:inline-block">
            Merkez: İstanbul, Türkiye
          </span>
        </div>

        <div className="p-4 sm:p-6 text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
          <p>
            EngelsizForum, merkezi <strong>İstanbul</strong> olmak üzere Türkiye&apos;nin 81 ilindeki tüm engelli vatandaşların yerel sağlık kurullarına, hakem hastanelerine, ilçe kaymakamlıkları bünyesindeki Sosyal Yardımlaşma ve Dayanışma Vakıflarına (SYDV) ve belediye engelliler merkezlerine doğrudan erişmesini sağlar:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm space-y-1.5">
              <strong className="text-[#185886] font-bold block">Büyükşehir Merkezleri (İstanbul, Ankara, İzmir):</strong>
              <p className="text-slate-600">
                İstanbul Çam ve Sakura, Cemil Taşcıoğlu (Okmeydanı), Haydarpaşa Numune ve Bakırköy Dr. Sadi Konuk; Ankara Bilkent ve Etlik Şehir Hastaneleri; İzmir Bayraklı Şehir ve Tepecik Eğitim Araştırma Hastaneleri yetkili nihai hakem hastanelerdir.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm space-y-1.5">
              <strong className="text-[#185886] font-bold block">Marmara, Ege ve Akdeniz İlleri:</strong>
              <p className="text-slate-600">
                Bursa, Kocaeli, Balıkesir, Çanakkale, Tekirdağ, Edirne, Sakarya; Manisa, Aydın, Denizli, Muğla; Antalya, Adana, Mersin, Hatay, Isparta illerindeki Şehir Hastaneleri ve Devlet Hastaneleri engelli sağlık heyeti kabul etmektedir.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm space-y-1.5">
              <strong className="text-[#185886] font-bold block">İç, Doğu, Güneydoğu &amp; Karadeniz İlleri:</strong>
              <p className="text-slate-600">
                Konya, Kayseri, Eskişehir, Sivas, Samsun, Trabzon, Ordu, Rize; Gaziantep, Diyarbakır, Şanlıurfa, Mardin, Batman; Erzurum, Van, Malatya, Elazığ illerinde 973 ilçe kaymakamlığı 2022 maaşı ve evde bakım başvurularını yürütmektedir.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600">81 İl Tam Kapsamı:</span>
            <div className="text-[10px] text-slate-500 font-mono flex flex-wrap gap-1 leading-relaxed">
              Adana (01), Adıyaman (02), Afyon (03), Ağrı (04), Amasya (05), Ankara (06), Antalya (07), Artvin (08), Aydın (09), Balıkesir (10), Bilecik (11), Bingöl (12), Bitlis (13), Bolu (14), Burdur (15), Bursa (16), Çanakkale (17), Çankırı (18), Çorum (19), Denizli (20), Diyarbakır (21), Edirne (22), Elazığ (23), Erzincan (24), Erzurum (25), Eskişehir (26), Gaziantep (27), Giresun (28), Gümüşhane (29), Hakkari (30), Hatay (31), Isparta (32), Mersin (33), İstanbul (34), İzmir (35), Kars (36), Kastamonu (37), Kayseri (38), Kırklareli (39), Kırşehir (40), Kocaeli (41), Konya (42), Kütahya (43), Malatya (44), Manisa (45), K.Maraş (46), Mardin (47), Muğla (48), Muş (49), Nevşehir (50), Niğde (51), Ordu (52), Rize (53), Sakarya (54), Samsun (55), Siirt (56), Sinop (57), Sivas (58), Tekirdağ (59), Tokat (60), Trabzon (61), Tunceli (62), Şanlıurfa (63), Uşak (64), Van (65), Yozgat (66), Zonguldak (67), Aksaray (68), Bayburt (69), Karaman (70), Kırıkkale (71), Batman (72), Şırnak (73), Bartın (74), Ardahan (75), Iğdır (76), Yalova (77), Karabük (78), Kilis (79), Osmaniye (80), Düzce (81).
            </div>
          </div>
        </div>
      </div>

      {/* Bölüm 9: Resmi Kurumlar & Başvuru Merkezleri Rehberi */}
      <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
        <div className="bg-[#123652] text-white py-2.5 px-3.5 border-b border-[#0f2e46] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale size={15} className="text-emerald-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white m-0">
              Resmi Kurumlar, Başvuru Merkezleri &amp; Yetki Alanları Kılavuzu
            </h3>
          </div>
        </div>

        <div className="p-4 sm:p-6 text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-[#185886] font-bold block mb-1">Sosyal Güvenlik Kurumu (SGK):</strong>
              <p className="text-slate-600">
                5510 Sayılı Kanun erken emeklilik tahsisleri, maluliyet tespiti, SUT tekerlekli sandalye, biyonik protez, ortez ve işitme cihazı geri ödemelerini yönetir.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-[#185886] font-bold block mb-1">Gelir İdaresi Başkanlığı (GİB) &amp; Vergi Daireleri:</strong>
              <p className="text-slate-600">
                2026 yılı 2.290.200 TL üst limitli ÖTV muafiyeti onayı, GVK 31. madde sakatlık indirimi belgesi ve Motorlu Taşıtlar Vergisi (MTV) muafiyet işlemlerini sonuçlandırır.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-[#185886] font-bold block mb-1">Aile ve Sosyal Hizmetler Bakanlığı (SHM):</strong>
              <p className="text-slate-600">
                Tam Bağımlı evde bakım yardımı müracaatları, ulusal Engelli Kimlik Kartı basımı ve kamu alanları erişilebilirlik denetimlerini yürütür.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
              <strong className="text-[#185886] font-bold block mb-1">İŞKUR &amp; Milli Eğitim Bakanlığı (RAM):</strong>
              <p className="text-slate-600">
                İş Kanunu 30. madde istihdam kotaları (%3 özel, %4 kamu), engelli hibe destekleri ve RAM özel eğitim destek seansı raporlarını tanzim eder.
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
