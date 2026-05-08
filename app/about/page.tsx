'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { Shield, Heart, Globe, Target } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <section className="mb-20 md:mb-32 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-6 bg-primary/10 rounded-3xl mb-8"
          >
            <Shield size={48} className="text-primary" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">EngelsizForum Nedir?</h1>
          <p className="text-base md:text-xl text-muted-foreground leading-relaxed px-4 max-w-2xl mx-auto font-medium">
            EngelsizForum, her bireyin dijital dünyada eşit haklara ve erişebilirliğe sahip olması gerektiği inancıyla doğmuş, 
            Türkiye&apos;nin ilk tam erişilebilir topluluk platformudur.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 mb-24 md:mb-40">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card p-8 rounded-3xl border border-border group"
          >
            <div className="mb-5 inline-flex p-4 bg-primary/5 rounded-2xl group-hover:bg-primary/10 text-primary transition-all group-hover:rotate-6">
              <Target size={28} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Misyonumuz</h2>
            <p className="text-sm md:text-lg text-muted-foreground leading-relaxed font-medium">
              Engelli bireylerin teknoloji, sosyal yaşam ve günlük zorluklar hakkında birbirleriyle yardımlaşabileceği, 
              AI desteğiyle karmaşık içeriklerin basitleştirildiği ve <span className="text-primary font-bold">WCAG 2.1</span> standartlarının ötesinde bir kullanıcı deneyimi sunmaktır.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card p-8 rounded-3xl border border-border group"
          >
            <div className="mb-5 inline-flex p-4 bg-red-500/5 rounded-2xl group-hover:bg-red-500/10 text-red-500 transition-all group-hover:-rotate-6">
              <Heart size={28} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Değerlerimiz</h2>
            <p className="text-sm md:text-lg text-muted-foreground leading-relaxed font-medium">
              Kapsayıcılık, Şeffaflık ve Yenilikçilik ana değerlerimizdir. Platformumuzdaki her bir özellik, <span className="text-primary font-bold">engelli topluluğunun</span> doğrudan geri bildirimleri ile şekillenmektedir.
            </p>
          </motion.div>
        </div>

        <section className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-24 text-center shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white tracking-tighter">Bize Katılın</h2>
            <p className="text-base md:text-xl font-medium text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
              Daha erişilebilir bir gelecek için sesinizi duyurun, başkalarına yardım edin veya sadece topluluğumuzun bir parçası olun.
            </p>
            <Link 
              href="/auth" 
              className="px-12 py-4 bg-white text-primary rounded-full font-bold text-lg hover:bg-white/90 transition-all"
            >
              Hemen Üye Ol
            </Link>
          </div>
          <Globe className="absolute -bottom-20 -right-20 size-64 md:size-[400px] opacity-10 group-hover:scale-110 group-hover:rotate-45 transition-all duration-1000" />
          <div className="absolute top-0 left-0 size-[300px] bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-[80px]"></div>
        </section>
        <AccessibilityToolbar />
      </div>
    </DashboardLayout>
  );
}
