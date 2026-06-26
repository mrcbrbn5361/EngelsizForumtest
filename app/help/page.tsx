import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Link from 'next/link';
import { HelpCircle, BookOpen, User, ShieldAlert, FileText, ArrowLeft, Mail } from 'lucide-react';

export default function HelpPage() {
  return (
    <DashboardLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
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
                  "text": "Destek ekibimize dilediğiniz zaman info@miracdeveloper.com.tr adresinden e-posta göndererek ulaşabilirsiniz."
                }
              }
            ]
          })
        }}
      />
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-black mb-8 tracking-tighter text-foreground">Yardım Merkezi</h1>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl mb-4">
              <BookOpen size={24} />
            </div>
            <h2 className="text-xl font-black mb-2 text-foreground">Kullanım Kılavuzu</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Platformun erişilebilirlik araçlarını, sesli giriş özelliklerini ve yapay zeka özetleyicisini nasıl kullanacağınızı öğrenin.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl mb-4">
              <User size={24} />
            </div>
            <h2 className="text-xl font-black mb-2 text-foreground">Hesap Yönetimi</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Profil oluşturma, şifre sıfırlama, bildirim tercihleri ve hesap silme süreçleri hakkında detaylı yönergeler.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl mb-4">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-xl font-black mb-2 text-foreground">Güvenlik ve Topluluk</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Güvenliğiniz için aldığımız önlemler, moderasyon kuralları ve platform etik ilkeleri.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl mb-4">
              <FileText size={24} />
            </div>
            <h2 className="text-xl font-black mb-2 text-foreground">Sorun Giderme</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tarayıcı uyumluluğu, oturum açma sorunları ve ekran okuyucu optimizasyonu hakkında teknik destek bilgileri.
            </p>
          </div>
        </section>

        {/* FAQ List */}
        <section className="mb-12 space-y-6">
          <h2 className="text-2xl font-black mb-6 text-foreground tracking-tight">Sıkça Sorulan Sorular</h2>
          
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2 flex gap-2">
                <span className="text-primary">Q.</span> EngelsizForum tamamen ücretsiz mi?
              </h3>
              <p className="text-muted-foreground text-sm">
                Evet. EngelsizForum, engelli bireylerin bilgiye ve topluluğa erişimini kolaylaştırmak amacıyla tamamen ücretsiz olarak sunulan açık kaynaklı bir sosyal platformdur.
              </p>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-lg font-bold text-foreground mb-2 flex gap-2">
                <span className="text-primary">Q.</span> Ekran okuyucu kullanırken sorun yaşıyorum, ne yapmalıyım?
              </h3>
              <p className="text-muted-foreground text-sm">
                Platformumuz NVDA, JAWS ve VoiceOver ekran okuyucularıyla tam uyumlu çalışacak şekilde tasarlanmıştır. Sorun yaşarsanız, sol alttaki erişilebilirlik menüsünden ilgili profili optimize edebilir veya bizimle iletişime geçebilirsiniz.
              </p>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-lg font-bold text-foreground mb-2 flex gap-2">
                <span className="text-primary">Q.</span> Yapay zeka sesli desteği nasıl çalışıyor?
              </h3>
              <p className="text-muted-foreground text-sm">
                Gönderilerdeki 'Yapay Zeka Seslendir' butonunu kullanarak metinleri doğal konuşma sesiyle dinleyebilirsiniz. Ayrıca sesinizi kullanarak sesli yanıtlar gönderebilir ve tartışmalara katılabilirsiniz.
              </p>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-xl font-black mb-4 flex items-center gap-3">
            <Mail size={24} className="text-primary" /> Bize Ulaşın
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Aradığınız yanıtı bulamadınız mı? Destek ekibimize doğrudan ulaşın. 24 saat içinde geri dönüş sağlıyoruz.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a 
              href="mailto:info@miracdeveloper.com.tr" 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center gap-2"
            >
              <Mail size={16} /> info@miracdeveloper.com.tr
            </a>
          </div>
        </section>

        {/* Back Link */}
        <div className="flex gap-4">
          <Link 
            href="/" 
            className="px-6 py-3 bg-muted text-foreground rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-muted/80 transition-all"
          >
            <ArrowLeft size={16} /> Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
