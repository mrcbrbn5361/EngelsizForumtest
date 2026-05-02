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
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="vibe-card overflow-hidden shadow-xl">
          <div className="bg-primary px-6 py-12 md:px-10 md:py-16 text-primary-foreground text-center relative overflow-hidden">
            <div className="mx-auto h-20 w-20 md:h-28 md:w-28 rounded-2xl bg-white/20 flex items-center justify-center mb-4 border-2 border-white/30 backdrop-blur-md relative z-10 transition-all hover:rotate-3 hover:scale-105 overflow-hidden shadow-xl">
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
                <User size={40} className="text-white" />
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold relative z-10 break-words tracking-tight leading-tight px-4 mb-1">
              {profile?.full_name || user.email?.split('@')[0]}
            </h1>
            <p className="text-white/70 text-xs md:text-sm font-bold uppercase tracking-widest relative z-10 break-all px-4">
              {profile?.username || user.email?.split('@')[0] ? `@${profile?.username || user.email?.split('@')[0]}` : ''}
            </p>
            
            <div className="absolute -top-10 -right-10 size-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 size-48 bg-black/10 rounded-full blur-2xl"></div>
          </div>
          
          <div className="p-6 md:p-10 space-y-8 md:space-y-12">
            {/* Account Info */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Shield size={16} className="text-primary" /> HESAP MERKEZİ
                </h2>
                <button 
                  onClick={() => setEditMode(!editMode)}
                  className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 transition-all flex items-center gap-2"
                >
                  {editMode ? <><X size={12} /> İptal</> : <><Settings size={12} /> Düzenle</>}
                </button>
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4 bg-muted/20 p-6 md:p-8 rounded-2xl border border-border shadow-inner">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Profil Resmi (URL)</label>
                    <input 
                      type="url"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-sm transition-all"
                      value={profile?.avatar_url || ''}
                      onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, avatar_url: v} : null); }}
                      placeholder="https://images.com/example.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Kullanıcı Adı</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-sm transition-all"
                      value={profile?.username || ''}
                      onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, username: v} : null); }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tam İsim</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-sm transition-all"
                      value={profile?.full_name || ''}
                      onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, full_name: v} : null); }}
                      required
                    />
                  </div>
                  <button 
                    disabled={updating}
                    type="submit"
                    className="vibe-button-primary w-full py-4 mt-2"
                  >
                    {updating ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    {updating ? 'GÜNCELLENİYOR...' : 'KAYDET'}
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <ProfileItem icon={<Mail size={18} />} label="E-posta" value={user.email || ''} />
                  <ProfileItem icon={<User size={18} />} label="Tam İsim" value={profile?.full_name || 'Tanımlanmamış'} />
                  <ProfileItem icon={<Settings size={18} />} label="Kullanıcı Kimliği" value={profile?.username || user.email?.split('@')[0] || ''} />
                </div>
              )}
            </section>

            {/* Accessibility Preferences */}
            <section>
              <h2 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings size={16} className="text-primary" /> ERİŞİLEBİLİRLİK SİSTEMİ
              </h2>
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-sm md:text-base font-bold text-foreground mb-4 leading-relaxed max-w-[80%]">
                    Kişiselleştirilmiş erişilebilirlik ayarlarınız tüm cihazlarınızda güvenle saklanır.
                  </p>
                  <button 
                    onClick={() => resetSettings()}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 hover:border-primary transition-all py-0.5"
                  >
                    Sıfırla
                  </button>
                </div>
                <Settings size={64} className="absolute -right-4 -bottom-4 text-primary/10 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
              </div>
            </section>

            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-destructive/5 text-destructive border border-destructive/20 rounded-xl font-bold text-sm hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-3 group active:scale-95 uppercase tracking-widest"
            >
              <LogIn className="rotate-180 group-hover:-translate-x-1 transition-transform" size={20} aria-hidden="true" /> Oturumu Sonlandır
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
    <div className="flex items-center justify-between p-4 md:p-6 bg-muted/30 rounded-xl md:rounded-2xl border border-border hover:border-primary/20 transition-all group/item">
      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
        <div className="p-2 md:p-3 bg-card rounded-lg shadow-sm text-primary shrink-0 group-hover/item:scale-110 transition-transform">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
          <p className="font-bold text-sm md:text-lg tracking-tight break-words line-clamp-1">{value}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-muted-foreground/20 group-hover/item:translate-x-1 transition-transform shrink-0 ml-2" />
    </div>
  );
}
