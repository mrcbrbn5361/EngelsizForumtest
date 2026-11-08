'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Search, Pin, Lock, Unlock, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ContentModerationView() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadSearch, setThreadSearch] = useState('');

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        let { data, error } = await supabase
          .from('topics')
          .select(`
            id, title, content, is_pinned, is_locked, views_count, comments_count, created_at,
            author:profiles(username, full_name),
            category:categories(name)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          const fallback = await supabase
            .from('threads')
            .select(`
              id, title, content, is_pinned, is_locked, views_count, comments_count, created_at,
              author:profiles(username, full_name),
              category:categories(name)
            `)
            .order('created_at', { ascending: false })
            .limit(100);
          data = fallback.data;
        }

        setThreads(data || []);
      } else {
        setThreads([]);
      }
    } catch (err) {
      console.error('Threads fetch error:', err);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleTogglePin = async (threadId: string, currentPinned: boolean) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('topics')
          .update({ is_pinned: !currentPinned })
          .eq('id', threadId);

        if (error) {
          await supabase
            .from('threads')
            .update({ is_pinned: !currentPinned })
            .eq('id', threadId);
        }
      }
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_pinned: !currentPinned } : t));
      toast.success(currentPinned ? 'Sabitleme kaldırıldı' : 'Konu en üste sabitlendi');
    } catch (err) {
      toast.error('İşlem başarısız');
    }
  };

  const handleToggleLock = async (threadId: string, currentLocked: boolean) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('topics')
          .update({ is_locked: !currentLocked })
          .eq('id', threadId);

        if (error) {
          await supabase
            .from('threads')
            .update({ is_locked: !currentLocked })
            .eq('id', threadId);
        }
      }
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_locked: !currentLocked } : t));
      toast.success(currentLocked ? 'Konu kilidi açıldı' : 'Konu kilitlendi (Yorumlara kapatıldı)');
    } catch (err) {
      toast.error('İşlem başarısız');
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('Bu konuyu silmek istediğinize emin misiniz?')) return;
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('topics').delete().eq('id', threadId);
        if (error) {
          await supabase.from('threads').delete().eq('id', threadId);
        }
      }
      setThreads(prev => prev.filter(t => t.id !== threadId));
      toast.success('Konu başarıyla silindi');
    } catch (err) {
      toast.error('Konu silinemedi');
    }
  };

  const filteredThreads = threads.filter(t => {
    if (!threadSearch.trim()) return true;
    const query = threadSearch.toLowerCase();
    return (
      (t.title || '').toLowerCase().includes(query) ||
      (t.author?.username || '').toLowerCase().includes(query) ||
      (t.category?.name || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#111B2E] border border-[#1E293B] rounded-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white uppercase tracking-wider font-heading">İçerik &amp; Tartışma Moderasyonu</h1>
            <p className="text-xs text-slate-400">Sabitleme, kitleme ve silme işlemleri</p>
          </div>
        </div>

        <button
          onClick={() => fetchThreads()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#18243A] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] text-xs font-bold transition-all cursor-pointer min-h-[38px] self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-400' : ''} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#111B2E] border border-[#1E293B] rounded-md">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={threadSearch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThreadSearch(e.target.value)}
            placeholder="Başlık, yazar veya kategoriye göre ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[#1E293B] bg-[#0B1220] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
          />
        </div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Gösterilen <strong>{filteredThreads.length}</strong> / Toplam <strong>{threads.length}</strong> Konu
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111B2E] border border-[#1E293B] rounded-md overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest">Konular Yükleniyor...</p>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Aramaya uygun konu bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#18243A] text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-[#1E293B]">
                  <th className="px-5 py-4">Başlık &amp; Kategori</th>
                  <th className="px-5 py-4">Yazar</th>
                  <th className="px-5 py-4">Durum</th>
                  <th className="px-5 py-4 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/70">
                {filteredThreads.map(t => (
                  <tr key={t.id} className="hover:bg-[#18243A]/40 transition-colors group">
                    <td className="px-5 py-4 max-w-md">
                      <div className="font-bold text-white flex items-center gap-2 truncate">
                        {t.is_pinned && <Pin size={12} className="text-amber-400 shrink-0" />}
                        {t.is_locked && <Lock size={12} className="text-rose-400 shrink-0" />}
                        <span className="truncate group-hover:text-indigo-400 transition-colors">{t.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium">
                        {t.category?.name || 'Genel'} &bull; {t.comments_count || 0} yanıt &bull; {t.views_count || 0} izlenme
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-300">
                      @{t.author?.username || t.author?.full_name || 'Yazar'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {t.is_pinned && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/40 text-amber-300 border border-amber-800/40 font-bold uppercase">Sabit</span>
                        )}
                        {t.is_locked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/40 text-rose-300 border border-rose-800/40 font-bold uppercase">Kilitli</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-bold uppercase tracking-tighter text-[9px]">Aktif</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePin(t.id, !!t.is_pinned)}
                          className={cn(
                            "p-2 rounded-md border transition-all cursor-pointer",
                            t.is_pinned ? "bg-amber-950/40 text-amber-400 border-amber-800/60" : "bg-[#18243A] border-[#1E293B] text-slate-400 hover:text-white"
                          )}
                          title="Sabitle"
                        >
                          <Pin size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleLock(t.id, !!t.is_locked)}
                          className={cn(
                            "p-2 rounded-md border transition-all cursor-pointer",
                            t.is_locked ? "bg-rose-950/40 text-rose-400 border-rose-800/60" : "bg-[#18243A] border-[#1E293B] text-slate-400 hover:text-white"
                          )}
                          title="Kilitle"
                        >
                          {t.is_locked ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>
                        <button
                          onClick={() => handleDeleteThread(t.id)}
                          className="p-2 rounded-md bg-[#18243A] border border-[#1E293B] text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-800/40 transition-all cursor-pointer"
                          title="Konuyu Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
