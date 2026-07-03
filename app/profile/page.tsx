'use client';
import { toast } from 'sonner';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { User, Mail, Shield, Settings, ChevronRight, LogIn, Loader2, Save, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, profile: globalProfile } = useAuth();
  const { resetSettings } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<{ username: string, full_name: string | null, avatar_url: string | null, role: string, level: number, xp: number } | null>(null);
  const [editMode, setEditMode] = useState(false);

  const initialLoadDone = React.useRef(false);

  useEffect(() => {
    if (globalProfile && !initialLoadDone.current) {
      setProfile({
        username: globalProfile.username,
        full_name: globalProfile.full_name,
        avatar_url: globalProfile.avatar_url,
        role: globalProfile.role,
        level: globalProfile.level || 1,
        xp: globalProfile.xp || 0
      });
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, [globalProfile]);

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
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      setEditMode(false);
      toast.success('Profil başarıyla güncellendi!');
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error('Hata: ' + err.message);
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
    <DashboardLayout>
      <main className="vibe-container py-12 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="vibe-card p-0 max-w-3xl mx-auto shadow-2xl"
        >
          <div className="bg-primary px-8 py-16 text-primary-foreground text-center relative overflow-hidden">
            <div className="mx-auto h-24 w-24 md:h-32 md:w-32 rounded-[2rem] bg-white/20 flex items-center justify-center mb-6 border-4 border-white/30 backdrop-blur-md relative z-10 overflow-hidden shadow-2xl">
              {profile?.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt={profile.full_name || 'Profile'} 
                  fill 
                  className="object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={48} className="text-white" />
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black relative z-10 tracking-tighter mb-2">
              {profile?.full_name || user.email?.split('@')[0]}
            </h1>
            <p className="text-white/70 text-xs md:text-sm font-black uppercase tracking-[0.3em] relative z-10">
              {profile?.username || user.email?.split('@')[0] ? `@${profile?.username || user.email?.split('@')[0]}` : ''}
            </p>
            
            <div className="absolute -top-12 -right-12 size-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 size-64 bg-black/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="p-4 sm:p-8 md:p-12 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="vibe-label flex items-center gap-2">
                  <Shield size={18} className="text-primary" /> HESAP YÖNETİMİ
                </h2>
                <button 
                  onClick={() => setEditMode(!editMode)}
                  className="vibe-badge border border-primary/20 text-primary hover:bg-primary/5 transition-all flex items-center gap-2 h-10 px-6"
                >
                  {editMode ? <><X size={14} /> İPTAL</> : <><Settings size={14} /> DÜZENLE</>}
                </button>
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6 bg-muted/30 p-4 sm:p-8 rounded-[2rem] border border-border">
                  <div className="space-y-2">
                    <label className="vibe-label">Profil Resmi (URL)</label>
                    <input 
                      type="url"
                      className="vibe-input text-sm h-14"
                      value={profile?.avatar_url || ''}
                      onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, avatar_url: v} : null); }}
                      placeholder="https://images.com/example.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="vibe-label">Kullanıcı Adı</label>
                    <input 
                      type="text"
                      className="vibe-input text-sm h-14"
                      value={profile?.username || ''}
                      onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, username: v} : null); }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="vibe-label">Tam İsim</label>
                    <input 
                      type="text"
                      className="vibe-input text-sm h-14"
                      value={profile?.full_name || ''}
                      onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, full_name: v} : null); }}
                      required
                    />
                  </div>
                  <button 
                    disabled={updating}
                    type="submit"
                    className="vibe-button-primary w-full h-16"
                  >
                    {updating ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                    {updating ? 'GÜNCELLENİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
                  </button>
                </form>
              ) : (
                <div className="grid gap-4">
                  <ProfileItem icon={<Mail size={20} />} label="E-posta" value={user.email || ''} />
                  <ProfileItem icon={<User size={20} />} label="Tam İsim" value={profile?.full_name || 'Tanımlanmamış'} />
                  <ProfileItem icon={<Settings size={20} />} label="Kullanıcı Kimliği" value={profile?.username || user.email?.split('@')[0] || ''} />
                  <ProfileItem 
                    icon={<Shield size={20} />} 
                    label="Üyelik Statüsü" 
                    value={profile?.role.toUpperCase() || 'USER'} 
                    badge={profile?.role === 'admin' || profile?.role === 'moderator' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  />
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-4 sm:p-6 bg-muted/30 rounded-3xl border border-border">
                       <p className="vibe-label whitespace-nowrap truncate">SEVİYE</p>
                       <p className="text-2xl sm:text-3xl font-black text-primary">{profile?.level || 1}</p>
                    </div>
                    <div className="p-4 sm:p-6 bg-muted/30 rounded-3xl border border-border">
                       <p className="vibe-label whitespace-nowrap truncate">TOPLAM XP</p>
                       <p className="text-2xl sm:text-3xl font-black text-primary">{profile?.xp || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section>
              <h2 className="vibe-label flex items-center gap-2 mb-6">
                <Settings size={18} className="text-primary" /> ERİŞİLEBİLİRLİK SİSTEMİ
              </h2>
              <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 sm:p-8 md:p-10 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-lg font-black text-foreground mb-6 leading-tight max-w-md">
                    Kişiselleştirilmiş erişilebilirlik ayarlarınız tüm cihazlarınızda güvenle saklanır.
                  </p>
                  <button 
                    onClick={() => {
                      if(confirm('Tüm erişilebilirlik ayarlarınız varsayılana döndürülecek. Emin misiniz?')) {
                        resetSettings();
                      }
                    }}
                    className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    AYARLARI SIFIRLA
                  </button>
                </div>
                <Settings size={120} className="absolute -right-8 -bottom-8 text-primary/10 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
              </div>
            </section>

            <button 
              onClick={handleLogout}
              className="w-full py-6 bg-destructive/5 text-destructive border-2 border-destructive/10 rounded-2xl font-black text-sm hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-3 group active:scale-95 uppercase tracking-[0.2em]"
            >
              <LogIn className="rotate-180 group-hover:-translate-x-2 transition-transform" size={24} aria-hidden="true" /> OTURUMU GÜVENLİ KAPAT
            </button>
          </div>
        </motion.div>
      </main>
    </DashboardLayout>
  );
}

function ProfileItem({ icon, label, value, badge }: { icon: React.ReactNode, label: string, value: string, badge?: string }) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6 bg-card rounded-[2rem] border border-border transition-all group/item hover:border-primary/30 shadow-sm min-w-0 w-full">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="p-3 sm:p-4 bg-muted rounded-2xl text-primary shrink-0 group-hover/item:scale-110 transition-transform">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="vibe-label mb-0 whitespace-nowrap truncate">{label}</p>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full">
            <p className="font-black text-sm sm:text-base md:text-xl tracking-tighter truncate text-foreground flex-1 min-w-0" title={value}>{value}</p>
            {badge && (
              <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0 ${badge}`}>
                 AKTİF
              </span>
            )}
          </div>
        </div>
      </div>
      <ChevronRight size={20} className="text-muted-foreground/30 group-hover/item:translate-x-1 transition-transform shrink-0 ml-2 sm:ml-4" />
    </div>
  );
}
