import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { Scale, ArrowLeft, ArrowRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <header className="mb-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">Kullanım Şartları</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto font-medium">
            Topluluğumuzun sağlıklı, erişilebilir ve güvenli kalması için tasarlanmış kuralları ve ilkeleri kapsar.
          </p>
        </header>

        {/* Highlight Section */}
        <section className="mb-24">
          <div className="bg-card border border-border rounded-3xl p-10 md:p-16 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-2xl font-bold mb-10 flex items-center gap-4 text-foreground tracking-tight">
              <Scale size={32} className="text-primary" /> Temel Kurallarımız
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
              <div className="space-y-3 p-6 bg-muted/40 border border-border/40 rounded-2xl">
                <div className="font-bold text-primary text-xs uppercase tracking-widest">SAYGI</div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">Kapsayıcı ve saygılı bir topluluk ortamını korumak zorunludur.</p>
              </div>
              <div className="space-y-3 p-6 bg-muted/40 border border-border/40 rounded-2xl">
                <div className="font-bold text-primary text-xs uppercase tracking-widest">ERİŞİLEBİLİRLİK</div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">İçeriklerinizi herkesin erişebileceği şekilde (resim açıklamaları, alternatif metinler) paylaşmaya özen gösterin.</p>
              </div>
              <div className="space-y-3 p-6 bg-muted/40 border border-border/40 rounded-2xl">
                <div className="font-bold text-primary text-xs uppercase tracking-widest">GÜVEN</div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">Sahte bilgi, manipülasyon ve kötü niyetli paylaşımlardan uzak durun.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-12 text-muted-foreground">
          <div className="bg-muted/20 border border-border rounded-3xl p-8 md:p-12 mb-16">
            <p className="text-xl leading-relaxed font-medium text-foreground mb-0">
              EngelsizForum platformunu kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. 
              Bu şartlar, topluluğumuzun sağlıklı, erişilebilir ve güvenli kalması için tasarlanmıştır.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Hizmet Şartlarının Kabulü</h2>
              <p className="text-lg leading-relaxed">
                EngelsizForum&apos;a üye olarak veya platformu ziyaretçi olarak kullanarak bu şartlara uyacağınızı taahhüt edersiniz. 
                Bu şartlar zaman zaman güncellenebilir ve güncellemeler bu sayfada yayınlandığı andan itibaren geçerli olur.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Üyelik ve Hesap Güvenliği</h2>
              <p className="text-lg leading-relaxed">
                Hesabınızın güvenliğinden ve hesabınız aracılığıyla yapılan tüm işlemlerden kendiniz sorumlusunuz. 
                Şüpheli bir durum fark ettiğinizde derhal bizimle iletişime geçmelisiniz.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Topluluk Kuralları</h2>
              <p className="text-lg leading-relaxed">
                Platformumuzunda nefret söylemi, ayrımcılık, taciz, telif hakkı ihlalleri ve yasa dışı içerikler paylaşılması kesinlikle yasaktır. 
                Erişilebilirliği desteklemek adına açıklayıcı başlıklar kullanmanız önerilir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Sorumluluk Sınırları</h2>
              <p className="text-lg leading-relaxed">
                EngelsizForum, kullanıcılar tarafından oluşturulan içeriklerin doğruluğunu garanti etmez. 
                Platform, &quot;olduğu gibi&quot; sunulmaktadır.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 p-10 rounded-3xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">5. İletişim ve Destek</h2>
            <p className="text-lg leading-relaxed mb-4">
              Kullanım şartları ve kurallar ile ilgili tüm sorularınız için bize ulaşabilirsiniz:
            </p>
            <p className="font-bold text-primary text-xl">
              <a href="mailto:miracbirben@engelsizforum.com" className="hover:underline">miracbirben@engelsizforum.com</a>
            </p>
          </div>

          <div className="mt-24 pt-16 border-t border-border">
            <h2 className="text-3xl font-extrabold mb-10 text-foreground tracking-tight">İlgili Bağlantılar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link href="/privacy" className="bg-card border border-border p-10 rounded-3xl block group transition-all hover:border-primary/50 hover:shadow-md">
                <h3 className="font-bold text-2xl mb-3 text-foreground group-hover:text-primary transition-colors tracking-tight">Gizlilik Politikası</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">Verilerinizin nasıl işlendiğini ve korunduğunu öğrenin.</p>
              </Link>
              <Link href="/about" className="bg-card border border-border p-10 rounded-3xl block group transition-all hover:border-primary/50 hover:shadow-md">
                <h3 className="font-bold text-2xl mb-3 text-foreground group-hover:text-primary transition-colors tracking-tight">Hakkımızda</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">Platformumuzun vizyonu ve hikayesi hakkında detaylar.</p>
              </Link>
            </div>
          </div>

          <div className="mt-24 pt-12 flex flex-col sm:flex-row gap-6">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-xl bg-primary px-10 py-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              Kabul Ediyorum ve Devam Et
            </Link>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-xl bg-background border border-border px-10 py-5 text-sm font-bold text-foreground transition hover:bg-muted gap-3"
            >
              <ArrowLeft size={16} /> Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
