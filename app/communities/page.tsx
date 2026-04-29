'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { Users, Search, ChevronRight, MessageSquare, Handshake } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

const COMMUNITIES = [
  { id: '1', name: 'Görme Engelliler Teknoloji Grubu', members: 1250, description: 'Ekran okuyucular, Braille ekranlar ve yardımcı teknolojiler üzerine tartışmalar.', icon: <Users className="text-blue-500" /> },
  { id: '2', name: 'İşitme Engelli Sosyal Ağ', members: 840, description: 'İşaret dili, görsel iletişim ve erişilebilir içerik paylaşım alanı.', icon: <MessageSquare className="text-purple-500" /> },
  { id: '3', name: 'Motor Engelsiz Yaşam', members: 620, description: 'Fiziksel erişilebilirlik, akıllı ev sistemleri ve mobilite çözümleri.', icon: <Handshake className="text-green-500" /> },
  { id: '4', name: 'Bilişsel Destek Topluluğu', members: 450, description: 'Basit arayüzler, odaklanma teknikleri ve bilişsel erişilebilirlik.', icon: <Users className="text-orange-500" /> },
];

export default function CommunitiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold mb-4"
          >
            Özel İlgi Grupları
          </motion.h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Deneyimlerinizi paylaşabileceğiniz ve benzer ilgi alanlarına sahip kişilerle tanışabileceğiniz topluluklara katılın.
          </p>
        </header>

        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Topluluk ara..." 
            className="w-full pl-12 pr-6 py-4 rounded-2xl border border-border bg-card shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {COMMUNITIES.map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors">
                  {community.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">{community.name}</h2>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{community.members} ÜYE</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {community.description}
              </p>
              <Link 
                href={`/communities/${community.id}`}
                className="flex items-center justify-between w-full py-3 px-4 bg-muted hover:bg-primary hover:text-primary-foreground rounded-xl font-bold transition-all"
              >
                Grubu Görüntüle <ChevronRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <AccessibilityToolbar />
    </div>
  );
}
