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
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-foreground">Gizlilik Politikası</h1>
        
        {/* Key Takeaways Section */}
        <section className="mb-12">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <span className="text-primary text-2xl">💡</span> Önemli Bilgiler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">GİZLİLİK</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Verileriniz bizimle güvende, üçüncü taraflara satılmaz.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">KONTROL</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Verileriniz üzerinde tam kontrole sahipsiniz, istediğiniz zaman silebilirsiniz.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">ŞEFFAFLIK</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Hangi veriyi neden topladığımızı açıkça belirtiyoruz.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg leading-relaxed font-normal text-foreground">
            EngelsizForum olarak gizliliğinize önem veriyoruz. Bu politika, platformumuzu kullanırken verilerinizin nasıl işlendiğini açıklar. 
            Daha fazla bilgi için <Link href="/about" className="text-primary hover:underline font-semibold">Hakkımızda</Link> sayfamızı da inceleyebilirsiniz.
          </p>
          
          <h2 className="text-2xl font-bold text-foreground mt-12">1. Toplanan Veriler</h2>
          <p className="text-base leading-relaxed">
            Hesap oluştururken verdiğiniz e-posta adresi, kullanıcı adı ve profil bilgileri güvenli bir şekilde saklanır.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. Veri Kullanımı</h2>
          <p className="text-base leading-relaxed">
            Verileriniz yalnızca platform içindeki deneyiminizi iyileştirmek, topluluk etkileşimlerini yönetmek ve size bildirim göndermek için kullanılır.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">3. Çerezler</h2>
          <p className="text-base leading-relaxed">
            Oturum tercihlerinizi hatırlamak ve erişilebilirlik ayarlarınızı kaydetmek için temel çerezler kullanmaktayız.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. İletişim</h2>
          <p className="text-base leading-relaxed">
            Gizlilikle ilgili sorularınız için bizimle iletişime geçebilirsiniz.
          </p>

          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Daha Fazla Bilgi</h2>
            <p className="mb-8 text-base">
              Erişilebilirlik politikalarımız ve platformumuzun vizyonu hakkında daha fazla bilgi edinmek için aşağıdaki kaynakları inceleyebilirsiniz:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/about" className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group">
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">Hakkımızda</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Misyonumuz, vizyonumuz ve hikayemiz hakkında bilgi edinin.</p>
              </Link>
              <Link href="/communities" className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group">
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">Topluluklar</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">İlgi alanlarınıza uygun gruplara katılın ve yardımlaşın.</p>
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/" 
              className="px-6 py-3 bg-primary text-primary-foreground rounded font-bold text-center hover:brightness-110 active:scale-[0.98] transition-all min-h-[48px] flex items-center justify-center text-sm"
            >
              Ana Sayfaya Dön
            </Link>
            <Link 
              href="/discussions" 
              className="px-6 py-3 bg-muted border border-border text-foreground rounded font-bold text-center hover:bg-muted/80 active:scale-[0.98] transition-all min-h-[48px] flex items-center justify-center text-sm"
            >
              Tartışmaları Keşfet
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
