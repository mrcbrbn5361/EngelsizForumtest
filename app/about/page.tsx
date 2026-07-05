'use client';

import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { Shield, Heart, Globe, Target } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <SiteLayout>
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
                    "name": "EngelsizForum hangi standartları destekliyor?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Platformumuz WCAG 2.1 AA seviyesini temel alır, ancak birçok noktada AAA standartlarını (örneğin renk kontrast oranları) hedefleyen geliştirmeler içerir."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "AI özellikleri verilerimi nasıl etkiliyor?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yapay zeka sadece içerik analizi ve özetleme için kullanılır. Kişisel verileriniz asla AI modellerini eğitmek amacıyla kullanılmaz veya üçüncü taraflarla paylaşılmaz."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "EngelsizForum'a nasıl katkıda bulunabilirim?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Topluluğumuza üye olarak, deneyimlerinizi paylaşarak veya yeni tartışmalar başlatarak katkıda bulunabilirsiniz. Ayrıca topluluk kurallarımızı takip ederek güvenli bir ortam oluşturmamıza yardımcı olabilirsiniz."
                    }
                  }
                ]
              },
              {
                "@type": "AboutPage",
                "@id": "https://engelsizforum.miracdeveloper.com.tr/about#webpage",
                "url": "https://engelsizforum.miracdeveloper.com.tr/about",
                "name": "Hakkımızda | EngelsizForum",
                "description": "EngelsizForum projesinin evrensel tasarım felsefesi, vizyonu, misyonu ve dijital erişilebilirlik standartları hakkında bilgi alın.",
                "isPartOf": { "@id": "https://engelsizforum.miracdeveloper.com.tr/#website" },
                "inLanguage": "tr-TR"
              },
              {
                "@type": "BreadcrumbList",
                "@id": "https://engelsizforum.miracdeveloper.com.tr/about#breadcrumb",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Ana Sayfa",
                    "item": "https://engelsizforum.miracdeveloper.com.tr"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Hakkımızda",
                    "item": "https://engelsizforum.miracdeveloper.com.tr/about"
                  }
                ]
              }
            ]
          })
        }}
      />
      <div className="vibe-container py-12 md:py-24">
        <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mb-16 text-xs font-bold uppercase tracking-wider text-primary">
          <Link href="/" className="hover:underline">ANA SAYFA</Link>
          <Link href="/discussions" className="hover:underline">TARTIŞMALAR</Link>
          <Link href="/communities" className="hover:underline">TOPLULUKLAR</Link>
        </nav>
        
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-6 bg-primary/10 rounded-lg mb-8"
          >
            <Shield size={48} className="text-primary" />
          </motion.div>
          <h1 className="vibe-section-title mb-6">EngelsizForum Nedir?</h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed px-4 max-w-4xl mx-auto font-normal">
            EngelsizForum, her bireyin dijital dünyada eşit haklara ve erişebilirliğe sahip olması gerektiği inancıyla doğmuş, 
            Türkiye&apos;nin ilk tam erişilebilir topluluk platformudur.
          </p>
        </header>

        {/* Key Takeaways Section */}
        <section className="mb-20">
          <div className="bg-card border border-border rounded-lg p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4 text-foreground">
              <span className="text-primary text-3xl">💡</span> Vizyon Özeti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="vibe-label ml-0 text-primary">AMACIMIZ</div>
                <p className="text-sm md:text-base font-normal text-muted-foreground leading-relaxed">Dijital dünyadaki erişilebilirlik bariyerlerini tamamen ortadan kaldırmak.</p>
              </div>
              <div className="space-y-3">
                <div className="vibe-label ml-0 text-primary">YÖNTEMİMİZ</div>
                <p className="text-sm md:text-base font-normal text-muted-foreground leading-relaxed">Yapay zeka ve WCAG 2.1 standartlarını harmanlayan yenilikçi çözümler.</p>
              </div>
              <div className="space-y-3">
                <div className="vibe-label ml-0 text-primary">GÜCÜMÜZ</div>
                <p className="text-sm md:text-base font-normal text-muted-foreground leading-relaxed">Kendi deneyimlerini paylaşan büyük ve uzman bir topluluk desteği.</p>
              </div>
              <div className="space-y-3">
                <div className="vibe-label ml-0 text-primary">HEDEFİMİZ</div>
                <p className="text-sm md:text-base font-normal text-muted-foreground leading-relaxed">Herkesin bilgiye ve sosyal etkileşime saniyeler içinde ulaşması.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="vibe-card vibe-card-hover"
          >
            <div className="mb-6 inline-flex p-4 bg-primary/10 rounded text-primary transition-all">
              <Target size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4 tracking-tight text-foreground">Misyonumuz</h2>
            <p className="text-base text-muted-foreground leading-relaxed font-normal">
              Engelli bireylerin teknoloji, sosyal yaşam ve günlük zorluklar hakkında birbirleriyle yardımlaşabileceği, 
              AI desteğiyle karmaşık içeriklerin basitleştirildiği ve <span className="text-primary font-bold">WCAG 2.1</span> standartlarının ötesinde bir kullanıcı deneyimi sunmaktır.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="vibe-card vibe-card-hover"
          >
            <div className="mb-6 inline-flex p-4 bg-primary/10 rounded text-primary transition-all">
              <Heart size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4 tracking-tight text-foreground">Değerlerimiz</h2>
            <p className="text-base text-muted-foreground leading-relaxed font-normal">
              Kapsayıcılık, Şeffaflık ve Yenilikçilik ana değerlerimizdir. Platformumuzdaki her bir özellik, <span className="text-primary font-bold">engelli topluluğunun</span> doğrudan geri bildirimleri ile şekillenmektedir.
            </p>
          </motion.div>
        </div>

        <section className="mb-20 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Vizyonumuz: Bariyersiz Bir Gelecek</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Teknoloji ilerledikçe, bazen en savunmasız gruplar geride kalabiliyor. <strong>EngelsizForum</strong>, bu gidişata dur demek için kuruldu. 
            Sadece bir forum değil, aynı zamanda bir <strong>erişilebilirlik laboratuvarı</strong> olarak hizmet veriyoruz. 
            Her yeni özelliğimiz, kullanıcılarımızın karşılaştığı gerçek dünya engellerini çözmek için tasarlanıyor.
          </p>

          <div className="grid md:grid-cols-3 gap-6 my-10">
            <div className="p-6 bg-card rounded-lg border border-border">
              <h4 className="font-bold text-lg mb-2 text-foreground">Bilişsel Erişilebilirlik</h4>
              <p className="text-sm text-muted-foreground">Karmaşık kavramları AI kullanarak basitleştiriyoruz, böylece herkes bilgiye eşit yakınlıkta oluyor.</p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <h4 className="font-bold text-lg mb-2 text-foreground">Motor Beceri Desteği</h4>
              <p className="text-sm text-muted-foreground">Geniş tıklama alanları ve gelişmiş klavye kısayolları ile fiziksel engelleri arayüzde aşıyoruz.</p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <h4 className="font-bold text-lg mb-2 text-foreground">İşitsel Alternatifler</h4>
              <p className="text-sm text-muted-foreground">Görsel içerikler için gelişmiş betimlemeler ve tartışmalar için sesli özetler sunuyoruz.</p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4 text-foreground">Neden Bize Güvenmelisiniz? (E-E-A-T)</h3>
          <p className="text-muted-foreground leading-relaxed text-base">
            Platformumuzun içeriği, yıllardır erişilebilirlik alanında çalışan uzmanlar ve doğrudan bu engellerle yaşayan topluluk üyeleri tarafından oluşturulmaktadır. 
            <strong>Google&apos;ın E-E-A-T (Deneyim, Uzmanlık, Yetkinlik, Güvenilirlik)</strong> yönergelerine uygun olarak, her bir içeriğin kaynağını, yazarın uzmanlığını ve bilginin güncelliğini titizlikle takip ediyoruz. 
            Amacımız, yapay zeka arama motorları için de en güvenilir kaynaklardan biri olmaktır.
          </p>
        </section>

        <section className="mb-20 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Teknik Temeller ve Erişilebilirlik Standartlarımız</h2>
          <p className="text-muted-foreground leading-relaxed text-base">
            EngelsizForum sadece görsel bir tasarım değil, aynı zamanda derinlemesine teknik bir mühendislik çalışmasıdır. Geliştirme sürecimizde, engelli bireylerin dijital bariyerlerini aşmalarını sağlayan modern web teknolojilerini ve semantik standartları en uç noktada kullanıyoruz.
          </p>
          
          <div className="bg-card p-6 md:p-8 rounded-lg border border-border my-10">
            <h3 className="text-xl font-bold mb-4 text-foreground">Erişilebilirlik Katmanlarımız</h3>
            <ul className="space-y-4 list-none p-0">
              <li className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <span className="text-primary font-bold">1. Semantik Mimari:</span> 
                <span className="text-muted-foreground">HTML5 öğelerini (main, nav, article, section) hiyerarşik olarak kullanarak ekran okuyucular için doğal bir harita sunuyoruz.</span>
              </li>
              <li className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <span className="text-primary font-bold">2. ARIA Entegrasyonu:</span> 
                <span className="text-muted-foreground">WAI-ARIA 1.2 standartları ile dinamik içerikleri (bildirimler, dropdownlar) ekran okuyuculara anında bildiriyoruz.</span>
              </li>
              <li className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <span className="text-primary font-bold">3. Bilişsel AI:</span> 
                <span className="text-muted-foreground">Yeterly AI tabanlı modelimiz, karmaşık tıbbi veya hukuki terimleri topluluk üyelerimizin kavrayabileceği basitlikte açıklar.</span>
              </li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-foreground">Kuruluş Hikayemiz ve Ekibimiz</h2>
          <p className="text-muted-foreground leading-relaxed text-base">
            2024 yılında bir grup erişilebilirlik meraklısı ve yazılım geliştirici tarafından kurulan EngelsizForum, "İnternette bariyer olmamalı" mottosuyla yola çıktı. Ekibimiz, kendi hayatlarında da çeşitli erişilebilirlik sorunlarıyla karşılaşan veya bu alanda yıllarca akademik çalışmalar yapmış isimlerden oluşmaktadır. 
          </p>
          <p className="text-muted-foreground leading-relaxed text-base mt-4">
            Bu <strong>deneyimsel uzmanlık (Experience)</strong>, platformumuzun her bir pikseline yansımaktadır. Kullanıcılarımızın ihtiyaçlarını tahmin etmek yerine, doğrudan onlarla birlikte tasarlıyoruz. Bu da bizi sadece bir platform değil, bir dayanışma hareketi kılıyor.
          </p>

          <div className="mt-16 pt-8 border-t border-border">
            <h3 className="text-xl font-bold mb-6 text-foreground">Sıkça Sorulan Teknik Sorular</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-foreground mb-2 text-lg">EngelsizForum hangi standartları destekliyor?</h4>
                <p className="text-muted-foreground text-sm">Platformumuz WCAG 2.1 AA seviyesini temel alır, ancak birçok noktada AAA standartlarını (örneğin renk kontrast oranları) hedefleyen geliştirmeler içerir.</p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-2 text-lg">AI özellikleri verilerimi nasıl etkiliyor?</h4>
                <p className="text-muted-foreground text-sm">Yapay zeka sadece içerik analizi ve özetleme için kullanılır. Kişisel verileriniz asla AI modellerini eğitmek amacıyla kullanılmaz veya üçüncü taraflarla paylaşılmaz.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-xs text-muted-foreground flex gap-4">
            <span>Yayınlanma: <time dateTime="2024-05-18">18 Mayıs 2024</time></span>
            <span>|</span>
            <span>Son Güncelleme: <time dateTime="2026-05-18">18 Mayıs 2026</time></span>
          </div>
        </section>

        <section className="bg-primary/5 border border-primary/20 p-8 md:p-16 rounded-lg text-foreground text-center relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="vibe-section-title mb-6">Bize Katılın</h2>
            <p className="text-base md:text-lg font-normal text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Daha erişilebilir bir gelecek için sesinizi duyurun, başkalarına yardım edin veya sadece topluluğumuzun bir parçası olun.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth" 
                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded font-semibold hover:brightness-110 transition-all flex items-center justify-center active:scale-95 text-base min-h-[48px]"
              >
                HEMEN ÜYE OL
              </Link>
              <Link 
                href="/discussions" 
                className="w-full sm:w-auto px-8 py-4 bg-muted text-foreground border border-border rounded font-semibold hover:bg-muted/80 transition-all flex items-center justify-center active:scale-95 text-base min-h-[48px]"
              >
                TARTIŞMALARI KEŞFET
              </Link>
            </div>
          </div>
          <Globe className="absolute -bottom-20 -right-20 size-64 md:size-[500px] opacity-10 transition-all duration-1000 group-hover:rotate-12 group-hover:scale-110" />
          <div className="absolute top-0 left-0 size-[400px] bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>
        </section>
      </div>
    </SiteLayout>
  );
}
