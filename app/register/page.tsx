'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';
import { toast } from 'sonner';
import { Home, UserPlus, Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        throw new Error('Kullanıcı adı en az 3 karakter olmalıdır.');
      }

      const { error: signUpError } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password,
        options: {
          data: {
            username: cleanUsername,
            full_name: username.trim()
          }
        }
      });

      if (signUpError) throw signUpError;

      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      router.push('/login');
    } catch (err: any) {
      toast.error('Kayıt yapılamadı: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto w-full py-4 sm:py-8">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="font-extrabold text-slate-950 dark:text-white">Yeni Kayıt</span>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b-2 border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
              <UserPlus size={18} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight">Topluluğa Katıl</h1>
              <p className="text-xs text-slate-400">Ücretsiz ve Bağımsız EngelsizForum Hesabı Oluşturun</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 space-y-5">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Kullanıcı Adı:
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 h-11 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  placeholder="kullanici_adiniz"
                  required
                />
                <User size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Sitedeki paylaşımlarınızda bu ad görünecektir.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                E-posta Adresi:
              </label>
              <div className="relative">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 h-11 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  placeholder="adiniz@ornek.com"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Şifre:
              </label>
              <div className="relative">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 h-11 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
               <input type="checkbox" id="terms" className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 mt-0.5" required />
               <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                  <Link href="/terms" className="text-sky-600 dark:text-sky-400 font-bold hover:underline">Kullanım şartlarını</Link> ve <Link href="/privacy" className="text-sky-600 dark:text-sky-400 font-bold hover:underline">gizlilik politikasını</Link> okudum, kabul ediyorum.
               </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
              <Button 
                type="submit"
                disabled={loading}
                variant="primary"
                size="default"
                className="w-full sm:w-auto px-8 gap-2 font-black uppercase text-xs tracking-wider"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                <span>Kaydı Tamamla</span>
              </Button>

              <Link href="/login" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                Zaten hesabınız var mı? <strong className="text-sky-600 dark:text-sky-400 underline">Giriş Yapın</strong>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
