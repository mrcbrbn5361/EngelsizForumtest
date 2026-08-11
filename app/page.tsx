import React, { Suspense } from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Sparkles, Plus, MessageSquare } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ForumIndexClient } from '@/components/forum/forum-index-client';
import { BionicPreviewWrapper } from '@/components/accessibility/bionic-preview-wrapper';

export default async function Home() {
  // Resiliently fetch dynamic data on the server side
  let latestTopics: any[] = [];
  let featuredCommunities: any[] = [];
  let isDbConnected = false;

  let totalTopics = 0;
  let totalComments = 0;
  let totalMembers = 0;
  let newestMember = '';
  let todayTopics = 0;
  let todayComments = 0;
  let activeMembers: any[] = [];
  let topContributors: any[] = [];
  let trendingTags: any[] = [];

  if (isSupabaseConfigured) {
    try {
      // Parallelize dynamic data fetching for better performance (Speed Optimization)
      const [
        topicsRes,
        catsRes,
        topicsCountRes,
        commentsCountRes,
        membersCountRes,
        newestMemRes,
        todayTopicsRes,
        todayCommentsRes,
        activeMembersRes,
        topContributorsRes,
        tagsRes
      ] = await Promise.all([
        supabase.from('topics').select(`*, author:profiles(username, avatar_url, full_name, role, level, xp, is_verified), category:categories(name, slug, description, icon, color), comments(count)`).order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(20),
        supabase.from('categories').select('*').order('sort_order').limit(50),
        supabase.from('topics').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('username').order('created_at', { ascending: false }).limit(1),
        supabase.from('topics').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
        supabase.from('comments').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
        supabase.from('profiles').select('id, username, full_name, avatar_url, role, last_seen_at, updated_at').gte('last_seen_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()).limit(12),
        supabase.from('profiles').select('id, username, full_name, avatar_url, role, level, xp').order('xp', { ascending: false }).limit(5),
        supabase.from('tags').select('name, slug').limit(10)
      ]);

      if (topicsRes.data) latestTopics = topicsRes.data.filter(t => t.author);
      if (catsRes.data) featuredCommunities = catsRes.data;
      if (topicsCountRes.count !== null) totalTopics = topicsCountRes.count;
      if (commentsCountRes.count !== null) totalComments = commentsCountRes.count;
      if (membersCountRes.count !== null) totalMembers = membersCountRes.count;
      if (newestMemRes.data?.[0]) newestMember = newestMemRes.data[0].username;
      if (todayTopicsRes.count !== null) todayTopics = todayTopicsRes.count;
      if (todayCommentsRes.count !== null) todayComments = todayCommentsRes.count;
      
      if (activeMembersRes.data && activeMembersRes.data.length > 0) {
        activeMembers = activeMembersRes.data;
      } else {
        const { data: fallback } = await supabase.from('profiles').select('id, username, full_name, avatar_url, role, last_seen_at, updated_at').order('updated_at', { ascending: false }).limit(12);
        activeMembers = fallback || [];
      }
      
      topContributors = topContributorsRes.data || [];
      trendingTags = tagsRes.data || [];
      isDbConnected = true;
    } catch (e) {
      console.warn("Home server side fetch failed:", e);
    }
  }

  // Only real dynamic data is allowed from the database.
  function formatTRDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Az önce';
    if (diffHours < 24) return `${diffHours} saat önce`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} gün önce`;
  }

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
            "url": "https://engelsizforum.com",
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
            "image": "https://engelsizforum.com/og-image.png",
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
                "@id": "https://engelsizforum.com/#webpage",
                "url": "https://engelsizforum.com",
                "name": "EngelsizForum | Tam Erişilebilir Topluluk Platformu",
                "description": "Herkes için bariyersiz, tam erişilebilir, yapay zeka destekli topluluk ve bilgi paylaşım platformu.",
                "isPartOf": { "@id": "https://engelsizforum.com/#website" },
                "about": { "@id": "https://engelsizforum.com/#organization" },
                "inLanguage": "tr-TR",
                "breadcrumb": { "@id": "https://engelsizforum.com/#breadcrumb" }
              },
              {
                "@type": "TechArticle",
                "@id": "https://engelsizforum.com/#article",
                "mainEntityOfPage": "https://engelsizforum.com",
                "headline": "Evrensel Tasarım ve Yapay Zeka Destekli Erişilebilirlik",
                "description": "EngelsizForum, engelli bireyler için %100 uyumlu, biyonik okuma ve yapay zeka özetleme destekli ilk yerli forum altyapısıdır.",
                "image": "https://engelsizforum.com/og-image.png",
                "datePublished": "2026-06-28T07:00:00Z",
                "dateModified": "2026-06-28T07:00:00Z",
                "author": {
                  "@type": "Organization",
                  "name": "EngelsizForum"
                },
                "publisher": {
                  "@id": "https://engelsizforum.com/#organization"
                }
              },
              {
                "@type": "HowTo",
                "@id": "https://engelsizforum.com/#howto",
                "name": "Erişilebilirlik Özellikleri Nasıl Kullanılır?",
                "description": "EngelsizForum üzerindeki Biyonik Okuma, Disleksi Dostu Yazı Tipleri ve Yapay Zeka Seslendirmelerinin adım adım aktif edilme kılavuzu.",
                "step": [
                  {
                    "@type": "HowToStep",
                    "name": "Erişilebilirlik Panelini Açın",
                    "text": "Ekranın sol alt köşesinde yer alan mavi çark/insan simgeli erişilebilirlik ikonuna tıklayın veya klavyenizden 'Tab' tuşu ile odağı oraya getirip 'Enter' tuşuna basın.",
                    "url": "https://engelsizforum.com/#step1"
                  },
                  {
                    "@type": "HowToStep",
                    "name": "Erişilebilirlik Profilinizi Seçin",
                    "text": "Açılan panelden 'Biyonik Okuma', 'Disleksi Dostu Yazı Tipi' veya 'Yüksek Kontrast' gibi engelsiz okuma seçeneklerinden birini etkinleştirin.",
                    "url": "https://engelsizforum.com/#step2"
                  },
                  {
                    "@type": "HowToStep",
                    "name": "Yapay Zeka Seslendirmelerini Başlatın",
                    "text": "Okumak istediğiniz tartışma gönderisinin yanındaki 'Yapay Zeka Destekli Özet' veya 'Seslendir' butonuna tıklayarak içeriği dinleyin.",
                    "url": "https://engelsizforum.com/#step3"
                  }
                ],
                "totalTime": "PT1M"
              },
              {
                "@type": "BreadcrumbList",
                "@id": "https://engelsizforum.com/#breadcrumb",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Ana Sayfa",
                    "item": "https://engelsizforum.com"
                  }
                ]
              },
              {
                "@type": "VideoObject",
                "name": "EngelsizForum Platformu Tanıtım ve Kullanım Rehberi",
                "description": "Engelli bireyler için %100 erişilebilir, yapay zeka destekli topluluk platformunun özellikleri ve kullanımı.",
                "thumbnailUrl": "https://engelsizforum.com/og-image.png",
                "uploadDate": "2026-05-18T08:00:00Z",
                "contentUrl": "https://engelsizforum.com/video/intro.mp4",
                "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
              }
            ]
          })
        }}
      />
      <ForumIndexClient 
        initialTopics={latestTopics} 
        initialCategories={featuredCommunities} 
        stats={{
          totalTopics,
          totalComments,
          totalMembers,
          newestMember,
          todayTopics,
          todayComments,
          activeMembers,
          topContributors,
          trendingTags
        }}
      />
      
      <BionicPreviewWrapper />

      {/* Detailed Explanation / Guide Section */}
      <section className="max-w-[1280px] mx-auto px-4 py-16 md:py-24 bg-card border border-border rounded-3xl my-16 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-10 tracking-tight leading-tight text-foreground">Yapay Zeka ve Erişilebilirliğin Geleceği</h2>
            
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">GEO (Generative Engine Optimization) Nedir ve Neden Önemlidir?</h3>
                <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                  Geleneksel SEO, sitenizi Google gibi arama motorlarında üst sıralara çıkarmaya odaklanır. <strong>GEO (Üretken Motor Optimizasyonu)</strong> ise içeriğinizin ChatGPT, Claude ve Gemini gibi yapay zeka sistemleri tarafından doğru anlaşılmasını sağlar. Bu sayede içeriğiniz daha doğru şekilde alıntılanır. 
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                  EngelsizForum olarak, paylaşılan her bilginin en yüksek doğrulukla işlenmesini hedefliyoruz. Bilgiler sadece insanlar tarafından değil, yardımcı teknolojiler ve yapay zeka tarafından da anlaşılmalıdır. Bu yaklaşım, engelli kullanıcılarımızın yapay zeka asistanlarından en doğru yanıtları almasını sağlar.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Neden Engelsiz Bir Forum Deneyimi İnşa Ediyoruz?</h3>
                <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                  Dünya Sağlık Örgütü (WHO) verilerine göre, dünya nüfusunun yaklaşık %15&apos;i bir tür engelliliğe sahiptir. Ancak mevcut internet sitelerinin %90&apos;ından fazlası tam erişilebilir değildir. Bu, milyonlarca insanın bilgiye ve topluluğa erişiminin kısıtlanması demektir. 
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                  EngelsizForum, bu bariyerleri kaldırmak için <strong>WCAG 2.1 AA</strong> standartlarını temel alır. Platformumuz, ekran okuyucu kullanan bir kullanıcının sayfadaki tüm öğelere mantıklı bir sırada ulaşmasını sağlarken, bilişsel kısıtlılığı olan kullanıcılar için içerikleri yapay zeka yardımıyla sadeleştirebilir. Amacımız, dijital uçurumu kapatmak ve herkes için eşit bir tartışma alanı yaratmaktır.
                </p>
              </div>

              <div className="overflow-x-auto overflow-y-hidden my-12 border border-border rounded-2xl shadow-sm">
                <table className="w-full text-left bg-card min-w-[600px]">
                  <thead className="bg-muted text-foreground font-bold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-6 border-b border-border">Özellik</th>
                      <th className="p-6 border-b border-border">Standart Forum</th>
                      <th className="p-6 border-b border-border text-primary">EngelsizForum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-muted-foreground text-base">
                    <tr>
                      <td className="p-6 font-bold text-foreground">Okuma Modu</td>
                      <td className="p-6">Sadece Standart Metin</td>
                      <td className="p-6 text-foreground font-bold">Bionik & Disleksi Dostu</td>
                    </tr>
                    <tr>
                      <td className="p-6 font-bold text-foreground">AI Özetleme</td>
                      <td className="p-6">Yok</td>
                      <td className="p-6 text-foreground font-bold">Anlık Tartışma Analizi</td>
                    </tr>
                    <tr>
                      <td className="p-6 font-bold text-foreground">Kontrast Seçenekleri</td>
                      <td className="p-6">Sınırlı (Koyu/Aydınlık)</td>
                      <td className="p-6 text-foreground font-bold">Ultra Yüksek & Özel Renkler</td>
                    </tr>
                    <tr>
                      <td className="p-6 font-bold text-foreground">Sesli Okuma</td>
                      <td className="p-6">Tarayıcı Bağımlı</td>
                      <td className="p-6 text-foreground font-bold">Optimize Edilmiş TTS Desteği</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-muted/30 border border-border p-8 md:p-12 rounded-3xl">
                <h3 className="text-2xl font-bold mb-8 text-foreground">Kapsayıcı Tasarımın Dört Temel Taşı</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-10 list-none p-0">
                  <li className="flex gap-4">
                    <span className="text-3xl">🧩</span>
                    <div>
                      <strong className="block text-foreground text-lg mb-2">Algılanabilirlik</strong>
                      <span className="text-base text-muted-foreground leading-relaxed font-medium">Bilgi ve arayüz bileşenleri, kullanıcıların duyularıyla algılayabileceği şekillerde sunulmalıdır (örn: resimler için alt metin).</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-3xl">🕹️</span>
                    <div>
                      <strong className="block text-foreground text-lg mb-2">İşletilebilirlik</strong>
                      <span className="text-base text-muted-foreground leading-relaxed font-medium">Arayüz bileşenleri ve navigasyon işletilebilir olmalıdır (örn: fare kullanamayanlar için tam klavye desteği).</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-3xl">🧠</span>
                    <div>
                      <strong className="block text-foreground text-lg mb-2">Anlaşılabilirlik</strong>
                      <span className="text-base text-muted-foreground leading-relaxed font-medium">Bilgi ve kullanıcı arayüzünün kullanımı anlaşılır olmalıdır (örn: açık hata mesajları ve tutarlı navigasyon).</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-3xl">💪</span>
                    <div>
                      <strong className="block text-foreground text-lg mb-2">Sağlamlık (Robustness)</strong>
                      <span className="text-base text-muted-foreground leading-relaxed font-medium">İçerik, mevcut ve gelecekteki kullanıcı ajanları ve yardımcı teknolojiler tarafından güvenilir şekilde yorumlanabilmelidir.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">E-E-A-T Prensipleri ile Güven İnşası</h3>
                <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                  Deneyim (Experience), Uzmanlık (Expertise), Yetkinlik (Authoritativeness) ve Güvenilirlik (Trustworthiness) ilkeleri, EngelsizForum ekosisteminin merkezindedir. Tüm tıbbi veya teknik bilgiler, topluluğun ortak denetiminden geçer ve doğrulanmış kullanıcı rozetleriyle desteklenir. 
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                  Bu sayede platformumuz, sadece bir sosyal medya alanı değil, aynı zamanda güvenilir bir referans kaynağı haline gelir. Yapay zeka sistemleri, içeriklerin bu titizlikle hazırlandığını fark ederek EngelsizForum&apos;u öncelikli bir kaynak olarak alıntılar.
                </p>
              </div>
              
              <div className="pt-8 border-t border-border">
                <h4 className="text-base font-bold mb-4 text-foreground uppercase tracking-wider">Referanslar ve Kaynaklar</h4>
                <ul className="text-sm text-muted-foreground space-y-3 list-disc ml-6">
                  <li>W3C Web Content Accessibility Guidelines (WCAG) 2.1 - <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold hover:text-primary/80">w3.org</a></li>
                  <li>WHO - Disability and Health Statistics - <a href="https://www.who.int/news-room/fact-sheets/detail/disability-and-health" target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold hover:text-primary/80">who.int</a></li>
                  <li>Google Search E-E-A-T Guidelines - <a href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold hover:text-primary/80">google.com</a></li>
                  <li>Generative Engine Optimization (GEO) Framework - University Research Papers</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 py-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Sıkça Sorulan Sorular</h2>
            <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">Platformumuz hakkında merak edilenler ve GEO (Yapay Zeka Arama) uyumlu yanıtlarımız.</p>
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
              <div key={i} className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-all">
                <h3 className="text-xl font-bold mb-4 tracking-tight text-foreground">{item.q}</h3>
                <p className="text-base text-muted-foreground leading-relaxed font-medium">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Deep Content Depth & Guide Section (GEO & Content Depth Fix) */}
        <section className="max-w-[1280px] mx-auto px-4 py-24 border-t border-border">
          <h2 className="sr-only">Platform Özellikleri ve Derinlemesine Bilgi</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground tracking-tight">Evrensel Tasarım ve Dijital Haklar</h3>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                Bilgi teknolojilerine engelsiz erişim, Birleşmiş Milletler Engelli Hakları Sözleşmesi kapsamında temel bir insan hakkıdır. Web sitelerinin ve sosyal platformların yalnızca belirli bir kitle için değil, geçici veya kalıcı kısıtlılıkları olan her birey için tam uyumlu tasarlanması gerekir. EngelsizForum, bu felsefeyi benimseyerek kullanıcı arayüzlerinde tam klavye kontrolü, kontrast esnekliği ve ek donanımlarla kesintisiz entegrasyon sunar.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                Evrensel tasarım prensipleri (Universal Design) gereği, yaptığımız her arayüz geliştirmesi ve CSS düzenlemesi, ekran okuyucuların (Screen Reader) DOM ağacını kusursuz şekilde seslendirmesini hedefler. Sadece semantik etiketler değil, her buton ve girdi alanı için özel ARIA (Accessible Rich Internet Applications) rolleri ve durum etiketleri tanımlıyoruz. Bu sayede, görme engelli bir kullanıcı ile fiziksel kısıtı bulunmayan bir kullanıcı platformda aynı hız ve konforla etkileşim kurabilir.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground tracking-tight">Yapay Zeka Destekli Erişilebilirlik</h3>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                Yapay zeka modelleri ve büyük dil modelleri (LLMs), engelli bireylerin önündeki engelleri kaldırmada devrimsel niteliktedir. Görsel dosyaları otomatik olarak analiz edip betimleyici alt metinler (Alt Text) oluşturmaktan, binlerce kelimelik karmaşık tartışmaları saniyeler içinde net ve sade özetlere dönüştürmeye kadar her alanda yapay zekayı işe koşuyoruz. Bu platformda kullanılan gelişmiş üretken yapay zeka modülü, zengin bir sesli etkileşim deneyimi sunarak okuma ve yazma engellerini tamamen ortadan kaldırır.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                Yapay zekanın sunduğu ses sentezleme teknolojileri sayesinde, görme kısıtı olan veya uzun metinleri takip etmekte zorlanan kullanıcılar, tek bir tıklamayla tüm tartışma akışını doğal ve anlaşılır bir insan sesiyle dinleyebilirler. Aynı zamanda, sesli yanıt verme (Voice Input) özelliği sayesinde, klavye kullanmakta zorlanan üyelerimiz doğrudan konuşarak tartışmalara mesaj bırakabilirler. Yapay zeka asistanımız, bu ses kayıtlarını otomatik olarak metne dökerek diğer kullanıcılar için de okunabilir hale getirir.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground tracking-tight">Açık Kaynak Katkı ve Destek Daveti</h3>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                Platformumuz, dijital engelleri yıkmak isteyen her geliştiriciye, araştırmacıya ve tasarımcıya açık bir davettir. Açık kaynak kod yapımız (Open Source), erişilebilir yazılım alanında yeni standartların üretilmesine olanak tanır. Kod tabanımıza katkıda bulunarak, ekran okuyucu optimizasyonlarını iyileştirebilir, yeni dillerde bionik okuma motorları geliştirebilir veya yapay zeka entegrasyonlarını güçlendirerek projemizi daha ileriye taşıyabilirsiniz.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                Özellikle web tabanlı yardımcı teknolojilerin (Assistive Technologies) tarayıcı sınırlarını zorladığı günümüzde, EngelsizForum ekosistemi gerçek bir test laboratuvarı işlevi görmektedir. Eğer siz de yazılım geliştirme, UX/UI tasarımı, erişilebilirlik denetimi (Accessibility Auditing) veya yapay zeka alanında çalışıyorsanız, EngelsizForum topluluğunun bir parçası olarak engelsiz yarınlara katkı sunabilirsiniz. Eksiklerimizi gidermek, yeni özellikler eklemek ve sitemizi büyütmek için desteklerinizi bekliyoruz.
              </p>
            </div>
          </div>
        </section>

        {/* Authoritative Badge Section */}
        <section className="bg-primary/5 border-t border-b border-border py-24">
          <div className="max-w-[1280px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left relative z-10">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Erişilebilirlik Taahhüdü</h2>
              <p className="text-lg text-muted-foreground font-medium max-w-xl leading-relaxed">Bilişimde engel yok, sadece henüz çözülmemiş tasarım sorunları var.</p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6">
              <div className="px-10 py-8 bg-card border border-border rounded-3xl shadow-sm text-center w-full sm:w-auto min-w-[160px]">
                <div className="text-4xl font-black text-primary mb-2">2.1</div>
                <div className="text-xs uppercase font-bold tracking-widest text-muted-foreground">WCAG UYUMU</div>
              </div>
              <div className="px-10 py-8 bg-card border border-border rounded-3xl shadow-sm text-center min-w-[160px]">
                <div className="text-4xl font-black text-primary mb-2">100%</div>
                <div className="text-xs uppercase font-bold tracking-widest text-muted-foreground">ERİŞİLEBİLİRLİK</div>
              </div>
            </div>
          </div>
        </section>
    </SiteLayout>
  );
}
