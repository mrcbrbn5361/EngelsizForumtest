import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { BookOpen, User, ShieldAlert, FileText, ArrowLeft, Mail, Search, MessageSquare, HelpCircle } from 'lucide-react';

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
                      "text": "Ekranın sol alt köşesinde bulunan veya klavyeden 'Tab' tuşuyla gezilebilen erişilebilirlik ikonuna tıklayarak renk kontrastı, font boyutu ve biyonik okuma gibi özellikleri yönetebilirsiniz."
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
                    "text": "Ekranın sol alt köşesindeki erişilebilirlik ikonuna tıklayın ya da klavyeden Tab tuşu ile odaklanıp Enter tuşuna basın.",
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

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
        
        {/* Header Hero */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
            <HelpCircle size={14} className="text-sky-400" />
            <span>Rehber ve Destek Kütüphanesi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Yardım ve Bilgi Merkezi
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
            Platform araçları, ekran okuyucu uyumluluğu, Balthazard ve ÖTV hesaplayıcıları ve sesli navigasyon yönergeleri hakkında tüm detaylara buradan ulaşabilirsiniz.
          </p>
        </header>

        {/* Core Help Guides */}
        <section aria-labelledby="guides-heading" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <h2 id="guides-heading" className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen size={18} className="text-sky-400" />
              <span>Temel Kullanım Rehberleri</span>
            </h2>
            <span className="text-xs text-muted-foreground font-medium">4 Kategori</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                icon: <BookOpen size={20} className="text-sky-400" />, 
                title: 'Erişilebilirlik ve Biyonik Okuma', 
                text: 'Sol alt panelden Biyonik Okuma, Disleksi yazı tipi, kontrast modları ve klavye kısayollarını nasıl kişiselleştireceğinizi öğrenin.' 
              },
              { 
                icon: <User size={20} className="text-sky-400" />, 
                title: 'Hesap ve Profil Yönetimi', 
                text: 'Profil düzenleme, takma ad seçimi, uzmanlık rozetleri ve güvenli oturum ayarlarını yapılandırma rehberi.' 
              },
              { 
                icon: <ShieldAlert size={20} className="text-emerald-400" />, 
                title: 'Topluluk İlkeleri ve Güvenlik', 
                text: 'Dayanışma kültürü, saygılı iletişim kuralları, moderasyon süreçleri ve spam koruma mekanizmaları.' 
              },
              { 
                icon: <FileText size={20} className="text-sky-400" />, 
                title: 'Mevzuat ve Hesaplama Araçları', 
                text: 'ÖTV muafiyetli araç limiti, Balthazard formülü ve Engelli Sağlık Kurulu Raporu değerlendirme modüllerinin kullanımı.' 
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-card/85 backdrop-blur-md border border-border/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500/40 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Step by Step Guide (How-To) */}
        <section aria-labelledby="step-guide-heading" className="bg-card/80 border border-border/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="space-y-1">
            <h2 id="step-guide-heading" className="text-lg sm:text-xl font-bold text-foreground">
              Erişilebilirlik Araçlarını 3 Adımda Etkinleştirin
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              Ekran okuyucu kullanıyor veya metinleri daha kolay okumak istiyorsanız aşağıdaki adımları takip edebilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold flex items-center justify-center">1</span>
                <h4 className="text-xs sm:text-sm font-bold text-foreground">Menüyü Açın</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                Ekranın sol altındaki erişilebilirlik butonuna tıklayın veya klavyeden Tab ile odaklanıp Enter&apos;a basın.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold flex items-center justify-center">2</span>
                <h4 className="text-xs sm:text-sm font-bold text-foreground">Modunuzu Seçin</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                Biyonik Okuma, Yüksek Kontrast, Disleksi Yazı Tipi veya Sesli Metin Okuma özelliklerinden dilediğinizi açın.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center">3</span>
                <h4 className="text-xs sm:text-sm font-bold text-foreground">Otomatik Kaydetme</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                Yaptığınız ayarlar tarayıcınıza kaydedilir, sonraki tüm ziyaretlerinizde aynı tercihleriniz geçerli kalır.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ List */}
        <section aria-labelledby="faq-heading" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <h2 id="faq-heading" className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <MessageSquare size={18} className="text-sky-400" />
              <span>Sıkça Sorulan Sorular</span>
            </h2>
            <span className="text-xs text-muted-foreground font-medium">Güncel Yanıtlar</span>
          </div>
          
          <div className="bg-card/80 border border-border/80 rounded-2xl p-4 sm:p-6 space-y-3 backdrop-blur-md">
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
              <div key={index} className="space-y-2 p-4 bg-muted/30 rounded-xl border border-border/60">
                <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-start gap-2">
                  <span className="text-sky-400 font-extrabold shrink-0">S:</span>
                  <span>{item.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-5 font-normal">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact & Support Section */}
        <section className="bg-card/90 border border-sky-500/20 p-6 sm:p-8 rounded-2xl space-y-4 backdrop-blur-md shadow-xs">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Mail size={20} className="text-sky-400" />
              <span>Doğrudan Destek ve Geri Bildirim</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
              Aradığınız konuyu bulamadınız mı veya bir erişilebilirlik aksaklığı mı fark ettiniz? Destek ekibimize doğrudan ulaşabilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a 
              href="mailto:miracbirben@engelsizforum.com" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
            >
              <Mail size={14} />
              <span>miracbirben@engelsizforum.com</span>
            </a>

            <Link 
              href="/discussions/new" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-muted hover:bg-muted/80 border border-border px-5 py-2.5 text-xs font-bold text-foreground transition-colors"
            >
              <span>Toplulukta Soru Sor</span>
            </Link>
          </div>
        </section>

        {/* Back Link */}
        <div className="pt-2">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-card border border-border/80 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

      </div>
    </SiteLayout>
  );
}
