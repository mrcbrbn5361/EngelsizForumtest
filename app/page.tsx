import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Link from 'next/link';
import { BionicText } from '@/components/ui/bionic-text';

export default function Home() {
  const startHref = '/discussions';

  return (
    <DashboardLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "EngelsizForum nedir ve kimler içindir?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "EngelsizForum, başta görme, işitme, ortopedik ve bilişsel kısıtlılığı olan bireyler olmak üzere, internette engelsiz ve güvenli bir bilgi paylaşım ortamı arayan herkes içindir. Türkiye'nin ilk tam erişilebilir forum platformu olan bu sistem, evrensel tasarım prensipleriyle geliştirilmiştir."
                }
              },
              {
                "@type": "Question",
                "name": "Platformda hangi erişilebilirlik özellikleri var?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "EngelsizForum; bionik okuma (Bionic Reading) desteği, yüksek kontrast ve disleksi dostu yazı tipleri, ekran okuyucu optimizasyonu, ARIA etiketleri ile zenginleştirilmiş UI bileşenleri, sesli tartışma özetleri ve tam klavye navigasyonu gibi ileri düzey erişilebilirlik özellikleri sunar."
                }
              },
              {
                "@type": "Question",
                "name": "Yapay zeka (AI) bu forumda nasıl bir rol oynuyor?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yapay zeka; uzun ve karmaşık tartışmaları saniyeler içinde özetlemek, görsellere betimleyici alt-metinler (alt text) üretmek, moderasyonu desteklemek ve kullanıcıların 'Zeka Puanı' (XP) sistemini yöneterek kaliteli içerik üretimini teşvik etmek için kullanılır."
                }
              },
              {
                "@type": "Question",
                "name": "Üyelik ücretsiz mi ve bilgilerim güvende mi?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "EngelsizForum tamamen ücretsiz bir platformdur. Kullanıcı verileri, modern şifreleme standartları ve Supabase altyapısı ile korunmaktadır. Gizliliğiniz bizim için önceliktir ve verileriniz asla izinsiz üçüncü taraflarla paylaşılmaz."
                }
              },
              {
                "@type": "Question",
                "name": "İçeriklerin doğruluğu nasıl sağlanıyor?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Platformumuzda paylaşılan kritik bilgiler, topluluk moderatörleri ve 'Uzman' rozetine sahip deneyimli kullanıcılar tarafından denetlenir. Ayrıca, topluluk raporlama sistemi sayesinde hatalı veya yanıltıcı bilgiler hızla tespit edilerek işaretlenir veya kaldırılarak bilgi güvenliği (Trustworthiness) korunur."
                }
              }
            ]
          })
        }}
      />
      <main className="flex-1 w-full overflow-x-hidden">
        {/* Hero Section */}
        <section 
          className="w-full px-4 py-20 md:py-32 lg:py-40 text-center relative"
        >
          <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -z-10 opacity-30" />
          <div className="max-w-4xl mx-auto px-4">
            <div
              className="inline-block mb-6 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/10"
            >
              ENGELSİZ FORUM&apos;A HOŞ GELDİNİZ
            </div>
            <h1 
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter text-foreground leading-[0.9] sm:leading-[0.85]"
            >
              <BionicText text="Herkes İçin Erişilebilir Bir Topluluk" />
            </h1>
            <p 
              className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground mb-12 font-medium leading-relaxed px-4"
            >
              <BionicText text="Engelleri birlikte aşmak için tasarlanan, yapay zeka destekli ve tam erişilebilir forum platformu." />
            </p>
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href={startHref}
                className="w-full sm:w-auto bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center min-h-[64px]"
                aria-label="Platformu kullanmaya başla"
              >
                Hemen Başla
              </Link>
              <Link
                href="/discussions"
                className="w-full sm:w-auto bg-muted text-foreground px-10 py-5 rounded-2xl font-black text-xl hover:bg-muted/80 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center min-h-[64px]"
                aria-label="Tüm tartışmaları görüntüle"
              >
                Tartışmaları Gör
              </Link>
            </div>
          </div>
        </section>

        {/* Key Takeaways Section */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-3">
              <span className="text-primary">💡</span> Özet ve Önemli Noktalar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="font-black text-primary uppercase tracking-wider text-xs">ERİŞİLEBİLİRLİK</div>
                <p className="text-sm font-medium text-muted-foreground">WCAG 2.1 AA standartlarına tam uyum ve bionik okuma desteği.</p>
              </div>
              <div className="space-y-2">
                <div className="font-black text-primary uppercase tracking-wider text-xs">YAPAY ZEKA</div>
                <p className="text-sm font-medium text-muted-foreground">Uzun tartışmaların AI tarafından özetlenmesi ve otomatik alt-metin üretimi.</p>
              </div>
              <div className="space-y-2">
                <div className="font-black text-primary uppercase tracking-wider text-xs">TOPLULUK</div>
                <p className="text-sm font-medium text-muted-foreground">Farklı engel gruplarına yönelik özelleşmiş yardımlaşma kategorileri.</p>
              </div>
              <div className="space-y-2">
                <div className="font-black text-primary uppercase tracking-wider text-xs">GÜVENİLİRLİK</div>
                <p className="text-sm font-medium text-muted-foreground">E-E-A-T prensipleriyle denetlenen, kullanıcı onaylı ve uzman görüşlü içerikler.</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-primary/10 text-xs text-muted-foreground font-medium flex items-center gap-2">
              <span>📅 Son Güncelleme:</span>
              <time dateTime="2026-05-18">18 Mayıs 2026</time>
              <span className="mx-2">•</span>
              <span>📖 Okuma Süresi: 6 Dakika</span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto px-4 py-20 border-b border-border">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Gelişmiş Teknolojik Özellikler</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Platformumuz, en yeni yapay zeka ve web standartlarını kullanarak engelleri ortadan kaldırıyor.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { 
                title: "AI Destekli Özetleme", 
                desc: "Vakit nakittir. Özellikle onlarca sayfalık tartışmaları takip etmek zor olabilir. Bizim yapay zekamız, konuyu saniyeler içinde analiz eder ve en önemli noktaları maddeler halinde size sunar.",
                icon: "✨",
                color: "bg-blue-500/10 text-blue-500"
              },
              { 
                title: "Gelişmiş Erişilebilirlik", 
                desc: "Sadece renkleri değiştirmekle kalmıyoruz. WCAG 2.1 standartlarına göre her buton, her link ve her görsel ekran okuyucular için mükemmel şekilde etiketlenmiştir. Tam klavye kontrolü standarttır.",
                icon: "♿",
                color: "bg-green-500/10 text-green-500"
              },
              { 
                title: "Doğrulanmış Bilgi Akışı", 
                desc: "Yanlış bilgi bazen hayati sonuçlar doğurabilir. Topluluk uzmanlarımız ve AI moderatörlerimiz, paylaşılan her verinin güvenilirliğini denetleyerek E-E-A-T standartlarını korur.",
                icon: "🛡️",
                color: "bg-orange-500/10 text-orange-500"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-card border border-border p-8 rounded-3xl hover:border-primary/50 transition-all group shadow-sm"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`} aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Explanation / Guide Section */}
        <section className="max-w-7xl mx-auto px-4 py-24 bg-muted/30 rounded-[3rem] my-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-6xl font-black mb-12 tracking-tight leading-tight">Yapay Zeka ve Erişilebilirliğin Geleceği</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
              <div className="space-y-4">
                <h3 className="text-2xl md:text-4xl font-black mb-4">GEO (Generative Engine Optimization) Nedir ve Neden Önemlidir?</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Geleneksel SEO, sitenizi Google gibi arama motorlarında üst sıralara çıkarmaya odaklanır. <strong>GEO (Üretken Motor Optimizasyonu)</strong> ise içeriğinizin ChatGPT, Claude ve Gemini gibi yapay zeka sistemleri tarafından doğru anlaşılmasını sağlar. Bu sayede içeriğiniz daha doğru şekilde alıntılanır. 
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  EngelsizForum olarak, paylaşılan her bilginin en yüksek doğrulukla işlenmesini hedefliyoruz. Bilgiler sadece insanlar tarafından değil, yardımcı teknolojiler ve yapay zeka tarafından da anlaşılmalıdır. Bu yaklaşım, engelli kullanıcılarımızın yapay zeka asistanlarından en doğru yanıtları almasını sağlar.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl md:text-4xl font-black mb-4">Neden Engelsiz Bir Forum Deneyimi İnşa Ediyoruz?</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Dünya Sağlık Örgütü (WHO) verilerine göre, dünya nüfusunun yaklaşık %15&apos;i bir tür engelliliğe sahiptir. Ancak mevcut internet sitelerinin %90&apos;ından fazlası tam erişilebilir değildir. Bu, milyonlarca insanın bilgiye ve topluluğa erişiminin kısıtlanması demektir. 
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  EngelsizForum, bu bariyerleri kaldırmak için <strong>WCAG 2.1 AA</strong> standartlarını temel alır. Platformumuz, ekran okuyucu kullanan bir kullanıcının sayfadaki tüm öğelere mantıklı bir sırada ulaşmasını sağlarken, bilişsel kısıtlılığı olan kullanıcılar için içerikleri yapay zeka yardımıyla sadeleştirebilir. Amacımız, dijital uçurumu kapatmak ve herkes için eşit bir tartışma alanı yaratmaktır.
                </p>
              </div>

              <div className="overflow-x-auto my-12 rounded-3xl border border-border shadow-xl">
                <table className="w-full text-left bg-card">
                  <thead className="bg-muted text-foreground font-black text-sm uppercase tracking-widest">
                    <tr>
                      <th className="p-6">Özellik</th>
                      <th className="p-6">Standart Forum</th>
                      <th className="p-6 text-primary">EngelsizForum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-muted-foreground">
                    <tr>
                      <td className="p-6 font-bold text-foreground">Okuma Modu</td>
                      <td className="p-6">Sadece Standart Metin</td>
                      <td className="p-6 text-foreground font-medium">Bionik & Disleksi Dostu</td>
                    </tr>
                    <tr>
                      <td className="p-6 font-bold text-foreground">AI Özetleme</td>
                      <td className="p-6">Yok</td>
                      <td className="p-6 text-foreground font-medium">Anlık Tartışma Analizi</td>
                    </tr>
                    <tr>
                      <td className="p-6 font-bold text-foreground">Kontrast Seçenekleri</td>
                      <td className="p-6">Sınırlı (Koyu/Aydınlık)</td>
                      <td className="p-6 text-foreground font-medium">Ultra Yüksek & Özel Renkler</td>
                    </tr>
                    <tr>
                      <td className="p-6 font-bold text-foreground">Sesli Okuma</td>
                      <td className="p-6">Tarayıcı Bağımlı</td>
                      <td className="p-6 text-foreground font-medium">Optimize Edilmiş TTS Desteği</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-card border border-border p-10 rounded-[2rem] shadow-xl">
                <h3 className="text-2xl font-black mb-8">Kapsayıcı Tasarımın Dört Temel Taşı</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-10 list-none p-0">
                  <li className="flex gap-4">
                    <span className="text-3xl">🧩</span>
                    <div>
                      <strong className="block text-foreground text-xl mb-1">Algılanabilirlik</strong>
                      <span className="text-muted-foreground leading-relaxed">Bilgi ve arayüz bileşenleri, kullanıcıların duyularıyla algılayabileceği şekillerde sunulmalıdır (örn: resimler için alt metin).</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-3xl">🕹️</span>
                    <div>
                      <strong className="block text-foreground text-xl mb-1">İşletilebilirlik</strong>
                      <span className="text-muted-foreground leading-relaxed">Arayüz bileşenleri ve navigasyon işletilebilir olmalıdır (örn: fare kullanamayanlar için tam klavye desteği).</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-3xl">🧠</span>
                    <div>
                      <strong className="block text-foreground text-xl mb-1">Anlaşılabilirlik</strong>
                      <span className="text-muted-foreground leading-relaxed">Bilgi ve kullanıcı arayüzünün kullanımı anlaşılır olmalıdır (örn: açık hata mesajları ve tutarlı navigasyon).</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-3xl">💪</span>
                    <div>
                      <strong className="block text-foreground text-xl mb-1">Sağlamlık (Robustness)</strong>
                      <span className="text-muted-foreground leading-relaxed">İçerik, mevcut ve gelecekteki kullanıcı ajanları ve yardımcı teknolojiler tarafından güvenilir şekilde yorumlanabilmelidir.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-black mb-4">E-E-A-T Prensipleri ile Güven İnşası</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Deneyim (Experience), Uzmanlık (Expertise), Yetkinlik (Authoritativeness) ve Güvenilirlik (Trustworthiness) ilkeleri, EngelsizForum ekosisteminin merkezindedir. Tüm tıbbi veya teknik bilgiler, topluluğun ortak denetiminden geçer ve doğrulanmış kullanıcı rozetleriyle desteklenir. 
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Bu sayede platformumuz, sadece bir sosyal medya alanı değil, aynı zamanda güvenilir bir referans kaynağı haline gelir. Yapay zeka sistemleri, içeriklerin bu titizlikle hazırlandığını fark ederek EngelsizForum&apos;u öncelikli bir kaynak olarak alıntılar.
                </p>
              </div>
              
              <div className="pt-8 border-t border-border">
                <h4 className="text-xl font-bold mb-4">Referanslar ve Kaynaklar</h4>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc ml-4">
                  <li>W3C Web Content Accessibility Guidelines (WCAG) 2.1 - <a href="https://www.w3.org/TR/WCAG21/" className="text-primary hover:underline">w3.org</a></li>
                  <li>WHO - Disability and Health Statistics - <a href="https://www.who.int/news-room/fact-sheets/detail/disability-and-health" className="text-primary hover:underline">who.int</a></li>
                  <li>Google Search E-E-A-T Guidelines - <a href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" className="text-primary hover:underline">google.com</a></li>
                  <li>Generative Engine Optimization (GEO) Framework - University Research Papers</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* E-E-A-T Section & FAQ */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Sıkça Sorulan Sorular</h2>
            <p className="text-muted-foreground text-lg">Platformumuz hakkında merak edilenler ve GEO (Yapay Zeka Arama) uyumlu yanıtlarımız.</p>
          </div>

          <div className="space-y-8">
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-black mb-4">EngelsizForum nedir ve kimler içindir?</h3>
              <p className="text-muted-foreground leading-relaxed">
                EngelsizForum, başta görme, işitme, ortopedik ve bilişsel kısıtlılığı olan bireyler olmak üzere, internette engelsiz ve güvenli bir bilgi paylaşım ortamı arayan herkes içindir. Türkiye&apos;nin ilk tam erişilebilir forum platformu olan bu sistem, evrensel tasarım prensipleriyle geliştirilmiştir.
              </p>
            </div>

            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-black mb-4">Platformda hangi erişilebilirlik özellikleri var?</h3>
              <p className="text-muted-foreground leading-relaxed">
                EngelsizForum; bionik okuma (Bionic Reading) desteği, yüksek kontrast ve disleksi dostu yazı tipleri, ekran okuyucu optimizasyonu, ARIA etiketleri ile zenginleştirilmiş UI bileşenleri, sesli tartışma özetleri ve tam klavye navigasyonu gibi ileri düzey erişilebilirlik özellikleri sunar.
              </p>
            </div>

            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-black mb-4">Yapay zeka (AI) bu forumda nasıl bir rol oynuyor?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Yapay zeka; uzun ve karmaşık tartışmaları saniyeler içinde özetlemek, görsellere betimleyici alt-metinler (alt text) üretmek, moderasyonu desteklemek ve kullanıcıların "Zeka Puanı" (XP) sistemini yöneterek kaliteli içerik üretimini teşvik etmek için kullanılır.
              </p>
            </div>

            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-black mb-4">Üyelik ücretsiz mi ve bilgilerim güvende mi?</h3>
              <p className="text-muted-foreground leading-relaxed">
                EngelsizForum tamamen ücretsiz bir platformdur. Kullanıcı verileri, modern şifreleme standartları ve Supabase altyapısı ile korunmaktadır. Gizliliğiniz bizim için önceliktir ve verileriniz asla izinsiz üçüncü taraflarla paylaşılmaz.
              </p>
            </div>

            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-black mb-4">İçeriklerin doğruluğu nasıl sağlanıyor?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Platformumuzda paylaşılan kritik bilgiler, topluluk moderatörleri ve "Uzman" rozetine sahip deneyimli kullanıcılar tarafından denetlenir. Ayrıca, topluluk raporlama sistemi sayesinde hatalı veya yanıltıcı bilgiler hızla tespit edilerek işaretlenir veya kaldırılarak bilgi güvenliği (Trustworthiness) korunur.
              </p>
            </div>
          </div>
        </section>

        {/* Authoritative Badge Section */}
        <section className="bg-primary text-primary-foreground py-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2 uppercase">Erişilebilirlik Taahhüdü</h2>
              <p className="opacity-90 font-medium">Bilişimde engel yok, sadece henüz çözülmemiş tasarım sorunları var.</p>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black">2.1</div>
                <div className="text-xs uppercase font-bold tracking-widest opacity-80">WCAG Uyumu</div>
              </div>
              <div className="px-6 py-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black">100%</div>
                <div className="text-xs uppercase font-bold tracking-widest opacity-80">Erişilebilirlik</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
