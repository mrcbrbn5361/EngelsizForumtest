'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
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
        <section className="container mx-auto px-4 py-20 lg:py-32 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 -skew-y-3 -z-10 origin-right"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 relative z-10"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
              Türkiye&apos;nin En Kapsayıcı Topluluğu
            </span>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] break-words">
              Engelleri <br className="hidden sm:block" /> 
              <span className="text-primary italic">Birlikte</span> Aşalım
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
              Teknoloji, erişilebilirlik ve sosyal yaşam hakkında her şeyi paylaştığımız, 
              AI desteğiyle güçlendirilmiş en geniş topluluğa hoş geldiniz.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              {!loading && (
                user ? (
                  <Link
                    href="/discussions"
                    className="rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground shadow-2xl transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    Tartışmalara Göz At
                  </Link>
                ) : (
                  <Link
                    href="/auth"
                    className="rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground shadow-2xl transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    Hemen Üye Ol
                  </Link>
                )
              )}
              {loading && <div className="h-14 w-40 animate-pulse bg-muted rounded-full"></div>}
              <Link
                href="/about"
                className="rounded-full border border-border bg-card px-10 py-4 text-lg font-bold shadow-sm transition-all hover:bg-muted"
              >
                Keşfet
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Quick Access Grid */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid gap-6 sm:grid-cols-3">
            <QuickActionLink 
              href="/search" 
              title="Hızlı Ara" 
              desc="İstediğin konuyu sesli veya yazılı ara." 
              icon={<Search size={24} />} 
              color="blue" 
            />
            <QuickActionLink 
              href="/discussions/new" 
              title="Yeni Konu" 
              desc="Topluluktan yardım al veya tecrübeni paylaş." 
              icon={<MessageCircle size={24} />} 
              color="purple" 
            />
            <QuickActionLink 
              href="/communities" 
              title="Özel Gruplar" 
              desc="İlgi alanına göre topluluklara katıl." 
              icon={<Users size={24} />} 
              color="orange" 
            />
          </div>
        </section>

        {/* Featured Content & Features */}
        <section className="bg-muted/30 py-24">
          <div className="container mx-auto px-4 lg:max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black mb-4">Neden EngelsizForum?</h2>
              <p className="text-muted-foreground">Her detay, her birey için özenle tasarlandı.</p>
            </div>
            
            <div className="grid gap-12 md:grid-cols-3">
              <FeatureCard 
                icon={<Zap size={32} className="text-yellow-500" />}
                title="AI Desteği"
                description="Gemini 2.0 Flash teknolojisi ile uzun tartışmaları saniyeler içinde anlayabileceğin şekilde özetliyoruz."
              />
              <FeatureCard 
                icon={<ShieldCheck size={32} className="text-green-500" />}
                title="Tam Erişilebilir"
                description="WCAG 2.1 standartlarının ötesinde, her türlü yardımcı teknoloji ile kusursuz çalışır."
              />
              <FeatureCard 
                icon={<Sparkles size={32} className="text-blue-500" />}
                title="Sesli Kütüphane"
                description="İçerikleri dinleyebilir, sesli arama yaparak platformda özgürce gezinebilirsiniz."
              />
            </div>
          </div>
        </section>

        {/* Statistics Banner */}
        <section className="container mx-auto px-4 py-24">
          <div className="bg-primary text-primary-foreground rounded-[3rem] p-12 lg:p-20 shadow-2xl relative overflow-hidden text-center">
            <div className="relative z-10 grid sm:grid-cols-3 gap-12">
              <div>
                <p className="text-5xl font-black mb-2">12.5k+</p>
                <p className="text-sm font-bold opacity-70 uppercase tracking-[0.2em]">Aktif Üye</p>
              </div>
              <div>
                <p className="text-5xl font-black mb-2">850+</p>
                <p className="text-sm font-bold opacity-70 uppercase tracking-[0.2em]">Günlük Yanıt</p>
              </div>
              <div>
                <p className="text-5xl font-black mb-2">%100</p>
                <p className="text-sm font-bold opacity-70 uppercase tracking-[0.2em]">Erişilebilirlik Ölçeği</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 size-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 bg-white dark:bg-black">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-black tracking-tighter">
            ENGELSİZ<span className="text-primary">FORUM</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2026 Herkes İçin Eşit İletişim.
          </div>
          <div className="flex gap-6 text-sm font-bold text-muted-foreground">
            <Link href="/about" className="hover:text-primary transition-colors">Hakkımızda</Link>
            <Link href="/discussions" className="hover:text-primary transition-colors">Tartışmalar</Link>
          </div>
        </div>
      </footer>

      <AccessibilityToolbar />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-[2rem] bg-card border border-border shadow-sm transition-all"
    >
      <div className="mb-6 p-4 bg-muted rounded-2xl w-fit">{icon}</div>
      <h3 className="mb-3 text-xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function QuickActionLink({ href, title, desc, icon, color }: { href: string, title: string, desc: string, icon: React.ReactNode, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  
  return (
    <Link href={href} className="group bg-card border border-border rounded-[2.5rem] p-8 hover:shadow-xl transition-all hover:border-primary/50">
      <div className={`size-14 rounded-2xl ${colors[color]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 flex items-center justify-between">
        {title} <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
