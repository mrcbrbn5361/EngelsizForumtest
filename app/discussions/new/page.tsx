'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopicEditor } from '@/components/forum/topic-editor';
import { Home, ArrowLeft, Save, Loader2, Tag, Pin, Lock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateUUID, generateUniqueSlug } from '@/lib/utils';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import { Button } from '@/components/ui/button';
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
          if (!categoryId && data[0]) {
            setCategoryId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error in category fetch:', err);
      }
    };
    fetchCategories();
  }, [categoryId]);

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
        slug: slug,
        views_count: 1,
        comments_count: 0
      };

      const { data, error } = await supabase
        .from('topics')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }
      
      toast.success('Konunuz başarıyla yayınlandı!');
      router.push(`/discussions/${data?.id || topicId}`);
    } catch (err: any) {
      console.error('Topic creation error:', err);
      toast.error('Tartışma yayınlanırken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center max-w-lg mx-auto my-8 shadow-xs">
        <h1 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-wide mb-2">Giriş Yapılması Gerekiyor</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">
          Yeni bir konu açmak ve toplulukla etkileşime geçmek için lütfen hesabınıza giriş yapın.
        </p>
        <Button 
          onClick={() => router.push('/login')} 
          variant="primary"
          size="default"
          className="font-bold text-xs uppercase"
        >
          Giriş Yap
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/discussions" className="hover:text-sky-600 font-semibold">Tartışmalar</Link>
        <span className="opacity-40">/</span>
        <span className="font-extrabold text-slate-950 dark:text-white">Yeni Konu Başlat</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Form Column */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white py-4 px-6 flex items-center justify-between border-b-2 border-slate-800">
              <h1 className="text-sm font-black uppercase tracking-wide flex items-center gap-2">
                <MessageSquare size={16} className="text-sky-400" />
                <span>YENİ TARTIŞMA BAŞLAT</span>
              </h1>
              <span className="text-[11px] text-slate-400 font-medium">Topluluk kurallarına uygun başlıklar seçiniz.</span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
              {/* Category Select */}
              <div className="space-y-1.5">
                <label htmlFor="category" className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Forum Kategorisi <span className="text-rose-500">*</span>
                </label>
                <select
                  id="category"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-sky-600 cursor-pointer"
                >
                  <option value="" disabled>Bir Kategori Seçin</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Preset Tags */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Tag size={12} className="text-sky-600" /> Konu Ön Eki (Opsiyonel)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                        selectedTag === tag 
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label htmlFor="title" className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Konu Başlığı <span className="text-rose-500">*</span>
                </label>
                <input 
                  id="title"
                  type="text" 
                  required 
                  disabled={loading}
                  placeholder="Örn: 2026 ÖTV üst sınırı ve bayi fatura süreçleri deneyimlerim" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:border-sky-600 outline-none"
                />
              </div>

              {/* Topic Content / Editor */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Mesaj İçeriği <span className="text-rose-500">*</span>
                </label>
                <TopicEditor 
                  value={content}
                  onChange={setContent}
                  placeholder="Sorunuzu, tecrübenizi veya mevzuat detaylarını detaylıca açıklayınız..."
                />
              </div>

              {/* Staff Moderation Options */}
              {isStaff && (
                <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800/40 rounded-xl flex flex-wrap items-center gap-6 text-xs text-slate-800 dark:text-slate-200 font-semibold">
                  <span className="text-[11px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider">Yönetici Seçenekleri:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isPinned} 
                      onChange={e => setIsPinned(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <Pin size={13} className="text-emerald-600" />
                    <span>Sabitle</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isLocked} 
                      onChange={e => setIsLocked(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <Lock size={13} className="text-amber-600" />
                    <span>Yoruma Kilitle</span>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100 dark:border-slate-800">
                <Button 
                  type="button" 
                  onClick={() => router.back()}
                  variant="secondary"
                  size="default"
                  className="font-bold text-xs"
                >
                  İptal
                </Button>

                <Button 
                  type="submit" 
                  disabled={loading}
                  variant="primary"
                  size="default"
                  className="gap-2 font-black text-xs uppercase tracking-wider px-6"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Yayınlanıyor...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Konuyu Yayınla</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4">
          <ClassicSidebar />
        </div>
      </div>
    </div>
  );
}

export default function NewTopicPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-sky-600" />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Yükleniyor...</span>
      </div>
    }>
      <NewTopicForm />
    </Suspense>
  );
}
