import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { Scale, ArrowLeft, Home, Shield, HeartHandshake, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <SiteLayout>
      <div className="flex flex-col gap-4">
        {/* Breadcrumb Navigation - XenForo Style */}
        <div className="bg-[#eef2f7] -mx-4 px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border-b border-slate-200 mb-1">
          <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 transition-colors">
            <Home size={12} />
            Ana Sayfa
          </Link>
          <span className="opacity-50">/</span>
          <span className="font-bold text-slate-800">Kullanım Şartları</span>
        </div>

        {/* XenForo Header Block */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="xf-block-header bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-black uppercase text-[12px] tracking-wider py-2.5 px-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={14} className="text-white/90" />
              <span>TOPLULUK KURALLARI &amp; KULLANIM ŞARTLARI</span>
            </div>
            <span className="text-[11px] font-normal text-white/80 bg-white/10 px-2 py-0.5 rounded-sm border border-white/20">
              Topluluk Sözleşmesi
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-white space-y-2 text-slate-700">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Eşit, Güvenli ve Saygılı Bir Topluluk İçin Temel Kurallarımız
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              EngelsizForum platformunu ziyaret eden veya üye olan her birey aşağıdaki ortak ilkeleri ve kullanım şartlarını kabul etmiş sayılır. Amacımız engelli hakları ve dayanışma alanında güvenli bir bilgi havuzu oluşturmaktır.
            </p>
          </div>
        </div>

        {/* Pillars - XenForo Node Grid */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[11px] tracking-wider py-2 px-3 flex items-center gap-1.5">
            <Shield size={13} />
            <span>Temel İlkelerimiz</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="p-4 bg-white space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#185886] font-bold text-xs uppercase tracking-wide">
                <HeartHandshake size={14} />
                <span>Saygı ve Kapsayıcılık</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Her türlü ayrımcılık, nefret söylemi, aşağılama ve ötekileştirme kesinlikle yasaktır ve anında engellenir.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#185886] font-bold text-xs uppercase tracking-wide">
                <Scale size={14} />
                <span>Doğru ve Teyitli Bilgi</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Mevzuat, rapor süreçleri ve hak kazanımları paylaşımlarında teyitsiz veya yanıltıcı bilgilerden kaçınılmalıdır.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#185886] font-bold text-xs uppercase tracking-wide">
                <AlertCircle size={14} />
                <span>Erişilebilir İçerik</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Görsel paylaşırken alternatif metin (alt text) eklenmesi ve açık bir dil kullanılması topluluk standardımızdır.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Articles - XenForo Section Block */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[11px] tracking-wider py-2 px-3">
            Hizmet ve Kullanım Maddeleri
          </div>

          <div className="divide-y divide-slate-200">
            <div className="p-4 bg-white space-y-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">1. Hizmet Şartlarının Kabulü</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                EngelsizForum&apos;a üye olarak veya platformu ziyaretçi olarak kullanarak bu şartlara uyacağınızı taahhüt edersiniz. Bu şartlar resmi mevzuat veya platform yeniliklerine göre periyodik olarak güncellenebilir.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">2. Üyelik ve Hesap Güvenliği</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Kullanıcılar hesaplarının şifre güvenliğinden kendileri sorumludur. Başkası adına yanıltıcı hesap açmak veya yetkisiz erişim teşebbüsünde bulunmak yasaktır.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">3. İçerik Sorumluluğu</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Forum üyelerinin paylaştığı deneyim ve görüşler kişisel nitelikte olup doğrudan resmi hukuki veya tıbbi tavsiye yerine geçmez. Moderasyon ekibimiz yasalara aykırı içerikleri kaldırma hakkına sahiptir.
              </p>
            </div>

            <div className="p-4 bg-white space-y-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">4. Hesap İptali ve İletişim</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Kullanım şartları ile ilgili her türlü soru veya kural ihlali bildirimi için <a href="mailto:miracbirben@engelsizforum.com" className="text-[#0066a2] font-bold hover:underline">miracbirben@engelsizforum.com</a> adresiyle iletişim kurabilirsiniz.
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
