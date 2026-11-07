import Link from 'next/link';
import { Scale, ArrowLeft, ChevronRight, Shield, HeartHandshake, AlertCircle } from 'lucide-react';
import ClassicSidebar from '@/components/forum/classic-sidebar';

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full py-4 text-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-[#111B2E] border border-[#1E293B] px-4 py-2.5 rounded-md flex items-center gap-2 text-xs text-slate-300">
        <Link href="/" className="hover:text-white font-bold transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight size={13} className="text-slate-500" />
        <span className="font-bold text-white">Kullanım Kuralları &amp; Topluluk İlkeleri</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header */}
          <div className="border-b border-[#1E293B] pb-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800 text-[11px] font-mono font-bold uppercase tracking-wider">
              <Scale size={13} />
              <span>Topluluk Sözleşmesi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Eşit, Güvenli ve Saygılı Bir Topluluk İçin Kurallarımız
            </h1>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed max-w-2xl">
              EngelsizForum platformunu ziyaret eden veya üye olan her birey aşağıdaki ortak ilkeleri ve kullanım şartlarını kabul etmiş sayılır. Amacımız engelli hakları ve dayanışma alanında güvenli bir bilgi havuzu oluşturmaktır.
            </p>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111B2E] border border-[#1E293B] p-5 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wide">
                <HeartHandshake size={15} />
                <span>Saygı ve Kapsayıcılık</span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Her türlü ayrımcılık, nefret söylemi, aşağılama ve ötekileştirme kesinlikle yasaktır ve anında engellenir.
              </p>
            </div>

            <div className="bg-[#111B2E] border border-[#1E293B] p-5 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                <Scale size={15} />
                <span>Doğru ve Teyitli Bilgi</span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Mevzuat, rapor süreçleri ve hak kazanımları paylaşımlarında teyitsiz veya yanıltıcı bilgilerden kaçınılmalıdır.
              </p>
            </div>

            <div className="bg-[#111B2E] border border-[#1E293B] p-5 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                <AlertCircle size={15} />
                <span>Erişilebilir İçerik</span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Görsel paylaşırken alternatif metin (alt text) eklenmesi ve açık bir dil kullanılması topluluk standardımızdır.
              </p>
            </div>
          </div>

          {/* Detailed Articles */}
          <div className="border border-[#1E293B] rounded-md bg-[#111B2E] overflow-hidden shadow-sm">
            <div className="bg-[#18243A] py-3 px-4 border-b border-[#1E293B] text-xs font-bold uppercase tracking-wider text-slate-200">
              Hizmet ve Kullanım Maddeleri
            </div>

            <div className="divide-y divide-[#1E293B]">
              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">1. Hizmet Şartlarının Kabulü</h2>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  EngelsizForum&apos;a üye olarak veya platformu ziyaretçi olarak kullanarak bu şartlara uyacağınızı taahhüt edersiniz. Bu şartlar resmi mevzuat veya platform yeniliklerine göre periyodik olarak güncellenebilir.
                </p>
              </div>

              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">2. Üyelik ve Hesap Güvenliği</h2>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Kullanıcılar hesaplarının şifre güvenliğinden kendileri sorumludur. Başkası adına yanıltıcı hesap açmak veya yetkisiz erişim teşebbüsünde bulunmak yasaktır.
                </p>
              </div>

              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">3. İçerik Sorumluluğu &amp; Tıbbi/Hukuki Sorumluluk Reddi</h2>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Forum üyelerinin paylaştığı deneyim ve görüşler kişisel nitelikte olup doğrudan resmi hukuki veya tıbbi reçete yerine geçmez. Moderasyon ekibimiz yasalara aykırı içerikleri kaldırma hakkına sahiptir.
                </p>
              </div>

              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">4. İletişim ve Kural İhlali Bildirimi</h2>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Kullanım kuralları ile ilgili her türlü soru veya kural ihlali bildirimi için <a href="mailto:miracbirben@gmail.com" className="text-indigo-400 font-bold hover:underline">miracbirben@gmail.com</a> adresiyle iletişim kurabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#18243A] border border-[#1E293B] hover:bg-[#1E293B] text-slate-200 text-xs font-semibold transition-colors"
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
