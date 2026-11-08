'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FolderTree, Plus, Save, RefreshCw, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Category } from '@/types/database';
import { toast } from 'sonner';

export function CategoryManagementView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('MessageSquare');
  const [addingCategory, setAddingCategory] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data) {
          setCategories(data as Category[]);
        } else {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Categories load error:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) {
      toast.error('Kategori adı ve URL uzantısı zorunludur');
      return;
    }
    setAddingCategory(true);
    try {
      const newCat = {
        name: newCatName.trim(),
        slug: newCatSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description: newCatDesc.trim(),
        icon: newCatIcon,
        sort_order: categories.length + 1
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('categories').insert([newCat]);
        if (error) throw error;
      }

      setCategories(prev => [...prev, { ...newCat, id: 'cat-' + Date.now(), created_at: '', color: '#6366F1' } as Category]);
      setNewCatName('');
      setNewCatSlug('');
      setNewCatDesc('');
      toast.success('Yeni kategori foruma eklendi!');
    } catch (err: any) {
      toast.error('Kategori eklenemedi: ' + (err?.message || 'Hata'));
    } finally {
      setAddingCategory(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#111B2E] border border-[#1E293B] rounded-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <FolderTree size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white uppercase tracking-wider font-heading">Kategori Yönetimi</h1>
            <p className="text-xs text-slate-400">Forum başlık kategorileri ve sıralama</p>
          </div>
        </div>

        <button
          onClick={() => fetchCategories()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#18243A] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] text-xs font-bold transition-all cursor-pointer min-h-[38px] self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-400' : ''} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Add Form */}
      <div className="p-6 bg-[#111B2E] border border-[#1E293B] rounded-md space-y-6 shadow-xs">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3">
          <Plus size={18} className="text-emerald-400" />
          <span>Yeni Kategori Ekle</span>
        </h2>
        <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Kategori Adı</label>
            <input
              type="text"
              value={newCatName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatName(e.target.value)}
              placeholder="Örn: Yapay Zeka &amp; WebMCP"
              required
              className="w-full px-4 py-2.5 rounded-md border border-[#1E293B] bg-[#0B1220] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium transition-all min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Slug (URL)</label>
            <input
              type="text"
              value={newCatSlug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatSlug(e.target.value)}
              placeholder="yazilim-ai"
              required
              className="w-full px-4 py-2.5 rounded-md border border-[#1E293B] bg-[#0B1220] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium transition-all min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">İkon</label>
            <select
              value={newCatIcon}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewCatIcon(e.target.value)}
              className="w-full px-4 py-2.5 rounded-md border border-[#1E293B] bg-[#0B1220] text-white text-xs focus:outline-none focus:border-indigo-500 font-bold min-h-[44px]"
            >
              <option value="Cpu">Cpu (Yazılım/AI)</option>
              <option value="Scale">Scale (Hukuk/Mevzuat)</option>
              <option value="Monitor">Monitor (Donanım/Sistem)</option>
              <option value="Briefcase">Briefcase (Kariyer/İş)</option>
              <option value="MessageSquare">MessageSquare (Sohbet)</option>
            </select>
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Açıklama</label>
            <input
              type="text"
              value={newCatDesc}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatDesc(e.target.value)}
              placeholder="Kategori içeriği hakkında kısa bilgi..."
              className="w-full px-4 py-2.5 rounded-md border border-[#1E293B] bg-[#0B1220] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium transition-all min-h-[44px]"
            />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={addingCategory}
              className="px-8 py-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center gap-2 min-h-[44px]"
            >
              {addingCategory ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Kategoriyi Foruma Ekle</span>
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-[#111B2E] border border-[#1E293B] rounded-md overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest">Kategoriler Yükleniyor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#18243A] text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-[#1E293B]">
                  <th className="px-5 py-4 w-16">Sıra</th>
                  <th className="px-5 py-4">Kategori</th>
                  <th className="px-5 py-4">Slug (URL)</th>
                  <th className="px-5 py-4">Açıklama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/70">
                {categories.map((c, idx) => (
                  <tr key={c.id || idx} className="hover:bg-[#18243A]/40 transition-colors group">
                    <td className="px-5 py-4 font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-4 font-bold text-white flex items-center gap-3">
                      <div className="p-2 rounded bg-indigo-950/40 border border-indigo-800/40 text-indigo-400">
                        <FolderTree size={14} />
                      </div>
                      <span className="group-hover:text-indigo-400 transition-colors">{c.name}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-indigo-400 font-semibold">/{c.slug}</td>
                    <td className="px-5 py-4 text-slate-400 font-normal leading-relaxed">{c.description || '-'}</td>
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
