import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function SecurityPage() {
  return (
    <SiteLayout>
      <div className="vibe-container py-12 md:py-24">
        <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mb-16 text-xs font-bold uppercase tracking-wider text-primary">
          <Link href="/" className="hover:underline">ANA SAYFA</Link>
          <Link href="/discussions" className="hover:underline">TARTIŞMALAR</Link>
          <Link href="/communities" className="hover:underline">TOPLULUKLAR</Link>
        </nav>

        <header className="mb-16 text-center">
          <h1 className="vibe-section-title mb-6">Bilgi Güvenliği</h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed px-4 max-w-4xl mx-auto font-normal">
            Verilerinizin, şifrelerinizin ve etkileşimlerinizin güvenliği platformumuzun en yüksek önceliğidir.
          </p>
        </header>

        {/* Highlight Section */}
        <section className="mb-16">
          <div className="vibe-card p-10 md:p-12 relative overflow-hidden shadow-2xl">
            <h2 className="text-2xl font-black mb-10 flex items-center gap-4 text-foreground uppercase tracking-tight">
              <Shield size={32} className="text-primary" /> Güvenlik Standartlarımız
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-2 p-6 bg-muted/40 border border-border/40 rounded-2xl">
                <div className="font-black text-primary text-xs uppercase tracking-widest">ŞİFRELER</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Şifreleriniz modern hash algoritmaları ile şifrelenerek güvenle saklanır.</p>
              </div>
              <div className="space-y-2 p-6 bg-muted/40 border border-border/40 rounded-2xl">
                <div className="font-black text-primary text-xs uppercase tracking-widest">İLETİŞİM</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Tüm sunucu ve istemci veri trafiği uçtan uca SSL/TLS protokolü ile korunur.</p>
              </div>
              <div className="space-y-2 p-6 bg-muted/40 border border-border/40 rounded-2xl">
                <div className="font-black text-primary text-xs uppercase tracking-widest">GÜNCEL</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Sistem altyapımız güvenlik açıklarına karşı düzenli olarak taranır ve güncellenir.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground">
          <p className="text-lg leading-relaxed font-normal text-foreground">
            EngelsizForum&apos;un güvenliği bizim için en yüksek önceliktir. Topluluğumuzun verilerini, mahremiyetini ve paylaşımlarını korumak için sektör standardı en iyi güvenlik protokollerini uyguluyoruz.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12">1. Hesap Güvenliği ve Doğrulama</h2>
          <p className="text-base leading-relaxed">
            Hesap oluşturma ve oturum açma süreçleri, yetkisiz erişimleri engellemek üzere güvenli oturum yönetim araçları ile yapılandırılmıştır. 
            Güçlü şifre politikaları teşvik edilerek hesap ele geçirme girişimlerinin önüne geçilmektedir.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. Veri Şifreleme</h2>
          <p className="text-base leading-relaxed">
            Veri tabanlarımız ve sunucularımız, yetkisiz fiziksel veya dijital erişimleri engellemek amacıyla sıkı güvenlik duvarları arkasında barındırılmaktadır. 
            Uygulamamızın veri tabanında saklanan kişisel bilgileriniz ve iletileriniz veri güvenliği standartlarına uygun şekilde şifrelenir.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">3. Sürekli Güncelleme ve Güvenlik Yamaları</h2>
          <p className="text-base leading-relaxed">
            Yazılım bileşenlerimiz ve bağımlılıklarımız güncel tutularak, bilinen açıklara karşı en kısa sürede yamalanmaktadır. 
            Adil ve emniyetli bir kullanım için zafiyet tarayıcıları ve koruma katmanları sürekli etkindir.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. Güvenlik Açığı Bildirimi</h2>
          <p className="text-base leading-relaxed">
            Platformumuzda bir güvenlik zafiyeti tespit ederseniz veya şüpheli bir güvenlik durumuyla karşılaşırsanız, bunu toplulukla paylaşmadan önce sorumlu bir şekilde bize iletmenizi rica ederiz. Güvenlik bildirimlerini çok ciddiye alıyor ve hızla aksiyon lıyoruz.
          </p>
          <p className="font-semibold text-foreground text-base mt-4">
            Zafiyet Raporlama E-postası: <a href="mailto:miracbirben@engelsizforum.com" className="text-primary hover:underline">miracbirben@engelsizforum.com</a>
          </p>

          <div className="mt-16 pt-12 border-t border-border">
            <h2 className="text-2xl font-black mb-8 text-foreground uppercase tracking-tight">İlgili Sayfalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link href="/privacy" className="vibe-card vibe-card-hover p-8 block group">
                <h3 className="font-black text-lg mb-2 text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">Gizlilik Politikası</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-semibold">Hangi verilerin hangi amaçlarla işlendiğini detaylıca görün.</p>
              </Link>
              <Link href="/terms" className="vibe-card vibe-card-hover p-8 block group">
                <h3 className="font-black text-lg mb-2 text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">Kullanım Şartları</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-semibold">Platformu kullanırken uymanız gereken kurallar dizisi.</p>
              </Link>
            </div>
          </div>

          <div className="mt-16 pt-8 flex flex-col sm:flex-row gap-6">
            <Link 
              href="/" 
              className="vibe-button-primary h-16 px-10 text-xs w-full sm:w-auto"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
