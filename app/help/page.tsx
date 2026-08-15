import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { BookOpen, User, ShieldAlert, FileText, ArrowLeft, Mail } from 'lucide-react';

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
                    "text": "Ekranın sol alt köşesindeki erişilebilirlik ikonuna (dişli/çark veya insan simgesi) tıklayın ya da klavyeden Tab tuşu ile odaklanıp Enter tuşuna basın.",
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
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-5xl">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase tracking-wider mb-4">
            <BookOpen size={12} /> Rehber ve Destek
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">Yardım Merkezi</h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
            Platform araçlarımız, sesli kontrol özellikleri, mevzuat hesaplayıcılar ve erişilebilirlik panelleriyle ilgili tüm detaylara buradan ulaşabilirsiniz.
          </p>
        </header>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {[
            { icon: <BookOpen size={22} />, title: 'Kullanım Kılavuzu', text: 'Platformun erişilebilirlik araçlarını, sesli giriş özelliklerini ve yapay zeka özetleyicisini nasıl kullanacağınızı öğrenin.' },
            { icon: <User size={22} />, title: 'Hesap Yönetimi', text: 'Profil oluşturma, şifre sıfırlama, bildirim tercihleri ve hesap doğrulama süreçleri hakkında detaylı yönergeler.' },
            { icon: <ShieldAlert size={22} />, title: 'Güvenlik ve Topluluk', text: 'Güvenliğiniz için aldığımız önlemler, moderasyon kuralları ve platform etik ilkeleri.' },
            { icon: <FileText size={22} />, title: 'Sorun Giderme', text: 'Tarayıcı uyumluluğu, oturum açma sorunları ve ekran okuyucu optimizasyonu hakkında teknik destek bilgileri.' },
          ].map((item, index) => (
            <div key={index} className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm transition-all hover:border-sky-500/40">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 w-fit rounded-xl mb-4" aria-hidden="true">
                {item.icon}
              </div>
              <h2 className="text-lg font-bold mb-2 tracking-tight text-foreground">{item.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        {/* FAQ List */}
        <section className="mb-16 space-y-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">Sıkça Sorulan Sorular</h2>
          
          <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            {[
              { q: "EngelsizForum tamamen ücretsiz mi?", a: "Evet. EngelsizForum, engelli bireylerin bilgiye ve topluluğa erişimini kolaylaştırmak amacıyla tamamen ücretsiz olarak sunulan açık kaynaklı bir sosyal platformdur." },
              { q: "Ekran okuyucu kullanırken sorun yaşıyorum, ne yapmalıyım?", a: "Platformumuz NVDA, JAWS & VoiceOver ekran okuyucularıyla tam uyumlu çalışacak şekilde tasarlanmıştır. Sorun yaşarsanız, sol alttaki erişilebilirlik menüsünden ilgili profili optimize edebilir veya bizimle iletişime geçebilirsiniz." },
              { q: "Yapay zeka sesli desteği nasıl çalışıyor?", a: "Gönderilerdeki 'Yapay Zeka Seslendir' butonunu kullanarak metinleri doğal konuşma sesiyle dinleyebilirsiniz. Ayrıca sesinizi kullanarak sesli yanıtlar gönderebilir ve tartışmalara katılabilirsiniz." }
            ].map((item, index) => (
              <div key={index} className="space-y-2 p-4 bg-muted/20 rounded-xl border border-border/60">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="text-sky-400 font-extrabold">S.</span> {item.q}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-5 font-normal">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent border border-sky-500/20 p-6 md:p-10 rounded-2xl mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-xl md:text-2xl font-extrabold mb-3 flex items-center gap-3 text-foreground">
              <Mail size={24} className="text-sky-400" /> Bize Ulaşın
            </h2>
            <p className="text-sm text-muted-foreground font-normal mb-6 leading-relaxed">
              Aradığınız yanıtı bulamadınız mı? Destek ekibimize doğrudan e-posta ile ulaşabilirsiniz. En kısa sürede geri dönüş sağlıyoruz.
            </p>
            <a 
              href="mailto:miracbirben@engelsizforum.com" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-sky-400 cursor-pointer"
            >
              <Mail size={14} /> miracbirben@engelsizforum.com
            </a>
          </div>
        </section>

        {/* Back Link */}
        <div className="flex gap-4">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-card border border-border/80 px-5 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted"
          >
            <ArrowLeft size={14} /> Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
