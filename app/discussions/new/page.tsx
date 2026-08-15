'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TopicEditor } from '@/components/forum/topic-editor';
import { ArrowLeft, Save, Loader2, HelpCircle, Tag, Eye } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateUUID } from '@/lib/utils';
import { toast } from 'sonner';

const PRESET_TAGS = ['[ÖTV 2026]', '[Emsal Karar]', '[Sağlık Raporu]', '[EKPSS 2026]', '[Evde Bakım]', '[SGK İtiraz]', '[Medikal]'];

function NewTopicForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(searchParams?.get('category_id') || searchParams?.get('kategori') || '');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isQuestion, setIsQuestion] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (data && data.length > 0) {
          setCategories(data);
        }
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

    setLoading(true);
    try {
      const topicId = generateUUID();
      
      const slugify = (text: string) => {
        const trMap: { [key: string]: string } = {
          'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
        };
        for (const key in trMap) {
          text = text.replace(new RegExp(key, 'g'), trMap[key]);
        }
        return text.toLowerCase()
          .replace(/[^-a-zA-Z0-9\s]+/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      };

      const finalTitle = selectedTag ? `${selectedTag} ${title.trim()}` : title.trim();
      let slug = slugify(finalTitle);
      if (!slug) slug = topicId.substring(0, 8);
      
      const { data, error } = await supabase
        .from('threads')
        .insert({
          id: topicId,
          title: finalTitle,
          category_id: categoryId,
          content: content.trim(),
          author_id: user.id,
          is_pinned: isPinned,
          is_locked: isLocked,
          is_solved: false,
          slug: slug
        })
        .select()
        .single();
      
      if (error) {
        // Fallback to topics table if threads is aliased or schema differs
        await supabase.from('topics').insert({
          id: topicId,
          title: finalTitle,
          category_id: categoryId,
          content: content.trim(),
          author_id: user.id,
          is_pinned: isPinned,
          is_locked: isLocked,
          slug: slug
        });
      }
      
      toast.success('Konunuz başarıyla yayınlandı!');
      router.push(`/discussions/${data?.id || topicId}`);
    } catch (err: any) {
      toast.error('Tartışma yayınlanırken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Lütfen giriş yapın</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">Yeni bir tartışma başlatmak için üye girişi yapmalısınız.</p>
        <button onClick={() => router.push('/login')} className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer">Giriş Yap</button>
      </div>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
      <button 
        onClick={() => router.back()} 
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-sky-400 transition-colors uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft size={14} /> Geri Dön
      </button>

      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <header className="space-y-1.5 border-b border-border/60 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Yeni Konu Başlat</h1>
          <p className="text-muted-foreground text-xs sm:text-sm font-normal">
            Topluluk üyelerine soru sorun, mevzuat deneyimlerinizi paylaşın veya emsal kararları yayınlayın.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preset Tag Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag size={13} className="text-sky-400" /> Hızlı Konu Etiketi
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    selectedTag === tag 
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm' 
                      : 'bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border/80'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Konu Başlığı *
            </label>
            <input 
              id="title"
              type="text" 
              required 
              disabled={loading}
              placeholder="Örn: 2026 ÖTV üst sınırı ile ilgili bayi faturası deneyimlerim" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="vibe-input font-medium text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Kategori *
            </label>
            <select 
              id="category"
              required 
              disabled={loading}
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
              className="vibe-input text-xs sm:text-sm font-medium cursor-pointer"
            >
              <option value="">Kategori Seçin...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Konu Detayı (Markdown / Zengin Metin) *
              </label>
              <span className="text-[11px] text-sky-400 font-medium flex items-center gap-1">
                <Eye size={12} /> Görsellerde otomatik erişilebilir alt-metin desteklenir
              </span>
            </div>
            <TopicEditor value={content} onChange={setContent} />
          </div>

          {/* Soru Konusu Checkbox */}
          <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg shrink-0">
                <HelpCircle size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Soru Konusu (Çözüm Bekliyor)</div>
                <div className="text-[11px] text-muted-foreground">
                  Doğru yanıt verildiğinde konuyu &quot;Çözüldü&quot; olarak işaretleyebilirsiniz.
                </div>
              </div>
            </div>
            <input 
              type="checkbox"
              checked={isQuestion}
              onChange={e => setIsQuestion(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 cursor-pointer"
            />
          </div>

          {isStaff && (
            <div className="p-3.5 bg-sky-500/5 rounded-xl border border-sky-500/20 flex gap-6 text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer text-foreground">
                <input 
                  type="checkbox" 
                  checked={isPinned} 
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500 cursor-pointer"
                />
                <span>Konuyu Sabitle</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-foreground">
                <input 
                  type="checkbox" 
                  checked={isLocked} 
                  onChange={e => setIsLocked(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500 cursor-pointer"
                />
                <span>Konuyu Kilitle</span>
              </label>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{loading ? 'Yayınlanıyor...' : 'Konuyu Yayınla'}</span>
          </button>
        </form>
      </div>
    </main>
  );
}

export default function NewTopicPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      }>
        <NewTopicForm />
      </Suspense>
      <Footer />
    </div>
  );
}
