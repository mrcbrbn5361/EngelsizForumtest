import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Accessibility, CheckCircle2, Eye, Volume2, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Erişilebilirlik Bildirimi | EngelsizForum',
  description: 'EngelsizForum platformunun engelli bireyler için erişilebilirlik standartları, WCAG uyumluluğu ve yardımcı teknoloji destekleri.',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-950 transition-colors">
            <ArrowLeft size={16} />
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 text-sky-600 mb-4">
            <Accessibility size={36} />
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-sky-50 text-sky-700 rounded-md">
              Erişilebilirlik Taahhüdü
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-4">
            Erişilebilirlik Bildirimi ve Standartlarımız
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            EngelsizForum olarak, dijital dünyada engelleri ortadan kaldırmayı ve tüm bireylerin bilgiye, topluluk tartışmalarına ve destek ağlarına eşit, engelsiz bir şekilde erişebilmesini sağlamayı temel misyonumuz olarak benimseriz.
          </p>
        </div>

        {/* Core Standards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <Eye size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Ekran Okuyucu ve Görme Desteği</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Platformumuz NVDA, JAWS, VoiceOver ve TalkBack gibi ekran okuyucularla tam uyumlu çalışacak şekilde semantik HTML etiketleri, ARIA rolleri ve alternatif metin (alt text) standartlarına uygun geliştirilmiştir.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Volume2 size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Yüksek Kontrast ve Tipografi</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              WCAG 2.1 AA ve AAA renk kontrast oranları gözetilerek tasarlanan arayüzümüz, düşük görüşlü kullanıcılar için optimize edilmiş yazı tipi boyutları ve odak göstergeleri sunar.
            </p>
          </div>
        </div>

        {/* Detailed Points */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            Uyguladığımız Temel Erişilebilirlik İlkeleri
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Klavye Kolaylığı (Keyboard Navigation)</h3>
                <p className="text-sm text-slate-600">Fare kullanamayan veya klavye kısayollarını tercih eden kullanıcılar için tüm formlar, menüler ve tartışma akışları sekme (Tab) tuşuyla eksiksiz gezilebilir.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Sesli Asistan ve AI Desteği (@EngelsizAI)</h3>
                <p className="text-sm text-slate-600">Engelli bireylerin hakları, ÖTV muafiyetleri ve mevzuat sorularına anında yanıt veren yapay zeka asistanımız kullanıcı dostu erişilebilir yanıtlar üretir.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Sürekli Geri Bildirim ve İyileştirme</h3>
                <p className="text-sm text-slate-600">Erişilebilirlikle ilgili karşılaştığınız her türlü engeli veya öneriyi bize bildirebilir, platformumuzun herkes için daha erişilebilir olmasına katkı sağlayabilirsiniz.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Footer */}
        <div className="bg-sky-900 text-white rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold mb-1">Erişilebilirlik İletişim Hattı</h2>
            <p className="text-xs text-sky-200">Geri bildirimleriniz bizim için çok değerlidir.</p>
          </div>
          <Link href="/help" className="px-5 py-2.5 bg-white text-sky-950 font-bold text-xs rounded-md hover:bg-sky-50 transition-colors uppercase tracking-wider">
            Yardım Merkezine Git
          </Link>
        </div>

      </div>
    </div>
  );
}
