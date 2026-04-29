'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { TopicEditor } from '@/components/forum/topic-editor';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';

export default function NewTopicPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Lütfen önce giriş yapın.');
      return;
    }

    if (!title.trim()) {
      alert('Lütfen bir başlık girin.');
      return;
    }

    if (!categoryId) {
      alert('Lütfen bir kategori seçin.');
      return;
    }

    if (!content.trim()) {
      alert('Lütfen tartışma içeriğini yazın.');
      return;
    }

    setLoading(true);
    try {
      // Ensure profile exists to avoid foreign key violation
      // Using upsert with ON CONFLICT (id) DO NOTHING behavior if possible, 
      // but supabase upsert handles this well.
      const baseUsername = user.email?.split('@')[0] || 'user';
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: `${baseUsername}_${user.id.slice(0, 4)}`, // More stable than random
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
        }, { onConflict: 'id', ignoreDuplicates: true });
      
      if (profileError) {
        console.error('Profile Upsert Error:', profileError);
        // We continue anyway, hoping the profile already exists if upsert failed
      }

      const { data, error } = await supabase
        .from('topics')
        .insert({
          title: title.trim(),
          category_id: categoryId,
          content: content.trim(),
          author_id: user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }
      
      router.push(`/discussions/${data.id}`);
    } catch (err: any) {
      alert('Tartışma yayınlanırken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Lütfen giriş yapın</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">Yeni bir tartışma başlatmak için önce üye girişi yapmanız gerekmektedir.</p>
        <button onClick={() => router.push('/auth')} className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold shadow-lg">Giriş Yap</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <button 
          onClick={() => router.back()} 
          className="mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
        </button>

        <div className="bg-card border border-border rounded-[2.5rem] shadow-xl p-8 md:p-12">
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-black mb-4">Yeni Tartışma</h1>
            <p className="text-muted-foreground leading-relaxed">Toplulukla paylaşmak istediğiniz bir sorunuz veya tecrübeniz mi var? Detayları aşağıya yazın.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label htmlFor="title" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">BAŞLIK</label>
              <input 
                id="title"
                type="text" 
                required 
                disabled={loading}
                placeholder="Örn: Ekran okuyucu kullanırken karşılaşılan zorluklar..." 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="w-full p-5 rounded-2xl border border-border bg-muted/20 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-lg disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">KATEGORİ</label>
              <select 
                id="category"
                required 
                disabled={loading}
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
                className="w-full p-5 rounded-2xl border border-border bg-muted/20 outline-none focus:ring-2 focus:ring-primary transition-all font-bold appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">Bir kategori seçin...</option>
                {categories.length === 0 && <option disabled>Kategoriler yüklenemedi...</option>}
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">İÇERİK</label>
              <TopicEditor value={content} onChange={setContent} />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-primary-foreground px-8 py-5 rounded-[2rem] font-black text-lg shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <Save size={20} />}
                {loading ? 'Yayınlanıyor...' : 'Tartışmayı Yayınla'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
