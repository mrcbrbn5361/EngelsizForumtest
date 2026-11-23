import Link from 'next/link';
import { Lock, ChevronRight, ArrowLeft, FileText } from 'lucide-react';
import ClassicSidebar from '@/components/forum/classic-sidebar';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full py-4 text-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-[#111B2E] border border-[#1E293B] px-4 py-2.5 rounded-md flex items-center gap-2 text-xs text-slate-300">
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
          <div className="border-b border-[#1E293B] pb-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800 text-[11px] font-mono font-bold uppercase tracking-wider">
              <Lock size={13} />
              <span>Gizlilik Bilgilendirmesi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Kişisel Veriler ve Gizlilik
            </h1>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed max-w-2xl">
              Bu sayfa, platformda toplanan verilerin neler olduğunu ve ne için kullanıldığını açıklar. Veri sorumlusu bilgisi belirleniyor; bu metin güncellenecektir.
            </p>
          </div>

          {/* Core Principles */}
          <div className="bg-[#111B2E] border border-[#1E293B] p-5 rounded-md space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
              <FileText size={15} />
              <span>Açık ve Sade Anlatım</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Bu sayfada yalnızca sitenin bugün yaptığı işlemler anlatılır. Henüz sunulmayan bir hizmet için söz verilmez.
            </p>
          </div>

          {/* Detailed Articles */}
          <div className="border border-[#1E293B] rounded-md bg-[#111B2E] overflow-hidden shadow-sm">
            <div className="bg-[#18243A] py-3 px-4 border-b border-[#1E293B] text-xs font-bold uppercase tracking-wider text-slate-200">
              Detaylı Bilgilendirme Maddeleri
            </div>

            <div className="divide-y divide-[#1E293B]">
              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">1. Toplanan Kişisel Veriler</h2>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Hesap oluştururken belirlediğiniz kullanıcı adı, e-posta adresi ve isteğe bağlı profil bilgileriniz güvenli bir şekilde saklanır. Sağlık raporu ve engel oranı hesaplamaları tamamen yerel tarayıcınızda (istemci tarafında) işlenir, sunucu veritabanına kaydedilmez.
                </p>
              </div>

              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">2. Verilerin İşlenme Amacı</h2>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Toplanan veriler yalnızca topluluk etkileşimlerini sürdürmek, tartışma bildirimlerini iletmek ve tercih ettiğiniz erişilebilirlik profilini (yüksek kontrast, font büyüklüğü) sonraki oturumlarınızda hatırlamak için kullanılır.
                </p>
              </div>

              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">3. Çerez ve Yerel Depolama (localStorage) Kullanımı</h2>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Platformumuz oturum güvenliği ve erişilebilirlik tercihleri (yüksek kontrast, biyonik okuma, disleksi fontu) için minimum düzeyde birinci taraf çerezleri ve yerel depolama mekanizmalarını kullanır.
                </p>
              </div>

              <div className="p-5 space-y-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white">4. İletişim ve Hak Arama</h2>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Gizlilik politikamız ve kişisel verilerinizle ilgili her türlü soru veya talep için <a href="mailto:miracbirben@gmail.com" className="text-indigo-400 font-bold hover:underline">miracbirben@gmail.com</a> e-posta adresi üzerinden yönetim ekibimize ulaşabilirsiniz.
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
