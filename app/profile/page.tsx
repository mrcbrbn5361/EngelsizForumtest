'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { User, Mail, Shield, Settings, ChevronRight, LogIn, Loader2, Save, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import Image from 'next/image';

export default function ProfilePage() {
  const { user } = useAuth();
  const { resetSettings } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<{ username: string, full_name: string, avatar_url: string | null } | null>(null);
  const [editMode, setEditMode] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile({
          username: data.username,
          full_name: data.full_name,
          avatar_url: data.avatar_url
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (user && isMounted) {
        await fetchProfile();
      }
    };
    init();
    return () => { isMounted = false; };
  }, [user, fetchProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    setUpdating(true);
    try {
      console.log('Updating profile with data:', {
        id: user.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      });
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      setEditMode(false);
      alert('Profil başarıyla güncellendi!');
    } catch (err: any) {
      console.error('Update error:', err);
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
      <main className="flex-1 container mx-auto px-4 py-8 md:py-20 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border-4 border-border rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="bg-primary px-8 py-16 md:px-12 md:py-20 text-primary-foreground text-center relative overflow-hidden">
            <div className="mx-auto h-24 w-24 md:h-32 md:w-32 rounded-[2rem] bg-white/20 flex items-center justify-center mb-6 border-4 border-white/30 backdrop-blur-md relative z-10 transition-all hover:rotate-6 hover:scale-110 overflow-hidden shadow-2xl relative">
              {profile?.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt={profile.full_name || 'Profile'} 
                  fill 
                  className="object-cover" 
                  unoptimized
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={48} className="text-white" />
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black relative z-10 break-words tracking-tighter leading-none px-4 mb-2">{profile?.full_name || user.email?.split('@')[0]}</h1>
            <p className="text-white/60 text-sm md:text-lg font-black uppercase tracking-[0.3em] relative z-10 break-all px-4">{profile?.username || user.email?.split('@')[0] ? `@${profile?.username || user.email?.split('@')[0]}` : ''}</p>
            
            <div className="absolute -top-10 -right-10 size-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 size-64 bg-black/10 rounded-full blur-2xl"></div>
          </div>
          
          <div className="p-8 md:p-16 space-y-12 md:space-y-16">
            {/* Account Info */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs md:text-sm font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-3">
                  <Shield size={18} className="text-primary" /> HESAP MERKEZİ
                </h2>
                <button 
                  onClick={() => setEditMode(!editMode)}
                  className="text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-4 py-2 rounded-full border-2 border-primary/10 transition-all flex items-center gap-2"
                >
                  {editMode ? <><X size={14} /> İptal</> : <><Settings size={14} /> Düzenle</>}
                </button>
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6 bg-muted/20 p-8 rounded-[2.5rem] border-4 border-border shadow-inner">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Profil Resmi (URL)</label>
                    <input 
                      type="url"
                      className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-base transition-all"
                      value={profile?.avatar_url || ''}
                      onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, avatar_url: v} : null); }}
                      placeholder="https://images.com/example.jpg"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Kullanıcı Adı</label>
                    <input 
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-base transition-all"
                      value={profile?.username || ''}
                      onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, username: v} : null); }}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Tam İsim</label>
                    <input 
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-base transition-all"
                      value={profile?.full_name || ''}
                      onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, full_name: v} : null); }}
                      required
                    />
                  </div>
                  <button 
                    disabled={updating}
                    type="submit"
                    className="w-full py-5 bg-primary text-primary-foreground rounded-full font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                    {updating ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                    {updating ? 'GÜNCELLENİYOR...' : 'KAYDET'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <ProfileItem icon={<Mail size={20} />} label="E-posta" value={user.email || ''} />
                  <ProfileItem icon={<User size={20} />} label="Tam İsim" value={profile?.full_name || 'Tanımlanmamış'} />
                  <ProfileItem icon={<Settings size={20} />} label="Kullanıcı Kimliği" value={profile?.username || user.email?.split('@')[0] || ''} />
                </div>
              )}
            </section>

            {/* Accessibility Preferences */}
            <section>
              <h2 className="text-xs md:text-sm font-black text-muted-foreground uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <Settings size={18} className="text-primary" /> ERİŞİLEBİLİRLİK SİSTEMİ
              </h2>
              <div className="bg-primary/5 border-2 border-primary/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-base md:text-xl font-bold text-foreground mb-6 leading-relaxed">
                    Kişiselleştirilmiş erişilebilirlik ayarlarınız tüm cihazlarınızda güvenle saklanır.
                  </p>
                  <button 
                    onClick={() => resetSettings()}
                    className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 hover:border-primary transition-all py-1"
                  >
                    Fabrika Ayarlarına Dön
                  </button>
                </div>
                <Settings size={120} className="absolute -right-10 -bottom-10 text-primary/5 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
              </div>
            </section>

            <button 
              onClick={handleLogout}
              className="w-full py-6 bg-destructive/5 text-destructive border-2 border-destructive/10 rounded-[2rem] font-black text-lg hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-4 group shadow-lg hover:shadow-destructive/20 active:scale-95 uppercase tracking-[0.2em]"
            >
              <LogIn className="rotate-180 group-hover:-translate-x-2 transition-transform" size={24} aria-hidden="true" /> Oturumu Sonlandır
            </button>
          </div>
        </motion.div>
      </main>
      <AccessibilityToolbar />
      <Footer />
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-6 md:p-8 bg-muted/30 rounded-[2rem] border-2 border-border hover:border-primary/20 transition-all group/item">
      <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
        <div className="p-3 md:p-4 bg-card rounded-2xl shadow-lg text-primary shrink-0 group-hover/item:scale-110 transition-transform">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">{label}</p>
          <p className="font-black text-lg md:text-2xl tracking-tight break-words line-clamp-1">{value}</p>
        </div>
      </div>
      <ChevronRight size={24} className="text-muted-foreground/20 group-hover/item:translate-x-2 transition-transform shrink-0 ml-4" />
    </div>
  );
}
