'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { TopicEditor } from '@/components/forum/topic-editor';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';

function NewTopicForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }
        if (data) setCategories(data);
      } catch (err) {
        console.error('Error in category fetch:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const preselected = searchParams?.get('category_id');
    if (preselected) {
      setCategoryId(preselected);
    }
  }, [searchParams]);

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
      const baseUsername = user.email?.split('@')[0] || 'user';
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: `${baseUsername}_${user.id.slice(0, 4)}`,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
        }, { onConflict: 'id', ignoreDuplicates: true });
      
      if (profileError) {
        console.error('Profile Upsert Error:', profileError);
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
    <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <button 
        onClick={() => router.back()} 
        className="mb-6 md:mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
      </button>

      <div className="bg-card border border-border rounded-2xl md:rounded-[2.5rem] shadow-xl p-6 md:p-12">
        <header className="mb-8 md:mb-10 text-center">
          <h1 className="text-2xl md:text-4xl font-black mb-4">Yeni Tartışma</h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Toplulukla paylaşmak istediğiniz bir sorunuz veya tecrübeniz mi var? Detayları aşağıya yazın.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-2">
            <label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">BAŞLIK</label>
            <input 
              id="title"
              type="text" 
              required 
              disabled={loading}
              placeholder="Başlığı buraya yazın..." 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl border border-border bg-muted/20 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-base md:text-lg disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">KATEGORİ</label>
            <select 
              id="category"
              required 
              disabled={loading}
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
              className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl border border-border bg-muted/20 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-sm md:text-base appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Bir kategori seçin...</option>
              {categories.length === 0 && <option disabled>Kategoriler yüklenemedi...</option>}
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">İÇERİK</label>
            <TopicEditor value={content} onChange={setContent} />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-6 md:px-8 py-4 md:py-5 rounded-xl md:rounded-[2rem] font-black text-base md:text-lg shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <Save size={20} />}
              {loading ? 'Yayınlanıyor...' : 'Tartışmayı Yayınla'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function NewTopicPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      }>
        <NewTopicForm />
      </Suspense>
      <AccessibilityToolbar />
    </div>
  );
}
