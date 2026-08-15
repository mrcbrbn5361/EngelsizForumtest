import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function SecurityPage() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-5xl">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase tracking-wider mb-4">
            <Shield size={13} /> Güvenlik ve Gizlilik
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">Bilgi Güvenliği</h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
            Verilerinizin, şifrelerinizin ve etkileşimlerinizin güvenliği platformumuzun en yüksek önceliğidir.
          </p>
        </header>

        {/* Highlight Section */}
        <section className="mb-12">
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-10 shadow-sm relative">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground tracking-tight">
              <Shield size={24} className="text-sky-400" /> Güvenlik Standartlarımız
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 p-5 bg-muted/20 border border-border/60 rounded-xl">
                <div className="font-bold text-sky-400 text-xs uppercase tracking-wider">Şifreleme & Hash</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Kullanıcı parolaları modern kriptografik hash algoritmaları ile şifrelenerek saklanır.</p>
              </div>
              <div className="space-y-2 p-5 bg-muted/20 border border-border/60 rounded-xl">
                <div className="font-bold text-sky-400 text-xs uppercase tracking-wider">SSL / TLS İletişim</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Tüm sunucu ve istemci veri trafiği uçtan uca TLS protokolü ile korunur.</p>
              </div>
              <div className="space-y-2 p-5 bg-muted/20 border border-border/60 rounded-xl">
                <div className="font-bold text-sky-400 text-xs uppercase tracking-wider">Güvenlik Yamaları</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Sistem altyapımız güvenlik açıklarına karşı düzenli olarak taranır ve güncellenir.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-8 text-muted-foreground text-sm">
          <div className="bg-muted/20 border border-border/60 rounded-2xl p-6 sm:p-8">
            <p className="text-sm sm:text-base leading-relaxed font-medium text-foreground mb-0">
              EngelsizForum&apos;un güvenliği bizim için en yüksek önceliktir. Topluluğumuzun verilerini, mahremiyetini ve paylaşımlarını korumak için sektör standardı en iyi güvenlik protokollerini uyguluyoruz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-2">
              <h2 className="text-base font-bold text-foreground">1. Hesap Güvenliği ve Doğrulama</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Hesap oluşturma ve oturum açma süreçleri yetkisiz erişimleri engellemek üzere güvenli oturum yönetim araçları ve RLS (Row Level Security) ile yapılandırılmıştır.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-2">
              <h2 className="text-base font-bold text-foreground">2. Veri Tabanı Güvenliği</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Veritabanımız ve sunucularımız yetkisiz erişimleri engellemek amacıyla sıkı güvenlik duvarları arkasında barındırılmaktadır.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-2">
              <h2 className="text-base font-bold text-foreground">3. Sürekli Güncelleme</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Yazılım bileşenlerimiz ve bağımlılıklarımız güncel tutularak, bilinen açıklara karşı en kısa sürede yamalanmaktadır.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-2">
              <h2 className="text-base font-bold text-foreground">4. Sorumlu Zafiyet Bildirimi</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Platformumuzda bir güvenlik zafiyeti tespit ederseniz, sorumlu açıklama prensibiyle doğrudan bizimle iletişime geçebilirsiniz.
              </p>
            </div>
          </div>

          <div className="bg-sky-500/5 border border-sky-500/20 p-6 rounded-2xl">
            <h2 className="text-base font-bold text-foreground mb-2">Güvenlik Ekibi İletişim</h2>
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground mb-2">
              Zafiyet bildirimi veya hesap güvenliğiyle ilgili acil durumlar için:
            </p>
            <p className="font-bold text-sky-400 text-sm">
              <a href="mailto:miracbirben@engelsizforum.com" className="hover:underline">miracbirben@engelsizforum.com</a>
            </p>
          </div>

          <div className="pt-6 border-t border-border/60">
            <h2 className="text-lg font-bold mb-4 text-foreground tracking-tight">İlgili Sayfalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/privacy" className="bg-card border border-border/80 p-6 rounded-2xl block group transition-all hover:border-sky-500/40">
                <h3 className="font-bold text-base mb-1 text-foreground group-hover:text-sky-400 transition-colors tracking-tight">Gizlilik Politikası</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Hangi verilerin işlendiğini detaylıca görün.</p>
              </Link>
              <Link href="/terms" className="bg-card border border-border/80 p-6 rounded-2xl block group transition-all hover:border-sky-500/40">
                <h3 className="font-bold text-base mb-1 text-foreground group-hover:text-sky-400 transition-colors tracking-tight">Kullanım Şartları</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Platformu kullanırken geçerli topluluk kuralları.</p>
              </Link>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-xs font-bold text-white transition hover:bg-sky-400 uppercase tracking-wider"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
