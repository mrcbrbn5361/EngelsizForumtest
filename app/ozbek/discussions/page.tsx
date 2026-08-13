'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, Search, Plus, Filter, Sparkles, HeartPulse, Scale, 
  GraduationCap, Smile, Cpu, CheckCircle2, ArrowLeft 
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/lib/supabase';

export default function OzbekDiscussionsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadTopics() {
      try {
        const { data } = await supabase
          .from('topics')
          .select('*, category:categories(name, title)')
          .order('created_at', { ascending: false });

        if (data) {
          setTopics(data);
        }
      } catch (err) {
        console.error('Error fetching topics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, []);

  const filtered = topics.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <Link href="/ozbek" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mb-2">
              <ArrowLeft size={14} /> O'zbekcha Bosh Sahifaga Qaytish
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
              Munozaralar va Forum Konulari
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Nogironlik huquqlari, qulayliklar va tajriba almashinuvi bo'yicha barbi suhbatlar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Mavzulardan qidirish..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-xs font-bold w-64 focus:border-primary outline-none"
              />
            </div>
            <Link 
              href="/discussions/new"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl font-bold text-xs uppercase shadow-sm hover:scale-105 transition-all"
            >
              <Plus size={16} /> Yangi Mavzu
            </Link>
          </div>
        </div>

        {/* Discussions List */}
        {loading ? (
          <div className="p-12 text-center text-muted-foreground font-bold text-sm">
            Yuklanmoqda...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-card border border-border rounded-3xl space-y-3">
            <p className="text-sm font-bold text-muted-foreground">Mavzular topilmadi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded-3xl p-6 shadow-xs hover:border-primary/40 transition-all space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {t.category?.name || 'Mavzu'}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                  {t.title}
                </h2>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {t.content}
                </p>
                <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground pt-2 border-t border-border/50">
                  <span>💬 {t.comments_count || 0} javoblar</span>
                  <span>👁️ {t.views_count || 0} ko'rishlar</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
