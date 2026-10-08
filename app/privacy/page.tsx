import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { ShieldCheck, Lock, Home, ArrowLeft, Eye, Database, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <SiteLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Verilerim üçüncü taraflarla paylaşılıyor mu?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Hayır, kişisel verileriniz asla reklam amacıyla veya üçüncü taraf şirketlerle paylaşılmaz."
                }
              },
              {
                "@type": "Question",
                "name": "Hesabımı nasıl silebilirim?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Profil ayarlarınızdan veya destek ekibimizle iletişime geçerek hesabınızı ve tüm verilerinizi kalıcı olarak silebilirsiniz."
                }
              }
            ]
          })
        }}
      />

      <div className="flex flex-col gap-5 w-full">
        {/* Breadcrumb Navigation */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 shadow-xs">
          <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
            <Home size={13} />
            <span>Ana Sayfa</span>
          </Link>
          <span className="opacity-40">/</span>
          <span className="font-extrabold text-slate-950 dark:text-white">Gizlilik Politikası</span>
        </div>

        {/* Header Block */}
        <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <div className="bg-sky-800 dark:bg-sky-950 text-white font-black uppercase text-xs tracking-wider py-3 px-4 flex items-center justify-between border-b-2 border-sky-900">
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-sky-300" />
              <span>GİZLİLİK POLİTİKASI &amp; KİŞİSEL VERİLERİN KORUNMASI</span>
            </div>
            <span className="text-[10px] font-bold text-sky-200 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-700">
              KVKK &amp; GDPR Uyumlu
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-2 text-slate-700 dark:text-slate-300">
            <h1 className="text-base sm:text-lg font-black text-slate-950 dark:text-white tracking-tight">
              Verilerinizin Güvenliği ve Mahremiyeti Güvencemiz Altındadır
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              EngelsizForum olarak üyelerimizin mahremiyetine en yüksek hassasiyeti gösteriyoruz. Bu sayfa, platformumuzda toplanan verilerin mahiyetini, kullanım sınırlarını ve haklarınızı şeffaf biçimde açıklar.
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <div className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-800 text-sky-800 dark:text-sky-300 font-black uppercase text-xs tracking-wider py-3 px-4 flex items-center gap-2">
            <ShieldCheck size={15} />
            <span>Temel Gizlilik İlkelerimiz</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-extrabold text-xs uppercase tracking-wide">
                <Eye size={15} />
                <span>Sıfır Reklam Takibi</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Verileriniz asla reklam hedeflemesi amacıyla kullanılmaz, üçüncü şahıslara veya veri simsarlarına satılmaz.
              </p>
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-extrabold text-xs uppercase tracking-wide">
                <Database size={15} />
                <span>Tam Veri Kontrolü</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Hesap ayarlarınızdan verilerinizi dışa aktarabilir veya üyeliğinizi tüm verilerinizle birlikte tek tıkla kalıcı olarak silebilirsiniz.
              </p>
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-extrabold text-xs uppercase tracking-wide">
                <FileText size={15} />
                <span>Açık ve Sade Şeffaflık</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Karmaşık hukuk jargonu yerine her kullanıcımızın kolayca anlayabileceği sade ve açık bir dil kullanıyoruz.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Articles */}
        <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <div className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black uppercase text-xs tracking-wider py-3 px-4">
            Detaylı Bilgilendirme Maddeleri
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="p-5 space-y-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white">1. Toplanan Kişisel Veriler</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Hesap oluştururken belirlediğiniz kullanıcı adı, e-posta adresi ve isteğe bağlı profil bilgileriniz güvenli bir şekilde saklanır. Sağlık raporu ve engel oranı verileri tamamen anonimleştirilmiş formüllerde işlenir ve kimliğinizle ilişkilendirilmez.
              </p>
            </div>

            <div className="p-5 space-y-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white">2. Verilerin İşlenme Amacı</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Toplanan veriler yalnızca topluluk etkileşimlerini sürdürmek, tartışma bildirimlerini iletmek ve tercih ettiğiniz erişilebilirlik profilini sonraki girişlerinizde hatırlamak için kullanılır.
              </p>
            </div>

            <div className="p-5 space-y-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white">3. Çerez ve Yerel Depolama Kullanımı</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Platformumuz oturum sürekliliği ve erişilebilirlik tercihleri (yüksek kontrast, biyonik okuma, disleksi fontu) için minimum düzeyde birinci taraf çerezleri ve yerel depolama (localStorage) mekanizmalarını kullanır.
              </p>
            </div>

            <div className="p-5 space-y-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white">4. İletişim ve Hak Arama</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Gizlilik politikamız ve kişisel verilerinizle ilgili her türlü soru veya talep için <a href="mailto:miracbirben@gmail.com" className="text-sky-700 dark:text-sky-400 font-bold hover:underline">miracbirben@gmail.com</a> e-posta adresi üzerinden yönetim ekibimize ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-1">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

      </div>
    </SiteLayout>
  );
}
