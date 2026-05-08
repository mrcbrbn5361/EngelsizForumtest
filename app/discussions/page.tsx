'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DiscussionCard } from '@/components/forum/discussion-card';
import { Topic } from '@/types/database';
import Link from 'next/link';
import { Search, Plus, Filter, MessageSquareCode, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

export default function DiscussionsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<{ id: string, text: string } | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    try {
      let query = supabase
        .from('topics')
        .select('*, author:profiles(*), category:categories(*), comments(id)')
        .order('created_at', { ascending: false });
      
      if (selectedCategoryId) {
        // Fetch topics in this category OR its subcategories
        const subCategoryIds = categories
          .filter(c => c.parent_id === selectedCategoryId)
          .map(c => c.id);
        
        query = query.in('category_id', [selectedCategoryId, ...subCategoryIds]);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching topics:', error);
        return;
      }
      setTopics(data || []);
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, categories]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      if (data) setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSummarize = async (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;

    setSummarizingId(id);
    setSummaryResult(null);

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

      const prompt = `Aşağıdaki forum tartışmasını bir cümleyle özetle ve en önemli 3 noktayı madde imiyle belirt. 
      Tartışma: ${topic.title}
      ${topic.content}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });
      
      if (response.text) {
        setSummaryResult({ id, text: response.text });
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      alert('AI Özetlenirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setSummarizingId(null);
    }
  };

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
        <div className="bg-card p-8 rounded-2xl mb-8 border border-border">
            <h1 className="text-3xl font-bold mb-2 text-foreground">Topluluğumuza Hoş Geldiniz</h1>
            <p className="text-muted-foreground mb-6">Burada olduğunuz için mutluyuz. Yardıma ihtiyacınız olursa, lütfen paylaşım yapmadan önce arama yapın.</p>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 h-12 rounded-xl border border-border bg-card outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-border overflow-hidden">
            <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide flex-nowrap items-center">
                {['Kategoriler', 'Etiketler', 'Tümü'].map(item => (
                    <button key={item} className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0 transition-colors">
                        {item}
                    </button>
                ))}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide flex-nowrap items-center">
                {[
                  { label: 'En Yeni', value: 'Latest' },
                  { label: 'Popüler', value: 'Popular' },
                  { label: 'Kategoriler', value: 'Categories' }
                ].map(item => (
                    <button 
                      key={item.value} 
                      className={`px-3 py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${item.value === 'Latest' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="w-full">
            <div className="grid grid-cols-12 text-xs font-bold text-muted-foreground uppercase py-3 px-4">
                <div className="col-span-12 md:col-span-6">Konu</div>
                <div className="hidden md:block col-span-2 text-center tracking-wider">Cevaplar</div>
                <div className="hidden md:block col-span-2 text-center tracking-wider">Görüntülenme</div>
                <div className="hidden md:block col-span-2 text-center tracking-wider">Etkinlik</div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => (
                <div key={topic.id} className="grid grid-cols-12 items-center py-4 px-4 border-b border-border hover:bg-muted/50 rounded-lg transition-colors group">
                    <div className="col-span-12 md:col-span-6 flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-lg text-primary transition-colors group-hover:bg-primary/10"><MessageSquareCode size={20}/></div>
                        <div className="min-w-0">
                            <Link href={`/discussions/${topic.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 break-words">{topic.title}</Link>
                            <div className="text-xs text-muted-foreground">{topic.category?.name || 'Genel'} kategorisinde</div>
                        </div>
                    </div>
                    <div className="hidden md:block col-span-2 text-center text-sm text-muted-foreground font-medium">{Array.isArray(topic.comments) ? topic.comments.length : 0}</div>
                    <div className="hidden md:block col-span-2 text-center text-sm text-muted-foreground font-medium">-</div>
                    <div className="hidden md:block col-span-2 text-center text-muted-foreground text-xs">{new Date(topic.created_at).toLocaleDateString('tr-TR')}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border mx-4">
                <p className="text-muted-foreground font-medium">Tartışma bulunamadı.</p>
              </div>
            )}
        </div>
    </DashboardLayout>
  );
}

function CategoryLink({ label, active, count, onClick }: { label: string, active?: boolean, count: number, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl px-5 py-3 text-sm font-bold transition-all whitespace-nowrap shrink-0 lg:w-full min-w-fit snap-start ${
        active 
          ? 'bg-primary text-primary-foreground shadow-lg' 
          : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <span className="mr-4 lg:mr-2">{label}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${active ? 'bg-white/20' : 'bg-muted'}`}>
        {count}
      </span>
    </button>
  );
}
