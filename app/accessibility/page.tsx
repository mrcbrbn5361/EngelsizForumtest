import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { Award } from 'lucide-react';

export default function AccessibilityStatementPage() {
  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-foreground">Erişilebilirlik Beyanı</h1>

        {/* Commitment Badge Section */}
        <section className="mb-12">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <Award size={24} className="text-primary" /> WCAG 2.1 & 2.2 Hedeflerimiz
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">DÜZEY AA / AAA</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Tüm temel alanlarda WCAG 2.1 AA uyumluluk kriterlerini karşılıyor, AAA seviyesini hedefliyoruz.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">EKRAN OKUYUCULAR</div>
                <p className="text-xs text-muted-foreground leading-relaxed">VoiceOver, NVDA ve JAWS ile test edilmiş semantik HTML ve ARIA etiketleri.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">KLAVYE GEZİNTİSİ</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Mouse kullanmadan, sadece Tab tuşuyla tüm kontrollere ve sayfalara hızlı erişim.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg leading-relaxed font-normal text-foreground">
            EngelsizForum olarak, her bireyin bilgiye eşit ve engelsiz bir şekilde erişebilmesi gerektiğine inanıyoruz. 
            Bu doğrultuda, platformumuzu en güncel erişilebilirlik standartlarına uyacak şekilde tasarlıyor ve geliştiriyoruz.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12">1. Uygulanan Erişilebilirlik Standartları</h2>
          <p className="text-base leading-relaxed">
            EngelsizForum altyapısı, W3C Web Erişilebilirlik Girişimi (WAI) tarafından yayınlanan 
            <strong> Web İçeriği Erişilebilirlik Kılavuz İlkeleri (WCAG) 2.1</strong> temel alınarak geliştirilmiştir. 
            Amacımız, engelli, yaşlı veya geçici sınırlılıkları olan tüm kullanıcıların platformu engelsizce kullanabilmesidir.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. Entegre Edilen Erişilebilirlik Özellikleri</h2>
          <ul className="list-disc pl-6 space-y-3 text-base leading-relaxed">
            <li><strong>Gelişmiş Erişilebilirlik Paneli:</strong> Ekranın sol alt köşesindeki buton ile açılabilen panel sayesinde kontrast ayarı, font boyutu büyütme/küçültme, biyonik okuma modu ve harici bağlantı bildirimleri kolayca yönetilebilir.</li>
            <li><strong>Yapay Zeka Destekli Metin Sadeleştirme ve Özetleme:</strong> Karmaşık veya uzun yazılar yapay zeka ile özetlenerek bilişsel kolaylık sağlanır.</li>
            <li><strong>Doğal Ses Sentezi (Metin Okuma):</strong> Tartışmalardaki içerikler, tek bir tıkla yüksek kaliteli ses motorumuz ile seslendirilebilir.</li>
            <li><strong>Geniş Dokunmatik Alanlar:</strong> Mobil ve dokunmatik cihazlarda kolay kullanım için buton ve bağlantı alanları en az 44x44 piksel olacak şekilde optimize edilmiştir.</li>
            <li><strong>Net Odak Belirteçleri:</strong> Klavye ile gezinirken hangi öğenin odaklandığını gösteren yüksek kontrastlı odak çizgileri bulunur.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8">3. Desteklenen Yardımcı Teknolojiler</h2>
          <p className="text-base leading-relaxed">
            Platformumuz, aşağıdaki ekran okuyucular ve araçlarla uyumlu olacak şekilde semantik kodlanmıştır:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
            <li>Windows işletim sistemlerinde NVDA ve JAWS</li>
            <li>macOS ve iOS işletim sistemlerinde VoiceOver</li>
            <li>Android işletim sisteminde TalkBack</li>
            <li>Tarayıcı içi ekran büyüteçleri ve ekran klavyeleri</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. Geri Bildirim ve İletişim</h2>
          <p className="text-base leading-relaxed">
            Platformumuzun erişilebilirliğini artırmak için sürekli çalışıyoruz. Eğer bir sayfada, görselde veya etkileşimde erişilebilirlik engeliyle karşılaşırsanız, lütfen bize bildirmekten çekinmeyin. Geri bildirimlerinizi büyük bir önemle inceleyip en kısa sürede düzeltiyoruz.
          </p>
          <p className="font-semibold text-foreground text-base mt-4">
            E-posta: <a href="mailto:info@miracdeveloper.com.tr" className="text-primary hover:underline">info@miracdeveloper.com.tr</a>
          </p>

          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Erişilebilirlik Ekosistemi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/help" className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group">
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">Yardım Merkezi</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Platformu nasıl en verimli şekilde kullanabileceğinizi öğrenin.</p>
              </Link>
              <Link href="/about" className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group">
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">Hakkımızda</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Vizyonumuz, misyonumuz ve kapsayıcı toplum hedeflerimiz.</p>
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
