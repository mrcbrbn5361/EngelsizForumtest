'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { User, Mail, Shield, Settings, Bell, Accessibility, ChevronRight, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const { user } = useAuth();
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
            <h1 className="text-3xl font-black relative z-10">{user.email?.split('@')[0]}</h1>
            <p className="text-white/70 text-sm mb-6 relative z-10">{user.email}</p>
            
            <div className="absolute -top-10 -right-10 size-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 size-48 bg-black/10 rounded-full blur-2xl"></div>
          </div>
          
          <div className="p-8 space-y-10">
            {/* Account Info */}
            <section>
              <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Shield size={14} className="text-primary" /> HESAP YÖNETİMİ
              </h2>
              <div className="space-y-3">
                <ProfileItem icon={<Mail />} label="E-posta" value={user.email || ''} />
                <ProfileItem icon={<Settings />} label="Kullanıcı Adı" value={user.email?.split('@')[0] || ''} />
              </div>
            </section>

            {/* Accessibility Preferences */}
            <section>
              <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Accessibility size={14} className="text-primary" /> ERİŞİLEBİLİRLİK TERCİHLERİ
              </h2>
              <div className="space-y-3">
                <ProfileToggleItem icon={<Bell />} label="Ekran Okuyucu Optimize Edilmiş İçerik" enabled />
                <ProfileToggleItem icon={<Accessibility />} label="AI Destekli Kolaylaştırılmış Dil" enabled />
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

function ProfileToggleItem({ icon, label, enabled }: { icon: React.ReactNode, label: string, enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-5 bg-muted/30 rounded-2xl border border-border/50">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl shadow-sm text-primary">{icon}</div>
        <p className="font-bold text-sm">{label}</p>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`} role="switch" aria-checked={enabled}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}
