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
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-5xl">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase tracking-wider mb-4">
            🔒 Güvenlik & Gizlilik
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">Gizlilik Politikası</h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
            Verilerinizin güvenliği, gizliliği ve haklarınız EngelsizForum koruması altındadır.
          </p>
        </header>
        
        {/* Key Takeaways Section */}
        <section className="mb-12">
          <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-xs overflow-hidden relative">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground tracking-tight">
              💡 Temel İlkelerimiz
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
              <div className="space-y-2 p-4 bg-muted/20 border border-border/60 rounded-xl">
                <div className="font-bold text-sky-400 text-xs uppercase tracking-wider">GİZLİLİK</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Verileriniz bizimle güvende, üçüncü taraflara satılmaz veya paylaşılmaz.</p>
              </div>
              <div className="space-y-2 p-4 bg-muted/20 border border-border/60 rounded-xl">
                <div className="font-bold text-sky-400 text-xs uppercase tracking-wider">KONTROL</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Verileriniz üzerinde tam kontrole sahipsiniz, istediğiniz zaman silebilirsiniz.</p>
              </div>
              <div className="space-y-2 p-4 bg-muted/20 border border-border/60 rounded-xl">
                <div className="font-bold text-sky-400 text-xs uppercase tracking-wider">ŞEFFAFLIK</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Hangi veriyi neden topladığımızı açıkça ve sade dille belirtiyoruz.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-8 text-muted-foreground">
          <div className="bg-muted/20 border border-border/60 rounded-2xl p-6 mb-8">
            <p className="text-sm leading-relaxed font-normal text-foreground">
              EngelsizForum olarak gizliliğinize önem veriyoruz. Bu politika, platformumuzu kullanırken verilerinizin nasıl işlendiğini açıklar. 
              Daha fazla bilgi için <Link href="/about" className="text-sky-400 hover:underline font-bold">Hakkımızda</Link> sayfamızı da inceleyebilirsiniz.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-card border border-border/80 rounded-2xl space-y-2">
              <h2 className="text-base font-bold text-foreground">1. Toplanan Veriler</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                Hesap oluştururken verdiğiniz e-posta adresi, kullanıcı adı ve profil bilgileri güvenli bir şekilde saklanır.
              </p>
            </div>

            <div className="p-6 bg-card border border-border/80 rounded-2xl space-y-2">
              <h2 className="text-base font-bold text-foreground">2. Veri Kullanımı</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                Verileriniz yalnızca platform içindeki deneyiminizi iyileştirmek, topluluk etkileşimlerini yönetmek ve size bildirim göndermek için kullanılır.
              </p>
            </div>

            <div className="p-6 bg-card border border-border/80 rounded-2xl space-y-2">
              <h2 className="text-base font-bold text-foreground">3. Çerezler</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                Oturum tercihlerinizi hatırlamak ve erişilebilirlik ayarlarınızı kaydetmek için temel çerezler kullanmaktayız.
              </p>
            </div>

            <div className="p-6 bg-card border border-border/80 rounded-2xl space-y-2">
              <h2 className="text-base font-bold text-foreground">4. İletişim</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                Gizlilikle ilgili sorularınız için bizimle <a href="mailto:miracbirben@engelsizforum.com" className="text-sky-400 font-bold hover:underline">miracbirben@engelsizforum.com</a> üzerinden iletişime geçebilirsiniz.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/60">
            <h2 className="text-xl font-extrabold mb-6 text-foreground tracking-tight">Daha Fazla Bilgi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/about" className="bg-card border border-border/80 p-6 rounded-2xl block group transition-all hover:border-sky-500/40">
                <h3 className="font-bold text-base mb-1 text-foreground group-hover:text-sky-400 transition-colors tracking-tight">Hakkımızda</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Misyonumuz, vizyonumuz ve topluluk hedeflerimiz hakkında bilgi edinin.</p>
              </Link>
              <Link href="/discussions" className="bg-card border border-border/80 p-6 rounded-2xl block group transition-all hover:border-sky-500/40">
                <h3 className="font-bold text-base mb-1 text-foreground group-hover:text-sky-400 transition-colors tracking-tight">Tartışmalar</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Tüm kategorilerdeki güncel konuları inceleyin ve yardımlaşın.</p>
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 flex flex-col sm:flex-row gap-3">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-xl bg-card border border-border/80 px-5 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted"
            >
              Ana Sayfaya Dön
            </Link>
            <Link 
              href="/discussions" 
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-sky-400"
            >
              Tartışmaları Keşfet
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
