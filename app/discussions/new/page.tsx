'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SiteLayout } from '@/components/layout/site-layout';
import { TopicEditor } from '@/components/forum/topic-editor';
import { ArrowLeft, Save, Loader2, HelpCircle, Tag, Eye } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateUUID, generateUniqueSlug } from '@/lib/utils';
import { toast } from 'sonner';

const PRESET_TAGS = ['[ÖTV 2026]', '[Emsal Karar]', '[Sağlık Raporu]', '[EKPSS 2026]', '[Evde Bakım]', '[SGK İtiraz]', '[Medikal & Cihaz]'];

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
      const finalTitle = selectedTag ? `${selectedTag} ${title.trim()}` : title.trim();
      let slug = generateUniqueSlug(finalTitle);
      
      const payload: any = {
        id: topicId,
        title: finalTitle,
        category_id: categoryId,
        content: content.trim(),
        author_id: user.id,
        is_pinned: isPinned,
        is_locked: isLocked,
        is_solved: false,
        slug: slug
      };

      let insertedTopic: any = null;
      let lastError: any = null;

      // Try inserting with unique slug, retry up to 3 times on any collision
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          payload.slug = generateUniqueSlug(finalTitle, 8 + attempt * 2);
        }

        const { data, error } = await supabase
          .from('topics')
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          insertedTopic = data;
          lastError = null;
          break;
        }

        lastError = error;

        // Check if error is unique slug violation
        const isSlugCollision = error?.message?.includes('topics_slug_key') || 
                                error?.message?.includes('duplicate key') || 
                                error?.code === '23505';

        if (!isSlugCollision) {
          // Fallback to 'threads' table if schema differs
          const { data: thData, error: threadErr } = await supabase
            .from('threads')
            .insert(payload)
            .select()
            .single();

          if (!threadErr && thData) {
            insertedTopic = thData;
            lastError = null;
            break;
          }
          if (threadErr) lastError = threadErr;
        }
      }

      if (lastError && !insertedTopic) {
        throw lastError;
      }
      
      toast.success('Konunuz başarıyla yayınlandı!');
      router.push(`/discussions/${insertedTopic?.id || topicId}`);
    } catch (err: any) {
      console.error('Topic creation error:', err);
      toast.error('Tartışma yayınlanırken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Giriş Yapılması Gerekiyor</h1>
        <p className="text-xs text-muted-foreground max-w-sm">
          Yeni bir konu veya tartışma başlatmak için lütfen platforma giriş yapın.
        </p>
        <button 
          onClick={() => router.push('/login')} 
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors cursor-pointer"
        >
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> Geri Dön
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <header className="space-y-1.5 border-b border-border pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Yeni Konu Başlat</h1>
          <p className="text-muted-foreground text-xs sm:text-sm font-normal leading-relaxed">
            Topluluk üyelerine soru sorun, mevzuat deneyimlerinizi aktarın veya emsal kararları paylaşın.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preset Tag Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag size={13} className="text-primary" /> Hızlı Konu Etiketi
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                    selectedTag === tag 
                      ? 'bg-primary/20 text-primary border-primary/40 shadow-xs' 
                      : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-semibold text-foreground">
              Konu Başlığı *
            </label>
            <input 
              id="title"
              type="text" 
              required 
              disabled={loading}
              placeholder="Örn: 2026 ÖTV üst sınırı ve bayi fatura süreçleri deneyimlerim" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-xs sm:text-sm focus:ring-1 focus:ring-primary outline-hidden placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category" className="text-xs font-semibold text-foreground">
              Kategori / Topluluk *
            </label>
            <select 
              id="category"
              required 
              disabled={loading}
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-xs sm:text-sm focus:ring-1 focus:ring-primary outline-hidden cursor-pointer"
            >
              <option value="">Kategori Seçin...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name || cat.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Konu Detayı (Markdown / Zengin Metin) *
              </label>
              <span className="text-[11px] text-primary font-normal flex items-center gap-1">
                <Eye size={12} /> Görsellerde otomatik AI alt-metin üretilir
              </span>
            </div>
            <TopicEditor value={content} onChange={setContent} />
          </div>

          {/* Soru Konusu Checkbox */}
          <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <HelpCircle size={16} />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Soru Konusu (Çözüm Bekliyor)</div>
                <div className="text-[11px] text-muted-foreground">
                  Doğru yanıt verildiğinde yanıtı &quot;Çözüldü&quot; olarak sabitleyebilirsiniz.
                </div>
              </div>
            </div>
            <input 
              type="checkbox"
              checked={isQuestion}
              onChange={e => setIsQuestion(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary bg-muted border-border cursor-pointer accent-primary"
            />
          </div>

          {isStaff && (
            <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 flex gap-6 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer text-foreground">
                <input 
                  type="checkbox" 
                  checked={isPinned} 
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <span>Konuyu Sabitle</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-foreground">
                <input 
                  type="checkbox" 
                  checked={isLocked} 
                  onChange={e => setIsLocked(e.target.checked)}
                  className="rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <span>Konuyu Kilitle</span>
              </label>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{loading ? 'Yayınlanıyor...' : 'Konuyu Yayınla'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewTopicPage() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        }>
          <NewTopicForm />
        </Suspense>
      </div>
    </SiteLayout>
  );
}
