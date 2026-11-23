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
import { AccessibilityMenu } from '@/components/accessibility/accessibility-menu';
import { DisabilityQuickBar } from '@/components/accessibility/disability-quick-bar';
import { UniversalDrawerMenu } from '@/components/layout/universal-drawer-menu';
import { UserAvatar } from '@/components/ui/user-avatar';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useKeyboardShortcuts } from '@/lib/hotkeys';

export default function ClassicNavbar() {
  const { user, profile } = useAuth();
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
    <header className="w-full flex flex-col sticky top-0 z-40 bg-surface border-b border-line text-fg-1">
      
      {/* 1. Quick Disability Type Profile Selector */}
      <DisabilityQuickBar />

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Universal Hamburger Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-line bg-surface-raised hover:bg-surface-hover text-fg-2 font-semibold text-xs transition-colors cursor-pointer" 
            aria-label="Tüm Sayfalar ve Yetki Menüsü"
            aria-expanded={isDrawerOpen}
            title="Tüm Sayfaları Göster (Alt + M)"
          >
            <Menu size={16} />
            <span className="hidden sm:inline">Menü</span>
          </button>

          <Link href="/" className="flex items-center gap-2 group select-none">
            <div className="w-8 h-8 rounded-md bg-indigo-500 text-white flex items-center justify-center font-bold">
              <Accessibility size={20} strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div className="max-[359px]:sr-only">
              <div className="text-sm sm:text-base font-bold tracking-tight text-fg flex items-center gap-1 font-heading">
                ENGELSİZ<span className="text-indigo-400 light:text-indigo-700 font-bold">FORUM</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center Nav Links - High Contrast & Clean Navigation */}
        <nav className="hidden xl:flex items-center gap-1 text-xs">
          <Link 
            href="/" 
            className={cn(
              "px-2.5 py-1.5 rounded-md font-medium transition-colors",
              pathname === '/' 
                ? "bg-surface-hover text-fg border border-line" 
                : "text-fg-3 hover:text-fg hover:bg-surface-raised"
            )}
          >
            Forum
          </Link>

          <Link 
            href="/discussions" 
            className={cn(
              "px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5",
              pathname === '/discussions' 
                ? "bg-surface-hover text-fg border border-line" 
                : "text-fg-3 hover:text-fg hover:bg-surface-raised"
            )}
          >
            <MessageSquare size={14} className="text-indigo-400 light:text-indigo-700" />
            <span>Tartışmalar</span>
          </Link>

          <Link 
            href="/hesaplama" 
            className={cn(
              "px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5",
              pathname?.startsWith('/hesaplama') 
                ? "bg-surface-hover text-fg border border-line" 
                : "text-fg-3 hover:text-fg hover:bg-surface-raised"
            )}
          >
            <Calculator size={14} className="text-emerald-400 light:text-emerald-700" />
            <span>Hesaplama</span>
          </Link>

          <Link 
            href="/about" 
            className={cn(
              "hidden 2xl:block px-2.5 py-1.5 rounded-md font-medium transition-colors",
              pathname === '/about' 
                ? "bg-surface-hover text-fg border border-line" 
                : "text-fg-3 hover:text-fg hover:bg-surface-raised"
            )}
          >
            Hakkımızda
          </Link>

          <Link 
            href="/help" 
            className={cn(
              "px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5",
              pathname === '/help' 
                ? "bg-surface-hover text-fg border border-line" 
                : "text-fg-3 hover:text-fg hover:bg-surface-raised"
            )}
          >
            <HelpCircle size={14} className="text-amber-400 light:text-amber-800" />
            <span>Rehber</span>
          </Link>

          {(user?.email === 'miracbirben@gmail.com' || profile?.role === 'admin' || profile?.role === 'moderator') && (
            <Link 
              href="/admin" 
              className={cn(
                "px-2.5 py-1 rounded-md font-bold transition-colors flex items-center gap-1 text-amber-300 light:text-amber-800 border border-amber-600/60 bg-amber-950/40 light:bg-amber-50/40",
                pathname.startsWith('/admin') && "bg-amber-900/60 light:bg-amber-100/60 text-white border-amber-400 light:border-amber-800"
              )}
            >
              <ShieldCheck size={14} />
              <span>Yönetim</span>
            </Link>
          )}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} role="search" className="hidden lg:flex items-center flex-1 xl:min-w-[9.5rem] max-w-xs relative mx-2">
          <Search size={15} className="absolute left-3 text-fg-4 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Forumda ara..."
            aria-label="Forum ve Mevzuatta Arama Yap"
            className="w-full h-9 pl-9 pr-3 text-xs bg-surface-raised border border-line rounded-md text-fg-1 placeholder-fg-4 focus:outline-none focus:border-indigo-400 light:focus:border-indigo-700 transition-colors font-sans"
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/search"
            aria-label="Forumda ara"
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md border border-line bg-surface-raised text-fg-2 hover:bg-surface-hover hover:text-fg transition-colors"
          >
            <Search size={16} aria-hidden="true" />
          </Link>
          {/* New Topic Button */}
          <Link 
            href="/discussions/new"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Yeni Konu</span>
          </Link>

          {/* Accessibility Settings Trigger */}
          <div className="relative" ref={a11yRef}>
            <button
              type="button"
              onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
              className="h-9 px-2.5 sm:px-3 rounded-md border border-line bg-surface-raised text-fg-2 hover:bg-surface-hover hover:text-fg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              aria-label="Detaylı Erişilebilirlik Menüsü"
              aria-expanded={isAccessibilityOpen}
            >
              <SlidersHorizontal size={14} className="text-indigo-400 light:text-indigo-700" />
              <span className="hidden md:inline">Erişilebilirlik</span>
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
                className="h-9 flex items-center gap-2 px-2.5 rounded-md border border-line bg-surface-raised hover:bg-surface-hover cursor-pointer text-xs"
                aria-expanded={isProfileOpen}
              >
                <UserAvatar
                  src={profile?.avatar_url || (user?.user_metadata?.avatar_url as string) || (user?.user_metadata?.picture as string) || null}
                  username={profile?.username || (user?.user_metadata?.user_name as string) || user?.email?.split('@')[0]}
                  name={profile?.full_name || (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || profile?.username}
                  size="sm"
                  className="w-5 h-5 rounded"
                />
                <span className="hidden sm:inline font-semibold text-fg-2 max-w-[90px] truncate">
                  {profile?.username || 'Hesap'}
                </span>
                <ChevronDown size={14} className="text-fg-4" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-raised border border-line rounded-md shadow-xl py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-line">
                    <div className="font-bold text-fg truncate">
                      {profile?.username}
                    </div>
                    <div className="text-[10px] text-fg-4 capitalize">
                      {profile?.role || 'Üye'}
                    </div>
                  </div>

                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-fg-2 hover:bg-surface-hover hover:text-fg"
                  >
                    <User size={14} />
                    <span>Profilim</span>
                  </Link>

                  <Link
                    href="/messages"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-fg-2 hover:bg-surface-hover hover:text-fg"
                  >
                    <MessageSquare size={14} />
                    <span>Özel Mesajlar</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-fg-2 hover:bg-surface-hover hover:text-fg"
                  >
                    <SlidersHorizontal size={14} />
                    <span>Tercihler</span>
                  </Link>

                  <Link
                    href="/developers"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-indigo-400 light:text-indigo-700 hover:bg-surface-hover hover:text-indigo-300 light:hover:text-indigo-700 font-semibold"
                  >
                    <Code2 size={14} />
                    <span>Geliştirici Portalı</span>
                  </Link>

                  {(profile?.role === 'admin' || user?.email === 'miracbirben@gmail.com') && (
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-amber-300 light:text-amber-800 hover:bg-surface-hover font-semibold"
                    >
                      <ShieldCheck size={14} />
                      <span>Yönetim Paneli (ACP)</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 light:text-rose-700 hover:bg-surface-hover text-left cursor-pointer border-t border-line mt-1"
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
                className="h-9 px-2.5 md:px-3 rounded-md bg-surface-raised border border-line hover:bg-surface-hover text-fg-2 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <LogIn size={14} aria-hidden="true" />
                <span className="sr-only md:not-sr-only">Giriş</span>
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
