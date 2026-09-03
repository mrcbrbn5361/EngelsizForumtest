import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { 
  BookOpen, User, ShieldAlert, FileText, ArrowLeft, Mail, 
  MessageSquare, HelpCircle, Home, CheckCircle2, Info
} from 'lucide-react';

export default function HelpPage() {
  return (
    <SiteLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Erişilebilirlik panelini nasıl açarım?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Ekranın sol alt köşesinde bulunan veya klavyeden 'Tab' tuşuyla gezilebilen erişilebilirlik butonuna tıklayarak renk kontrastı, font boyutu ve biyonik okuma gibi özellikleri yönetebilirsiniz."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Yapay zeka asistanı nasıl çalışır?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Tartışmalarda ve gönderilerde yer alan 'Yapay Zeka Destekli Özet' butonuna tıklayarak uzun yazıları saniyeler içinde seslendirilebilir, sadeleştirilmiş veya özetlenmiş hale getirebilirsiniz."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Destek ekibiyle nasıl iletişim kurarım?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Destek ekibimize dilediğiniz zaman miracbirben@engelsizforum.com adresinden e-posta göndererek ulaşabilirsiniz."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "EngelsizForum tamamen ücretsiz mi?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Evet. EngelsizForum, engelli bireylerin bilgiye ve topluluğa erişimini kolaylaştırmak amacıyla tamamen ücretsiz olarak sunulan açık kaynaklı bir sosyal platformdur."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Ekran okuyucu kullanırken sorun yaşıyorum, ne yapmalıyım?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Platformumuz NVDA, JAWS ve VoiceOver ekran okuyucularıyla tam uyumlu çalışacak şekilde tasarlanmıştır. Sorun yaşarsanız, sol alttaki erişilebilirlik menüsünden ilgili profili optimize edebilir veya bizimle iletişime geçebilirsiniz."
                    }
                  }
                ]
              },
              {
                "@type": "HowTo",
                "name": "Erişilebilirlik Paneli Nasıl Kullanılır?",
                "description": "EngelsizForum platformundaki bionik okuma, kontrast ayarları ve disleksi yazı tiplerini etkinleştirme rehberi.",
                "step": [
                  {
                    "@type": "HowToStep",
                    "name": "Erişilebilirlik Menüsünü Açın",
                    "text": "Ekranın sol alt köşesindeki erişilebilirlik butonuna tıklayın ya da klavyeden Tab tuşu ile odaklanıp Enter tuşuna basın.",
                    "url": "https://engelsizforum.com/help#step1"
                  },
                  {
                    "@type": "HowToStep",
                    "name": "Profil veya Özellik Seçin",
                    "text": "Açılan panelde 'Biyonik Okuma', 'Disleksi Yazı Tipi' veya 'Yüksek Kontrast' gibi erişilebilirlik ayarlarından dilediğinizi aktif edin.",
                    "url": "https://engelsizforum.com/help#step2"
                  },
                  {
                    "@type": "HowToStep",
                    "name": "Ayarları Kaydedin",
                    "text": "Yaptığınız tercihler otomatik olarak tarayıcı yerel hafızasına kaydedilir ve sonraki ziyaretlerinizde de geçerli olur.",
                    "url": "https://engelsizforum.com/help#step3"
                  }
                ],
                "totalTime": "PT1M"
              },
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Ana Sayfa",
                    "item": "https://engelsizforum.com"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Yardım Merkezi",
                    "item": "https://engelsizforum.com/help"
                  }
                ]
              }
            ]
          })
        }}
      />

      <div className="flex flex-col gap-4">
        {/* Breadcrumb Navigation - XenForo Style */}
        <div className="bg-[#eef2f7] -mx-4 px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border-b border-slate-200 mb-1">
          <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 transition-colors">
            <Home size={12} />
            Ana Sayfa
          </Link>
          <span className="opacity-50">/</span>
          <span className="font-bold text-slate-800">Yardım ve Bilgi Merkezi</span>
        </div>

        {/* XenForo Main Header Block */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="xf-block-header bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-black uppercase text-[12px] tracking-wider py-2.5 px-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle size={15} className="text-white/90" />
              <span>Yardım ve Bilgi Merkezi</span>
            </div>
            <span className="text-[11px] font-normal text-white/80 bg-white/10 px-2 py-0.5 rounded-sm border border-white/20">
              Rehber &amp; Destek Kütüphanesi
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-white space-y-2 text-slate-700">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Engelsiz Topluluk Rehberi &amp; Kullanıcı Desteği
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Platform araçları, ekran okuyucu uyumluluğu, Balthazard ve ÖTV hesaplayıcıları, mevzuat danışmanlığı ve sesli navigasyon yönergeleri hakkında tüm detaylara buradan ulaşabilirsiniz.
            </p>
          </div>
        </div>

        {/* Core Help Guides - XenForo Node Grid Style */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[11px] tracking-wider py-2 px-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen size={13} />
              <span>Temel Kullanım Rehberleri</span>
            </div>
            <span className="text-slate-500 font-bold text-[10px]">4 Kategori</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {[
              { 
                icon: <BookOpen size={18} className="text-[#185886]" />, 
                title: 'Erişilebilirlik ve Biyonik Okuma', 
                badge: 'WCAG AAA',
                text: 'Sol alt panelden Biyonik Okuma, Disleksi yazı tipi, kontrast modları ve klavye kısayollarını nasıl kişiselleştireceğinizi öğrenin.' 
              },
              { 
                icon: <User size={18} className="text-[#185886]" />, 
                title: 'Hesap ve Profil Yönetimi', 
                badge: 'Kullanıcı Rehberi',
                text: 'Profil düzenleme, takma ad seçimi, uzmanlık rozetleri ve güvenli oturum ayarlarını yapılandırma rehberi.' 
              },
              { 
                icon: <ShieldAlert size={18} className="text-[#185886]" />, 
                title: 'Topluluk İlkeleri ve Güvenlik', 
                badge: 'Moderasyon',
                text: 'Dayanışma kültürü, saygılı iletişim kuralları, moderasyon süreçleri ve spam koruma mekanizmaları.' 
              },
              { 
                icon: <FileText size={18} className="text-[#185886]" />, 
                title: 'Mevzuat ve Hesaplama Araçları', 
                badge: '2026 Mevzuatı',
                text: 'ÖTV muafiyetli araç limiti, Balthazard formülü ve Engelli Sağlık Kurulu Raporu değerlendirme modüllerinin kullanımı.' 
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className="p-4 sm:p-5 bg-white hover:bg-[#f8fafc] transition-colors border-b border-slate-200 last:border-b-0 flex gap-3.5"
              >
                <div className="w-9 h-9 rounded-sm bg-[#eef2f7] border border-slate-300 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs sm:text-sm font-bold text-[#185886] hover:underline cursor-pointer">
                      {item.title}
                    </h2>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#eef2f7] text-slate-600 rounded-sm border border-slate-300 shrink-0">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step by Step Guide - XenForo Notice / Process Style */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="xf-block-header bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-black uppercase text-[12px] tracking-wider py-2.5 px-3 flex items-center gap-2">
            <Info size={14} className="text-white/90" />
            <span>Erişilebilirlik Araçlarını 3 Adımda Etkinleştirin</span>
          </div>

          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
            Ekran okuyucu kullanıyor veya metinleri daha kolay okumak istiyorsanız aşağıdaki adımları uygulayabilirsiniz:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="p-4 bg-white space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-[#185886] text-white text-[11px] font-black flex items-center justify-center">1</span>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Menüyü Açın</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">
                Ekranın sol altındaki erişilebilirlik butonuna tıklayın veya klavyeden <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded-sm text-[10px] font-mono">Tab</kbd> ile odaklanıp <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded-sm text-[10px] font-mono">Enter</kbd>&apos;a basın.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-[#185886] text-white text-[11px] font-black flex items-center justify-center">2</span>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Modunuzu Seçin</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">
                Biyonik Okuma, Yüksek Kontrast, Disleksi Yazı Tipi veya Sesli Metin Okuma özelliklerinden dilediğinizi açın.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-[#2e7d32] text-white text-[11px] font-black flex items-center justify-center">3</span>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Otomatik Kaydetme</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">
                Yaptığınız tercihler tarayıcınıza kaydedilir, sonraki tüm ziyaretlerinizde aynı tercihleriniz otomatik olarak geçerli kalır.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ List - XenForo Collapsible / Structured Q&A Style */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[11px] tracking-wider py-2 px-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={13} />
              <span>Sıkça Sorulan Sorular (S.S.S.)</span>
            </div>
            <span className="text-slate-500 font-bold text-[10px]">Resmi Bilgiler</span>
          </div>

          <div className="divide-y divide-slate-200">
            {[
              { 
                q: "EngelsizForum tamamen ücretsiz mi?", 
                a: "Evet. EngelsizForum, engelli bireylerin haklarına, bilgiye ve dayanışma topluluğuna erişimini kolaylaştırmak amacıyla tamamen ücretsiz ve açık kaynaklı olarak geliştirilen bir sosyal platformdur." 
              },
              { 
                q: "Ekran okuyucu kullanırken sorun yaşarsam ne yapmalıyım?", 
                a: "Platformumuz NVDA, JAWS, VoiceOver ve TalkBack ekran okuyucularıyla tam uyumlu çalışacak şekilde semantik HTML ve ARIA standartlarıyla kodlanmıştır. Bir sorun yaşarsanız erişilebilirlik menüsünden Ekran Okuyucu Profilini etkinleştirebilirsiniz." 
              },
              { 
                q: "Yapay zeka sesli özet ve danışmanlık özellikleri nasıl çalışıyor?", 
                a: "Tartışma sayfalarındaki 'AI Özet' butonuna tıklayarak uzun yazıları tek dokunuşla anlaşılır maddeler halinde özetletebilir ve ses sentezleyici ile dinleyebilirsiniz." 
              },
              {
                q: "ÖTV muafiyeti ve Balthazard hesaplama modülleri güncel mevzuata uygun mu?",
                a: "Evet. Hesaplama algoritmaları Resmi Gazete'de yayımlanan güncel Engelli Sağlık Kurulu Raporu Yönetmeliği ve Gelir İdaresi Başkanlığı limitlerine göre periyodik olarak güncellenmektedir."
              }
            ].map((item, index) => (
              <div key={index} className="p-4 bg-white hover:bg-[#f8fafc] transition-colors">
                <div className="flex items-start gap-2.5">
                  <span className="px-1.5 py-0.5 rounded-sm bg-[#eef2f7] text-[#185886] border border-slate-300 text-[11px] font-black shrink-0 mt-0.5">
                    SORU
                  </span>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.q}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed pl-0 font-normal">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Support Section - XenForo Notice Style */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-black uppercase text-[12px] tracking-wider py-2.5 px-3 flex items-center gap-2">
            <Mail size={14} className="text-white/90" />
            <span>Doğrudan Destek ve Geri Bildirim</span>
          </div>

          <div className="p-4 sm:p-5 bg-[#fbfcfd] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Aradığınız konuyu bulamadınız mı veya bir erişilebilirlik aksaklığı mı fark ettiniz?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Destek ekibimiz tüm soru, öneri ve teknik hata bildirimlerinize en geç 24 saat içinde yanıt vermektedir.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a 
                href="mailto:miracbirben@engelsizforum.com" 
                className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-[#185886] hover:bg-[#12466b] text-white px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors shadow-xs"
              >
                <Mail size={13} />
                <span>E-posta Gönder</span>
              </a>

              <Link 
                href="/discussions/new" 
                className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-[#f2930d] hover:bg-[#d5800a] text-white px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors shadow-xs"
              >
                <MessageSquare size={13} />
                <span>Toplulukta Soru Sor</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-1">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-white border border-slate-300 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft size={13} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

      </div>
    </SiteLayout>
  );
}
