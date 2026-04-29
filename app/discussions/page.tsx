'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { DiscussionCard } from '@/components/forum/discussion-card';
import { MOCK_TOPICS } from '@/types/mock-data';
import Link from 'next/link';
import { Search, Plus, Filter, MessageSquareCode } from 'lucide-react';
import { motion } from 'motion/react';

export default function DiscussionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const handleSummarize = async (id: string) => {
    setSummarizingId(id);
    // TODO: Implement actual Gemini AI summarization here
    setTimeout(() => {
      alert('AI Özetleme özelliği yakında aktif olacak! (Gemini API Entegrasyonu)');
      setSummarizingId(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <MessageSquareCode className="text-primary" /> Tartışmalar
            </h1>
            <p className="text-muted-foreground">Topluluğumuzdaki güncel başlıkları ve yardım taleplerini inceleyin.</p>
          </div>
          
          <Link 
            href="/discussions/new"
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-1"
          >
            <Plus size={18} /> Yeni Başlık Aç
          </Link>
        </header>

        <div className="grid lg:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar / Filters */}
          <aside className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text"
                placeholder="Başlıklarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <nav className="space-y-1" aria-label="Kategoriler">
              <h2 className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <Filter size={14} /> Kategoriler
              </h2>
              <CategoryLink label="Tüm Tartışmalar" active count={42} />
              <CategoryLink label="Görme Engelli" count={12} />
              <CategoryLink label="İşitme Engelli" count={8} />
              <CategoryLink label="Motor Engelli" count={15} />
              <CategoryLink label="Teknoloji" count={24} />
              <CategoryLink label="Sosyal Haklar" count={10} />
            </nav>
          </aside>

          {/* Discussion List */}
          <section className="space-y-4">
            {MOCK_TOPICS.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DiscussionCard 
                  topic={topic} 
                  onSummarize={handleSummarize}
                />
              </motion.div>
            ))}
          </section>
        </div>
      </main>

      <AccessibilityToolbar />
    </div>
  );
}

function CategoryLink({ label, active, count }: { label: string, active?: boolean, count: number }) {
  return (
    <button
      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
        active 
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1'
      }`}
    >
      <span>{label}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${active ? 'bg-white/20' : 'bg-muted'}`}>
        {count}
      </span>
    </button>
  );
}
