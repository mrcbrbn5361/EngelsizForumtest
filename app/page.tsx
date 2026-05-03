'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { MessageCircle, ShieldCheck, Zap, HeartHandshake, ArrowRight, Search, Users, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-24 lg:py-32 text-center relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 md:space-y-8 relative z-10"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] md:text-sm font-bold tracking-widest uppercase">
              Türkiye&apos;nin En Kapsayıcı Topluluğu
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl vibe-heading px-2">
              Engelleri <span className="text-primary">Birlikte</span> Aşalım
            </h1>
            <p className="mx-auto max-w-2xl text-sm md:text-xl text-muted-foreground leading-relaxed font-medium px-4">
              Teknoloji, erişilebilirlik ve sosyal yaşam hakkında her şeyi paylaştığımız, 
              AI desteğiyle güçlendirilmiş en geniş topluluğa hoş geldiniz.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 px-4 max-w-md mx-auto">
              {!loading && (
                user ? (
                  <Link
                    href="/discussions"
                    className="vibe-button-primary flex-1"
                  >
                    Tartışmaları Keşfet
                  </Link>
                ) : (
                  <Link
                    href="/auth"
                    className="vibe-button-primary flex-1"
                  >
                    Hemen Katıl
                  </Link>
                )
              )}
              {loading && <div className="h-14 flex-1 animate-pulse bg-muted rounded-full"></div>}
              <Link
                href="/about"
                className="flex-1 rounded-full border border-border bg-card px-8 py-3 text-base font-bold transition-all hover:bg-muted active:scale-95 flex items-center justify-center"
              >
                Hakkımızda
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Quick Access Grid */}
        <section className="container mx-auto px-4 pb-20 md:pb-24">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3 -mt-6 md:-mt-16">
            <QuickActionLink 
              href="/communities" 
              title="Özel Gruplar" 
              desc="İlgi alanına göre topluluklara katıl." 
              icon={<Users size={32} />} 
              color="blue" 
            />
            <QuickActionLink 
              href="/discussions/new" 
              title="Yeni Konu" 
              desc="Topluluktan yardım al veya tecrübeni paylaş." 
              icon={<MessageCircle size={32} />} 
              color="purple" 
            />
            <QuickActionLink 
              href="/about" 
              title="Misyonumuz" 
              desc="Neden buradayız ve neyi hedefliyoruz?" 
              icon={<Sparkles size={32} />} 
              color="orange" 
            />
          </div>
        </section>

        {/* Featured Content & Features */}
        <section className="bg-muted/30 py-16 md:py-24 border-y border-border">
          <div className="container mx-auto px-4 lg:max-w-7xl">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-5xl vibe-heading mb-4">Neden EngelsizForum?</h2>
              <p className="text-sm md:text-xl text-muted-foreground font-medium">Her detay, her birey için özenle tasarlandı.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard 
                icon={<Zap size={32} className="text-blue-600" />}
                title="AI Desteği"
                description="Gemini 2.0 Flash teknolojisi ile uzun tartışmaları saniyeler içinde anlayabileceğin şekilde özetliyoruz."
              />
              <FeatureCard 
                icon={<ShieldCheck size={32} className="text-blue-600" />}
                title="Tam Erişilebilir"
                description="WCAG 2.1 standartlarının ötesinde, her türlü yardımcı teknoloji ile kusursuz çalışır."
              />
              <FeatureCard 
                icon={<Sparkles size={32} className="text-blue-600" />}
                title="Sesli Kütüphane"
                description="İçerikleri dinleyebilir, sesli arama yaparak platformda özgürce gezinebilirsiniz."
              />
            </div>
          </div>
        </section>

        {/* Statistics Banner */}
        <section className="container mx-auto px-4 py-16 md:py-28">
          <div className="bg-primary text-primary-foreground rounded-3xl md:rounded-[3rem] p-8 md:p-20 shadow-xl relative overflow-hidden text-center">
            <div className="relative z-10 grid sm:grid-cols-3 gap-8 md:gap-16">
              <div className="space-y-1">
                <p className="text-3xl md:text-6xl font-bold tracking-tight">Birlikte</p>
                <p className="text-[10px] md:text-sm font-medium opacity-70 uppercase tracking-widest">Güçlüyüz</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-6xl font-bold tracking-tight">Eşit</p>
                <p className="text-[10px] md:text-sm font-medium opacity-70 uppercase tracking-widest">İletişim</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-6xl font-bold tracking-tight">Özgür</p>
                <p className="text-[10px] md:text-sm font-medium opacity-70 uppercase tracking-widest">Gelecek</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <AccessibilityToolbar />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="vibe-card flex flex-col items-center text-center group"
    >
      <div className="mb-6 p-5 bg-primary/5 rounded-2xl text-primary group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="mb-3 text-xl md:text-2xl font-bold tracking-tight">{title}</h3>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}

function QuickActionLink({ href, title, desc, icon, color }: { href: string, title: string, desc: string, icon: React.ReactNode, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    orange: 'bg-orange-500/10 text-orange-500'
  };
  
  return (
    <Link href={href} className="vibe-card group block">
      <div className={`size-14 md:size-16 rounded-2xl ${colors[color]} flex items-center justify-center mb-6 group-hover:rotate-6 transition-all duration-300 border border-transparent group-hover:border-current/20`}>
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center justify-between tracking-tight">
        {title} <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
      </h3>
      <p className="text-sm md:text-base text-muted-foreground font-medium line-clamp-2">{desc}</p>
    </Link>
  );
}
