'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  Menu, 
  LogIn, 
  Accessibility, 
  Calculator,
  ShieldCheck, 
  ChevronDown, 
  LogOut, 
  User, 
  SlidersHorizontal, 
  Plus, 
  HelpCircle, 
  MessageSquare,
  Code2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { AccessibilityMenu } from '@/components/accessibility/accessibility-menu';
import { DisabilityQuickBar } from '@/components/accessibility/disability-quick-bar';
import { UniversalDrawerMenu } from '@/components/layout/universal-drawer-menu';
import { UserAvatar } from '@/components/ui/user-avatar';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useKeyboardShortcuts } from '@/lib/hotkeys';

export default function ClassicNavbar() {
  const { user, profile } = useAuth();
  const { triggerVisualAlert } = useAccessibility();
  const router = useRouter();
  const pathname = usePathname();

  // Navigation states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const a11yRef = useRef<HTMLDivElement>(null);

  // Global hotkeys for barrier-free access
  useKeyboardShortcuts([
    {
      key: 'm',
      alt: true,
      description: 'Navigasyon Menüsünü Aç/Kapat',
      action: () => setIsDrawerOpen((prev) => !prev),
    },
    {
      key: 'a',
      alt: true,
      description: 'Erişilebilirlik Menüsünü Aç/Kapat',
      action: () => setIsAccessibilityOpen((prev) => !prev),
    },
    {
      key: 'h',
      alt: true,
      description: 'Ana Sayfaya Git',
      action: () => router.push('/'),
    },
    {
      key: 'c',
      alt: true,
      description: 'Hesaplama Araçlarına Git',
      action: () => router.push('/hesaplama'),
    },
    {
      key: 'n',
      alt: true,
      description: 'Yeni Konu Aç',
      action: () => router.push('/discussions/new'),
    },
  ]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (a11yRef.current && !a11yRef.current.contains(event.target as Node)) {
        setIsAccessibilityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
    triggerVisualAlert('info');
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="w-full flex flex-col sticky top-0 z-40 bg-[#0B1220] border-b border-[#1E293B] text-slate-100">
      
      {/* 1. Quick Disability Type Profile Selector */}
      <DisabilityQuickBar />

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Universal Hamburger Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#1E293B] bg-[#111B2E] hover:bg-[#18243A] text-slate-200 font-semibold text-xs transition-colors cursor-pointer" 
            aria-label="Tüm Sayfalar ve Yetki Menüsü"
            aria-expanded={isDrawerOpen}
            title="Tüm Sayfaları Göster (Alt + M)"
          >
            <Menu size={16} />
            <span className="hidden sm:inline">Menü</span>
          </button>

          <Link href="/" className="flex items-center gap-2 group select-none">
            <div className="w-8 h-8 rounded-md bg-indigo-500 text-white flex items-center justify-center font-bold">
              <Accessibility size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1 font-heading">
                ENGELSİZ<span className="text-indigo-400 font-bold">FORUM</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center Nav Links - High Contrast & Clean Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-xs">
          <Link 
            href="/" 
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-colors",
              pathname === '/' 
                ? "bg-[#18243A] text-white border border-[#1E293B]" 
                : "text-slate-300 hover:text-white hover:bg-[#111B2E]"
            )}
          >
            Forum
          </Link>

          <Link 
            href="/discussions" 
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5",
              pathname === '/discussions' 
                ? "bg-[#18243A] text-white border border-[#1E293B]" 
                : "text-slate-300 hover:text-white hover:bg-[#111B2E]"
            )}
          >
            <MessageSquare size={14} className="text-indigo-400" />
            <span>Tartışmalar</span>
          </Link>

          <Link 
            href="/hesaplama" 
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5",
              pathname?.startsWith('/hesaplama') 
                ? "bg-[#18243A] text-white border border-[#1E293B]" 
                : "text-slate-300 hover:text-white hover:bg-[#111B2E]"
            )}
          >
            <Calculator size={14} className="text-emerald-400" />
            <span>Hesaplama</span>
          </Link>

          <Link 
            href="/about" 
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-colors",
              pathname === '/about' 
                ? "bg-[#18243A] text-white border border-[#1E293B]" 
                : "text-slate-300 hover:text-white hover:bg-[#111B2E]"
            )}
          >
            Hakkımızda
          </Link>

          <Link 
            href="/help" 
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5",
              pathname === '/help' 
                ? "bg-[#18243A] text-white border border-[#1E293B]" 
                : "text-slate-300 hover:text-white hover:bg-[#111B2E]"
            )}
          >
            <HelpCircle size={14} className="text-amber-400" />
            <span>Rehber</span>
          </Link>

          {(user?.email === 'miracbirben@gmail.com' || profile?.role === 'admin' || profile?.role === 'moderator') && (
            <Link 
              href="/admin" 
              className={cn(
                "px-2.5 py-1 rounded-md font-bold transition-colors flex items-center gap-1 text-amber-300 border border-amber-600/60 bg-amber-950/40",
                pathname.startsWith('/admin') && "bg-amber-900/60 text-white border-amber-400"
              )}
            >
              <ShieldCheck size={14} />
              <span>Yönetim</span>
            </Link>
          )}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-xs relative mx-2">
          <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mevzuat, Balthazard, ÖTV ara..."
            aria-label="Forum ve Mevzuatta Arama Yap"
            className="w-full h-9 pl-9 pr-3 text-xs bg-[#111B2E] border border-[#1E293B] rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-colors font-sans"
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* New Topic Button */}
          <Link 
            href="/discussions/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Yeni Konu</span>
          </Link>

          {/* Accessibility Settings Trigger */}
          <div className="relative" ref={a11yRef}>
            <button
              type="button"
              onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
              className="h-9 px-2.5 sm:px-3 rounded-md border border-[#1E293B] bg-[#111B2E] text-slate-200 hover:bg-[#18243A] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              aria-label="Detaylı Erişilebilirlik Menüsü"
              aria-expanded={isAccessibilityOpen}
            >
              <SlidersHorizontal size={14} className="text-indigo-400" />
              <span className="hidden sm:inline">Erişilebilirlik</span>
            </button>
            <AccessibilityMenu 
              isOpen={isAccessibilityOpen} 
              onClose={() => setIsAccessibilityOpen(false)} 
            />
          </div>

          {/* Auth State */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-9 flex items-center gap-2 px-2.5 rounded-md border border-[#1E293B] bg-[#111B2E] hover:bg-[#18243A] cursor-pointer text-xs"
                aria-expanded={isProfileOpen}
              >
                <UserAvatar
                  src={profile?.avatar_url || (user?.user_metadata?.avatar_url as string) || (user?.user_metadata?.picture as string) || null}
                  username={profile?.username || (user?.user_metadata?.user_name as string) || user?.email?.split('@')[0]}
                  name={profile?.full_name || (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || profile?.username}
                  size="sm"
                  className="w-5 h-5 rounded"
                />
                <span className="hidden sm:inline font-semibold text-slate-200 max-w-[90px] truncate">
                  {profile?.username || 'Hesap'}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#111B2E] border border-[#1E293B] rounded-md shadow-xl py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-[#1E293B]">
                    <div className="font-bold text-white truncate">
                      {profile?.username}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {profile?.role || 'Üye'}
                    </div>
                  </div>

                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-[#18243A] hover:text-white"
                  >
                    <User size={14} />
                    <span>Profilim</span>
                  </Link>

                  <Link
                    href="/messages"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-[#18243A] hover:text-white"
                  >
                    <MessageSquare size={14} />
                    <span>Özel Mesajlar</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-[#18243A] hover:text-white"
                  >
                    <SlidersHorizontal size={14} />
                    <span>Tercihler</span>
                  </Link>

                  <Link
                    href="/developers"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-indigo-400 hover:bg-[#18243A] hover:text-indigo-300 font-semibold"
                  >
                    <Code2 size={14} />
                    <span>Geliştirici Portalı</span>
                  </Link>

                  {(profile?.role === 'admin' || user?.email === 'miracbirben@gmail.com') && (
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-amber-300 hover:bg-[#18243A] font-semibold"
                    >
                      <ShieldCheck size={14} />
                      <span>Yönetim Paneli (ACP)</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-[#18243A] text-left cursor-pointer border-t border-[#1E293B] mt-1"
                  >
                    <LogOut size={14} />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link 
                href="/login"
                className="h-9 px-3 rounded-md bg-[#111B2E] border border-[#1E293B] hover:bg-[#18243A] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <LogIn size={14} />
                <span>Giriş</span>
              </Link>
              <Link 
                href="/register"
                className="h-9 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold hidden sm:flex items-center transition-colors"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Universal Slide-over Drawer for All Pages and Permissions */}
      <UniversalDrawerMenu 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </header>
  );
}
