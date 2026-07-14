import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-foreground">Kullanım Şartları</h1>

        {/* Highlight Section */}
        <section className="mb-12">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <Scale size={24} className="text-primary" /> Temel Kurallarımız
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">SAYGI</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Kapsayıcı ve saygılı bir topluluk ortamını korumak zorunludur.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">ERİŞİLEBİLİRLİK</div>
                <p className="text-xs text-muted-foreground leading-relaxed">İçeriklerinizi herkesin erişebileceği şekilde (örneğin resim alt yazıları ekleyerek) paylaşmaya özen gösterin.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">GÜVEN</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Sahte bilgi, manipülasyon ve kötü niyetli paylaşımlardan uzak durun.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg leading-relaxed font-normal text-foreground">
            EngelsizForum platformunu kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. 
            Bu şartlar, topluluğumuzun sağlıklı, erişilebilir ve güvenli kalması için tasarlanmıştır.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12">1. Hizmet Şartlarının Kabulü</h2>
          <p className="text-base leading-relaxed">
            EngelsizForum&apos;a üye olarak veya platformu ziyaretçi olarak kullanarak bu şartlara uyacağınızı taahhüt edersiniz. 
            Bu şartlar zaman zaman güncellenebilir ve güncellemeler bu sayfada yayınlandığı andan itibaren geçerli olur.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. Üyelik ve Hesap Güvenliği</h2>
          <p className="text-base leading-relaxed">
            Hesabınızın güvenliğinden ve hesabınız aracılığıyla yapılan tüm işlemlerden kendiniz sorumlusunuz. 
            Şüpheli bir durum fark ettiğinizde derhal bizimle iletişime geçmelisiniz.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">3. Topluluk Kuralları ve İçerik İlkeleri</h2>
          <p className="text-base leading-relaxed">
            Platformumuzda nefret söylemi, ayrımcılık, taciz, telif hakkı ihlalleri ve yasa dışı içerikler paylaşılması kesinlikle yasaktır. 
            Paylaştığınız içeriklerin ekran okuyucular tarafından okunabilirliğini desteklemek adına açıklayıcı başlıklar ve alternatif metinler kullanmanız önerilir.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. Sorumluluk Sınırları</h2>
          <p className="text-base leading-relaxed">
            EngelsizForum, kullanıcılar tarafından oluşturulan içeriklerin doğruluğunu veya güvenilirliğini garanti etmez. 
            Platform, &quot;olduğu gibi&quot; sunulmaktadır ve kesintisiz çalışma garantisi vermez.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">5. İletişim ve Destek</h2>
          <p className="text-base leading-relaxed">
            Kullanım şartları ve kurallar ile ilgili tüm sorularınız için bize ulaşabilirsiniz:
          </p>
          <p className="font-semibold text-foreground text-base mt-4">
            E-posta: <a href="mailto:miracbirben@engelsizforum.com" className="text-primary hover:underline">miracbirben@engelsizforum.com</a>
          </p>

          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-bold mb-6 text-foreground tracking-tight">İlgili Bağlantılar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/privacy" className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group">
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">Gizlilik Politikası</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Verilerinizin nasıl işlendiğini ve korunduğunu öğrenin.</p>
              </Link>
              <Link href="/accessibility" className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group">
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">Erişilebilirlik Beyanı</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Erişilebilirlik standartlarımız ve WCAG uyumumuz hakkında detaylar.</p>
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/" 
              className="px-6 py-3 bg-primary text-primary-foreground rounded font-bold text-center hover:brightness-110 active:scale-[0.98] transition-all min-h-[48px] flex items-center justify-center text-sm"
            >
              Kabul Ediyorum ve Devam Et
            </Link>
            <Link 
              href="/" 
              className="px-6 py-3 bg-muted border border-border text-foreground rounded font-bold text-center hover:bg-muted/80 active:scale-[0.98] transition-all min-h-[48px] flex items-center justify-center text-sm"
            >
              Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
