'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { User, Mail, Shield, Settings, ChevronRight, LogIn, Loader2, Save, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useAccessibility } from '@/components/providers/accessibility-provider';

export default function ProfilePage() {
  const { user } = useAuth();
  const { resetSettings } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<{ username: string, full_name: string } | null>(null);
  const [editMode, setEditMode] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          full_name: profile.full_name,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      setEditMode(false);
      alert('Profil başarıyla güncellendi!');
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-[2.5rem] shadow-xl overflow-hidden">
          <div className="bg-primary px-8 py-12 text-primary-foreground text-center relative overflow-hidden">
            <div className="mx-auto h-24 w-24 rounded-full bg-white/20 flex items-center justify-center mb-4 border-4 border-white/30 backdrop-blur-sm relative z-10 transition-transform hover:scale-110">
              <User size={48} />
            </div>
            <h1 className="text-3xl font-black relative z-10">{profile?.full_name || user.email?.split('@')[0]}</h1>
            <p className="text-white/70 text-sm mb-6 relative z-10">@{profile?.username || user.email?.split('@')[0]}</p>
            
            <div className="absolute -top-10 -right-10 size-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 size-48 bg-black/10 rounded-full blur-2xl"></div>
          </div>
          
          <div className="p-8 space-y-10">
            {/* Account Info */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  <Shield size={14} className="text-primary" /> HESAP BİLGİLERİ
                </h2>
                <button 
                  onClick={() => setEditMode(!editMode)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  {editMode ? <><X size={12} /> İptal</> : <><Settings size={12} /> Düzenle</>}
                </button>
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4 bg-muted/20 p-6 rounded-3xl border border-border">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Kullanıcı Adı</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary outline-none"
                      value={profile?.username || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, username: e.target.value} : null)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tam Ad</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary outline-none"
                      value={profile?.full_name || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                      required
                    />
                  </div>
                  <button 
                    disabled={updating}
                    type="submit"
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {updating ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <ProfileItem icon={<Mail size={18} />} label="E-posta" value={user.email || ''} />
                  <ProfileItem icon={<User size={18} />} label="Tam Ad" value={profile?.full_name || 'Tanımlanmamış'} />
                  <ProfileItem icon={<Settings size={18} />} label="Kullanıcı Adı" value={profile?.username || user.email?.split('@')[0] || ''} />
                </div>
              )}
            </section>

            {/* Accessibility Preferences */}
            <section>
              <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Settings size={14} className="text-primary" /> ERİŞİLEBİLİRLİK TERCİHLERİ
              </h2>
              <div className="bg-muted/10 border border-border rounded-3xl p-6">
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Erişilebilirlik ayarlarınız hesabınızla senkronize edilir. Alt paneldeki butonu kullanarak ayarlarınızı özelleştirebilirsiniz.
                </p>
                <button 
                  onClick={() => resetSettings()}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Varsayılan Ayarlara Dön
                </button>
              </div>
            </section>

            <button 
              onClick={handleLogout}
              className="w-full py-5 bg-destructive/5 text-destructive border border-destructive/10 rounded-2xl font-black hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-3 group"
            >
              <LogIn className="rotate-180 group-hover:-translate-x-1 transition-transform" aria-hidden="true" /> Oturumu Kapat
            </button>
          </div>
        </motion.div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-5 bg-muted/30 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl shadow-sm text-primary">{icon}</div>
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="font-bold">{value}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-muted-foreground/30" />
    </div>
  );
}
