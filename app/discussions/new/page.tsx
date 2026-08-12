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
        <button onClick={() => router.push('/login')} className="vibe-button-primary">Giriş Yap</button>
      </div>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
      <button 
        onClick={() => router.back()} 
        className="mb-6 flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> GERİ DÖN
      </button>

      <div className="vibe-card p-6 md:p-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Yeni Konu Başlat</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Topluluk üyelerine soru sorun, mevzuat deneyimlerinizi paylaşın veya emsal karar yayınlayın.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preset Tag Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag size={14} className="text-primary" /> Hızlı Etiket Seçimi
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    selectedTag === tag 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-muted hover:bg-card text-muted-foreground border-border'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
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
              className="vibe-input font-semibold text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Kategori *
            </label>
            <select 
              id="category"
              required 
              disabled={loading}
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
              className="vibe-input text-sm font-semibold cursor-pointer"
            >
              <option value="">Kategori Seçin...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Konu Detayı (Markdown / Zengin Metin) *
              </label>
              <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                <Eye size={12} /> Görsel Yüklemelerde Otomatik Alt-Metin Eklenir
              </span>
            </div>
            <TopicEditor value={content} onChange={setContent} />
          </div>

          {/* Soru Konusu Checkbox */}
          <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <HelpCircle size={20} />
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
              className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          {isStaff && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex gap-6 text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isPinned} 
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded text-primary"
                />
                <span>Konuyu Sabitle</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isLocked} 
                  onChange={e => setIsLocked(e.target.checked)}
                  className="rounded text-primary"
                />
                <span>Konuyu Kilitle</span>
              </label>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="vibe-button-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{loading ? 'Yayınlanıyor...' : 'KONUYU YAYINLA'}</span>
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
