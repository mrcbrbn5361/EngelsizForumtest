import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { Shield, ArrowLeft, CheckCircle2, Mail, FileText } from 'lucide-react';

export default function SecurityPage() {
  return (
    <SiteLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
        
        {/* Header Hero */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Shield size={14} className="text-emerald-400" />
            <span>Güvenlik Bilgisi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Güvenlik
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
            Bu sayfa yalnızca sitenin bugün yaptığı güvenlik uygulamalarını anlatır. Bir güvenlik açığı fark ederseniz aşağıdaki adrese bildirebilirsiniz.
          </p>
        </header>

        <section aria-labelledby="security-pillars" className="space-y-4">
          <h2 id="security-pillars" className="text-base sm:text-lg font-bold text-foreground pb-2 border-b border-border/60">
            Bugün Uygulananlar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card/85 border border-border/80 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">HTTPS</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                Site HTTPS üzerinden sunulur.
              </p>
            </div>

            <div className="bg-card/85 border border-border/80 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Shield size={18} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">Hesaplayıcı girdileri</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                Hesaplayıcılara girdiğiniz değerler tarayıcınızda işlenir; forum veritabanına yazılmaz.
              </p>
            </div>
          </div>
        </section>

        {/* Security Contact */}
        <section className="bg-card/90 border border-emerald-500/20 p-6 sm:p-8 rounded-2xl space-y-4 backdrop-blur-md shadow-xs">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Mail size={20} className="text-emerald-400" />
              <span>Güvenlik Bildirimi</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
              Bir güvenlik açığı bildirmek için bu adrese yazabilirsiniz.
            </p>
          </div>

          <div className="pt-2">
            <a 
              href="mailto:miracbirben@engelsizforum.com" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
            >
              <Mail size={14} />
              <span>miracbirben@engelsizforum.com</span>
            </a>
          </div>
        </section>

        {/* Related Policy Links */}
        <section className="space-y-4 pt-4 border-t border-border/60">
          <h3 className="text-sm font-bold text-foreground">İlgili Yasal Dokümanlar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              href="/privacy" 
              className="p-4 rounded-xl bg-card border border-border/80 hover:border-sky-500/40 transition-colors flex items-center justify-between group"
            >
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-sky-400 transition-colors">Gizlilik Politikası</span>
                <p className="text-xs text-muted-foreground font-normal">Kişisel verilerin işlenmesi ve KVKK ilkeleri.</p>
              </div>
              <FileText size={16} className="text-muted-foreground group-hover:text-sky-400 transition-colors shrink-0" />
            </Link>

            <Link 
              href="/terms" 
              className="p-4 rounded-xl bg-card border border-border/80 hover:border-sky-500/40 transition-colors flex items-center justify-between group"
            >
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-sky-400 transition-colors">Kullanım Şartları</span>
                <p className="text-xs text-muted-foreground font-normal">Topluluk kuralları ve kullanıcı hakları sözleşmesi.</p>
              </div>
              <FileText size={16} className="text-muted-foreground group-hover:text-sky-400 transition-colors shrink-0" />
            </Link>
          </div>
        </section>

        {/* Back Link */}
        <div className="pt-2">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-card border border-border/80 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

      </div>
    </SiteLayout>
  );
}
