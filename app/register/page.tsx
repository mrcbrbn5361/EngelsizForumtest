'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';
import { toast } from 'sonner';
import { Home, UserPlus, Mail, Lock, User, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error('Lütfen kullanım şartlarını ve gizlilik politikasını kabul edin.');
      return;
    }

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

      toast.success('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      router.push('/login');
    } catch (err: any) {
      toast.error('Kayıt yapılamadı: ' + (err.message || 'Lütfen bilgilerinizi kontrol edin.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto w-full py-6 sm:py-10 px-4">
      {/* Breadcrumb Navigation */}
      <div className="bg-[#111B2E] border border-[#1E293B] px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 rounded-md font-mono">
        <Link href="/" className="hover:text-indigo-400 flex items-center gap-1.5 font-sans font-medium transition-colors">
          <Home size={13} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="text-slate-600">/</span>
        <span className="font-semibold text-slate-200 font-sans">Kayıt Ol</span>
      </div>

      {/* Main Register Card */}
      <div className="bg-[#111B2E] border border-[#1E293B] rounded-lg overflow-hidden shadow-xl">
        {/* Card Header */}
        <div className="bg-[#18243A] text-white p-5 sm:p-6 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <UserPlus size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-heading">
                Topluluğa Katıl
              </h1>
              <p className="text-xs text-slate-400 font-normal">
                Ücretsiz ve bağımsız EngelsizForum hesabı oluşturun
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-mono font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
            Sıfır Ücret
          </span>
        </div>
        
        {/* Card Body */}
        <div className="p-6 sm:p-7 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label 
                htmlFor="reg-username" 
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                Kullanıcı Adı <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input 
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 h-11 text-xs sm:text-sm font-medium bg-[#18243A] border border-[#1E293B] rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                  placeholder="kullanici_adiniz"
                  autoComplete="username"
                  required
                />
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 font-normal">
                Sitedeki paylaşımlarınızda ve tartışmalarda bu ad görünecektir.
              </p>
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="reg-email" 
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                E-posta Adresi <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input 
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 h-11 text-xs sm:text-sm font-medium bg-[#18243A] border border-[#1E293B] rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                  placeholder="adiniz@ornek.com"
                  autoComplete="email"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="reg-password" 
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                Şifre (En az 6 karakter) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input 
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 h-11 text-xs sm:text-sm font-medium bg-[#18243A] border border-[#1E293B] rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-[#1E293B] bg-[#18243A] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer" 
                required 
              />
              <label htmlFor="terms" className="text-xs text-slate-300 leading-snug cursor-pointer select-none">
                <Link href="/terms" className="text-indigo-400 hover:underline">Kullanım şartlarını</Link> ve <Link href="/privacy" className="text-indigo-400 hover:underline">gizlilik politikasını</Link> okudum, kabul ediyorum.
              </label>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Hesap Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Kaydı Tamamla</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link 
                href="/login" 
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Zaten hesabınız var mı? <span className="text-indigo-400 font-semibold underline underline-offset-4">Giriş Yapın</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
