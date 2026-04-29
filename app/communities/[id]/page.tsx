'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { ArrowLeft, Users, MessageSquare, Shield, Globe } from 'lucide-react';
import { motion } from 'motion/react';

const COMMUNITIES = [
  { id: '1', name: 'Görme Engelliler Teknoloji Grubu', members: 1250, description: 'Ekran okuyucular, Braille ekranlar ve yardımcı teknolojiler üzerine tartışmalar.' },
  { id: '2', name: 'İşitme Engelli Sosyal Ağ', members: 840, description: 'İşaret dili, görsel iletişim ve erişilebilir içerik paylaşım alanı.' },
  { id: '3', name: 'Motor Engelsiz Yaşam', members: 620, description: 'Fiziksel erişilebilirlik, akıllı ev sistemleri ve mobilite çözümleri.' },
  { id: '4', name: 'Bilişsel Destek Topluluğu', members: 450, description: 'Basit arayüzler, odaklanma teknikleri ve bilişsel erişilebilirlik.' },
];

export default function CommunityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const community = COMMUNITIES.find(c => c.id === id);

  if (!community) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <button 
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Geri Dön
        </button>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-8">
            <header className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Users size={32} />
                  </div>
                  <h1 className="text-3xl font-extrabold">{community.name}</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  {community.description}
                </p>
                <div className="flex gap-4">
                  <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-primary/20 transition-all">
                    Gruba Katıl
                  </button>
                  <button className="bg-card border border-border px-8 py-3 rounded-full font-bold hover:bg-muted transition-all">
                    Mesaj Gönder
                  </button>
                </div>
              </div>
              <Users className="absolute -bottom-10 -right-10 size-64 opacity-5" />
            </header>

            <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <MessageSquare size={20} className="text-primary" /> Topluluk Kuralları
              </h2>
              <ul className="space-y-4">
                <RuleItem title="Saygı ve Nezaket" description="Tüm üyelere saygılı davranın ve yapıcı geri bildirimler verin." />
                <RuleItem title="Erişilebilirlik Odaklılık" description="Paylaşılan her içeriğin erişilebilir olduğundan (alt-text, temiz dil vb.) emin olun." />
                <RuleItem title="Gizlilik" description="Üyelerin özel bilgilerini izinsiz paylaşmayın." />
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Grup Bilgileri</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Users size={14} /> Üyeler</span>
                  <span className="text-sm font-bold">{community.members}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Globe size={14} /> Görünürlük</span>
                  <span className="text-sm font-bold">Açık</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Shield size={14} /> Tür</span>
                  <span className="text-sm font-bold">Destek Grubu</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Hızlı Destek</h3>
              <p className="text-xs text-muted-foreground mb-4">Bu grup hakkında sorunuz mu var? Moderatörlere ulaşın.</p>
              <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-lg">
                Yöneticiye Yaz
              </button>
            </div>
          </aside>
        </div>
      </main>

      <AccessibilityToolbar />
    </div>
  );
}

function RuleItem({ title, description }: { title: string, description: string }) {
  return (
    <li className="flex gap-4">
      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary mt-1">
        ✓
      </div>
      <div>
        <h4 className="text-sm font-bold mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </li>
  );
}
