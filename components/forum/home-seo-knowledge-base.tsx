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
  ArrowRight
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
          "text": "2026 yılı için belirlenen ÖTV istisna üst limiti, her yıl Resmi Gazete'de yayımlanan Yeniden Değerleme Oranı (YDO) uyarınca 2.873.972 TL (2 milyon 290 bin 200 Türk Lirası) olarak uygulanmaktadır. Bu limit vergiler (ÖTV ve KDV) dahil azami anahtar teslim satış fiyatını kapsar."
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
          "text": "Başbakanlık ve Cumhurbaşkanlığı genelgeleri uyarınca, olumsuz hava koşulları nedeniyle kamuda mülki amirler tarafından hamile ve engelli kamu çalışanlarına idari izin verilir. Ayrıca 3 Aralık Dünya Engelliler Günü ile 10-16 Mayıs Engelliler Haftasının ilk günü tüm engelli kamu personeli idari izinli sayılır."
        }
      }
    ]
  };

  return (
    <section 
      id="engelsiz-mevzuat-rehberi" 
      className="border-t border-[#1E293B] pt-12 space-y-12 text-slate-300"
      aria-labelledby="mevzuat-portal-title"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Ana Başlık ve Giriş Alanı */}
      <div className="max-w-3xl space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 font-heading">
          <BookOpen size={14} className="text-indigo-400" />
          <span>Mevzuat ve Başvuru Kılavuzu</span>
        </div>
        <h2 id="mevzuat-portal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading">
          2026 Engelli Hakları, Balthazard ve Resmi Süreçler
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          EngelsizForum, Türkiye&apos;deki engelli bireylerin, hasta ve bakıma muhtaç yakınlarının ve özel gereksinimli çocuk sahibi ailelerin (ÇÖZGER) sosyal güvenlik haklarını, vergi istisnalarını ve hukuki güvencelerini hiçbir hak kaybı yaşamadan öğrenebilmeleri için hazırlanmış bağımsız açık bilgi merkezidir.
        </p>
      </div>

      {/* Bölüm 1 & 2: Balthazard + ÖTV 2026 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 pt-2">
        {/* Kutu 1: Balthazard */}
        <article className="space-y-4">
          <div className="border-b border-[#1E293B] pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-heading">
              <Calculator size={14} className="text-indigo-400" />
              <span>Balthazard Formülü (ESKR &amp; ÇÖZGER)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Ek-2</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Erişkinler İçin Engellilik Değerlendirmesi Yönetmeliği gereğince birden fazla teşhisi bulunan bireylerin engel oranları aritmetik olarak doğrudan toplanamaz. Bunun yerine uluslararası tıp standartlarına dayanan Balthazard Formülü uygulanır.
          </p>

          <div className="py-2 font-mono text-xs text-slate-200 border-l border-[#1E293B] pl-3 space-y-1 bg-[#111B2E]/60 p-2.5 rounded-sm">
            <div>Formül: A + [ B × (100 - A) / 100 ]</div>
            <div className="text-slate-400">Örnek: %50 ve %40 iki oran = %70 nihai Balthazard oranı.</div>
          </div>

          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 font-normal">
            <li><strong className="text-white">65 Yaş Kuralı:</strong> 65 yaşını dolduranlarda nihai orana ilave %10 yaşlılık payı eklenir.</li>
            <li><strong className="text-white">ÇÖZGER Dönemi:</strong> 18 yaş altı çocuklarda yüzde yerine özel gereksinim kademeleri esas alınır.</li>
            <li><strong className="text-white">İtiraz Süreci:</strong> Sağlık raporuna itiraz İl Sağlık Müdürlüğüne yapılır; Hakem Hastaneye sevk edilir.</li>
          </ul>

          <Link 
            href="/hesaplama" 
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors pt-1"
          >
            <span>Canlı Balthazard Robotunu Aç</span>
            <ArrowRight size={13} />
          </Link>
        </article>

        {/* Kutu 2: 2026 ÖTV */}
        <article className="space-y-4">
          <div className="border-b border-[#1E293B] pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-heading">
              <Car size={14} className="text-emerald-400" />
              <span>2026 ÖTV &amp; MTV İstisnası</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400">2.873.972 TL</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            4760 Sayılı Özel Tüketim Vergisi Kanununun 7. maddesi uyarınca engelli vatandaşlar sıfır kilometre otomobil alımlarında ÖTV muafiyetinden yararlanır. 2026 yılı için belirlenen ÖTV istisna tavanı 2.873.972 TL&apos;dir.
          </p>

          <div className="space-y-2 text-xs text-slate-300 font-normal">
            <div>
              <strong className="text-white">%90 ve Üzeri:</strong> Özel tertibat aranmaksızın araç alınabilir; kullanım için vasi veya mevzuata uygun şoför kaydı uygulanır.
            </div>
            <div>
              <strong className="text-white">%90 Altı Ortopedik:</strong> Yalnızca hareket ettirici aksamda kısıtlılığı ve ehliyetinde tertibat kodu bulunan bireyler bizzat kullanmak şartıyla yararlanabilir.
            </div>
          </div>

          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 font-normal">
            <li><strong className="text-white">5 Yıl Şerhi:</strong> Alınan araç 5 yıl dolmadan satılamaz veya devredilemez.</li>
            <li><strong className="text-white">MTV İstisnası:</strong> ÖTV muafiyetli araçlar Motorlu Taşıtlar Vergisinden muaftır.</li>
          </ul>

          <Link 
            href="/hesaplama" 
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors pt-1"
          >
            <span>ÖTV Muafiyet ve Hesaplama Detayları</span>
            <ArrowRight size={13} />
          </Link>
        </article>
      </div>

      {/* Bölüm 3 & 4: Emeklilik + Sosyal Yardımlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 pt-2">
        {/* Kutu 3: Emeklilik Tablosu */}
        <article className="space-y-4">
          <div className="border-b border-[#1E293B] pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-heading">
              <Calendar size={14} className="text-amber-400" />
              <span>SGK Engelli Erken Emeklilik</span>
            </h3>
            <span className="text-[11px] font-mono text-amber-400">Yaş Şartsız</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Engelli çalışanlar, yaş haddine tabi tutulmaksızın yalnızca sigortalılık süresi ve prim gün sayısı şartlarını tamamlayarak emekli olabilirler.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400 text-[11px]">
                  <th className="py-2 pr-4 font-medium">Derece</th>
                  <th className="py-2 pr-4 font-medium">Süre</th>
                  <th className="py-2 font-medium">Prim Günü</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/70 text-slate-300">
                <tr>
                  <td className="py-2 pr-4 text-white font-sans font-medium">1. Derece (%80+)</td>
                  <td className="py-2 pr-4">15 Yıl</td>
                  <td className="py-2">3600 - 3960</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-white font-sans font-medium">2. Derece (%60-%79)</td>
                  <td className="py-2 pr-4">16 - 18 Yıl</td>
                  <td className="py-2">3680 - 4160</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-white font-sans font-medium">3. Derece (%40-%59)</td>
                  <td className="py-2 pr-4">18 - 20 Yıl</td>
                  <td className="py-2">4000 - 4400</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-400">
            01.10.2008 öncesi işe başlayan 4A çalışanları için Vergi İndirimi Belgesi zorunludur.
          </p>
        </article>

        {/* Kutu 4: Evde Bakım ve 2022 Aylığı */}
        <article className="space-y-4">
          <div className="border-b border-[#1E293B] pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-heading">
              <HeartHandshake size={14} className="text-indigo-400" />
              <span>Evde Bakım ve 2022 Aylığı Kriterleri</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Gelir Testi</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Aile ve Sosyal Hizmetler Bakanlığı tarafından ödenen desteklerde hane gelir kriterleri uygulanmaktadır:
          </p>

          <div className="space-y-3 text-xs text-slate-300 font-normal">
            <div>
              <strong className="text-white block mb-0.5">Evde Bakım Yardımı (2828 Sayılı Kanun):</strong>
              Raporda &quot;Tam Bağımlı&quot; ibaresi aranır. Hane içinde kişi başına düşen aylık net gelir, net asgari ücretin 2/3&apos;ünden az olmalıdır.
            </div>
            <div>
              <strong className="text-white block mb-0.5">2022 Sayılı Kanun Engelli Aylığı:</strong>
              SGK güvencesi bulunmayan ve en az %40 oranlı raporu olan vatandaşlara ödenir. Hane kişi başı geliri net asgari ücretin 1/3&apos;ünden az olmalıdır.
            </div>
          </div>
        </article>
      </div>

      {/* Sıkça Sorulan Sorular */}
      <section className="space-y-5 pt-2" aria-label="Sıkça Sorulan Sorular">
        <div className="border-b border-[#1E293B] pb-3 flex items-center gap-2">
          <HelpCircle size={15} className="text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading">
            Sıkça Sorulan Sorular
          </h3>
        </div>

        <div className="divide-y divide-[#1E293B]/70">
          <details className="py-4 group" open>
            <summary className="text-xs sm:text-sm font-medium text-slate-200 cursor-pointer flex items-center justify-between list-none hover:text-white transition-colors">
              <span>Balthazard formülü nedir ve birden fazla oran nasıl birleştirilir?</span>
              <span className="text-slate-400 text-xs font-mono ml-4">+</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Balthazard formülü, birden fazla hastalığı bulunan bireylerin engel yüzdelerinin doğrudan toplanması yerine kalan sağlıklı vücut oranı üzerinden kademeli eklenmesini sağlar: A + [B × (100 - A) / 100]. 65 yaş ve üzerinde olanlara çıkan nihai sonuca %10 ilave edilir.
            </div>
          </details>

          <details className="py-4 group">
            <summary className="text-xs sm:text-sm font-medium text-slate-200 cursor-pointer flex items-center justify-between list-none hover:text-white transition-colors">
              <span>2026 yılı ÖTV muafiyetli araç üst sınırı ne kadardır?</span>
              <span className="text-slate-400 text-xs font-mono ml-4">+</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              2026 yılı için belirlenen ÖTV istisna üst limiti 2.873.972 TL&apos;dir. Bu tavan tutar vergiler (ÖTV ve KDV) dahil azami anahtar teslim satış fiyatını kapsar.
            </div>
          </details>

          <details className="py-4 group">
            <summary className="text-xs sm:text-sm font-medium text-slate-200 cursor-pointer flex items-center justify-between list-none hover:text-white transition-colors">
              <span>%90 altı ortopedik engelliler ÖTV muafiyetinden nasıl yararlanır?</span>
              <span className="text-slate-400 text-xs font-mono ml-4">+</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Hareket ettirici aksamda kalıcı fiziksel kısıtlılık bulunması, raporda &quot;özel tertibatlı araç kullanması gerekir&quot; ibaresinin yer alması ve sürücü belgesinde tertibat kodlarının bulunması zorunludur. Sol bacak engellilerde otomatik vites doğrudan tertibat sayılır.
            </div>
          </details>

          <details className="py-4 group">
            <summary className="text-xs sm:text-sm font-medium text-slate-200 cursor-pointer flex items-center justify-between list-none hover:text-white transition-colors">
              <span>Engelli erken emeklilikte yaş şartı var mıdır?</span>
              <span className="text-slate-400 text-xs font-mono ml-4">+</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Hayır, engellilik gerekçesiyle kademeli erken emeklilikte yaş şartı aranmaz. Yalnızca sigortalılık süresini (15-20 yıl) ve gerekli prim gün sayısını (3600-4400 gün) doldurmak yeterlidir.
            </div>
          </details>

          <details className="py-4 group">
            <summary className="text-xs sm:text-sm font-medium text-slate-200 cursor-pointer flex items-center justify-between list-none hover:text-white transition-colors">
              <span>Evde bakım maaşı ve 2022 aylığı gelir kriteri nedir?</span>
              <span className="text-slate-400 text-xs font-mono ml-4">+</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Evde bakım yardımı için hane içi kişi başı gelir net asgari ücretin 2/3&apos;ünden az ve rapor &quot;Tam Bağımlı&quot; olmalıdır. 2022 engelli aylığı için hane kişi başı gelir net asgari ücretin 1/3&apos;ünden az ve SGK güvencesi bulunmamalıdır.
            </div>
          </details>
        </div>
      </section>

      {/* Terimler Sözlüğü */}
      <section className="space-y-4 pt-2" aria-label="Terimler Sözlüğü">
        <div className="border-b border-[#1E293B] pb-2 flex items-center gap-2">
          <FileText size={14} className="text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading">
            Terimler ve Kısaltmalar
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 text-xs text-slate-400">
          <div>
            <span className="text-slate-200 font-medium">ESKR:</span> Erişkinler İçin Engellilik Sağlık Kurulu Raporu
          </div>
          <div>
            <span className="text-slate-200 font-medium">ÇÖZGER:</span> Çocuklar İçin Özel Gereksinim Raporu
          </div>
          <div>
            <span className="text-slate-200 font-medium">Balthazard:</span> Çoklu oran birleştirme formülü
          </div>
          <div>
            <span className="text-slate-200 font-medium">ÖTV İstisnası:</span> Sıfır araç alım vergi muafiyeti
          </div>
          <div>
            <span className="text-slate-200 font-medium">GVK 31:</span> Gelir vergisi sakatlık indirimi
          </div>
          <div>
            <span className="text-slate-200 font-medium">E-KPSS:</span> Engelli kamu personeli sınavı
          </div>
          <div>
            <span className="text-slate-200 font-medium">SYDV:</span> Muhtaçlık ve yardım değerlendirme vakfı
          </div>
          <div>
            <span className="text-slate-200 font-medium">SUT:</span> Sağlık Uygulama Tebliği donanım listesi
          </div>
        </div>
      </section>
    </section>
  );
}

