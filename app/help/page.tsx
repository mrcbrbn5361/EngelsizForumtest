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
      <div className="container mx-auto px-4 py-16 md:py-24">
        <header className="mb-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">Yardım Merkezi</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto font-medium">
            Platform araçlarımız, sesli kontrol özellikleri ve erişilebilirlik panelleriyle ilgili tüm detaylara buradan ulaşabilirsiniz.
          </p>
        </header>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {[
            { icon: <BookOpen size={28} />, title: 'Kullanım Kılavuzu', text: 'Platformun erişilebilirlik araçlarını, sesli giriş özelliklerini ve yapay zeka özetleyicisini nasıl kullanacağınızı öğrenin.' },
            { icon: <User size={28} />, title: 'Hesap Yönetimi', text: 'Profil oluşturma, şifre sıfırlama, bildirim tercihleri ve hesap silme süreçleri hakkında detaylı yönergeler.' },
            { icon: <ShieldAlert size={28} />, title: 'Güvenlik ve Topluluk', text: 'Güvenliğiniz için aldığımız önlemler, moderasyon kuralları ve platform etik ilkeleri.' },
            { icon: <FileText size={28} />, title: 'Sorun Giderme', text: 'Tarayıcı uyumluluğu, oturum açma sorunları ve ekran okuyucu optimizasyonu hakkında teknik destek bilgileri.' },
          ].map((item, index) => (
            <div key={index} className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm transition-all hover:shadow-md">
              <div className="p-4 bg-primary/10 text-primary w-fit rounded-2xl mb-6" aria-hidden="true">
                {item.icon}
              </div>
              <h2 className="text-2xl font-bold mb-4 tracking-tight text-foreground">{item.title}</h2>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        {/* FAQ List */}
        <section className="mb-24 space-y-12">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Sıkça Sorulan Sorular</h2>
          
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 space-y-10 shadow-sm">
            {[
              { q: "EngelsizForum tamamen ücretsiz mi?", a: "Evet. EngelsizForum, engelli bireylerin bilgiye ve topluluğa erişimini kolaylaştırmak amacıyla tamamen ücretsiz olarak sunulan açık kaynaklı bir sosyal platformdur." },
              { q: "Ekran okuyucu kullanırken sorun yaşıyorum, ne yapmalıyım?", a: "Platformumuz NVDA, JAWS & VoiceOver ekran okuyucularıyla tam uyumlu çalışacak şekilde tasarlanmıştır. Sorun yaşarsanız, sol alttaki erişilebilirlik menüsünden ilgili profili optimize edebilir veya bizimle iletişime geçebilirsiniz." },
              { q: "Yapay zeka sesli desteği nasıl çalışıyor?", a: "Gönderilerdeki 'Yapay Zeka Seslendir' butonunu kullanarak metinleri doğal konuşma sesiyle dinleyebilirsiniz. Ayrıca sesinizi kullanarak sesli yanıtlar gönderebilir ve tartışmalara katılabilirsiniz." }
            ].map((item, index) => (
              <div key={index} className="space-y-4 p-8 bg-muted/30 rounded-2xl border border-border/50">
                <h3 className="text-lg font-bold text-foreground flex gap-3">
                  <span className="text-primary">Q.</span> {item.q}
                </h3>
                <p className="text-muted-foreground leading-relaxed pl-8 font-medium">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-primary/5 border border-primary/10 p-10 md:p-16 rounded-3xl mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-extrabold mb-6 flex items-center gap-4 text-foreground">
              <Mail size={32} className="text-primary" /> Bize Ulaşın
            </h2>
            <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed">
              Aradığınız yanıtı bulamadınız mı? Destek ekibimize doğrudan ulaşın. 24 saat içinde geri dönüş sağlıyoruz.
            </p>
            <a 
              href="mailto:miracbirben@engelsizforum.com" 
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              <Mail size={18} /> miracbirben@engelsizforum.com
            </a>
          </div>
        </section>

        {/* Back Link */}
        <div className="flex gap-6">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-background border border-border px-8 py-4 text-sm font-bold text-foreground transition hover:bg-muted"
          >
            <ArrowLeft size={18} /> Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
