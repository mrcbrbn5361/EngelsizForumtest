'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle2, RefreshCw, Loader2, ShieldCheck, Users } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile } from '@/types/database';
import { toast } from 'sonner';

export function UserManagementView() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data) {
          setProfiles(data as Profile[]);
        } else {
          setProfiles([]);
        }
      } else {
        setProfiles([]);
      }
    } catch (err) {
      console.error('Users load error:', err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (targetId: string, newRole: 'admin' | 'moderator' | 'user') => {
    setRoleUpdatingId(targetId);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', targetId);

        if (error) throw error;
      }
      setProfiles(prev => prev.map(p => p.id === targetId ? { ...p, role: newRole } : p));
      toast.success(`Kullanıcı rolü "${newRole}" olarak güncellendi.`);
    } catch (err: any) {
      toast.error('Rol güncellenemedi: ' + (err?.message || 'Hata'));
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handleToggleVerify = async (targetId: string, currentStatus: boolean) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({ is_verified: !currentStatus })
          .eq('id', targetId);

        if (error) throw error;
      }
      setProfiles(prev => prev.map(p => p.id === targetId ? { ...p, is_verified: !currentStatus } : p));
      toast.success('Doğrulama durumu güncellendi.');
    } catch (err: any) {
      toast.error('Hata: ' + (err?.message || 'İşlem başarısız'));
    }
  };

  const filteredProfiles = profiles.filter(p => {
    if (!userSearch.trim()) return true;
    const query = userSearch.toLowerCase();
    return (
      (p.username || '').toLowerCase().includes(query) ||
      (p.full_name || '').toLowerCase().includes(query) ||
      (p.role || '').toLowerCase().includes(query) ||
      (p.id || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface-raised border border-line rounded-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-indigo-600/20 text-indigo-400 light:text-indigo-700 border border-indigo-500/30">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-fg uppercase tracking-wider font-heading">Üye &amp; Rol Yönetimi</h1>
            <p className="text-xs text-fg-4">Kullanıcı yetkileri, doğrulama rozetleri ve itibar puanları</p>
          </div>
        </div>

        <button
          onClick={() => fetchUsers()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-surface-hover hover:bg-line text-fg-2 border border-line text-xs font-bold transition-all cursor-pointer min-h-[38px] self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-400 light:text-indigo-700' : ''} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface-raised border border-line rounded-md">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-5" />
          <input
            type="text"
            value={userSearch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserSearch(e.target.value)}
            placeholder="İsim, kullanıcı adı veya role göre ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-line bg-surface text-fg text-xs placeholder:text-fg-6 focus:outline-none focus:border-indigo-500 transition-all font-medium"
          />
        </div>
        <div className="text-[11px] font-bold text-fg-4 uppercase tracking-widest">
          Gösterilen <strong>{filteredProfiles.length}</strong> / Toplam <strong>{profiles.length}</strong> Üye
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-raised border border-line rounded-md overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-fg-4 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest">Üyeler Yükleniyor...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-12 text-center text-fg-4 text-xs">
            Aramaya uygun üye kaydı bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-hover text-fg-4 font-bold uppercase text-[10px] tracking-widest border-b border-line">
                  <th className="px-5 py-4">Üye Bilgisi</th>
                  <th className="px-5 py-4">Mevcut Rol</th>
                  <th className="px-5 py-4">İtibar / XP</th>
                  <th className="px-5 py-4">Doğrulama Rozeti</th>
                  <th className="px-5 py-4 text-right">Rol Atama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {filteredProfiles.map(p => (
                  <tr key={p.id} className="hover:bg-surface-hover/40 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-bold text-fg flex items-center gap-2">
                        <span>{p.username || p.full_name || 'isimsiz'}</span>
                        {p.is_verified && <CheckCircle2 size={13} className="text-indigo-400 light:text-indigo-700 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-fg-5 font-mono mt-0.5">{p.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold border ${
                        p.role === 'admin'
                          ? 'bg-amber-950/40 light:bg-amber-50/40 text-amber-300 light:text-amber-800 border-amber-800/40'
                          : p.role === 'moderator'
                          ? 'bg-indigo-950/40 light:bg-indigo-50/40 text-indigo-300 light:text-indigo-700 border-indigo-800/40'
                          : 'bg-slate-900/40 text-fg-4 border-slate-800/40'
                      }`}>
                        {p.role || 'user'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-fg-3">
                      {p.reputation_points || 0} PTS &bull; L{p.level || 1}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleVerify(p.id, !!p.is_verified)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          p.is_verified
                            ? 'bg-indigo-950/50 light:bg-indigo-50/50 border-indigo-600 text-indigo-300 light:text-indigo-700 hover:bg-indigo-900/50 light:hover:bg-indigo-100/50'
                            : 'bg-surface border-line text-fg-5 hover:text-fg'
                        }`}
                      >
                        {p.is_verified ? 'Doğrulanmış' : 'Onayla'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={p.role || 'user'}
                        disabled={roleUpdatingId === p.id}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateRole(p.id, e.target.value as any)}
                        className="bg-surface border border-line text-fg rounded-md px-3 py-1.5 text-[11px] font-bold focus:outline-none focus:border-indigo-500 cursor-pointer min-h-[32px] appearance-none hover:border-slate-600 transition-all text-center"
                      >
                        <option value="user">USER</option>
                        <option value="moderator">MOD</option>
                        <option value="admin">ADMIN</option>
                      </select>
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
