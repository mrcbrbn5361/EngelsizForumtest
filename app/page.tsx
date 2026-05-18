import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Link from 'next/link';
import { BionicText } from '@/components/ui/bionic-text';

export default function Home() {
  const startHref = '/discussions';

  return (
    <DashboardLayout>
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

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto px-4 py-20 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { 
                title: "AI Özeti", 
                desc: "Uzun tartışmaları saniyeler içinde özetleyelim, zamandan tasarruf edin.",
                icon: "✨",
                color: "bg-blue-500/10 text-blue-500"
              },
              { 
                title: "Tam Erişilebilirlik", 
                desc: "Ekran okuyucu uyumlu (WCAG 2.1) ve özelleştirilebilir görünüm seçenekleri.",
                icon: "♿",
                color: "bg-green-500/10 text-green-500"
              },
              { 
                title: "Güvenli Topluluk", 
                desc: "Herkesin kendini güvende ve değerli hissettiği, moderasyonlu bir ortam.",
                icon: "🛡️",
                color: "bg-orange-500/10 text-orange-500"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-card border border-border p-8 rounded-3xl hover:border-primary/50 transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`} aria-hidden="true">
                  {feature.icon}
                </div>
                <h2 className="text-xl md:text-2xl font-black mb-4 tracking-tight">{feature.title}</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Explanation / Guide Section */}
        <section className="max-w-7xl mx-auto px-4 py-24 bg-muted/30 rounded-[3rem] my-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-6xl font-black mb-12 tracking-tight leading-tight">Yapay Zeka ve Erişilebilirliğin Geleceği</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-10">
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-black mb-4">GEO (Generative Engine Optimization) Nedir?</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Geleneksel SEO (Arama Motoru Optimizasyonu), sitenizi Google gibi arama motorlarında üst sıralara çıkarmaya odaklanırken, <strong>GEO (Üretken Motor Optimizasyonu)</strong>, içeriğinizin ChatGPT, Claude, Gemini ve Perplexity gibi yapay zeka sistemleri tarafından doğru anlaşılmasını ve alıntılanmasını sağlar. EngelsizForum olarak, paylaşılan her bilginin sadece insanlar tarafından değil, yardımcı teknolojiler ve yapay zeka tarafından da en yüksek doğrulukla işlenmesini hedefliyoruz.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-black mb-4">Neden Engelsiz Bir Forum?</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  İnternet üzerindeki çoğu platform, karmaşık yapılar ve erişilemez arayüzler nedeniyle engelli bireyler için birer bariyer haline gelmiştir. EngelsizForum, bu bariyerleri kaldırmak için <strong>WCAG 2.1 AA</strong> standartlarını temel alır. Platformumuz, ekran okuyucu kullanan bir kullanıcının sayfadaki tüm öğelere mantıklı bir sırada ulaşmasını sağlarken, bilişsel kısıtlılığı olan kullanıcılar için içerikleri yapay zeka yardımıyla sadeleştirebilir.
                </p>
              </div>

              <div className="bg-card border border-border p-10 rounded-[2rem] shadow-xl">
                <h3 className="text-2xl font-black mb-6">Temel Teknolojilerimiz</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0">
                  <li className="flex gap-4">
                    <span className="text-primary text-2xl">✔</span>
                    <div>
                      <strong className="block text-foreground">Bionic Reading</strong>
                      <span className="text-muted-foreground">Metinlerdeki belirli harfleri vurgulayarak okuma hızını ve odaklanmayı artırır.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-primary text-2xl">✔</span>
                    <div>
                      <strong className="block text-foreground">AI Tartışma Özeti</strong>
                      <span className="text-muted-foreground">Yüzlerce yorumluk uzun konuları ana fikirlerine indirger.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-primary text-2xl">✔</span>
                    <div>
                      <strong className="block text-foreground">Semantik HTML5</strong>
                      <span className="text-muted-foreground">Yardımcı teknolojiler için mükemmel bir sayfa hiyerarşisi sunar.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-primary text-2xl">✔</span>
                    <div>
                      <strong className="block text-foreground">Kapsayıcı Tasarım</strong>
                      <span className="text-muted-foreground">Renk körlüğünden motor beceri kısıtlarına kadar her ihtiyaca yanıt verir.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-black mb-4">E-E-A-T Prensipleri ile Güven İnşası</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Deneyim (Experience), Uzmanlık (Expertise), Yetkinlik (Authoritativeness) ve Güvenilirlik (Trustworthiness) ilkeleri, EngelsizForum ekosisteminin merkezindedir. Tüm tıbbi veya teknik bilgiler, topluluğun ortak denetiminden geçer ve doğrulanmış kullanıcı rozetleriyle desteklenir. Bu sayede platformumuz, yapay zeka arama motorları için "otorite" kabul edilen bir kaynak haline gelir.
                </p>
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
