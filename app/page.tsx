'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { BionicText } from '@/components/ui/bionic-text';

export default function Home() {
  const { user } = useAuth();

  const startHref = user ? '/discussions' : '/auth';

  return (
    <DashboardLayout>
      <main className="flex-1 w-full overflow-x-hidden">
        {/* Hero Section */}
        <section 
          className="w-full px-4 py-20 md:py-32 lg:py-40 text-center relative animate-in fade-in slide-in-from-bottom-4 duration-1000"
        >
          <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -z-10 blur-3xl opacity-30" />
          <div className="max-w-4xl mx-auto px-4">
            <div
              className="inline-block mb-6 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              ENGELSİZ FORUM&apos;A HOŞ GELDİNİZ
            </div>
            <h1 
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter text-foreground leading-[0.9] sm:leading-[0.85] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both"
            >
              <BionicText text="Herkes İçin Erişilebilir Bir Topluluk" />
            </h1>
            <p 
              className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground mb-12 font-medium leading-relaxed px-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 fill-mode-both"
            >
              <BionicText text="Engelleri birlikte aşmak için tasarlanan, yapay zeka destekli ve tam erişilebilir forum platformu." />
            </p>
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 fill-mode-both"
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
        <section className="max-w-7xl mx-auto px-4 py-20">
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
                desc: "Ekran okuyucu uyumlu ve özelleştirilebilir görünüm seçenekleri.",
                icon: "♿",
                color: "bg-green-500/10 text-green-500"
              },
              { 
                title: "Güvenli Topluluk", 
                desc: "Herkesin kendini güvende ve değerli hissettiği bir ortam.",
                icon: "🛡️",
                color: "bg-orange-500/10 text-orange-500"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-card border border-border p-8 rounded-3xl hover:border-primary/50 transition-all group animate-in fade-in slide-in-from-bottom-8 duration-1000"
                style={{ animationDelay: `${i * 150 + 500}ms`, animationFillMode: 'both' }}
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
      </main>
    </DashboardLayout>
  );
}
