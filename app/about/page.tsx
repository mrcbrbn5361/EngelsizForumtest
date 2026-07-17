'use client';

import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { 
  Shield, Heart, Globe, Target, Sparkles, Eye, 
  Handshake, Zap, Award, Users, ArrowRight,
  MessageSquare, Layout, Scale, Rocket
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AboutPage() {
  return (
    <SiteLayout>
      <div className="flex-1 w-full" role="main">
        
        {/* --- HERO SECTION --- */}
        <section className="relative py-24 md:py-32 overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]"
              >
                <Sparkles size={14} className="animate-pulse" /> ENGELSİZ BİR DİJİTAL DÜNYA İÇİN
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl font-black tracking-tighter text-foreground uppercase leading-[1.1]"
              >
                Bariyersiz Bilgi, <br />
                <span className="text-primary">Eşit Topluluk.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-3xl mx-auto opacity-80"
              >
                EngelsizForum, Türkiye&apos;nin ilk tam erişilebilir dijital ekosistemi olarak, her bireyin bilgiye ve sosyal etkileşime engelsiz ulaşması amacıyla inşa edildi.
              </motion.p>
            </div>
          </div>
        </section>

        {/* --- CORE PILLARS BENTO GRID --- */}
        <section className="py-24 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Pillar 1: Mission */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-7 bg-card border border-border rounded-[2.5rem] p-10 md:p-16 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Target size={32} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">Misyonumuz</h2>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
                    Engelli bireylerin teknoloji, sosyal yaşam ve hak arama süreçlerinde birbirleriyle yardımlaşabileceği, AI destekli ve <span className="text-primary font-bold">WCAG 2.1</span> standartlarının ötesinde bir kullanıcı deneyimi sunmaktır.
                  </p>
                  <div className="pt-6 flex flex-wrap gap-4">
                    <div className="px-4 py-2 bg-muted rounded-2xl text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-border">#KAPSAYICILIK</div>
                    <div className="px-4 py-2 bg-muted rounded-2xl text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-border">#ERİŞİLEBİLİRLİK</div>
                    <div className="px-4 py-2 bg-muted rounded-2xl text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-border">#EŞİTLİK</div>
                  </div>
                </div>
              </motion.div>

              {/* Pillar 2: Stats/Values */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-5 flex flex-col gap-8"
              >
                <div className="bg-primary text-primary-foreground rounded-[2.5rem] p-10 flex-1 shadow-lg shadow-primary/20 relative overflow-hidden">
                   <div className="relative z-10 space-y-4">
                    <Heart size={40} className="mb-4" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">Değerlerimiz</h3>
                    <p className="text-sm font-bold opacity-80 leading-relaxed uppercase tracking-wide">
                      Kapsayıcılık, Şeffaflık ve Yenilikçilik ana değerlerimizdir. Platformumuzdaki her özellik, topluluğumuzun doğrudan geri bildirimleri ile şekillenmektedir.
                    </p>
                   </div>
                   <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                </div>
                <div className="bg-card border border-border rounded-[2.5rem] p-10 flex-1 flex flex-col justify-center">
                  <div className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">GÜCÜMÜZÜ TOPLULUKTAN ALIYORUZ</div>
                  <div className="text-5xl font-black text-foreground font-mono tracking-tighter">1.2k+</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">AKTİF TARTIŞMA KONUSU</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- PROJECT ORIGIN & TECH STACK --- */}
        <section className="py-24 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-foreground uppercase tracking-tight">Proje Vizyonu</h2>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                  EngelsizForum, dijital dünyadaki bariyerleri yıkmak amacıyla <span className="text-foreground font-bold underline decoration-primary decoration-4 underline-offset-4">Miraç Birben</span> tarafından hayal edildi ve hayata geçirildi.
                </p>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">GELİŞTİRME ARAÇLARI</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Google AI Studio', desc: 'Yapay Zeka Mimarisi' },
                    { name: 'Vercel', desc: 'Bulut Dağıtım & Hosting' },
                    { name: 'GitHub', desc: 'Kaynak Kod Yönetimi' },
                    { name: 'Supabase', desc: 'Veritabanı & Auth' }
                  ].map((tech) => (
                    <div key={tech.name} className="p-5 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/30 transition-all">
                      <div className="font-black text-foreground text-sm uppercase tracking-tight mb-1">{tech.name}</div>
                      <div className="text-[10px] font-bold text-primary uppercase tracking-widest">{tech.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-primary/5 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-1000" />
                <div className="relative bg-card border border-border rounded-[2.5rem] p-10 md:p-16 flex flex-col items-center text-center space-y-8">
                  <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Handshake size={48} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Topluluk Odaklı Geliştirme</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      Her satır kod, engelli bireylerin dijital dünyada daha özgür olması için titizlikle yazıldı. Bu proje, teknolojinin insan hayatını nasıl kolaylaştırabileceğinin canlı bir örneğidir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- MEET THE DIGITAL GUIDES --- */}
        <section className="py-24 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-black text-foreground uppercase tracking-tight">Dijital Rehberlerimiz</h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              EngelsizForum sadece bir yazılım değil, Aria, Felix ve Bora gibi dijital rehberlerimizle yaşayan, dinamik bir yardımcıdır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: 'Aria', 
                role: 'UI/UX & Erişilebilirlik Uzmanı', 
                desc: 'Arayüzün her zaman en yüksek erişilebilirlik standartlarında kalmasını sağlar.', 
                icon: <Layout className="w-6 h-6" />,
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=aria'
              },
              { 
                name: 'Felix', 
                role: 'Frontend & Entegrasyon', 
                desc: 'Topluluk özelliklerinin ve forum akışının kesintisiz çalışmasını yönetir.', 
                icon: <Zap className="w-6 h-6" />,
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=felix'
              },
              { 
                name: 'Bora', 
                role: 'Backend & Güvenlik', 
                desc: 'Verilerinizin güvenliğini ve sistemin stabil kalmasını sağlayan dijital kalkanımız.', 
                icon: <Shield className="w-6 h-6" />,
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bora'
              }
            ].map((guide, idx) => (
              <motion.div 
                key={guide.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border rounded-[2rem] p-10 text-center hover:border-primary/30 transition-all group"
              >
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-primary/10 overflow-hidden bg-muted mb-6 group-hover:scale-105 transition-transform">
                  <img src={guide.avatar} alt={guide.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-1">{guide.name}</h3>
                <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-6 px-3 py-1 bg-primary/10 rounded-full inline-block">
                  {guide.role}
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed opacity-80">
                  {guide.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- VISION & TECHNOLOGY --- */}
        <section className="py-24 border-y border-border/50 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2 space-y-10">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-foreground uppercase tracking-tight">Teknolojik Vizyonumuz</h2>
                  <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                    Yapay zeka (AI) destekli özelliklerimizle, internetteki bariyerleri sadece kaldırmıyor, onları tamamen yok ediyoruz.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    { title: 'Bilişsel Erişilebilirlik', text: 'Karmaşık yasal ve tıbbi terimleri AI ile herkesin anlayabileceği sadeliğe dönüştürüyoruz.', icon: <Scale className="w-5 h-5 text-primary" /> },
                    { title: 'Sesli & Görsel Adaptasyon', text: 'Tüm tartışmalar ve içerikler ekran okuyucular ve yardımcı teknolojilerle tam uyumlu şekilde kodlanmıştır.', icon: <Eye className="w-5 h-5 text-primary" /> },
                    { title: 'Bariyersiz Navigasyon', text: 'Klavye kısayolları ve sesli komut destekleri ile fiziksel engelleri arayüzde aşıyoruz.', icon: <Rocket className="w-5 h-5 text-primary" /> }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center shrink-0 shadow-sm">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-foreground uppercase text-sm tracking-tight">{item.title}</h4>
                        <p className="text-sm text-muted-foreground font-medium opacity-80 leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-1/2 relative">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-transparent rounded-[3rem] border border-primary/20 overflow-hidden p-8 md:p-16 flex items-center justify-center">
                   <div className="w-full h-full border-2 border-dashed border-primary/20 rounded-[2rem] flex flex-col items-center justify-center gap-6 relative">
                      <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                      <Sparkles className="w-20 h-20 text-primary animate-pulse" />
                      <div className="text-center space-y-2 relative z-10">
                        <div className="text-2xl font-black text-foreground uppercase tracking-tight">AI LABORATUVARI</div>
                        <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Erişilebilirlik Ar-Ge Merkezi</p>
                      </div>
                   </div>
                </div>
                {/* Float elements */}
                <div className="absolute -top-6 -right-6 bg-card border border-border p-5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce duration-3000">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Sistem Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CALL TO ACTION --- */}
        <section className="py-24 container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-foreground text-background rounded-[3rem] p-12 md:p-24 text-center space-y-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/10 opacity-50 blur-3xl rounded-full translate-y-1/2" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
                Bu Yolculuğa <br /> <span className="text-primary">Birlikte Çıkalım.</span>
              </h2>
              <p className="text-lg md:text-xl text-background/70 font-medium leading-relaxed max-w-2xl mx-auto">
                Daha erişilebilir bir gelecek için sesinizi duyurun, tecrübelerinizi paylaşın ve topluluğumuzun bir parçası olun.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Link 
                href="/auth" 
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-primary px-10 py-5 text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 transition hover:bg-primary/90 hover:scale-105 active:scale-95 uppercase tracking-widest"
              >
                HEMEN KATIL
              </Link>
              <Link 
                href="/discussions" 
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-white/10 px-10 py-5 text-sm font-black text-white border border-white/20 transition hover:bg-white/20 hover:scale-105 active:scale-95 uppercase tracking-widest"
              >
                TARTIŞMALARI KEŞFET
              </Link>
            </div>
          </motion.div>
        </section>

      </div>
    </SiteLayout>
  );
}
