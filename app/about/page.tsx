'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Shield, Heart, Globe, Target } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <DashboardLayout>
        <div className="max-w-5xl mx-auto p-4">
          <section className="mb-20 md:mb-32 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block p-6 bg-[#FFF0F6] rounded-[8px] mb-8"
            >
              <Shield size={48} className="text-[#FF4D94]" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-[#1A1A1A]">EngelsizForum Nedir?</h1>
            <p className="text-base md:text-xl text-[#666666] leading-relaxed px-4 max-w-2xl mx-auto font-medium">
              EngelsizForum, her bireyin dijital dünyada eşit haklara ve erişebilirliğe sahip olması gerektiği inancıyla doğmuş, 
              Türkiye&apos;nin ilk tam erişilebilir topluluk platformudur.
            </p>
          </section>

          {/* Key Takeaways Section */}
          <section className="mb-24">
            <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 md:p-12">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span className="text-primary">💡</span> Vizyon Özeti
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <div className="font-bold text-primary text-xs uppercase tracking-widest">AMACIMIZ</div>
                  <p className="text-sm text-muted-foreground">Dijital dünyadaki erişilebilirlik bariyerlerini tamamen ortadan kaldırmak.</p>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-primary text-xs uppercase tracking-widest">YÖNTEMİMİZ</div>
                  <p className="text-sm text-muted-foreground">Yapay zeka ve WCAG 2.1 standartlarını harmanlayan yenilikçi çözümler.</p>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-primary text-xs uppercase tracking-widest">GÜCÜMÜZ</div>
                  <p className="text-sm text-muted-foreground">Kendi deneyimlerini paylaşan büyük ve uzman bir topluluk desteği.</p>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-primary text-xs uppercase tracking-widest">HEDEFİMİZ</div>
                  <p className="text-sm text-muted-foreground">Herkesin bilgiye ve sosyal etkileşime saniyeler içinde ulaşması.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 mb-24 md:mb-40">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#FFFFFF] p-8 rounded-[8px] border border-[#E5E7EB] group"
            >
              <div className="mb-5 inline-flex p-4 bg-[#FFF0F6] rounded-[8px] text-[#FF4D94] transition-all">
                <Target size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight text-[#1A1A1A]">Misyonumuz</h2>
              <p className="text-sm md:text-lg text-[#666666] leading-relaxed font-medium">
                Engelli bireylerin teknoloji, sosyal yaşam ve günlük zorluklar hakkında birbirleriyle yardımlaşabileceği, 
                AI desteğiyle karmaşık içeriklerin basitleştirildiği ve <span className="text-[#FF4D94] font-bold">WCAG 2.1</span> standartlarının ötesinde bir kullanıcı deneyimi sunmaktır.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#FFFFFF] p-8 rounded-[8px] border border-[#E5E7EB] group"
            >
              <div className="mb-5 inline-flex p-4 bg-red-50 rounded-[8px] text-red-500 transition-all">
                <Heart size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight text-[#1A1A1A]">Değerlerimiz</h2>
              <p className="text-sm md:text-lg text-[#666666] leading-relaxed font-medium">
                Kapsayıcılık, Şeffaflık ve Yenilikçilik ana değerlerimizdir. Platformumuzdaki her bir özellik, <span className="text-[#FF4D94] font-bold">engelli topluluğunun</span> doğrudan geri bildirimleri ile şekillenmektedir.
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

          <section className="bg-[#FF4D94] text-[#FFFFFF] rounded-[8px] p-12 md:p-24 text-center shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-6 text-[#FFFFFF] tracking-tighter">Bize Katılın</h2>
              <p className="text-base md:text-xl font-medium text-[#FFFFFF]/80 mb-10 max-w-xl mx-auto leading-relaxed">
                Daha erişilebilir bir gelecek için sesinizi duyurun, başkalarına yardım edin veya sadece topluluğumuzun bir parçası olun.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/auth" 
                  className="w-full sm:w-auto px-12 py-4 bg-[#FFFFFF] text-[#FF4D94] rounded-[8px] font-bold text-lg hover:bg-white/90 transition-all text-center"
                >
                  Hemen Üye Ol
                </Link>
                <Link 
                  href="/discussions" 
                  className="w-full sm:w-auto px-12 py-4 bg-primary text-primary-foreground rounded-[8px] font-bold text-lg hover:opacity-90 transition-all text-center border border-white/20"
                >
                  Tartışmaları Keşfet
                </Link>
              </div>
            </div>
            <Globe className="absolute -bottom-20 -right-20 size-64 md:size-[400px] opacity-10 transition-all duration-1000" />
            <div className="absolute top-0 left-0 size-[300px] bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-[80px]"></div>
          </section>
        </div>
      </DashboardLayout>
  );
}
