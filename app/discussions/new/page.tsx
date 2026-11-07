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
      <div className="bg-[#111B2E] border border-[#1E293B] rounded-lg p-10 text-center max-w-lg mx-auto my-8 space-y-3">
        <h1 className="text-base font-bold text-white uppercase tracking-wide font-heading">Giriş Yapılması Gerekiyor</h1>
        <p className="text-xs text-slate-400 leading-relaxed font-normal">
          Yeni bir konu açmak ve toplulukla etkileşime geçmek için lütfen hesabınıza giriş yapın.
        </p>
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="bg-[#111B2E] px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 border border-[#1E293B] rounded-lg font-mono">
        <Link href="/" className="hover:text-indigo-400 flex items-center gap-1 font-medium transition-colors">
          <Home size={13} />
          <span className="font-sans">Ana Sayfa</span>
        </Link>
        <span className="text-slate-600">/</span>
        <Link href="/discussions" className="hover:text-indigo-400 font-sans transition-colors">Tartışmalar</Link>
        <span className="text-slate-600">/</span>
        <span className="font-semibold text-slate-200 font-sans">Yeni Konu Başlat</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Form Column */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-[#111B2E] border border-[#1E293B] rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#18243A] text-white py-3.5 px-6 flex items-center justify-between border-b border-[#1E293B]">
              <h1 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 font-heading">
                <MessageSquare size={15} className="text-indigo-400" />
                <span>YENİ TARTIŞMA BAŞLAT</span>
              </h1>
              <span className="text-[11px] text-slate-400 font-normal">Topluluk kurallarına uygun başlıklar seçiniz.</span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
              {/* Category Select */}
              <div className="space-y-1.5">
                <label htmlFor="category" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Forum Kategorisi <span className="text-rose-400">*</span>
                </label>
                <select
                  id="category"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 bg-[#18243A] border border-[#1E293B] rounded-md px-3.5 text-xs font-medium text-slate-200 outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="" disabled>Bir Kategori Seçin</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Preset Tags */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag size={12} className="text-indigo-400" /> Konu Ön Eki (Opsiyonel)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all border cursor-pointer ${
                        selectedTag === tag 
                          ? 'bg-indigo-600 text-white border-indigo-500' 
                          : 'bg-[#18243A] text-slate-300 border-[#1E293B] hover:bg-[#1E293B] hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label htmlFor="title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Konu Başlığı <span className="text-rose-400">*</span>
                </label>
                <input 
                  id="title"
                  type="text" 
                  required 
                  disabled={loading}
                  placeholder="Örn: 2026 ÖTV üst sınırı ve bayi fatura süreçleri deneyimlerim" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-md border border-[#1E293B] bg-[#18243A] text-white text-xs sm:text-sm font-medium focus:border-indigo-400 outline-none placeholder-slate-500"
                />
              </div>

              {/* Topic Content / Editor */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Mesaj İçeriği <span className="text-rose-400">*</span>
                </label>
                <TopicEditor 
                  value={content}
                  onChange={setContent}
                  placeholder="Sorunuzu, tecrübenizi veya mevzuat detaylarını detaylıca açıklayınız..."
                />
              </div>

              {/* Staff Moderation Options */}
              {isStaff && (
                <div className="p-3.5 bg-[#18243A]/60 border border-[#1E293B] rounded-md flex flex-wrap items-center gap-6 text-xs text-slate-300 font-medium">
                  <span className="text-[11px] font-mono font-semibold uppercase text-amber-400 tracking-wider">Yönetici Seçenekleri:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isPinned} 
                      onChange={e => setIsPinned(e.target.checked)}
                      className="rounded border-[#1E293B] text-indigo-600 focus:ring-indigo-500 bg-[#111B2E]"
                    />
                    <Pin size={13} className="text-emerald-400" />
                    <span>Sabitle</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isLocked} 
                      onChange={e => setIsLocked(e.target.checked)}
                      className="rounded border-[#1E293B] text-indigo-600 focus:ring-indigo-500 bg-[#111B2E]"
                    />
                    <Lock size={13} className="text-amber-400" />
                    <span>Yoruma Kilitle</span>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
                <button 
                  type="button" 
                  onClick={() => router.back()}
                  className="px-4 py-2 rounded-md bg-[#18243A] hover:bg-[#1E293B] text-slate-300 text-xs font-medium border border-[#1E293B] transition-colors cursor-pointer"
                >
                  İptal
                </button>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
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
                </button>
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
        <Loader2 size={24} className="animate-spin text-indigo-400" />
        <span className="text-xs text-slate-400 font-mono">Yükleniyor...</span>
      </div>
    }>
      <NewTopicForm />
    </Suspense>
  );
}
