import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Link from 'next/link';
import { Shield, Eye, Lock, RefreshCw, Mail } from 'lucide-react';

export default function SecurityPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-black mb-8 tracking-tighter text-foreground">Bilgi Güvenliği</h1>

        {/* Highlight Section */}
        <section className="mb-12">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-black mb-4 flex items-center gap-3">
              <Shield size={24} className="text-primary" /> Güvenlik Standartlarımız
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">ŞİFRELER</div>
                <p className="text-xs text-muted-foreground">Şifreleriniz modern hash algoritmaları ile şifrelenerek güvenle saklanır.</p>
              </div>
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">İLETİŞİM</div>
                <p className="text-xs text-muted-foreground">Tüm sunucu ve istemci veri trafiği uçtan uca SSL/TLS protokolü ile korunur.</p>
              </div>
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">GÜNCEL</div>
                <p className="text-xs text-muted-foreground">Sistem altyapımız güvenlik açıklarına karşı düzenli olarak taranır ve güncellenir.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg leading-relaxed font-medium">
            EngelsizForum&apos;un güvenliği bizim için en yüksek önceliktir. Topluluğumuzun verilerini, mahremiyetini ve paylaşımlarını korumak için sektör standardı en iyi güvenlik protokollerini uyguluyoruz.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12">1. Hesap Güvenliği ve Doğrulama</h2>
          <p>
            Hesap oluşturma ve oturum açma süreçleri, yetkisiz erişimleri engellemek üzere güvenli oturum yönetim araçları ile yapılandırılmıştır. 
            Güçlü şifre politikaları teşvik edilerek hesap ele geçirme girişimlerinin önüne geçilmektedir.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. Veri Şifreleme</h2>
          <p>
            Veri tabanlarımız ve sunucularımız, yetkisiz fiziksel veya dijital erişimleri engellemek amacıyla sıkı güvenlik duvarları arkasında barındırılmaktadır. 
            Uygulamamızın veri tabanında saklanan kişisel bilgileriniz ve iletileriniz veri güvenliği standartlarına uygun şekilde şifrelenir.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">3. Sürekli Güncelleme ve Güvenlik Yamaları</h2>
          <p>
            Yazılım bileşenlerimiz ve bağımlılıklarımız güncel tutularak, bilinen açıklara karşı en kısa sürede yamalanmaktadır. 
            Ayrıca kötü niyetli istekleri (DDoS, XSS, CSRF vb.) engellemek üzere güvenlik mekanizmaları devrededir.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. Güvenlik Açığı Bildirimi</h2>
          <p>
            Platformumuzda bir güvenlik zafiyeti tespit ederseniz veya şüpheli bir güvenlik durumuyla karşılaşırsanız, bunu toplulukla paylaşmadan önce sorumlu bir şekilde bize iletmenizi rica ederiz. Güvenlik bildirimlerini çok ciddiye alıyor ve hızla aksiyon alıyoruz.
          </p>
          <p className="font-bold text-foreground">
            Zafiyet Raporlama E-postası: <a href="mailto:info@miracdeveloper.com.tr" className="text-primary hover:underline">info@miracdeveloper.com.tr</a>
          </p>

          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-black mb-6 text-foreground tracking-tight">İlgili Sayfalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/privacy" className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Gizlilik Politikası</h3>
                <p className="text-sm">Hangi verilerin hangi amaçlarla işlendiğini detaylıca görün.</p>
              </Link>
              <Link href="/terms" className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Kullanım Şartları</h3>
                <p className="text-sm">Platformu kullanırken uymanız gereken kurallar dizisi.</p>
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
