'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Shield, Heart, Globe, Target } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function AboutPage() {
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
          })
        }}
      />
        <div className="vibe-container py-12 md:py-24">
          <nav className="flex justify-center gap-8 mb-16 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <Link href="/" className="hover:underline">ANA SAYFA</Link>
            <Link href="/discussions" className="hover:underline">TARTIŞMALAR</Link>
            <Link href="/communities" className="hover:underline">TOPLULUKLAR</Link>
          </nav>
          <header className="mb-24 md:mb-40 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block p-8 bg-primary/10 rounded-[2rem] mb-10 shadow-2xl shadow-primary/5"
            >
              <Shield size={64} className="text-primary" />
            </motion.div>
            <h1 className="vibe-section-title mb-8 uppercase">EngelsizForum Nedir?</h1>
            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed px-4 max-w-4xl mx-auto font-medium">
              EngelsizForum, her bireyin dijital dünyada eşit haklara ve erişebilirliğe sahip olması gerektiği inancıyla doğmuş, 
              Türkiye&apos;nin ilk tam erişilebilir topluluk platformudur.
            </p>
          </header>

          {/* Key Takeaways Section */}
          <section className="mb-32">
            <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-10 md:p-16">
              <h2 className="text-2xl md:text-3xl font-black mb-10 flex items-center gap-4">
                <span className="text-primary text-4xl">💡</span> Vizyon Özeti
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <div className="space-y-3">
                  <div className="vibe-label ml-0 text-primary">AMACIMIZ</div>
                  <p className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed">Dijital dünyadaki erişilebilirlik bariyerlerini tamamen ortadan kaldırmak.</p>
                </div>
                <div className="space-y-3">
                  <div className="vibe-label ml-0 text-primary">YÖNTEMİMİZ</div>
                  <p className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed">Yapay zeka ve WCAG 2.1 standartlarını harmanlayan yenilikçi çözümler.</p>
                </div>
                <div className="space-y-3">
                  <div className="vibe-label ml-0 text-primary">GÜCÜMÜZ</div>
                  <p className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed">Kendi deneyimlerini paylaşan büyük ve uzman bir topluluk desteği.</p>
                </div>
                <div className="space-y-3">
                  <div className="vibe-label ml-0 text-primary">HEDEFİMİZ</div>
                  <p className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed">Herkesin bilgiye ve sosyal etkileşime saniyeler içinde ulaşması.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-32 md:mb-48">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="vibe-card vibe-card-hover p-10 md:p-16"
            >
              <div className="mb-8 inline-flex p-6 bg-primary/10 rounded-3xl text-primary transition-all">
                <Target size={40} />
              </div>
              <h2 className="text-2xl md:text-4xl font-black mb-6 tracking-tight text-foreground">Misyonumuz</h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
                Engelli bireylerin teknoloji, sosyal yaşam ve günlük zorluklar hakkında birbirleriyle yardımlaşabileceği, 
                AI desteğiyle karmaşık içeriklerin basitleştirildiği ve <span className="text-primary font-black">WCAG 2.1</span> standartlarının ötesinde bir kullanıcı deneyimi sunmaktır.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="vibe-card vibe-card-hover p-10 md:p-16"
            >
              <div className="mb-8 inline-flex p-6 bg-destructive/10 rounded-3xl text-destructive transition-all">
                <Heart size={40} />
              </div>
              <h2 className="text-2xl md:text-4xl font-black mb-6 tracking-tight text-foreground">Değerlerimiz</h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
                Kapsayıcılık, Şeffaflık ve Yenilikçilik ana değerlerimizdir. Platformumuzdaki her bir özellik, <span className="text-primary font-black">engelli topluluğunun</span> doğrudan geri bildirimleri ile şekillenmektedir.
              </p>
            </motion.div>
          </div>

          <section className="mb-24 prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-black mb-8">Vizyonumuz: Bariyersiz Bir Gelecek</h2>
            <p className="text-[#666666] leading-relaxed">
              Teknoloji ilerledikçe, bazen en savunmasız gruplar geride kalabiliyor. <strong>EngelsizForum</strong>, bu gidişata dur demek için kuruldu. 
              Sadece bir forum değil, aynı zamanda bir <strong>erişilebilirlik laboratuvarı</strong> olarak hizmet veriyoruz. 
              Her yeni özelliğimiz, kullanıcılarımızın karşılaştığı gerçek dünya engellerini çözmek için tasarlanıyor.
            </p>

            <div className="grid md:grid-cols-3 gap-8 my-16">
              <div className="p-6 bg-muted rounded-2xl border border-border">
                <h4 className="font-bold text-lg mb-2">Bilişsel Erişilebilirlik</h4>
                <p className="text-sm text-muted-foreground">Karmaşık kavramları AI kullanarak basitleştiriyoruz, böylece herkes bilgiye eşit yakınlıkta oluyor.</p>
              </div>
              <div className="p-6 bg-muted rounded-2xl border border-border">
                <h4 className="font-bold text-lg mb-2">Motor Beceri Desteği</h4>
                <p className="text-sm text-muted-foreground">Geniş tıklama alanları ve gelişmiş klavye kısayolları ile fiziksel engelleri arayüzde aşıyoruz.</p>
              </div>
              <div className="p-6 bg-muted rounded-2xl border border-border">
                <h4 className="font-bold text-lg mb-2">İşitsel Alternatifler</h4>
                <p className="text-sm text-muted-foreground">Görsel içerikler için gelişmiş betimlemeler ve tartışmalar için sesli özetler sunuyoruz.</p>
              </div>
            </div>

            <h3 className="text-2xl font-black mb-6">Neden Bize Güvenmelisiniz? (E-E-A-T)</h3>
            <p className="text-[#666666] leading-relaxed">
              Platformumuzun içeriği, yıllardır erişilebilirlik alanında çalışan uzmanlar ve doğrudan bu engellerle yaşayan topluluk üyeleri tarafından oluşturulmaktadır. 
              <strong>Google&apos;ın E-E-A-T (Deneyim, Uzmanlık, Yetkinlik, Güvenilirlik)</strong> yönergelerine uygun olarak, her bir içeriğin kaynağını, yazarın uzmanlığını ve bilginin güncelliğini titizlikle takip ediyoruz. 
              Amacımız, yapay zeka arama motorları için de en güvenilir kaynaklardan biri olmaktır.
            </p>
          </section>

          <section className="mb-24 prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-black mb-8 tracking-tight">Teknik Temeller ve Erişilebilirlik Standartlarımız</h2>
            <p className="text-[#666666] leading-relaxed">
              EngelsizForum sadece görsel bir tasarım değil, aynı zamanda derinlemesine teknik bir mühendislik çalışmasıdır. Geliştirme sürecimizde, engelli bireylerin dijital bariyerlerini aşmalarını sağlayan modern web teknolojilerini ve semantik standartları en uç noktada kullanıyoruz.
            </p>
            
            <div className="bg-muted p-8 rounded-2xl border border-border my-12">
              <h3 className="text-2xl font-black mb-4">Erişilebilirlik Katmanlarımız</h3>
              <ul className="space-y-4 list-none p-0">
                <li className="flex gap-4">
                  <span className="text-primary font-bold">1. Semantik Mimari:</span> 
                  <span>HTML5 öğelerini (main, nav, article, section) hiyerarşik olarak kullanarak ekran okuyucular için doğal bir harita sunuyoruz.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary font-bold">2. ARIA Entegrasyonu:</span> 
                  <span>WAI-ARIA 1.2 standartları ile dinamik içerikleri (bildirimler, dropdownlar) ekran okuyuculara anında bildiriyoruz.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary font-bold">3. Bilişsel AI:</span> 
                  <span>Gemini 1.5 Pro tabanlı AI modelimiz, karmaşık tıbbi veya hukuki terimleri topluluk üyelerimizin kavrayabileceği basitlikte açıklar.</span>
                </li>
              </ul>
            </div>

            <h2 className="text-3xl font-black mb-8 tracking-tight">Kuruluş Hikayemiz ve Ekibimiz</h2>
            <p className="text-[#666666] leading-relaxed">
              2024 yılında bir grup erişilebilirlik meraklısı ve yazılım geliştirici tarafından kurulan EngelsizForum, "İnternette bariyer olmamalı" mottosuyla yola çıktı. Ekibimiz, kendi hayatlarında da çeşitli erişilebilirlik sorunlarıyla karşılaşan veya bu alanda yıllarca akademik çalışmalar yapmış isimlerden oluşmaktadır. 
            </p>
            <p className="text-[#666666] leading-relaxed mt-4">
              Bu <strong>deneyimsel uzmanlık (Experience)</strong>, platformumuzun her bir pikseline yansımaktadır. Kullanıcılarımızın ihtiyaçlarını tahmin etmek yerine, doğrudan onlarla birlikte tasarlıyoruz. Bu da bizi sadece bir platform değil, bir dayanışma hareketi kılıyor.
            </p>

            <div className="mt-16 pt-10 border-t border-border">
              <h3 className="text-2xl font-black mb-8">Sıkça Sorulan Teknik Sorular</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-black text-[#1A1A1A] mb-2 text-xl">EngelsizForum hangi standartları destekliyor?</h4>
                  <p className="text-[#666666]">Platformumuz WCAG 2.1 AA seviyesini temel alır, ancak birçok noktada AAA standartlarını (örneğin renk kontrast oranları) hedefleyen geliştirmeler içerir.</p>
                </div>
                <div>
                  <h4 className="font-black text-[#1A1A1A] mb-2 text-xl">AI özellikleri verilerimi nasıl etkiliyor?</h4>
                  <p className="text-[#666666]">Yapay zeka sadece içerik analizi ve özetleme için kullanılır. Kişisel verileriniz asla AI modellerini eğitmek amacıyla kullanılmaz veya üçüncü taraflarla paylaşılmaz.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-xs text-muted-foreground">
              <span>Yayınlanma: <time dateTime="2024-05-18">18 Mayıs 2024</time></span>
              <span className="mx-2">|</span>
              <span>Son Güncelleme: <time dateTime="2026-05-18">18 Mayıs 2026</time></span>
            </div>
          </section>

          <section className="bg-primary p-12 md:p-24 rounded-[3rem] text-primary-foreground text-center shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="vibe-section-title text-white mb-8 tracking-tighter">Bize Katılın</h2>
              <p className="text-lg md:text-2xl font-medium text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                Daha erişilebilir bir gelecek için sesinizi duyurun, başkalarına yardım edin veya sadece topluluğumuzun bir parçası olun.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link 
                  href="/auth" 
                  className="w-full sm:w-auto h-20 px-16 bg-white text-primary rounded-[2rem] font-black text-xl hover:bg-white/90 transition-all flex items-center justify-center shadow-2xl active:scale-95"
                >
                  HEMEN ÜYE OL
                </Link>
                <Link 
                  href="/discussions" 
                  className="w-full sm:w-auto h-20 px-16 bg-primary-foreground/10 border-2 border-white/20 text-white rounded-[2rem] font-black text-xl hover:bg-white/10 transition-all flex items-center justify-center active:scale-95"
                >
                  KEŞFET
                </Link>
              </div>
            </div>
            <Globe className="absolute -bottom-20 -right-20 size-64 md:size-[500px] opacity-10 transition-all duration-1000 group-hover:rotate-12 group-hover:scale-110" />
            <div className="absolute top-0 left-0 size-[400px] bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>
          </section>
        </div>
      </DashboardLayout>
  );
}
