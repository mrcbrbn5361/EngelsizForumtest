import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Award, HelpCircle } from 'lucide-react';

export default function AccessibilityStatementPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-black mb-8 tracking-tighter text-foreground">Erişilebilirlik Beyanı</h1>

        {/* Commitment Badge Section */}
        <section className="mb-12">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-black mb-4 flex items-center gap-3">
              <Award size={24} className="text-primary" /> WCAG 2.1 & 2.2 Hedeflerimiz
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">DÜZEY AA / AAA</div>
                <p className="text-xs text-muted-foreground">Tüm temel alanlarda WCAG 2.1 AA uyumluluk kriterlerini karşılıyor, AAA seviyesini hedefliyoruz.</p>
              </div>
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">EKRAN OKUYUCULAR</div>
                <p className="text-xs text-muted-foreground">VoiceOver, NVDA ve JAWS ile test edilmiş semantik HTML ve ARIA etiketleri.</p>
              </div>
              <div>
                <div className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">KLAVYE GEZİNTİSİ</div>
                <p className="text-xs text-muted-foreground">Mouse kullanmadan, sadece Tab tuşuyla tüm kontrollere ve sayfalara hızlı erişim.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg leading-relaxed font-medium">
            EngelsizForum olarak, her bireyin bilgiye eşit ve engelsiz bir şekilde erişebilmesi gerektiğine inanıyoruz. 
            Bu doğrultuda, platformumuzu en güncel erişilebilirlik standartlarına uyacak şekilde tasarlıyor ve geliştiriyoruz.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12">1. Uygulanan Erişilebilirlik Standartları</h2>
          <p>
            EngelsizForum altyapısı, W3C Web Erişilebilirlik Girişimi (WAI) tarafından yayınlanan 
            <strong> Web İçeriği Erişilebilirlik Kılavuz İlkeleri (WCAG) 2.1</strong> temel alınarak geliştirilmiştir. 
            Amacımız, engelli, yaşlı veya geçici sınırlılıkları olan tüm kullanıcıların platformu engelsizce kullanabilmesidir.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. Entegre Edilen Erişilebilirlik Özellikleri</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Gelişmiş Erişilebilirlik Paneli:</strong> Ekranın sol alt köşesindeki buton ile açılabilen panel sayesinde kontrast ayarı, font boyutu büyütme/küçültme, biyonik okuma modu ve harici bağlantı bildirimleri kolayca yönetilebilir.</li>
            <li><strong>Yapay Zeka Destekli Metin Sadeleştirme ve Özetleme:</strong> Karmaşık veya uzun yazılar yapay zeka ile özetlenerek bilişsel kolaylık sağlanır.</li>
            <li><strong>Doğal Ses Sentezi (Metin Okuma):</strong> Tartışmalardaki içerikler, tek bir tıkla yüksek kaliteli ses motorumuz ile seslendirilebilir.</li>
            <li><strong>Geniş Dokunmatik Alanlar:</strong> Mobil ve dokunmatik cihazlarda kolay kullanım için buton ve bağlantı alanları en az 44x44 piksel olacak şekilde optimize edilmiştir.</li>
            <li><strong>Net Odak Belirteçleri:</strong> Klavye ile gezinirken hangi öğenin odaklandığını gösteren yüksek kontrastlı odak çizgileri bulunur.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8">3. Desteklenen Yardımcı Teknolojiler</h2>
          <p>
            Platformumuz, aşağıdaki ekran okuyucular ve araçlarla uyumlu olacak şekilde semantik kodlanmıştır:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Windows işletim sistemlerinde NVDA ve JAWS</li>
            <li>macOS ve iOS işletim sistemlerinde VoiceOver</li>
            <li>Android işletim sisteminde TalkBack</li>
            <li>Tarayıcı içi ekran büyüteçleri ve ekran klavyeleri</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. Geri Bildirim ve İletişim</h2>
          <p>
            Platformumuzun erişilebilirliğini artırmak için sürekli çalışıyoruz. Eğer bir sayfada, görselde veya etkileşimde erişilebilirlik engeliyle karşılaşırsanız, lütfen bize bildirmekten çekinmeyin. Geri bildirimlerinizi büyük bir önemle inceleyip en kısa sürede düzeltiyoruz.
          </p>
          <p className="font-bold text-foreground">
            E-posta: <a href="mailto:info@miracdeveloper.com.tr" className="text-primary hover:underline">info@miracdeveloper.com.tr</a>
          </p>

          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-black mb-6 text-foreground tracking-tight">Erişilebilirlik Ekosistemi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/help" className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Yardım Merkezi</h3>
                <p className="text-sm">Platformu nasıl en verimli şekilde kullanabileceğinizi öğrenin.</p>
              </Link>
              <Link href="/about" className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Hakkımızda</h3>
                <p className="text-sm">Vizyonumuz, misyonumuz ve kapsayıcı toplum hedeflerimiz.</p>
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
