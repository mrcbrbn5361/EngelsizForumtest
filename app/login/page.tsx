'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';
import { toast } from 'sonner';
import { Home, LogIn, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) throw signInError;

      toast.success('Giriş başarılı!');
      router.push('/');
    } catch (err: any) {
      toast.error('Giriş yapılamadı: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error('Google ile giriş hatası: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <div className="bg-[#eceff3] -mx-4 px-4 py-2 flex flex-wrap items-center gap-2 text-[12px] text-[#6c757d] border-b border-[#d8dee4] mb-4">
        <Link href="/" className="hover:text-[#18587a] flex items-center gap-1">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <span className="font-semibold text-[#212529]">Giriş Yap</span>
      </div>

      <div className="max-w-xl mx-auto w-full mt-10">
        <div className="xf-block rounded-sm overflow-hidden">
          <div className="xf-block-header">
            GİRİŞ YAP
          </div>
          
          <div className="p-8 bg-white border-b border-[#d8dee4]">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#204060] mb-1">E-posta veya Kullanıcı Adı:</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#d8dee4] p-2 text-sm focus:outline-none focus:border-[#18587a]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#204060] mb-1">Şifre:</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[#d8dee4] p-2 text-sm focus:outline-none focus:border-[#18587a]"
                  required
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                 <input type="checkbox" id="remember" className="rounded" />
                 <label htmlFor="remember" className="text-sm text-slate-600">Oturumu açık tut</label>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-[#204060] text-white px-8 py-2 rounded text-sm font-bold hover:bg-[#18587a] transition-colors border-b-2 border-black/20 active:translate-y-0.5 transition-transform flex items-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Giriş Yap
                </button>
                <Link href="/register" className="text-sm text-[#18587a] hover:underline font-medium">
                  Hala kayıtlı değil misiniz?
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[#d8dee4]">
               <p className="text-xs text-slate-500 font-bold uppercase mb-4 text-center">Veya Şununla Giriş Yap</p>
               <button 
                onClick={handleGoogleLogin}
                className="w-full border border-[#d8dee4] p-2 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors text-sm font-semibold"
               >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                  Google ile Giriş Yap
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
