'use client';
import { toast } from 'sonner';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { TopicEditor } from '@/components/forum/topic-editor';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { createTopic } from '@/app/actions';

function NewTopicForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(searchParams?.get('category_id') || '');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const leafCategories = React.useMemo(() => {
    const parentIds = new Set(categories.map(c => c.parent_id).filter(Boolean));
    return categories.filter(c => !parentIds.has(c.id));
  }, [categories]);

  useEffect(() => {
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co';

    if (!isSupabaseConfigured) return;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Lütfen önce giriş yapın.');
      return;
    }

    if (!title.trim()) {
      toast.error('Lütfen bir başlık girin.');
      return;
    }

    if (!categoryId) {
      toast.error('Lütfen bir kategori seçin.');
      return;
    }

    if (!content.trim()) {
      toast.error('Lütfen tartışma içeriğini yazın.');
      return;
    }

    const forbiddenWords = ['spam', 'reklam', 'kumar', 'bet', 'casino'];
    const lowerContent = content.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const isSpam = forbiddenWords.some(word => lowerContent.includes(word) || lowerTitle.includes(word));
    if (isSpam) {
      toast.error('İçeriğiniz otomatik spam filtresine takıldı. Lütfen kurallara uygun içerik girin.');
      return;
    }

    setLoading(true);
    try {
      const data = await createTopic({
        title: title.trim(),
        category_id: categoryId,
        content: content.trim(),
        author_id: user.id
      });
      
      router.push(`/discussions/${data.id}`);
    } catch (err: any) {
      toast.error('Tartışma yayınlanırken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 vibe-heading">Lütfen giriş yapın</h1>
        <p className="text-muted-foreground mb-8 max-w-sm text-base md:text-lg font-medium">Yeni bir tartışma başlatmak için önce üye girişi yapmanız gerekmektedir.</p>
        <button onClick={() => router.push('/auth')} className="vibe-button-primary">Giriş Yap</button>
      </div>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <button 
        onClick={() => router.back()} 
        className="mb-8 flex items-center gap-3 text-sm font-black text-muted-foreground hover:text-primary transition-all group uppercase tracking-[0.2em] px-2"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> GERİ DÖN
      </button>

      <div className="vibe-card p-8 md:p-16 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <header className="mb-8 text-center relative z-10">
          <h1 className="text-2xl md:text-5xl vibe-heading mb-3">Yeni Tartışma</h1>
          <p className="text-sm md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Toplulukla paylaşmak istediğiniz bir sorunuz veya tecrübeniz mi var? Detayları aşağıya yazın.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10 md:space-y-12 relative z-10">
          <div className="space-y-4">
            <label htmlFor="title" className="vibe-label">TARTIŞMA BAŞLIĞI</label>
            <input 
              id="title"
              type="text" 
              required 
              disabled={loading}
              placeholder="Örn: Erişilebilir web tasarımı" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="vibe-input h-20 text-xl"
            />
          </div>

          <div className="space-y-4">
            <label htmlFor="category" className="vibe-label">KATEGORİ SEÇİMİ</label>
            <div className="relative">
              <select 
                id="category"
                required 
                disabled={loading}
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
                className="vibe-input h-20 text-lg appearance-none cursor-pointer"
              >
                  <option value="">{categories.length === 0 ? "Kategoriler yükleniyor veya boş..." : "Bir kategori seçin..."}</option>
                  {leafCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="vibe-label">DETAYLI İÇERİK (MARKDOWN)</label>
            <TopicEditor value={content} onChange={setContent} />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="vibe-button-primary w-full py-4 md:py-5 text-sm md:text-xl flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {loading ? 'Yayımlanıyor...' : 'TARTIŞMAYI BAŞLAT'}
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
      <Footer />
      <AccessibilityToolbar />
    </div>
  );
}
