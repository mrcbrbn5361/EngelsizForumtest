'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { User, Mail, Shield } from 'lucide-react';
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
          <div className="bg-primary px-8 py-12 text-primary-foreground text-center relative">
            <div className="mx-auto h-24 w-24 rounded-full bg-white/20 flex items-center justify-center mb-4 border-4 border-white/30 backdrop-blur-sm">
              <User size={48} />
            </div>
            <h1 className="text-2xl font-bold">{user.email?.split('@')[0]}</h1>
            <p className="text-white/70 text-sm mb-6">{user.email}</p>
          </div>
          <div className="p-8 space-y-8">
            <section>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><Shield size={16} /> Hesap Bilgileri</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                  <div className="flex items-center gap-3"><Mail size={18} className="text-primary" /><span>{user.email}</span></div>
                </div>
              </div>
            </section>

            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl font-bold hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center justify-center gap-2"
            >
              Oturumu Kapat
            </button>
          </div>
        </motion.div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
