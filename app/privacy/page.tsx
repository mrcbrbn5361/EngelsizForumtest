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

      <div className="flex flex-col gap-4">
        {/* Breadcrumb Navigation - XenForo Style */}
        <div className="bg-[#eef2f7] -mx-4 px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border-b border-slate-200 mb-1">
          <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 transition-colors">
            <Home size={12} />
            Ana Sayfa
          </Link>
          <span className="opacity-50">/</span>
          <span className="font-bold text-slate-800">Gizlilik Politikası</span>
        </div>

        {/* XenForo Header Block */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="xf-block-header bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-black uppercase text-[12px] tracking-wider py-2.5 px-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-white/90" />
              <span>GİZLİLİK POLİTİKASI &amp; KİŞİSEL VERİLERİN KORUNMASI</span>
            </div>
            <span className="text-[11px] font-normal text-white/80 bg-white/10 px-2 py-0.5 rounded-sm border border-white/20">
              KVKK &amp; GDPR Uyumlu
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-white space-y-2 text-slate-700">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Verilerinizin Güvenliği ve Mahremiyeti Güvencemiz Altındadır
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              EngelsizForum olarak üyelerimizin mahremiyetine en yüksek hassasiyeti gösteriyoruz. Bu sayfa, platformumuzda toplanan verilerin mahiyetini, kullanım sınırlarını ve haklarınızı şeffaf biçimde açıklar.
            </p>
          </div>
        </div>

        {/* Core Principles - XenForo Node Grid */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[11px] tracking-wider py-2 px-3 flex items-center gap-1.5">
            <ShieldCheck size={13} />
            <span>Temel Gizlilik İlkelerimiz</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="p-4 bg-white space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#185886] font-bold text-xs uppercase tracking-wide">
                <Eye size={14} />
                <span>Sıfır Reklam Takibi</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Verileriniz asla reklam hedeflemesi amacıyla kullanılmaz, üçüncü şahıslara veya veri simsarlarına satılmaz.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#185886] font-bold text-xs uppercase tracking-wide">
                <Database size={14} />
                <span>Tam Veri Kontrolü</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Hesap ayarlarınızdan verilerinizi dışa aktarabilir veya üyeliğinizi tüm verilerinizle birlikte tek tıkla kalıcı olarak silebilirsiniz.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#185886] font-bold text-xs uppercase tracking-wide">
                <FileText size={14} />
                <span>Açık ve Sade Şeffaflık</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Karmaşık hukuk jargonu yerine her kullanıcımızın kolayca anlayabileceği sade ve açık bir dil kullanıyoruz.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Articles - XenForo Section Block */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[11px] tracking-wider py-2 px-3">
            Detaylı Bilgilendirme Maddeleri
          </div>

          <div className="divide-y divide-slate-200">
            <div className="p-4 bg-white space-y-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">1. Toplanan Kişisel Veriler</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Hesap oluştururken belirlediğiniz kullanıcı adı, e-posta adresi ve isteğe bağlı profil bilgileriniz güvenli bir şekilde saklanır. Sağlık raporu ve engel oranı verileri tamamen anonimleştirilmiş formüllerde işlenir ve kimliğinizle ilişkilendirilmez.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">2. Verilerin İşlenme Amacı</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Toplanan veriler yalnızca topluluk etkileşimlerini sürdürmek, tartışma bildirimlerini iletmek ve tercih ettiğiniz erişilebilirlik profilini sonraki girişlerinizde hatırlamak için kullanılır.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">3. Çerez ve Yerel Depolama Kullanımı</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Platformumuz oturum sürekliliği ve erişilebilirlik tercihleri (yüksek kontrast, biyonik okuma, disleksi fontu) için minimum düzeyde birinci taraf çerezleri ve yerel depolama (localStorage) mekanizmalarını kullanır.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">4. İletişim ve Hak Arama</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Gizlilik politikamız ve kişisel verilerinizle ilgili her türlü soru veya talep için <a href="mailto:miracbirben@engelsizforum.com" className="text-[#0066a2] font-bold hover:underline">miracbirben@engelsizforum.com</a> e-posta adresi üzerinden moderatör ekibimize ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-1">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-white border border-slate-300 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft size={13} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

      </div>
    </SiteLayout>
  );
}
