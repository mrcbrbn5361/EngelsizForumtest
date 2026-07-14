import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function SecurityPage() {
  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-foreground">Bilgi Güvenliği</h1>

        {/* Highlight Section */}
        <section className="mb-12">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <Shield size={24} className="text-primary" /> Güvenlik Standartlarımız
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">ŞİFRELER</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Şifreleriniz modern hash algoritmaları ile şifrelenerek güvenle saklanır.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">İLETİŞİM</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Tüm sunucu ve istemci veri trafiği uçtan uca SSL/TLS protokolü ile korunur.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">GÜNCEL</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Sistem altyapımız güvenlik açıklarına karşı düzenli olarak taranır ve güncellenir.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
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
            Platformumuzda bir güvenlik zafiyeti tespit ederseniz veya şüpheli bir güvenlik durumuyla karşılaşırsanız, bunu toplulukla paylaşmadan önce sorumlu bir şekilde bize iletmenizi rica ederiz. Güvenlik bildirimlerini çok ciddiye alıyor ve hızla aksiyon alıyoruz.
          </p>
          <p className="font-semibold text-foreground text-base mt-4">
            Zafiyet Raporlama E-postası: <a href="mailto:miracbirben@engelsizforum.com" className="text-primary hover:underline">miracbirben@engelsizforum.com</a>
          </p>

          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-bold mb-6 text-foreground tracking-tight">İlgili Sayfalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/privacy" className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group">
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">Gizlilik Politikası</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Hangi verilerin hangi amaçlarla işlendiğini detaylıca görün.</p>
              </Link>
              <Link href="/terms" className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group">
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">Kullanım Şartları</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Platformu kullanırken uymanız gereken kurallar dizisi.</p>
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
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
