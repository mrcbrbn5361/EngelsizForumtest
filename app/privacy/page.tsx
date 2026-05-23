import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Link from 'next/link';

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-black mb-8 tracking-tighter text-foreground">Gizlilik Politikası</h1>
        
        {/* Key Takeaways Section */}
        <section className="mb-12">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-black mb-4 flex items-center gap-3">
              <span className="text-primary">💡</span> Önemli Bilgiler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">GİZLİLİK</div>
                <p className="text-xs text-muted-foreground">Verileriniz bizimle güvende, üçüncü taraflara satılmaz.</p>
              </div>
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">KONTROL</div>
                <p className="text-xs text-muted-foreground">Verileriniz üzerinde tam kontrole sahipsiniz, istediğiniz zaman silebilirsiniz.</p>
              </div>
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">ŞEFFAFLIK</div>
                <p className="text-xs text-muted-foreground">Hangi veriyi neden topladığımızı açıkça belirtiyoruz.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg leading-relaxed font-medium">
            EngelsizForum olarak gizliliğinize önem veriyoruz. Bu politika, platformumuzu kullanırken verilerinizin nasıl işlendiğini açıklar. 
            Daha fazla bilgi için <Link href="/about" className="text-primary hover:underline font-bold">Hakkımızda</Link> sayfamızı da inceleyebilirsiniz.
          </p>
          
          <h2 className="text-2xl font-bold text-foreground mt-12">1. Toplanan Veriler</h2>
          <p>
            Hesap oluştururken verdiğiniz e-posta adresi, kullanıcı adı ve profil bilgileri güvenli bir şekilde saklanır.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. Veri Kullanımı</h2>
          <p>
            Verileriniz yalnızca platform içindeki deneyiminizi iyileştirmek, topluluk etkileşimlerini yönetmek ve size bildirim göndermek için kullanılır.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">3. Çerezler</h2>
          <p>
            Oturum tercihlerinizi hatırlamak ve erişilebilirlik ayarlarınızı kaydetmek için temel çerezler kullanmaktayız.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. İletişim</h2>
          <p>
            Gizlilikle ilgili sorularınız için bizimle iletişime geçebilirsiniz.
          </p>

          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-black mb-6 text-foreground tracking-tight">Daha Fazla Bilgi</h2>
            <p className="mb-8">
              Erişilebilirlik politikalarımız ve platformumuzun vizyonu hakkında daha fazla bilgi edinmek için aşağıdaki kaynakları inceleyebilirsiniz:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/about" className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Hakkımızda</h3>
                <p className="text-sm">Misyonumuz, vizyonumuz ve hikayemiz hakkında bilgi edinin.</p>
              </Link>
              <Link href="/communities" className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Topluluklar</h3>
                <p className="text-sm">İlgi alanlarınıza uygun gruplara katılın ve yardımlaşın.</p>
              </Link>
            </div>
          </div>

          <div className="mt-16 pt-8 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/" 
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              Ana Sayfaya Dön
            </Link>
            <Link 
              href="/discussions" 
              className="px-8 py-4 bg-muted text-foreground rounded-xl font-bold text-center hover:bg-muted/80 transition-all"
            >
              Tartışmaları Keşfet
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
