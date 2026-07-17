import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <SiteLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Verilerim üçüncü taraflarla paylaşılıyor mu?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Hayır, kişisel verileriniz asla reklam amacıyla veya üçüncü taraf şirketlerle paylaşılmaz."
                }
              },
              {
                "@type": "Question",
                "name": "Hesabımı nasıl silebilim?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Profil ayarlarınızdan veya destek ekibimizle iletişime geçerek hesabınızı ve tüm verilerinizi kalıcı olarak silebilirsiniz."
                }
              }
            ]
          })
        }}
      />
      <div className="container mx-auto px-4 py-16 md:py-24">
        <header className="mb-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">Gizlilik Politikası</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto font-medium">
            Verilerinizin güvenliği, gizliliği ve haklarınız EngelsizForum koruması altındadır.
          </p>
        </header>
        
        {/* Key Takeaways Section */}
        <section className="mb-24">
          <div className="bg-card border border-border rounded-3xl p-10 md:p-16 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-2xl font-bold mb-10 flex items-center gap-4 text-foreground tracking-tight">
              <span className="text-3xl">💡</span> Önemli Bilgiler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
              <div className="space-y-3 p-6 bg-muted/40 border border-border/40 rounded-2xl">
                <div className="font-bold text-primary text-xs uppercase tracking-widest">GİZLİLİK</div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">Verileriniz bizimle güvende, üçüncü taraflara satılmaz veya paylaşılmaz.</p>
              </div>
              <div className="space-y-3 p-6 bg-muted/40 border border-border/40 rounded-2xl">
                <div className="font-bold text-primary text-xs uppercase tracking-widest">KONTROL</div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">Verileriniz üzerinde tam kontrole sahipsiniz, istediğiniz zaman kalıcı olarak silebilirsiniz.</p>
              </div>
              <div className="space-y-3 p-6 bg-muted/40 border border-border/40 rounded-2xl">
                <div className="font-bold text-primary text-xs uppercase tracking-widest">ŞEFFAFLIK</div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">Hangi veriyi neden topladığımızı açıkça ve sade dille belirtiyoruz.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-12 text-muted-foreground">
          <div className="bg-muted/20 border border-border rounded-3xl p-8 md:p-12 mb-16">
            <p className="text-xl leading-relaxed font-medium text-foreground mb-0">
              EngelsizForum olarak gizliliğinize önem veriyoruz. Bu politika, platformumuzu kullanırken verilerinizin nasıl işlendiğini açıklar. 
              Daha fazla bilgi için <Link href="/about" className="text-primary hover:underline font-bold">Hakkımızda</Link> sayfamızı da inceleyebilirsiniz.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Toplanan Veriler</h2>
              <p className="text-lg leading-relaxed">
                Hesap oluştururken verdiğiniz e-posta adresi, kullanıcı adı ve profil bilgileri güvenli bir şekilde saklanır.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Veri Kullanımı</h2>
              <p className="text-lg leading-relaxed">
                Verileriniz yalnızca platform içindeki deneyiminizi iyileştirmek, topluluk etkileşimlerini yönetmek ve size bildirim göndermek için kullanılır.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Çerezler</h2>
              <p className="text-lg leading-relaxed">
                Oturum tercihlerinizi hatırlamak ve erişilebilirlik ayarlarınızı kaydetmek için temel çerezler kullanmaktayız.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. İletişim</h2>
              <p className="text-lg leading-relaxed">
                Gizlilikle ilgili sorularınız için bizimle iletişime geçebilirsiniz.
              </p>
            </div>
          </div>

          <div className="mt-24 pt-16 border-t border-border">
            <h2 className="text-3xl font-extrabold mb-10 text-foreground tracking-tight">Daha Fazla Bilgi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link href="/about" className="bg-card border border-border p-10 rounded-3xl block group transition-all hover:border-primary/50 hover:shadow-md">
                <h3 className="font-bold text-2xl mb-3 text-foreground group-hover:text-primary transition-colors tracking-tight">Hakkımızda</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">Misyonumuz, vizyonumuz ve hikayemiz hakkında bilgi edinin.</p>
              </Link>
              <Link href="/communities" className="bg-card border border-border p-10 rounded-3xl block group transition-all hover:border-primary/50 hover:shadow-md">
                <h3 className="font-bold text-2xl mb-3 text-foreground group-hover:text-primary transition-colors tracking-tight">Topluluklar</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">İlgi alanlarınıza uygun gruplara katılın ve yardımlaşın.</p>
              </Link>
            </div>
          </div>

          <div className="mt-24 pt-12 flex flex-col sm:flex-row gap-6">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-xl bg-primary px-10 py-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              Ana Sayfaya Dön
            </Link>
            <Link 
              href="/discussions" 
              className="inline-flex items-center justify-center rounded-xl bg-background border border-border px-10 py-5 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              Tartışmaları Keşfet
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
