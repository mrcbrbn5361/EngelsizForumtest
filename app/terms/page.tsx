import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { Scale, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-5xl">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase tracking-wider mb-4">
            <Scale size={13} /> Kullanım İlkeleri
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">Kullanım Şartları</h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
            Topluluğumuzun sağlıklı, erişilebilir ve güvenli kalması için tasarlanmış kuralları ve ilkeleri kapsar.
          </p>
        </header>

        {/* Highlight Section */}
        <section className="mb-12">
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-10 shadow-sm relative">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground tracking-tight">
              <Scale size={24} className="text-sky-400" /> Temel İlkelerimiz
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
              <div className="space-y-2 p-5 bg-muted/20 border border-border/60 rounded-xl">
                <div className="font-bold text-sky-400 text-xs uppercase tracking-wider">Saygı ve Kapsayıcılık</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Kapsayıcı, yapıcı ve saygılı bir topluluk ortamını korumak zorunludur.</p>
              </div>
              <div className="space-y-2 p-5 bg-muted/20 border border-border/60 rounded-xl">
                <div className="font-bold text-sky-400 text-xs uppercase tracking-wider">Erişilebilirlik</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">İçeriklerinizi herkesin erişebileceği şekilde (resim açıklamaları, alternatif metinler) paylaşmaya özen gösterin.</p>
              </div>
              <div className="space-y-2 p-5 bg-muted/20 border border-border/60 rounded-xl">
                <div className="font-bold text-sky-400 text-xs uppercase tracking-wider">Güven ve Doğruluk</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Sahte bilgi, mevzuat manipülasyonu ve kötü niyetli yönlendirmelerden uzak durun.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-8 text-muted-foreground text-sm">
          <div className="bg-muted/20 border border-border/60 rounded-2xl p-6 sm:p-8">
            <p className="text-sm sm:text-base leading-relaxed font-medium text-foreground mb-0">
              EngelsizForum platformunu kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. 
              Bu şartlar, topluluğumuzun sağlıklı, erişilebilir ve güvenli kalması için tasarlanmıştır.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-2">
              <h2 className="text-base font-bold text-foreground">1. Hizmet Şartlarının Kabulü</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                EngelsizForum&apos;a üye olarak veya platformu ziyaretçi olarak kullanarak bu şartlara uyacağınızı taahhüt edersiniz. 
                Bu şartlar zaman zaman mevzuat veya platform yeniliklerine göre güncellenebilir.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-2">
              <h2 className="text-base font-bold text-foreground">2. Üyelik ve Hesap Güvenliği</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Hesabınızın güvenliğinden ve hesabınız aracılığıyla yapılan tüm işlemlerden kendiniz sorumlusunuz. 
                Şüpheli bir durum fark ettiğinizde derhal yöneticilerle iletişime geçmelisiniz.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-2">
              <h2 className="text-base font-bold text-foreground">3. Topluluk Kuralları</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Platformumuzda nefret söylemi, ayrımcılık, taciz, telif hakkı ihlalleri ve yasa dışı içerikler paylaşılması kesinlikle yasaktır.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-2">
              <h2 className="text-base font-bold text-foreground">4. Sorumluluk Sınırları</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Kullanıcılar tarafından paylaşılan mevzuat deneyimleri ve öneriler bilgilendirme amaçlıdır. Nihai kararlarda resmi kurum tebliğleri esas alınmalıdır.
              </p>
            </div>
          </div>

          <div className="bg-sky-500/5 border border-sky-500/20 p-6 rounded-2xl">
            <h2 className="text-base font-bold text-foreground mb-2">5. İletişim ve Destek</h2>
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground mb-2">
              Kullanım şartları ve kurallar ile ilgili tüm sorularınız için bize ulaşabilirsiniz:
            </p>
            <p className="font-bold text-sky-400 text-sm">
              <a href="mailto:miracbirben@engelsizforum.com" className="hover:underline">miracbirben@engelsizforum.com</a>
            </p>
          </div>

          <div className="pt-6 border-t border-border/60">
            <h2 className="text-lg font-bold mb-4 text-foreground tracking-tight">İlgili Bağlantılar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/privacy" className="bg-card border border-border/80 p-6 rounded-2xl block group transition-all hover:border-sky-500/40">
                <h3 className="font-bold text-base mb-1 text-foreground group-hover:text-sky-400 transition-colors tracking-tight">Gizlilik Politikası</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Verilerinizin nasıl korunduğunu öğrenin.</p>
              </Link>
              <Link href="/about" className="bg-card border border-border/80 p-6 rounded-2xl block group transition-all hover:border-sky-500/40">
                <h3 className="font-bold text-base mb-1 text-foreground group-hover:text-sky-400 transition-colors tracking-tight">Hakkımızda</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">Platformumuzun vizyonu ve hikayesi hakkında detaylar.</p>
              </Link>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-xs font-bold text-white transition hover:bg-sky-400 uppercase tracking-wider"
            >
              Kabul Ediyorum ve Devam Et
            </Link>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-xl bg-muted/60 border border-border/80 px-6 py-3 text-xs font-bold text-foreground transition hover:bg-muted gap-2 uppercase tracking-wider"
            >
              <ArrowLeft size={14} /> Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
