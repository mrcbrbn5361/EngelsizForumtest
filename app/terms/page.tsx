import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Scale, CheckCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-black mb-8 tracking-tighter text-foreground">Kullanım Şartları</h1>

        {/* Highlight Section */}
        <section className="mb-12">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-black mb-4 flex items-center gap-3">
              <Scale size={24} className="text-primary" /> Temel Kurallarımız
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">SAYGI</div>
                <p className="text-xs text-muted-foreground">Kapsayıcı ve saygılı bir topluluk ortamını korumak zorunludur.</p>
              </div>
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">ERİŞİLEBİLİRLİK</div>
                <p className="text-xs text-muted-foreground">İçeriklerinizi herkesin erişebileceği şekilde (örneğin resim alt yazıları ekleyerek) paylaşmaya özen gösterin.</p>
              </div>
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">GÜVEN</div>
                <p className="text-xs text-muted-foreground">Sahte bilgi, manipülasyon ve kötü niyetli paylaşımlardan uzak durun.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg leading-relaxed font-medium">
            EngelsizForum platformunu kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. 
            Bu şartlar, topluluğumuzun sağlıklı, erişilebilir ve güvenli kalması için tasarlanmıştır.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12">1. Hizmet Şartlarının Kabulü</h2>
          <p>
            EngelsizForum&apos;a üye olarak veya platformu ziyaretçi olarak kullanarak bu şartlara uyacağınızı taahhüt edersiniz. 
            Bu şartlar zaman zaman güncellenebilir ve güncellemeler bu sayfada yayınlandığı andan itibaren geçerli olur.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. Üyelik ve Hesap Güvenliği</h2>
          <p>
            Hesabınızın güvenliğinden ve hesabınız aracılığıyla yapılan tüm işlemlerden kendiniz sorumlusunuz. 
            Şüpheli bir durum fark ettiğinizde derhal bizimle iletişime geçmelisiniz.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">3. Topluluk Kuralları ve İçerik İlkeleri</h2>
          <p>
            Platformumuzda nefret söylemi, ayrımcılık, taciz, telif hakkı ihlalleri ve yasa dışı içerikler paylaşılması kesinlikle yasaktır. 
            Paylaştığınız içeriklerin ekran okuyucular tarafından okunabilirliğini desteklemek adına açıklayıcı başlıklar ve alternatif metinler kullanmanız önerilir.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. Sorumluluk Sınırları</h2>
          <p>
            EngelsizForum, kullanıcılar tarafından oluşturulan içeriklerin doğruluğunu veya güvenilirliğini garanti etmez. 
            Platform, &quot;olduğu gibi&quot; sunulmaktadır ve kesintisiz çalışma garantisi vermez.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">5. İletişim ve Destek</h2>
          <p>
            Kullanım şartları ve kurallar ile ilgili tüm sorularınız için bize ulaşabilirsiniz:
          </p>
          <p className="font-bold text-foreground">
            E-posta: <a href="mailto:info@miracdeveloper.com.tr" className="text-primary hover:underline">info@miracdeveloper.com.tr</a>
          </p>

          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-black mb-6 text-foreground tracking-tight">İlgili Bağlantılar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/privacy" className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Gizlilik Politikası</h3>
                <p className="text-sm">Verilerinizin nasıl işlendiğini ve korunduğunu öğrenin.</p>
              </Link>
              <Link href="/accessibility" className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Erişilebilirlik Beyanı</h3>
                <p className="text-sm">Erişilebilirlik standartlarımız ve WCAG uyumumuz hakkında detaylar.</p>
              </Link>
            </div>
          </div>

          <div className="mt-16 pt-8 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/" 
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              Kabul Ediyorum ve Devam Et
            </Link>
            <Link 
              href="/" 
              className="px-8 py-4 bg-muted text-foreground rounded-xl font-bold text-center hover:bg-muted/80 transition-all"
            >
              Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
