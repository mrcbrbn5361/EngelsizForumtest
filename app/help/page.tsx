import Link from 'next/link';
import { 
  BookOpen, 
  User, 
  ShieldAlert, 
  FileText, 
  ArrowLeft, 
  Mail, 
  MessageSquare, 
  HelpCircle, 
  Home, 
  CheckCircle2, 
  Info,
  SlidersHorizontal,
  Accessibility,
  Calculator,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ClassicSidebar from '@/components/forum/classic-sidebar';

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Erişilebilirlik panelini nasıl açarım?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Üst menü çubuğunda bulunan veya klavyeden 'Alt + A' kısayoluyla erişilebilirlik butonuna tıklayarak renk kontrastı, font boyutu ve biyonik okuma gibi özellikleri yönetebilirsiniz."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Balthazard ve ÖTV hesaplama robotları ücretsiz mi?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Evet. EngelsizForum bünyesindeki tüm hesaplama robotları 2026-2027 resmi mevzuat parametreleriyle tamamen ücretsiz ve reklamsız olarak hizmet verir."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Destek ekibiyle nasıl iletişim kurarım?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Destek ekibimize dilediğiniz zaman miracbirben@gmail.com adresinden e-posta göndererek ulaşabilirsiniz."
                    }
                  }
                ]
              }
            ]
          })
        }}
      />

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="font-extrabold text-slate-950 dark:text-white">Yardım ve Bilgi Merkezi</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Hero Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xs space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-black uppercase tracking-wider">
              <HelpCircle size={14} />
              <span>Kullanıcı Rehberi ve Destek Masası</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
              Nasıl Yardımcı Olabiliriz?
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Platform kullanımı, ekran okuyucu uyumluluğu, Balthazard ve ÖTV hesaplama robotları, doğrudan mesajlaşma (DM) ve topluluk ilkeleri hakkında merak ettiğiniz tüm yanıtlar burada.
            </p>
          </div>

          {/* Quick Guides Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { 
                icon: SlidersHorizontal, 
                title: 'Erişilebilirlik Paneli (Alt + A)', 
                badge: 'WCAG AAA',
                text: 'Yazı tipi boyutu, yüksek kontrast modu, disleksi dostu font ve görsel uyarıları üst panelden dilediğiniz gibi açıp kapatabilirsiniz.' 
              },
              { 
                icon: Calculator, 
                title: 'Resmi Hesaplama Robotları', 
                badge: '2026 Mevzuatı',
                text: 'Balthazard sağlık raporu oranı birleştirme, 2.247.100 TL ÖTV istisna limiti ve kademeli erken emeklilik hesaplayıcıları.' 
              },
              { 
                icon: MessageSquare, 
                title: 'Özel Mesajlar (DM)', 
                badge: 'Birebir İletişim',
                text: 'Üyelerle profillerindeki "Mesaj Gönder (DM)" butonu üzerinden güvenli ve anlık birebir yazışma gerçekleştirebilirsiniz.' 
              },
              { 
                icon: ShieldAlert, 
                title: 'Topluluk İlkeleri ve Güvenlik', 
                badge: 'Moderasyon',
                text: 'Ayrımcılığa sıfır tolerans, yapıcı ve saygılı dil kuralları ve moderatör denetim prosedürleri hakkında bilgiler.' 
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
                      <item.icon size={20} />
                    </div>
                    <Badge variant="primary" size="sm" className="font-black text-[10px] uppercase tracking-wider">
                      {item.badge}
                    </Badge>
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-950 dark:text-white">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Sıkça Sorulan Sorular FAQ Accordion / List */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-900 text-white py-3.5 px-5 flex items-center justify-between border-b-2 border-slate-800">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                <BookOpen size={15} className="text-sky-400" />
                <span>SIKÇA SORULAN SORULAR (SSS)</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                5 Madde
              </span>
            </div>

            <div className="divide-y-2 divide-slate-100 dark:divide-slate-800 p-2">
              {[
                {
                  q: "Erişilebilirlik panelini nasıl açarım?",
                  a: "Sayfanın üst kısmındaki dişli simgeli butona basabilir veya klavyenizden 'Alt + A' kısayolunu kullanabilirsiniz. Ayarlarınız cihazınıza otomatik kaydedilir."
                },
                {
                  q: "EngelsizForum tamamen ücretsiz mi?",
                  a: "Evet. Platformumuz engelli bireylerin hak arama, deneyim paylaşımı ve bilgi edinme süreçlerine destek olmak üzere bağımsız ve ücretsiz olarak geliştirilmiştir."
                },
                {
                  q: "Hesaplama robotları güncel mevzuata uygun mu?",
                  a: "Tüm araçlarımız 2026 yılı Resmî Gazete tebliğleri, Sağlık Bakanlığı Balthazard formülü yönergeleri ve SGK 5510 sayılı kanununa birebir uygun matematik motoru ile çalışır."
                },
                {
                  q: "Ekran okuyucu kullanırken sorun yaşarsam ne yapmalıyım?",
                  a: "Sitemiz NVDA, JAWS, VoiceOver ve TalkBack standartlarına tam uyumludur. Herhangi bir erişim engeli veya etiket eksikliği fark ederseniz yönetim ekibimize iletebilirsiniz."
                },
                {
                  q: "Yeni bir tartışma konusu nasıl açabilirim?",
                  a: "Üst menüdeki 'Yeni Konu' butonuna veya 'Alt + N' kısayoluna basarak ilgili kategoriyi seçip sorunuzu veya deneyiminizi toplulukla paylaşabilirsiniz."
                }
              ].map((faq, i) => (
                <div key={i} className="p-4 space-y-1.5">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-black text-[10px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Support CTA */}
          <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-2xl p-6 border-2 border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-sm sm:text-base font-black">
                Daha Fazla Desteğe mi İhtiyacınız Var?
              </h2>
              <p className="text-xs text-slate-300">
                Topluluğumuza sorabilir veya doğrudan geliştirici ekibimizle iletişime geçebilirsiniz.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/new-thread">
                <Button variant="primary" size="sm" className="font-bold bg-white text-slate-950 hover:bg-slate-100">
                  Topluluğa Sor
                </Button>
              </Link>
            </div>
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
