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
  return (
    <section 
      id="engelsiz-mevzuat-rehberi" 
      className="border-t border-[#1E293B] pt-12 space-y-12 text-slate-300"
      aria-labelledby="mevzuat-portal-title"
    >
      {/* Ana Başlık ve Giriş Alanı */}
      <div className="max-w-3xl space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 font-heading">
          <BookOpen size={14} className="text-indigo-400" />
          <span>Mevzuat ve Başvuru Kılavuzu</span>
        </div>
        <h2 id="mevzuat-portal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading">
          Engelli Hakları, Balthazard ve Resmî Süreçler
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
              <span>ÖTV &amp; MTV İstisnası</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Tutar doğrulanıyor</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            4760 Sayılı Özel Tüketim Vergisi Kanununun 7. maddesi uyarınca engelli vatandaşlar sıfır kilometre otomobil alımlarında ÖTV muafiyetinden yararlanır. İstisna için üst tutar sınırı vardır; güncel tutar doğrulanıyor, resmî kaynaktan kontrol edin.
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

          <p className="text-xs text-slate-400">
            Gerekli süre ve prim günü şartları doğrulanıyor; bu sayfada gösterilmez. Güncel şartlar için Sosyal Güvenlik Kurumu&apos;na başvurun.
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
              <span>ÖTV muafiyetli araç için üst tutar sınırı var mıdır?</span>
              <span className="text-slate-400 text-xs font-mono ml-4">+</span>
            </summary>
            <div className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              İstisnanın bir üst tutar sınırı vardır. Güncel tutar doğrulanıyor; bu sayfada gösterilmez, resmî kaynaktan kontrol edin.
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
              Hayır, engellilik gerekçesiyle kademeli erken emeklilikte yaş şartı aranmaz. Gerekli sigortalılık süresi ve prim günü şartları için Sosyal Güvenlik Kurumu&apos;na başvurun.
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

