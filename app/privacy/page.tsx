import Link from 'next/link';
import { ShieldCheck, Lock, ChevronRight, ArrowLeft, Eye, Database, FileText } from 'lucide-react';
import ClassicSidebar from '@/components/forum/classic-sidebar';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full py-4 text-white">
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
                  "text": "Hayır, kişisel verileriniz asla reklam amacıyla veya üçüncü taraf veri simsarlarıyla paylaşılmaz."
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

      {/* Breadcrumb Navigation */}
      <div className="bg-[#161b22] border border-[#30363d] px-4 py-2.5 rounded-md flex items-center gap-2 text-xs text-slate-300">
        <Link href="/" className="hover:text-white font-bold transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight size={13} className="text-slate-500" />
        <span className="font-bold text-white">Gizlilik Politikası &amp; KVKK</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header */}
          <div className="border-b border-[#30363d] pb-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 text-[11px] font-mono font-bold uppercase tracking-wider">
              <Lock size={13} />
              <span>KVKK &amp; GDPR Uyumluluğu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verilerinizin Güvenliği ve Mahremiyeti
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              EngelsizForum olarak engelli bireylerin mahremiyetine en yüksek hassasiyeti gösteriyoruz. Bu sayfa, platformumuzda toplanan verilerin mahiyetini, kullanım sınırlarını ve haklarınızı şeffaf biçimde açıklar.
            </p>
          </div>

          {/* Core Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wide">
                <Eye size={15} />
                <span>Sıfır Reklam Takibi</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verileriniz asla reklam hedeflemesi amacıyla kullanılmaz, üçüncü şahıslara veya veri simsarlarına satılmaz.
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                <Database size={15} />
                <span>Tam Veri Kontrolü</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hesap ayarlarınızdan verilerinizi dışa aktarabilir veya üyeliğinizi tüm içeriklerinizle birlikte kalıcı olarak silebilirsiniz.
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                <FileText size={15} />
                <span>Açık ve Sade Şeffaflık</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Karmaşık hukuk jargonu yerine her kullanıcımızın kolayca anlayabileceği sade ve açık bir dil kullanıyoruz.
              </p>
            </div>
          </div>

          {/* Detailed Articles */}
          <div className="border border-[#30363d] rounded-md bg-[#161b22] overflow-hidden">
            <div className="bg-[#21262d] py-3 px-4 border-b border-[#30363d] text-xs font-bold uppercase tracking-wider text-slate-200">
              Detaylı Bilgilendirme Maddeleri
            </div>

            <div className="divide-y divide-[#30363d]">
              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">1. Toplanan Kişisel Veriler</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hesap oluştururken belirlediğiniz kullanıcı adı, e-posta adresi ve isteğe bağlı profil bilgileriniz güvenli bir şekilde saklanır. Sağlık raporu ve engel oranı hesaplamaları tamamen yerel tarayıcınızda (istemci tarafında) işlenir, sunucu veritabanına kaydedilmez.
                </p>
              </div>

              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">2. Verilerin İşlenme Amacı</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Toplanan veriler yalnızca topluluk etkileşimlerini sürdürmek, tartışma bildirimlerini iletmek ve tercih ettiğiniz erişilebilirlik profilini (yüksek kontrast, font büyüklüğü) sonraki oturumlarınızda hatırlamak için kullanılır.
                </p>
              </div>

              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">3. Çerez ve Yerel Depolama (localStorage) Kullanımı</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Platformumuz oturum güvenliği ve erişilebilirlik tercihleri (yüksek kontrast, biyonik okuma, disleksi fontu) için minimum düzeyde birinci taraf çerezleri ve yerel depolama mekanizmalarını kullanır.
                </p>
              </div>

              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">4. İletişim ve Hak Arama</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gizlilik politikamız ve kişisel verilerinizle ilgili her türlü soru veya talep için <a href="mailto:miracbirben@gmail.com" className="text-sky-400 font-bold hover:underline">miracbirben@gmail.com</a> e-posta adresi üzerinden yönetim ekibimize ulaşabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-slate-200 text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <ClassicSidebar />
        </div>
      </div>
    </div>
  );
}
