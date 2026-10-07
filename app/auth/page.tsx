'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SiteLayout } from '@/components/layout/site-layout';
import LoginPage from '@/app/login/page';
import RegisterPage from '@/app/register/page';
import { LogIn, UserPlus, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/providers/auth-provider';

export default function AuthPortalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const initialTab = searchParams?.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'register' || tabParam === 'login') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/discussions');
    }
  }, [user, loading, router]);

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <SiteLayout>
      <div className="flex-1 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-muted/10 to-muted/30">
        <div className="w-full max-w-xl">
          {/* Navigation Tab Bar */}
          <div 
            className="flex items-center p-1.5 mb-6 bg-[#111726]/90 border border-white/[0.08] rounded-2xl backdrop-blur-md shadow-lg"
            role="tablist"
            aria-label="Kimlik Doğrulama Seçenekleri"
          >
            <button
              role="tab"
              id="tab-login"
              aria-selected={activeTab === 'login'}
              aria-controls="panel-login"
              onClick={() => handleTabChange('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <LogIn size={16} aria-hidden="true" />
              <span>Giriş Yap</span>
            </button>

            <button
              role="tab"
              id="tab-register"
              aria-selected={activeTab === 'register'}
              aria-controls="panel-register"
              onClick={() => handleTabChange('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <UserPlus size={16} aria-hidden="true" />
              <span>Kayıt Ol</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login-panel"
                  id="panel-login"
                  role="tabpanel"
                  aria-labelledby="tab-login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoginPage />
                </motion.div>
              ) : (
                <motion.div
                  key="register-panel"
                  id="panel-register"
                  role="tabpanel"
                  aria-labelledby="tab-register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <RegisterPage />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

