import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { Scale, ArrowLeft, Home, Shield, HeartHandshake, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <SiteLayout>
      <div className="flex flex-col gap-5 w-full">
        {/* Breadcrumb Navigation */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 shadow-xs">
          <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
            <Home size={13} />
            <span>Ana Sayfa</span>
          </Link>
          <span className="opacity-40">/</span>
          <span className="font-extrabold text-slate-950 dark:text-white">Kullanım Şartları</span>
        </div>

        {/* Header Block */}
        <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <div className="bg-sky-800 dark:bg-sky-950 text-white font-black uppercase text-xs tracking-wider py-3 px-4 flex items-center justify-between border-b-2 border-sky-900">
            <div className="flex items-center gap-2">
              <Scale size={15} className="text-sky-300" />
              <span>TOPLULUK KURALLARI &amp; KULLANIM ŞARTLARI</span>
            </div>
            <span className="text-[10px] font-bold text-sky-200 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-700">
              Topluluk Sözleşmesi
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-2 text-slate-700 dark:text-slate-300">
            <h1 className="text-base sm:text-lg font-black text-slate-950 dark:text-white tracking-tight">
              Eşit, Güvenli ve Saygılı Bir Topluluk İçin Temel Kurallarımız
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              EngelsizForum platformunu ziyaret eden veya üye olan her birey aşağıdaki ortak ilkeleri ve kullanım şartlarını kabul etmiş sayılır. Amacımız engelli hakları ve dayanışma alanında güvenli bir bilgi havuzu oluşturmaktır.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <div className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-800 text-sky-800 dark:text-sky-300 font-black uppercase text-xs tracking-wider py-3 px-4 flex items-center gap-2">
            <Shield size={15} />
            <span>Temel İlkelerimiz</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-extrabold text-xs uppercase tracking-wide">
                <HeartHandshake size={15} />
                <span>Saygı ve Kapsayıcılık</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Her türlü ayrımcılık, nefret söylemi, aşağılama ve ötekileştirme kesinlikle yasaktır ve anında engellenir.
              </p>
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-extrabold text-xs uppercase tracking-wide">
                <Scale size={15} />
                <span>Doğru ve Teyitli Bilgi</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Mevzuat, rapor süreçleri ve hak kazanımları paylaşımlarında teyitsiz veya yanıltıcı bilgilerden kaçınılmalıdır.
              </p>
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-extrabold text-xs uppercase tracking-wide">
                <AlertCircle size={15} />
                <span>Erişilebilir İçerik</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Görsel paylaşırken alternatif metin (alt text) eklenmesi ve açık bir dil kullanılması topluluk standardımızdır.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Articles */}
        <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <div className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black uppercase text-xs tracking-wider py-3 px-4">
            Hizmet ve Kullanım Maddeleri
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="p-5 space-y-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white">1. Hizmet Şartlarının Kabulü</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                EngelsizForum&apos;a üye olarak veya platformu ziyaretçi olarak kullanarak bu şartlara uyacağınızı taahhüt edersiniz. Bu şartlar resmi mevzuat veya platform yeniliklerine göre periyodik olarak güncellenebilir.
              </p>
            </div>

            <div className="p-5 space-y-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white">2. Üyelik ve Hesap Güvenliği</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Kullanıcılar hesaplarının şifre güvenliğinden kendileri sorumludur. Başkası adına yanıltıcı hesap açmak veya yetkisiz erişim teşebbüsünde bulunmak yasaktır.
              </p>
            </div>

            <div className="p-5 space-y-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white">3. İçerik Sorumluluğu</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Forum üyelerinin paylaştığı deneyim ve görüşler kişisel nitelikte olup doğrudan resmi hukuki veya tıbbi tavsiye yerine geçmez. Moderasyon ekibimiz yasalara aykırı içerikleri kaldırma hakkına sahiptir.
              </p>
            </div>

            <div className="p-5 space-y-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white">4. Hesap İptali ve İletişim</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Kullanım şartları ile ilgili her türlü soru veya kural ihlali bildirimi için <a href="mailto:miracbirben@gmail.com" className="text-sky-700 dark:text-sky-400 font-bold hover:underline">miracbirben@gmail.com</a> adresiyle iletişim kurabilirsiniz.
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
