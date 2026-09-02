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
      <div className="xf-block border border-slate-200 rounded-sm bg-white p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
        <h1 className="text-lg font-black text-[#185886] uppercase tracking-wide mb-2">Giriş Yapılması Gerekiyor</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Yeni bir konu açmak ve toplulukla etkileşime geçmek için lütfen hesabınıza giriş yapın.
        </p>
        <button 
          onClick={() => router.push('/login')} 
          className="px-6 py-2 rounded-sm bg-[#185886] hover:bg-[#104f75] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
        >
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* XenForo Breadcrumbs */}
      <div className="bg-[#eef2f7] px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border border-slate-200 rounded-sm mb-2">
        <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 font-semibold">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/discussions" className="hover:text-[#185886] hover:underline font-semibold">Forumlar</Link>
        <span className="opacity-50">/</span>
        <span className="font-bold text-slate-800">Yeni Konu Aç</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main Form Column */}
        <div className="flex-1 min-w-0">
          <div className="xf-block border border-slate-200 rounded-sm bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="xf-block-header bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 py-3 px-4 flex items-center justify-between">
              <h1 className="text-sm font-black text-[#185886] uppercase tracking-wide flex items-center gap-2">
                <MessageSquare size={14} />
                YENİ KONU BAŞLAT
              </h1>
              <span className="text-[11px] text-slate-500 font-medium">Lütfen forum kurallarına uygun başlıklar seçiniz.</span>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              {/* Category Select */}
              <div className="space-y-1">
                <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Forum Kategorisi *
                </label>
                <select
                  id="category"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-9 bg-slate-50 border border-slate-300 rounded-sm px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#185886]"
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
                  <Tag size={12} className="text-[#185886]" /> Konu Ön Eki (Opsiyonel)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                      className={`px-2.5 py-1 rounded-sm text-[11px] font-bold transition-all border cursor-pointer ${
                        selectedTag === tag 
                          ? 'bg-[#185886] text-white border-[#185886] shadow-2xs' 
                          : 'bg-[#eef2f7] hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label htmlFor="title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                  className="w-full h-9 px-3 rounded-sm border border-slate-300 bg-slate-50 text-slate-800 text-xs sm:text-sm font-medium focus:border-[#185886] focus:bg-white outline-none"
                />
              </div>

              {/* Topic Content / Editor */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mesaj İçeriği *
                </label>
                <TopicEditor 
                  value={content}
                  onChange={setContent}
                  placeholder="Sorunuzu, tecrübenizi veya mevzuat detaylarını detaylıca açıklayınız..."
                />
              </div>

              {/* Staff Moderation Options */}
              {isStaff && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm flex flex-wrap items-center gap-6 text-xs text-slate-700 font-semibold">
                  <span className="text-[11px] font-black uppercase text-[#185886] tracking-wider">Yönetici Seçenekleri:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isPinned} 
                      onChange={e => setIsPinned(e.target.checked)}
                      className="rounded-sm border-slate-300 text-[#185886] focus:ring-[#185886]"
                    />
                    <Pin size={13} className="text-emerald-700" />
                    <span>Sabitle</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isLocked} 
                      onChange={e => setIsLocked(e.target.checked)}
                      className="rounded-sm border-slate-300 text-[#185886] focus:ring-[#185886]"
                    />
                    <Lock size={13} className="text-amber-700" />
                    <span>Yoruma Kilitle</span>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                >
                  İptal
                </button>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#f2930d] hover:bg-[#d5800a] text-white font-black text-xs uppercase tracking-wider rounded-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
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

          {/* Bottom Breadcrumbs */}
          <div className="bg-[#eef2f7] px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border border-slate-200 rounded-sm mt-4">
            <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 font-semibold">
              <Home size={12} />
              Ana Sayfa
            </Link>
            <span className="opacity-50">/</span>
            <Link href="/discussions" className="hover:text-[#185886] hover:underline font-semibold">Forumlar</Link>
            <span className="opacity-50">/</span>
            <span className="font-bold text-slate-800">Yeni Konu Aç</span>
          </div>
        </div>

        {/* Right Sidebar */}
        <ClassicSidebar />
      </div>
    </div>
  );
}

export default function NewTopicPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-[#185886]" />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Yükleniyor...</span>
      </div>
    }>
      <NewTopicForm />
    </Suspense>
  );
}
