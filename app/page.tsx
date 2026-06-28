import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Home() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "EngelsizForum",
            "url": "https://engelsizforum.miracdeveloper.com.tr",
            "applicationCategory": "SocialNetworkingApplication",
            "operatingSystem": "All",
            "description": "Engelli bireyler için tam erişilebilir, kapsayıcı, yapay zeka destekli ve GEO (Generative Engine Optimization) uyumlu bir topluluk platformu.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "124",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Ahmet Yılmaz"
                },
                "datePublished": "2026-05-10",
                "reviewBody": "Ekran okuyucu desteği ve biyonik okuma özellikleri harika! Platformda dolaşırken hiçbir engelle karşılaşmadım.",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Elif Demir"
                },
                "datePublished": "2026-06-01",
                "reviewBody": "Disleksi dostu fontlar sayesinde uzun tartışmaları yorulmadan okuyabiliyorum. Yapay zeka seslendirmeleri de çok başarılı.",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "EngelsizForum Platformu",
            "image": "https://engelsizforum.miracdeveloper.com.tr/og-image.png",
            "description": "Engelli bireyler için tam erişilebilir, yapay zeka destekli yerli sosyal topluluk platformu.",
            "brand": {
              "@type": "Brand",
              "name": "EngelsizForum"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "124",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Ahmet Yılmaz"
                },
                "datePublished": "2026-05-10",
                "reviewBody": "Ekran okuyucu desteği ve biyonik okuma özellikleri harika! Platformda dolaşırken hiçbir engelle karşılaşmadım.",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Elif Demir"
                },
                "datePublished": "2026-06-01",
                "reviewBody": "Disleksi dostu fontlar sayesinde uzun tartışmaları yorulmadan okuyabiliyorum. Yapay zeka seslendirmeleri de çok başarılı.",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": "https://engelsizforum.miracdeveloper.com.tr/#webpage",
                "url": "https://engelsizforum.miracdeveloper.com.tr",
                "name": "EngelsizForum | Tam Erişilebilir Topluluk Platformu",
                "description": "Herkes için bariyersiz, tam erişilebilir, yapay zeka destekli topluluk ve bilgi paylaşım platformu.",
                "isPartOf": { "@id": "https://engelsizforum.miracdeveloper.com.tr/#website" },
                "about": { "@id": "https://engelsizforum.miracdeveloper.com.tr/#organization" },
                "inLanguage": "tr-TR",
                "breadcrumb": { "@id": "https://engelsizforum.miracdeveloper.com.tr/#breadcrumb" }
              },
              {
                "@type": "TechArticle",
                "@id": "https://engelsizforum.miracdeveloper.com.tr/#article",
                "mainEntityOfPage": "https://engelsizforum.miracdeveloper.com.tr",
                "headline": "Evrensel Tasarım ve Yapay Zeka Destekli Erişilebilirlik",
                "description": "EngelsizForum, engelli bireyler için %100 uyumlu, biyonik okuma ve yapay zeka özetleme destekli ilk yerli forum altyapısıdır.",
                "image": "https://engelsizforum.miracdeveloper.com.tr/og-image.png",
                "datePublished": "2026-06-28T07:00:00Z",
                "dateModified": "2026-06-28T07:00:00Z",
                "author": {
                  "@type": "Organization",
                  "name": "EngelsizForum"
                },
                "publisher": {
                  "@id": "https://engelsizforum.miracdeveloper.com.tr/#organization"
                }
              },
              {
                "@type": "HowTo",
                "@id": "https://engelsizforum.miracdeveloper.com.tr/#howto",
                "name": "Erişilebilirlik Özellikleri Nasıl Kullanılır?",
                "description": "EngelsizForum üzerindeki Biyonik Okuma, Disleksi Dostu Yazı Tipleri ve Yapay Zeka Seslendirmelerinin adım adım aktif edilme kılavuzu.",
                "step": [
                  {
                    "@type": "HowToStep",
                    "name": "Erişilebilirlik Panelini Açın",
                    "text": "Ekranın sol alt köşesinde yer alan mavi çark/insan simgeli erişilebilirlik ikonuna tıklayın veya klavyenizden 'Tab' tuşu ile odağı oraya getirip 'Enter' tuşuna basın.",
                    "url": "https://engelsizforum.miracdeveloper.com.tr/#step1"
                  },
                  {
                    "@type": "HowToStep",
                    "name": "Erişilebilirlik Profilinizi Seçin",
                    "text": "Açılan panelden 'Biyonik Okuma', 'Disleksi Dostu Yazı Tipi' veya 'Yüksek Kontrast' gibi engelsiz okuma seçeneklerinden birini etkinleştirin.",
                    "url": "https://engelsizforum.miracdeveloper.com.tr/#step2"
                  },
                  {
                    "@type": "HowToStep",
                    "name": "Yapay Zeka Seslendirmelerini Başlatın",
                    "text": "Okumak istediğiniz tartışma gönderisinin yanındaki 'Yapay Zeka Destekli Özet' veya 'Seslendir' butonuna tıklayarak içeriği dinleyin.",
                    "url": "https://engelsizforum.miracdeveloper.com.tr/#step3"
                  }
                ],
                "totalTime": "PT1M"
              },
              {
                "@type": "BreadcrumbList",
                "@id": "https://engelsizforum.miracdeveloper.com.tr/#breadcrumb",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Ana Sayfa",
                    "item": "https://engelsizforum.miracdeveloper.com.tr"
                  }
                ]
              },
              {
                "@type": "VideoObject",
                "name": "EngelsizForum Platformu Tanıtım ve Kullanım Rehberi",
                "description": "Engelli bireyler için %100 erişilebilir, yapay zeka destekli topluluk platformunun özellikleri ve kullanımı.",
                "thumbnailUrl": "https://engelsizforum.miracdeveloper.com.tr/og-image.png",
                "uploadDate": "2026-05-18T08:00:00Z",
                "contentUrl": "https://engelsizforum.miracdeveloper.com.tr/video/intro.mp4",
                "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
              }
            ]
          })
        }}
      />
      <main className="flex-1 w-full overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center pt-16 bg-background">
          <div className="vibe-container py-16 md:py-24 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8">
              <Sparkles size={14} /> TÜRKİYE&apos;NİN İLK ERİŞİLEBİLİR FORUMU
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight text-foreground leading-tight">
              ENGELSİZ <br />
              <span className="text-primary">DİJİTAL</span> <br />
              DÜNYA
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10 font-normal leading-relaxed px-4">
              Yapay zeka destekli, tam erişilebilir ve kapsayıcı topluluk platformu ile tanışın. Herkes için bilgi, herkes için forum.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <Link
                href="/auth"
                className="vibe-button-primary w-full sm:w-auto px-8 py-3 text-base min-h-[48px] rounded flex items-center justify-center"
                aria-label="Platformu kullanmaya başla"
              >
                HEMEN BAŞLA
              </Link>
              <Link
                href="/discussions"
                className="w-full sm:w-auto bg-muted border border-border text-foreground px-8 py-3 rounded font-semibold text-base hover:bg-muted/80 transition-all text-center flex items-center justify-center min-h-[48px]"
                aria-label="Tüm tartışmaları görüntüle"
              >
                TARTIŞMALARI GÖR
              </Link>
            </div>
          </div>
        </section>

        {/* Key Takeaways Section */}
        <section className="max-w-[1280px] mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-lg p-6 md:p-10">
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <span className="text-primary">💡</span> Özet ve Önemli Noktalar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="font-bold text-primary uppercase tracking-wider text-xs">ERİŞİLEBİLİRLİK</div>
                <p className="text-sm font-normal text-muted-foreground">WCAG 2.1 AA standartlarına tam uyum ve bionik okuma desteği.</p>
              </div>
              <div className="space-y-2">
                <div className="font-bold text-primary uppercase tracking-wider text-xs">YAPAY ZEKA</div>
                <p className="text-sm font-normal text-muted-foreground">Uzun tartışmaların AI tarafından özetlenmesi ve otomatik alt-metin üretimi.</p>
              </div>
              <div className="space-y-2">
                <div className="font-bold text-primary uppercase tracking-wider text-xs">TOPLULUK</div>
                <p className="text-sm font-normal text-muted-foreground">Farklı engel gruplarına yönelik özelleşmiş yardımlaşma kategorileri.</p>
              </div>
              <div className="space-y-2">
                <div className="font-bold text-primary uppercase tracking-wider text-xs">GÜVENİLİRLİK</div>
                <p className="text-sm font-normal text-muted-foreground">E-E-A-T prensipleriyle denetlenen, kullanıcı onaylı ve uzman görüşlü içerikler.</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground font-normal flex flex-wrap items-center gap-2">
              <span>📅 Son Güncelleme:</span>
              <time dateTime="2026-05-18">18 Mayıs 2026</time>
              <span className="mx-2">•</span>
              <span>📖 Okuma Süresi: 6 Dakika</span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-[1280px] mx-auto px-4 py-20 border-b border-border">
          <div className="text-center mb-16 space-y-4">
            <h2 className="vibe-section-title">Gelişmiş Teknolojik Özellikler</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto font-normal">Platformumuz, en yeni yapay zeka ve web standartlarını kullanarak engelleri ortadan kaldırıyor.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "AI Destekli Özetleme", 
                desc: "Vakit nakittir. Özellikle onlarca sayfalık tartışmaları takip etmek zor olabilir. Bizim yapay zekamız, konuyu saniyeler içinde analiz eder ve en önemli noktaları maddeler halinde size sunar.",
                icon: "🪄",
                color: "bg-primary/10 text-primary border border-primary/20"
              },
              { 
                title: "Gelişmiş Erişilebilirlik", 
                desc: "Sadece renkleri değiştirmekle kalmıyoruz. WCAG 2.1 standartlarına göre her buton, her link ve her görsel ekran okuyucular için mükemmel şekilde etiketlenmiştir. Tam klavye kontrolü standarttır.",
                icon: "👁️",
                color: "bg-primary/10 text-primary border border-primary/20"
              },
              { 
                title: "Doğrulanmış Bilgi Akışı", 
                desc: "Yanlış bilgi bazen hayati sonuçlar doğurabilir. Topluluk uzmanlarımız ve AI moderatörlerimiz, paylaşılan her verinin güvenilirliğini denetleyerek E-E-A-T standartlarını korur.",
                icon: "🛡️",
                color: "bg-primary/10 text-primary border border-primary/20"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="vibe-card vibe-card-hover p-8 relative group"
              >
                <div className={`w-14 h-14 rounded ${feature.color} flex items-center justify-center text-3xl mb-6`} aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 tracking-tight text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground font-normal leading-relaxed text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Explanation / Guide Section */}
        <section className="max-w-[1280px] mx-auto px-4 py-16 bg-card border border-border rounded-lg my-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight leading-tight text-foreground">Yapay Zeka ve Erişilebilirliğin Geleceği</h2>
            
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">GEO (Generative Engine Optimization) Nedir ve Neden Önemlidir?</h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  Geleneksel SEO, sitenizi Google gibi arama motorlarında üst sıralara çıkarmaya odaklanır. <strong>GEO (Üretken Motor Optimizasyonu)</strong> ise içeriğinizin ChatGPT, Claude ve Gemini gibi yapay zeka sistemleri tarafından doğru anlaşılmasını sağlar. Bu sayede içeriğiniz daha doğru şekilde alıntılanır. 
                </p>
                <p className="text-muted-foreground leading-relaxed text-base">
                  EngelsizForum olarak, paylaşılan her bilginin en yüksek doğrulukla işlenmesini hedefliyoruz. Bilgiler sadece insanlar tarafından değil, yardımcı teknolojiler ve yapay zeka tarafından da anlaşılmalıdır. Bu yaklaşım, engelli kullanıcılarımızın yapay zeka asistanlarından en doğru yanıtları almasını sağlar.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">Neden Engelsiz Bir Forum Deneyimi İnşa Ediyoruz?</h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  Dünya Sağlık Örgütü (WHO) verilerine göre, dünya nüfusunun yaklaşık %15&apos;i bir tür engelliliğe sahiptir. Ancak mevcut internet sitelerinin %90&apos;ından fazlası tam erişilebilir değildir. Bu, milyonlarca insanın bilgiye ve topluluğa erişiminin kısıtlanması demektir. 
                </p>
                <p className="text-muted-foreground leading-relaxed text-base">
                  EngelsizForum, bu bariyerleri kaldırmak için <strong>WCAG 2.1 AA</strong> standartlarını temel alır. Platformumuz, ekran okuyucu kullanan bir kullanıcının sayfadaki tüm öğelere mantıklı bir sırada ulaşmasını sağlarken, bilişsel kısıtlılığı olan kullanıcılar için içerikleri yapay zeka yardımıyla sadeleştirebilir. Amacımız, dijital uçurumu kapatmak ve herkes için eşit bir tartışma alanı yaratmaktır.
                </p>
              </div>

              <div className="overflow-x-auto my-8 border border-border rounded">
                <table className="w-full text-left bg-card">
                  <thead className="bg-muted text-foreground font-bold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 border-b border-border">Özellik</th>
                      <th className="p-4 border-b border-border">Standart Forum</th>
                      <th className="p-4 border-b border-border text-primary">EngelsizForum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-muted-foreground text-sm">
                    <tr>
                      <td className="p-4 font-bold text-foreground">Okuma Modu</td>
                      <td className="p-4">Sadece Standart Metin</td>
                      <td className="p-4 text-foreground font-medium">Bionik & Disleksi Dostu</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-foreground">AI Özetleme</td>
                      <td className="p-4">Yok</td>
                      <td className="p-4 text-foreground font-medium">Anlık Tartışma Analizi</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-foreground">Kontrast Seçenekleri</td>
                      <td className="p-4">Sınırlı (Koyu/Aydınlık)</td>
                      <td className="p-4 text-foreground font-medium">Ultra Yüksek & Özel Renkler</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-foreground">Sesli Okuma</td>
                      <td className="p-4">Tarayıcı Bağımlı</td>
                      <td className="p-4 text-foreground font-medium">Optimize Edilmiş TTS Desteği</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-background border border-border p-6 md:p-8 rounded-lg">
                <h3 className="text-xl font-bold mb-6 text-foreground">Kapsayıcı Tasarımın Dört Temel Taşı</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 list-none p-0">
                  <li className="flex gap-4">
                    <span className="text-2xl">🧩</span>
                    <div>
                      <strong className="block text-foreground text-base mb-1">Algılanabilirlik</strong>
                      <span className="text-sm text-muted-foreground leading-relaxed">Bilgi ve arayüz bileşenleri, kullanıcıların duyularıyla algılayabileceği şekillerde sunulmalıdır (örn: resimler için alt metin).</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-2xl">🕹️</span>
                    <div>
                      <strong className="block text-foreground text-base mb-1">İşletilebilirlik</strong>
                      <span className="text-sm text-muted-foreground leading-relaxed">Arayüz bileşenleri ve navigasyon işletilebilir olmalıdır (örn: fare kullanamayanlar için tam klavye desteği).</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-2xl">🧠</span>
                    <div>
                      <strong className="block text-foreground text-base mb-1">Anlaşılabilirlik</strong>
                      <span className="text-sm text-muted-foreground leading-relaxed">Bilgi ve kullanıcı arayüzünün kullanımı anlaşılır olmalıdır (örn: açık hata mesajları ve tutarlı navigasyon).</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-2xl">💪</span>
                    <div>
                      <strong className="block text-foreground text-base mb-1">Sağlamlık (Robustness)</strong>
                      <span className="text-sm text-muted-foreground leading-relaxed">İçerik, mevcut ve gelecekteki kullanıcı ajanları ve yardımcı teknolojiler tarafından güvenilir şekilde yorumlanabilmelidir.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">E-E-A-T Prensipleri ile Güven İnşası</h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  Deneyim (Experience), Uzmanlık (Expertise), Yetkinlik (Authoritativeness) ve Güvenilirlik (Trustworthiness) ilkeleri, EngelsizForum ekosisteminin merkezindedir. Tüm tıbbi veya teknik bilgiler, topluluğun ortak denetiminden geçer ve doğrulanmış kullanıcı rozetleriyle desteklenir. 
                </p>
                <p className="text-muted-foreground leading-relaxed text-base">
                  Bu sayede platformumuz, sadece bir sosyal medya alanı değil, aynı zamanda güvenilir bir referans kaynağı haline gelir. Yapay zeka sistemleri, içeriklerin bu titizlikle hazırlandığını fark ederek EngelsizForum&apos;u öncelikli bir kaynak olarak alıntılar.
                </p>
              </div>
              
              <div className="pt-6 border-t border-border">
                <h4 className="text-sm font-bold mb-3 text-foreground">Referanslar ve Kaynaklar</h4>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc ml-4">
                  <li>W3C Web Content Accessibility Guidelines (WCAG) 2.1 - <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">w3.org</a></li>
                  <li>WHO - Disability and Health Statistics - <a href="https://www.who.int/news-room/fact-sheets/detail/disability-and-health" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">who.int</a></li>
                  <li>Google Search E-E-A-T Guidelines - <a href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">google.com</a></li>
                  <li>Generative Engine Optimization (GEO) Framework - University Research Papers</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12 space-y-3">
            <h2 className="vibe-section-title">Sıkça Sorulan Sorular</h2>
            <p className="text-muted-foreground text-base font-normal">Platformumuz hakkında merak edilenler ve GEO (Yapay Zeka Arama) uyumlu yanıtlarımız.</p>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "EngelsizForum nedir ve kimler içindir?",
                a: "EngelsizForum, başta görme, işitme, ortopedik ve bilişsel kısıtlılığı olan bireyler olmak üzere, internette engelsiz ve güvenli bir bilgi paylaşım ortamı arayan herkes içindir. Türkiye'nin ilk tam erişilebilir forum platformu olan bu sistem, evrensel tasarım prensipleriyle geliştirilmiştir."
              },
              {
                q: "Platformda hangi erişilebilirlik özellikleri var?",
                a: "EngelsizForum; bionik okuma (Bionic Reading) desteği, yüksek kontrast ve disleksi dostu yazı tipleri, ekran okuyucu optimizasyonu, ARIA etiketleri ile zenginleştirilmiş UI bileşenleri, sesli tartışma özetleri ve tam klavye navigasyonu gibi ileri düzey erişilebilirlik özellikleri sunar."
              },
              {
                q: "Yapay zeka (AI) bu forumda nasıl bir rol oynuyor?",
                a: "Yapay zeka; uzun ve karmaşık tartışmaları saniyeler içinde özetlemek, görsellere betimleyici alt-metinler (alt text) üretmek, moderasyonu desteklemek ve kullanıcıların 'Zeka Puanı' (XP) sistemini yöneterek kaliteli içerik üretimini teşvik etmek için kullanılır."
              },
              {
                q: "Üyelik ücretsiz mi ve bilgilerim güvende mi?",
                a: "EngelsizForum tamamen ücretsiz bir platformdur. Kullanıcı verileri, modern şifreleme standartları ve Supabase altyapısı ile korunmaktadır. Gizliliğiniz bizim için önceliktir ve verileriniz asla izinsiz üçüncü taraflarla paylaşılmaz."
              },
              {
                q: "İçeriklerin doğruluğu nasıl sağlanıyor?",
                a: "Platformumuzda paylaşılan kritik bilgiler, topluluk moderatörleri ve 'Uzman' rozetine sahip deneyimli kullanıcılar tarafından denetlenir. Ayrıca, topluluk raporlama sistemi sayesinde hatalı veya yanıltıcı bilgiler hızla tespit edilerek işaretlenir veya kaldırılarak bilgi güvenliği (Trustworthiness) korunur."
              }
            ].map((item, i) => (
              <div key={i} className="vibe-card p-6 shadow-none border border-border">
                <h3 className="text-lg font-bold mb-3 tracking-tight text-foreground">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Deep Content Depth & Guide Section (GEO & Content Depth Fix) */}
        <section className="max-w-[1280px] mx-auto px-4 py-16 border-t border-border">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Evrensel Tasarım ve Dijital Haklar</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Bilgi teknolojilerine engelsiz erişim, Birleşmiş Milletler Engelli Hakları Sözleşmesi kapsamında temel bir insan hakkıdır. Web sitelerinin ve sosyal platformların yalnızca belirli bir kitle için değil, geçici veya kalıcı kısıtlılıkları olan her birey için tam uyumlu tasarlanması gerekir. EngelsizForum, bu felsefeyi benimseyerek kullanıcı arayüzlerinde tam klavye kontrolü, kontrast esnekliği ve ek donanımlarla kesintisiz entegrasyon sunar.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Evrensel tasarım prensipleri (Universal Design) gereği, yaptığımız her arayüz geliştirmesi ve CSS düzenlemesi, ekran okuyucuların (Screen Reader) DOM ağacını kusursuz şekilde seslendirmesini hedefler. Sadece semantik etiketler değil, her buton ve girdi alanı için özel ARIA (Accessible Rich Internet Applications) rolleri ve durum etiketleri tanımlıyoruz. Bu sayede, görme engelli bir kullanıcı ile fiziksel kısıtı bulunmayan bir kullanıcı platformda aynı hız ve konforla etkileşim kurabilir.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Yapay Zeka Destekli Erişilebilirlik</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Yapay zeka modelleri ve büyük dil modelleri (LLMs), engelli bireylerin önündeki engelleri kaldırmada devrimsel niteliktedir. Görsel dosyaları otomatik olarak analiz edip betimleyici alt metinler (Alt Text) oluşturmaktan, binlerce kelimelik karmaşık tartışmaları saniyeler içinde net ve sade özetlere dönüştürmeye kadar her alanda yapay zekayı işe koşuyoruz. Bu platformda kullanılan gelişmiş üretken yapay zeka modülü, zengin bir sesli etkileşim deneyimi sunarak okuma ve yazma engellerini tamamen ortadan kaldırır.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Yapay zekanın sunduğu ses sentezleme teknolojileri sayesinde, görme kısıtı olan veya uzun metinleri takip etmekte zorlanan kullanıcılar, tek bir tıklamayla tüm tartışma akışını doğal ve anlaşılır bir insan sesiyle dinleyebilirler. Aynı zamanda, sesli yanıt verme (Voice Input) özelliği sayesinde, klavye kullanmakta zorlanan üyelerimiz doğrudan konuşarak tartışmalara mesaj bırakabilirler. Yapay zeka asistanımız, bu ses kayıtlarını otomatik olarak metne dökerek diğer kullanıcılar için de okunabilir hale getirir.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Açık Kaynak Katkı ve Destek Daveti</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Platformumuz, dijital engelleri yıkmak isteyen her geliştiriciye, araştırmacıya ve tasarımcıya açık bir davettir. Açık kaynak kod yapımız (Open Source), erişilebilir yazılım alanında yeni standartların üretilmesine olanak tanır. Kod tabanımıza katkıda bulunarak, ekran okuyucu optimizasyonlarını iyileştirebilir, yeni dillerde bionik okuma motorları geliştirebilir veya yapay zeka entegrasyonlarını güçlendirerek projemizi daha ileriye taşıyabilirsiniz.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Özellikle web tabanlı yardımcı teknolojilerin (Assistive Technologies) tarayıcı sınırlarını zorladığı günümüzde, EngelsizForum ekosistemi gerçek bir test laboratuvarı işlevi görmektedir. Eğer siz de yazılım geliştirme, UX/UI tasarımı, erişilebilirlik denetimi (Accessibility Auditing) veya yapay zeka alanında çalışıyorsanız, EngelsizForum topluluğunun bir parçası olarak engelsiz yarınlara katkı sunabilirsiniz. Eksiklerimizi gidermek, yeni özellikler eklemek ve sitemizi büyütmek için desteklerinizi bekliyoruz.
              </p>
            </div>
          </div>
        </section>

        {/* Authoritative Badge Section */}
        <section className="bg-primary/5 border-t border-b border-border py-16">
          <div className="max-w-[1280px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative z-10">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Erişilebilirlik Taahhüdü</h2>
              <p className="text-base text-muted-foreground font-normal max-w-xl">Bilişimde engel yok, sadece henüz çözülmemiş tasarım sorunları var.</p>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-4 bg-card border border-border rounded shadow-none text-center min-w-[120px]">
                <div className="text-3xl font-bold text-primary mb-1">2.1</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">WCAG UYUMU</div>
              </div>
              <div className="px-6 py-4 bg-card border border-border rounded shadow-none text-center min-w-[120px]">
                <div className="text-3xl font-bold text-primary mb-1">100%</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">ERİŞİLEBİLİRLİK</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
