import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function PrivacyPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-black mb-8 tracking-tighter">Gizlilik Politikası</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg leading-relaxed">
            EngelsizForum olarak gizliliğinize önem veriyoruz. Bu politika, platformumuzu kullanırken verilerinizin nasıl işlendiğini açıklar.
          </p>
          
          <h2 className="text-2xl font-bold text-foreground mt-12">1. Toplanan Veriler</h2>
          <p>
            Hesap oluştururken verdiğiniz e-posta adresi, kullanıcı adı ve profil bilgileri güvenli bir şekilde saklanır.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. Veri Kullanımı</h2>
          <p>
            Verileriniz yalnızca platform içindeki deneyiminizi iyileştirmek, topluluk etkileşimlerini yönetmek ve size bildirim göndermek için kullanılır.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">3. Çerezler</h2>
          <p>
            Oturum tercihlerinizi hatırlamak ve erişilebilirlik ayarlarınızı kaydetmek için temel çerezler kullanmaktayız.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. İletişim</h2>
          <p>
            Gizlilikle ilgili sorularınız için bizimle iletişime geçebilirsiniz.
          </p>

          <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row gap-4">
            <a 
              href="/" 
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-center hover:opacity-90 transition-all"
            >
              Ana Sayfaya Dön
            </a>
            <a 
              href="/discussions" 
              className="px-8 py-3 bg-muted text-foreground rounded-xl font-bold text-center hover:bg-muted/80 transition-all"
            >
              Tartışmalara Göz At
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
