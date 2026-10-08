'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  Accessibility, 
  Sparkles, 
  Calculator,
  Shield,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
  Flame,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { AccessibilityMenu } from '@/components/accessibility/accessibility-menu';
import { Button } from '@/components/ui/button';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const a11yRef = useRef<HTMLDivElement>(null);

  // Global hotkeys for barrier-free access
  useKeyboardShortcuts([
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
      action: () => router.push('/new-thread'),
    },
  ]);

  // Click outside listener
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
    <header className="w-full flex flex-col sticky top-0 z-50 bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Top Utility Bar with High-Contrast Direct Actions */}
      <div className="bg-slate-900 text-white px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-extrabold tracking-wide uppercase text-[11px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-sm flex items-center gap-1">
            <Sparkles size={11} />
            <span>TEKNOFEST 2027</span>
          </span>
          <span className="hidden md:inline text-slate-300 text-[11px]">
            Engelsiz Yaşam Teknolojileri Resmi Topluluk Platformu
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300 text-[11px]">
            <span>Kısayol:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-amber-300">Alt + A</kbd>
            <span className="text-slate-400">Erişilebilirlik</span>
          </div>

          {/* Quick Voice / A11y trigger */}
          <button
            type="button"
            onClick={() => setIsAccessibilityOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs transition-colors cursor-pointer"
            aria-label="Engelsiz Erişim Paneli"
          >
            <Accessibility size={13} />
            <span className="hidden sm:inline">Erişilebilirlik</span>
          </button>
        </div>
      </div>

      {/* Main Distinctive Navigation Bar */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer" 
            aria-label="Navigasyon Menüsü"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="flex items-center gap-2 group select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-sky-900 dark:from-sky-500 dark:to-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Accessibility size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white flex items-center gap-1">
                ENGELSİZ<span className="text-sky-700 dark:text-sky-400">FORUM</span>
              </div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">
                Haklar &bull; Mevzuat &bull; Dayanışma
              </div>
            </div>
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link 
            href="/" 
            className={cn(
              "px-3.5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5",
              pathname === '/' 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-700" 
                : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            )}
          >
            <span>Topluluk</span>
          </Link>

          <Link 
            href="/hesaplama" 
            className={cn(
              "px-3.5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5",
              pathname?.startsWith('/hesaplama') 
                ? "bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800" 
                : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            )}
          >
            <Calculator size={15} className="text-sky-700 dark:text-sky-400" />
            <span>Hesaplama Robotları</span>
          </Link>

          <Link 
            href="/messages" 
            className={cn(
              "px-3.5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5",
              pathname?.startsWith('/messages') 
                ? "bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-400 border border-slate-200 dark:border-slate-700" 
                : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            )}
          >
            <MessageSquare size={15} className="text-sky-600 dark:text-sky-400" />
            <span>Mesajlar (DM)</span>
          </Link>

          <Link 
            href="/about" 
            className={cn(
              "px-3.5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5",
              pathname === '/about' 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-700" 
                : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            )}
          >
            <span>Hakkımızda</span>
          </Link>

          <Link 
            href="/help" 
            className={cn(
              "px-3.5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5",
              pathname === '/help' 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-700" 
                : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            )}
          >
            <HelpCircle size={15} className="text-slate-500" />
            <span>Yardım &amp; SSS</span>
          </Link>

          {profile && (profile.role === 'admin' || profile.role === 'moderator') && (
            <Link 
              href="/admin" 
              className={cn(
                "px-3.5 py-2 rounded-lg text-sm font-extrabold uppercase tracking-wider transition-colors flex items-center gap-1.5 bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60",
                pathname.startsWith('/admin') && "bg-amber-500/20 ring-2 ring-amber-400"
              )}
            >
              <ShieldCheck size={15} />
              <span>Yönetim</span>
            </Link>
          )}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-xs relative mx-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mevzuat, Balthazard, ÖTV ara..."
            aria-label="Forum ve Mevzuatta Arama Yap"
            className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
          <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
        </form>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* New Topic Button with Semantic Primary Styling */}
          <Link href="/new-thread">
            <Button variant="primary" size="sm" className="hidden sm:inline-flex gap-1.5">
              <PlusCircle size={15} />
              <span>Yeni Konu</span>
            </Button>
          </Link>

          {/* Accessibility Dropdown Trigger */}
          <div className="relative" ref={a11yRef}>
            <button
              type="button"
              onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
              className="min-h-[44px] min-w-[44px] p-2 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer flex items-center justify-center gap-1"
              aria-label="Erişilebilirlik Araçları"
              aria-expanded={isAccessibilityOpen}
            >
              <SlidersHorizontal size={17} />
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
                className="min-h-[44px] flex items-center gap-2 p-1.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-expanded={isProfileOpen}
              >
                <UserAvatar
                  src={profile?.avatar_url || (user?.user_metadata?.avatar_url as string) || (user?.user_metadata?.picture as string) || null}
                  username={profile?.username || (user?.user_metadata?.user_name as string) || user?.email?.split('@')[0]}
                  name={profile?.full_name || (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || profile?.username}
                  size="sm"
                  className="rounded-lg shadow-xs"
                />
                <span className="hidden sm:inline text-xs font-bold text-slate-900 dark:text-white max-w-[100px] truncate">
                  {profile?.username || 'Hesabım'}
                </span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {profile?.username}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">
                      {profile?.role || 'Üye'}
                    </div>
                  </div>

                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User size={14} className="text-sky-600" />
                    <span>Profilim</span>
                  </Link>

                  <Link
                    href="/messages"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <MessageSquare size={14} className="text-emerald-600" />
                    <span>Özel Mesajlarım (DM)</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <SlidersHorizontal size={14} className="text-slate-500" />
                    <span>Profil &amp; Tercih Ayarları</span>
                  </Link>

                  {profile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      <Shield size={14} />
                      <span>Yönetim Paneli (ACP)</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <LogIn size={14} />
                  <span>Giriş</span>
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:inline-block">
                <Button variant="accent" size="sm">
                  <UserPlus size={14} />
                  <span>Kayıt Ol</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mevzuat, Balthazard ara..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          </form>

          {/* User Status Bar in Mobile Menu */}
          {user ? (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={profile?.avatar_url || (user?.user_metadata?.avatar_url as string) || (user?.user_metadata?.picture as string) || null}
                  username={profile?.username || (user?.user_metadata?.user_name as string) || user?.email?.split('@')[0]}
                  name={profile?.full_name || (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || profile?.username}
                  size="md"
                  className="rounded-xl shadow-xs"
                />
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-950 dark:text-white truncate">
                    {profile?.full_name || profile?.username || 'Hesabım'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    @{profile?.username || user.email?.split('@')[0]} &bull; {profile?.role || 'Üye'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Link
                  href={`/profile/${user.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <User size={13} className="text-sky-600" />
                  <span>Profilim</span>
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300"
                >
                  <MessageSquare size={13} className="text-emerald-600" />
                  <span>DM (Mesajlar)</span>
                </Link>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-sky-600"
                >
                  Profil &amp; Tercih Ayarları
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <LogIn size={13} />
                <span>Giriş Yap</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold shadow-xs"
              >
                <UserPlus size={13} />
                <span>Kayıt Ol</span>
              </Link>
            </div>
          )}

          <div className="space-y-1 pt-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-2.5 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Forum Ana Sayfa
            </Link>
            <Link
              href="/hesaplama"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-2.5 py-2 text-sm font-bold text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg flex items-center gap-2"
            >
              <Calculator size={16} />
              <span>Balthazard &amp; ÖTV Hesaplama Robotları</span>
            </Link>
            <Link
              href="/new-thread"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-2.5 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg flex items-center gap-2"
            >
              <PlusCircle size={16} />
              <span>Yeni Konu Aç</span>
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-2.5 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Hakkımızda &bull; TEKNOFEST 2027
            </Link>
            <Link
              href="/help"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-2.5 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Yardım &amp; SSS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
