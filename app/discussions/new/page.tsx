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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-100">Giriş Yapılması Gerekiyor</h1>
        <p className="text-xs text-slate-400 max-w-sm">
          Yeni bir konu veya tartışma başlatmak için lütfen platforma giriş yapın.
        </p>
        <button 
          onClick={() => router.push('/login')} 
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-3xl space-y-6">
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> Geri Dön
      </button>

      <div className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md">
        <header className="space-y-1.5 border-b border-white/[0.08] pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Yeni Konu Başlat</h1>
          <p className="text-slate-400 text-xs sm:text-sm font-normal leading-relaxed">
            Topluluk üyelerine soru sorun, mevzuat deneyimlerinizi aktarın veya emsal kararları paylaşın.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preset Tag Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag size={13} className="text-sky-400" /> Hızlı Konu Etiketi
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                    selectedTag === tag 
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-xs' 
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-white/[0.06]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-semibold text-slate-300">
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
              className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/80 text-slate-200 text-xs sm:text-sm focus:ring-1 focus:ring-sky-500 outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category" className="text-xs font-semibold text-slate-300">
              Kategori / Topluluk *
            </label>
            <select 
              id="category"
              required 
              disabled={loading}
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/80 text-slate-200 text-xs sm:text-sm focus:ring-1 focus:ring-sky-500 outline-none cursor-pointer"
            >
              <option value="">Kategori Seçin...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Konu Detayı (Markdown / Zengin Metin) *
              </label>
              <span className="text-[11px] text-sky-400 font-normal flex items-center gap-1">
                <Eye size={12} /> Görsellerde otomatik AI alt-metin üretilir
              </span>
            </div>
            <TopicEditor value={content} onChange={setContent} />
          </div>

          {/* Soru Konusu Checkbox */}
          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg shrink-0">
                <HelpCircle size={16} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Soru Konusu (Çözüm Bekliyor)</div>
                <div className="text-[11px] text-slate-400">
                  Doğru yanıt verildiğinde yanıtı &quot;Çözüldü&quot; olarak sabitleyebilirsiniz.
                </div>
              </div>
            </div>
            <input 
              type="checkbox"
              checked={isQuestion}
              onChange={e => setIsQuestion(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-800 border-slate-700 cursor-pointer"
            />
          </div>

          {isStaff && (
            <div className="p-3.5 bg-sky-500/5 rounded-xl border border-sky-500/20 flex gap-6 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input 
                  type="checkbox" 
                  checked={isPinned} 
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500 cursor-pointer"
                />
                <span>Konuyu Sabitle</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
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
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
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
          <Loader2 size={32} className="animate-spin text-sky-400" />
        </div>
      }>
        <NewTopicForm />
      </Suspense>
      <Footer />
    </div>
  );
}
