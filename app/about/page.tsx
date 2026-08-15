'use client';

import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { 
  Shield, Heart, Globe, Target, Sparkles, Eye, 
  Handshake, Zap, Award, Users, ArrowRight,
  MessageSquare, Layout, Scale, Rocket, ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function AboutPage() {
  return (
    <SiteLayout>
      <div className="flex-1 w-full" role="main">
        
        {/* --- HERO SECTION --- */}
        <section className="relative py-16 md:py-24 overflow-hidden border-b border-border/60 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8">
              <Link href="/" className="hover:text-sky-400 transition-colors">Ana Sayfa</Link>
              <ChevronRight size={14} />
              <span className="text-foreground font-bold">Hakkımızda & EngelsizForum</span>
            </div>
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider"
              >
                <Sparkles size={13} /> Engelsiz Bir Dijital Dünya İçin
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]"
              >
                Bariyersiz Bilgi, <br />
                <span className="text-sky-400">Eşit Topluluk.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-2xl mx-auto"
              >
                EngelsizForum, Türkiye&apos;nin ilk tam erişilebilir dijital ekosistemi olarak, her bireyin bilgiye, mevzuat desteğine ve sosyal dayanışmaya engelsiz ulaşması amacıyla geliştirildi.
              </motion.p>
            </div>
          </div>
        </section>

        {/* --- CORE PILLARS BENTO GRID --- */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Pillar 1: Mission */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-7 bg-card border border-border/80 rounded-2xl p-8 md:p-10 shadow-sm relative overflow-hidden"
              >
                <div className="relative z-10 space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Target size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Misyonumuz</h2>
                  <p className="text-base text-muted-foreground leading-relaxed font-normal">
                    Engelli bireylerin teknoloji, sosyal yaşam ve hak arama süreçlerinde birbirleriyle yardımlaşabileceği, AI destekli ve <span className="text-sky-400 font-bold">WCAG 2.2 AAA</span> standartlarının ötesinde bir kullanıcı deneyimi sunmaktır.
                  </p>
                  <div className="pt-4 flex flex-wrap gap-2">
                    <div className="px-3 py-1 bg-muted/60 rounded-lg text-xs font-bold text-muted-foreground border border-border">#Kapsayıcılık</div>
                    <div className="px-3 py-1 bg-muted/60 rounded-lg text-xs font-bold text-muted-foreground border border-border">#Erişilebilirlik</div>
                    <div className="px-3 py-1 bg-muted/60 rounded-lg text-xs font-bold text-muted-foreground border border-border">#Eşitlik</div>
                  </div>
                </div>
              </motion.div>

              {/* Pillar 2: Stats/Values */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-5 flex flex-col gap-6"
              >
                <div className="bg-sky-500 text-white rounded-2xl p-8 flex-1 shadow-sm relative overflow-hidden">
                   <div className="relative z-10 space-y-3">
                    <Heart size={28} className="mb-2 text-white/90" />
                    <h3 className="text-xl font-bold tracking-tight">Değerlerimiz</h3>
                    <p className="text-xs sm:text-sm font-normal text-white/90 leading-relaxed">
                      Kapsayıcılık, Şeffaflık ve Yenilikçilik ana ilkelerimizdir. Platformumuzdaki her özellik, topluluğumuzun doğrudan geri bildirimleri ile şekillenmektedir.
                    </p>
                   </div>
                </div>
                <div className="bg-card border border-border/80 rounded-2xl p-8 flex-1 flex flex-col justify-center">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Gücümüzü Topluluktan Alıyoruz</div>
                  <div className="text-4xl font-extrabold text-foreground font-mono tracking-tight">1.200+</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Aktif Tartışma Konusu</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- PROJECT ORIGIN & TECH STACK --- */}
        <section className="py-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Proje Vizyonu</h2>
                <p className="text-base text-muted-foreground font-normal leading-relaxed">
                  EngelsizForum, dijital dünyadaki bariyerleri yıkmak amacıyla <span className="text-foreground font-bold">Miraç Birben</span> tarafından hayata geçirildi.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Teknoloji Altyapısı</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'Google AI Studio', desc: 'Yapay Zeka Mimarisi' },
                    { name: 'Vercel', desc: 'Bulut Dağıtım & Hosting' },
                    { name: 'GitHub', desc: 'Kaynak Kod Yönetimi' },
                    { name: 'Supabase', desc: 'Veritabanı & Auth' }
                  ].map((tech) => (
                    <div key={tech.name} className="p-4 bg-card border border-border/80 rounded-xl shadow-sm hover:border-sky-500/30 transition-all">
                      <div className="font-bold text-foreground text-sm tracking-tight mb-0.5">{tech.name}</div>
                      <div className="text-xs text-sky-400 font-medium">{tech.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-card border border-border/80 rounded-2xl p-8 md:p-12 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Handshake size={32} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground tracking-tight">Topluluk Odaklı Geliştirme</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed max-w-md">
                    Her satır kod, engelli bireylerin dijital dünyada daha özgür olması için titizlikle yazıldı. Bu platform, teknolojinin insan hayatını nasıl kolaylaştırabileceğinin canlı bir örneğidir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CALL TO ACTION --- */}
        <section className="py-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-card border border-border/80 rounded-2xl p-8 md:p-14 text-center space-y-6 shadow-sm relative overflow-hidden"
          >
            <div className="relative z-10 space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Bu Dayanışmaya <span className="text-sky-400">Birlikte Katılalım.</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed max-w-xl mx-auto">
                Daha erişilebilir bir gelecek için deneyimlerinizi paylaşın, sorularınızı sorun ve topluluğumuzun bir parçası olun.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link 
                href="/login" 
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-sky-400 uppercase tracking-wider"
              >
                Hemen Katıl
              </Link>
              <Link 
                href="/discussions" 
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-muted/60 border border-border/80 px-6 py-3 text-xs font-bold text-foreground transition hover:bg-muted uppercase tracking-wider"
              >
                Tartışmaları Keşfet
              </Link>
            </div>
          </motion.div>
        </section>

      </div>
    </SiteLayout>
  );
}
