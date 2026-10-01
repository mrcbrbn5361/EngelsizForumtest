'use client';

import React, { useState } from 'react';
import { 
  Rocket, 
  QrCode, 
  Globe2, 
  Heart, 
  Sparkles, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';

export default function TeknofestNotice() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section 
      aria-label="TEKNOFEST Özel Ziyaretçi Duyurusu"
      className="mb-5 xf-block border-2 border-[#185886] rounded-sm overflow-hidden bg-white shadow-md transition-all"
    >
      {/* Header Bar - XenForo Notice Gradient */}
      <div className="bg-gradient-to-r from-[#185886] via-[#154c73] to-[#0f3754] text-white py-2.5 px-3.5 sm:px-4 flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-sm bg-red-600 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Rocket size={15} className="animate-bounce" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-500/30 text-red-200 border border-red-400/30 px-1.5 py-0.2 rounded-xs">
                TEKNOFEST ÖZEL
              </span>
              <span className="text-[10px] font-bold text-amber-300 hidden sm:inline-flex items-center gap-1">
                <QrCode size={11} />
                <span>QR Stand Ziyareti</span>
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-black tracking-tight truncate text-white m-0">
              TEKNOFEST Ziyaretçileri &amp; Ekibine Özel Kurucu Mesajı
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 hover:bg-white/10 rounded-sm text-sky-100 hover:text-white transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Duyuruyu Daralt" : "Duyuruyu Genişlet"}
        >
          <span className="hidden md:inline">{isExpanded ? 'Gizle' : 'Genişlet'}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Notice Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 text-slate-800 text-xs sm:text-sm leading-relaxed space-y-3.5 bg-gradient-to-b from-[#fbfcfd] to-white">
          
          {/* Greeting & Identity */}
          <div className="flex items-start gap-3 bg-[#eef4f9] border border-[#cbdce9] p-3 sm:p-3.5 rounded-sm text-slate-800">
            <div className="w-8 h-8 rounded-full bg-[#185886] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
              MB
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-900 leading-snug">
                Selam değerli TEKNOFEST Ziyaretçileri ve TEKNOFEST Ekibi! 👋
              </p>
              <p className="text-xs text-slate-700">
                Ben <strong>Miraç Birben</strong>. Eğer TEKNOFEST standımızda gördüğünüz QR kodu okutarak bu platforma geldiyseniz, size bu proje hakkında birkaç önemli şey paylaşmak istiyorum:
              </p>
            </div>
          </div>

          {/* Story & Vision */}
          <div className="space-y-2.5 text-slate-700 text-xs sm:text-[13px] leading-relaxed">
            <p>
              <strong>1. olarak;</strong> bu projeyi tamamen kendi cebimden <strong>1 TL dahi harcamadan</strong>, küçük sponsorluklarla ve gece gündüz süren 2 yıllık yoğun bir emekle elimden geldiğince buraya kadar getirdim. Şimdi sıra <strong>büyük sponsorluklarda ve kurumsal desteklerde</strong>!
            </p>
            <p>
              Şunu açıkça söylemek gerekir ki; günümüzde bu sitedeki özelliklere (<em>%100 WCAG AAA tam erişilebilirlik, Balthazard ve ÖTV 2026 mevzuat robotları, WebMCP AI ajanları ve bağımsız açık standartlar</em>) sahip forum siteleri neredeyse hiç yok veya çok nadir bulunuyor.
            </p>
            <p>
              Evet, biliyorum hâlâ birkaç kısımda geliştirmeye devam ettiğimiz noktalar var ama şu anlık bu kadarı bile devrim niteliğinde. Ancak sizlerin ve kurumlarımızın <strong>sponsorluğunu ve desteğini</strong> arkamıza alabilirsek ülkemizi dünya çapında çok daha güçlü duyuracağımıza yürekten inanıyorum.
            </p>
            <p className="flex items-center gap-1.5 text-[#185886] font-bold">
              <Globe2 size={14} className="shrink-0 text-emerald-600" />
              <span>
                Zaten şu anda bile globalde 5-6 farklı ülkeden aktif etkileşim alıyoruz. Güçlü sponsorlukları yakalarsak tüm dünya sesimizi duyabilir!
              </span>
            </p>
          </div>

          {/* Sponsor Thanks Section */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Heart size={14} className="text-rose-500 shrink-0 fill-rose-500" />
              <span>Değerli Sponsorlukları İçin Teşekkürler:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a 
                href="https://yeterly.ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-900 hover:bg-black text-white font-extrabold text-xs transition-colors shadow-2xs group"
              >
                <Sparkles size={12} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>yeterly.ai</span>
                <ExternalLink size={11} className="text-slate-400" />
              </a>

              <a 
                href="https://goldhost.com.tr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#185886] hover:bg-[#12466b] text-white font-extrabold text-xs transition-colors shadow-2xs group"
              >
                <span>goldhost.com.tr</span>
                <ExternalLink size={11} className="text-sky-200" />
              </a>
            </div>
          </div>

        </div>
      )}
    </section>
  );
}
