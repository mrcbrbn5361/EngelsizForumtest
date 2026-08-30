'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';
import { toast } from 'sonner';
import { Home, UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

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
      const { error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            full_name: username.trim()
          }
        }
      });

      if (signUpError) throw signUpError;

      toast.success('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');
      router.push('/login');
    } catch (err: any) {
      toast.error('Kayıt yapılamadı: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <div className="bg-[#eceff3] -mx-4 px-4 py-2 flex flex-wrap items-center gap-2 text-[12px] text-[#4b5563] border-b border-[#d8dee4] mb-4">
        <Link href="/" className="hover:text-[#18587a] flex items-center gap-1">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <span className="font-semibold text-[#212529]">Kayıt Ol</span>
      </div>

      <div className="max-w-xl mx-auto w-full mt-10">
        <div className="xf-block rounded-sm overflow-hidden">
          <div className="xf-block-header">
            KAYIT OL
          </div>
          
          <div className="p-8 bg-white border-b border-[#d8dee4]">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#204060] mb-1">Kullanıcı Adı:</label>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-[#d8dee4] p-2 text-sm focus:outline-none focus:border-[#18587a]"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">Lütfen sitede görünecek adınızı seçin.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#204060] mb-1">E-posta Adresi:</label>
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
                 <input type="checkbox" id="terms" className="rounded" required />
                 <label htmlFor="terms" className="text-sm text-slate-600">
                    <Link href="/terms" className="text-[#18587a] hover:underline">Kullanım şartlarını</Link> ve <Link href="/privacy" className="text-[#18587a] hover:underline">gizlilik politikasını</Link> kabul ediyorum.
                 </label>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-[#204060] text-white px-8 py-2 rounded text-sm font-bold hover:bg-[#18587a] transition-colors border-b-2 border-black/20 active:translate-y-0.5 transition-transform flex items-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Kaydı Tamamla
                </button>
                <Link href="/login" className="text-sm text-[#18587a] hover:underline font-medium">
                  Zaten bir hesabınız var mı?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
