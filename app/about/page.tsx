'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { Shield, Heart, Globe, Target } from 'lucide-react';
import { motion } from 'motion/react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <section className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-4 bg-primary/10 rounded-3xl mb-6"
          >
            <Shield size={48} className="text-primary" />
          </motion.div>
          <h1 className="text-4xl font-extrabold mb-6">EngelsizForum Nedir?</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            EngelsizForum, her bireyin dijital dünyada eşit haklara ve erişebilirliğe sahip olması gerektiği inancıyla doğmuş, 
            Türkiye&apos;nin ilk tam erişilebilir topluluk platformudur.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Target size={24} className="text-primary" /> Misyonumuz
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Engelli bireylerin teknoloji, sosyal yaşam ve günlük zorluklar hakkında birbirleriyle yardımlaşabileceği, 
              AI desteğiyle karmaşık içeriklerin basitleştirildiği ve WCAG 2.1 standartlarının ötesinde bir kullanıcı deneyimi sunmaktır.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Heart size={24} className="text-red-500" /> Değerlerimiz
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Kapsayıcılık, Şeffaflık ve Yenilikçilik ana değerlerimizdir. Platformumuzdaki her bir özellik, engelli topluluğunun 
              doğrudan geri bildirimleri ile şekillenmektedir.
            </p>
          </motion.div>
        </div>

        <section className="bg-primary text-primary-foreground rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Bize Katılın</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Daha erişilebilir bir gelecek için sesinizi duyurun, başkalarına yardım edin veya sadece topluluğumuzun bir parçası olun.
            </p>
            <a 
              href="/auth" 
              className="inline-block px-10 py-4 bg-white text-primary font-bold rounded-full shadow-lg hover:bg-zinc-100 transition-all focus:ring-4 focus:ring-white/50 outline-none"
            >
              Hemen Üye Ol
            </a>
          </div>
          <Globe className="absolute -bottom-10 -right-10 size-64 opacity-10" />
        </section>
      </main>

      <AccessibilityToolbar />
    </div>
  );
}
