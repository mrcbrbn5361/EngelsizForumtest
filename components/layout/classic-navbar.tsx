'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Mail, 
  Menu, 
  X, 
  ChevronDown, 
  Home, 
  LogIn, 
  UserPlus, 
  Accessibility, 
  Check, 
  Eye, 
  Type, 
  Sparkles, 
  Info, 
  ShieldAlert,
  Moon,
  Volume2
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { AccessibilityMenu } from '@/components/accessibility/accessibility-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function ClassicNavbar() {
  const { user, profile } = useAuth();
  const { 
    fontSize, 
    highContrast, 
    dyslexicFont, 
    bionicReading, 
    reducedMotion,
    updateSettings, 
    resetSettings 
  } = useAccessibility();
  
  const router = useRouter();
  const pathname = usePathname();

  // Active UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for closing on outside click
  const profileRef = useRef<HTMLDivElement>(null);
  const a11yRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);

  // Close other dropdowns when opening one
  const closeAllDropdowns = () => {
    setIsNotificationsOpen(false);
    setIsMessagesOpen(false);
    setIsProfileOpen(false);
    setIsAccessibilityOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (a11yRef.current && !a11yRef.current.contains(event.target as Node)) {
        setIsAccessibilityOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (msgRef.current && !msgRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
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
    <header className="w-full flex flex-col shadow-xs sticky top-0 z-50">
      {/* Primary Navigation Bar */}
      <div className="bg-[#185886] text-white border-b border-[#104f75]">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-4 flex items-center justify-between h-[48px] sm:h-[54px] md:h-[58px]">
          
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                closeAllDropdowns();
              }}
              className="md:hidden p-1.5 text-sky-100 hover:text-white hover:bg-white/10 rounded-sm focus:outline-none cursor-pointer" 
              aria-label="Navigasyon Menüsü"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="classic-nav-logo text-base sm:text-lg md:text-xl font-black tracking-tight hover:text-sky-200 transition-colors shrink min-w-0 truncate select-none">
              ENGELSİZ<span className="text-sky-300 font-light">FORUM</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center h-full gap-1">
            <Link 
              href="/" 
              className={cn(
                "classic-nav-link px-4 h-full flex items-center text-sm transition-all",
                pathname === '/' 
                  ? "border-b-[3px] border-sky-300 bg-white/10 font-bold text-white" 
                  : "text-sky-100 hover:text-white hover:bg-white/[0.05] font-semibold"
              )}
            >
              Forumlar
            </Link>
            <Link 
              href="/hesaplama" 
              className={cn(
                "classic-nav-link px-4 h-full flex items-center text-sm transition-all",
                pathname?.startsWith('/hesaplama') 
                  ? "border-b-[3px] border-sky-300 bg-white/10 font-bold text-white" 
                  : "text-sky-100 hover:text-white hover:bg-white/[0.05] font-semibold"
              )}
            >
              Hesaplama Araçları
            </Link>
            <Link 
              href="/about" 
              className={cn(
                "classic-nav-link px-4 h-full flex items-center text-sm transition-all",
                pathname === '/about' 
                  ? "border-b-[3px] border-sky-300 bg-white/10 font-bold text-white" 
                  : "text-sky-100 hover:text-white hover:bg-white/[0.05] font-semibold"
              )}
            >
              Hakkımızda
            </Link>
            <Link 
              href="/help" 
              className={cn(
                "classic-nav-link px-4 h-full flex items-center text-sm transition-all",
                pathname === '/help' 
                  ? "border-b-[3px] border-sky-300 bg-white/10 font-bold text-white" 
                  : "text-sky-100 hover:text-white hover:bg-white/[0.05] font-semibold"
              )}
            >
              Yardım / SSS
            </Link>
            {profile && (profile.role === 'admin' || profile.role === 'moderator') && (
              <Link 
                href="/admin" 
                className={cn(
                  "classic-nav-admin px-4 h-full flex items-center transition-all text-sm font-extrabold uppercase tracking-wide gap-1 bg-amber-500/10 border-b-[3px]",
                  pathname.startsWith('/admin') 
                    ? "border-amber-400 text-white bg-amber-500/20" 
                    : "border-transparent text-amber-200 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <ShieldAlert size={14} />
                Yönetim
              </Link>
            )}
          </nav>

          {/* Controls: Search, A11y, Messages, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Desktop Search */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Forumda ara..." 
                className="classic-search-input rounded-sm px-3 py-1.5 text-xs focus:outline-none transition-all w-[130px] lg:w-[180px]"
              />
              <button type="submit" className="absolute right-2 text-slate-500 hover:text-slate-800" aria-label="Ara">
                <Search size={13} />
              </button>
            </form>

            {/* 1. Accessibility Panel Button */}
            <div className="relative" ref={a11yRef}>
              <button
                onClick={() => {
                  const newState = !isAccessibilityOpen;
                  closeAllDropdowns();
                  setIsAccessibilityOpen(newState);
                }}
                className={`p-2 rounded-sm text-sky-100 hover:text-white transition-colors focus:outline-none cursor-pointer ${
                  isAccessibilityOpen ? 'bg-white/20 text-white ring-1 ring-white/30' : 'hover:bg-white/10'
                }`}
                aria-label="Erişilebilirlik Paneli"
                title="Erişilebilirlik Ayarları"
                aria-expanded={isAccessibilityOpen}
              >
                <Accessibility size={18} />
              </button>

              <AccessibilityMenu
                isOpen={isAccessibilityOpen}
                onClose={() => setIsAccessibilityOpen(false)}
              />
            </div>

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* 2. Notifications Button */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => {
                      const newState = !isNotificationsOpen;
                      closeAllDropdowns();
                      setIsNotificationsOpen(newState);
                    }}
                    className={`p-2 rounded-sm relative transition-colors focus:outline-none ${isNotificationsOpen ? 'bg-white/10 text-white' : 'text-sky-100 hover:text-white hover:bg-white/10'}`} 
                    aria-label="Bildirimler"
                  >
                    <Bell size={18} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#185886]"></span>
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-sm w-72 p-3 text-slate-800 z-50 animate-in fade-in duration-150">
                      <h4 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-1.5 mb-2 uppercase tracking-wide">Bildirimler</h4>
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        <div className="text-xs text-slate-500 p-3 text-center italic bg-slate-50 border border-slate-100 rounded">
                          Hiç yeni bildiriminiz yok.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Direct Messages Button */}
                <div className="relative">
                  <Link 
                    href="/messages"
                    className="p-2 rounded-sm relative block transition-colors focus:outline-none text-amber-300 hover:text-white hover:bg-white/10"
                    aria-label="Özel Mesajlar"
                    title="Özel Mesajlar"
                  >
                    <Mail size={18} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 animate-pulse rounded-full border-2 border-[#185886]"></span>
                  </Link>
                </div>

                <div className="h-6 w-[1px] bg-white/20 mx-1 hidden sm:block"></div>

                {/* 4. Profile Dropdown Controls */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => {
                      const newState = !isProfileOpen;
                      closeAllDropdowns();
                      setIsProfileOpen(newState);
                    }}
                    className="flex items-center gap-1.5 p-1 hover:bg-white/10 rounded-sm transition-colors focus:outline-none"
                    aria-label="Profil Menüsü"
                  >
                    <div className="w-8 h-8 bg-sky-900 rounded-full flex-shrink-0 border border-white/20 flex items-center justify-center overflow-hidden">
                       {profile?.avatar_url ? (
                         <img src={profile.avatar_url} alt={profile.username ? `${profile.username} profil resmi` : 'Kullanıcı profil resmi'} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-[11px] text-sky-200 font-bold uppercase">{profile?.username?.substring(0, 2) || 'Ü'}</span>
                       )}
                    </div>
                    <ChevronDown size={12} className="text-sky-100" />
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 bg-white text-slate-800 border border-slate-200 shadow-2xl rounded-sm w-48 overflow-hidden z-50 animate-in fade-in duration-150">
                      <div className="p-3 bg-slate-50 border-b border-slate-100">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Giriş yapıldı</span>
                        <span className="block text-sm font-extrabold text-[#185886] truncate">@{profile?.username || 'Üye'}</span>
                      </div>
                      <Link 
                        href={`/profile/${profile?.id || user?.id}`} 
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2.5 text-xs font-bold hover:bg-slate-50 border-b border-slate-100 text-slate-700"
                      >
                        PROFİLİM
                      </Link>
                      <Link 
                        href="/profile" 
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2.5 text-xs font-bold hover:bg-slate-50 border-b border-slate-100 text-slate-700"
                      >
                        HESAP AYARLARI
                      </Link>
                      <Link 
                        href="/developers" 
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2.5 text-xs font-bold hover:bg-slate-50 border-b border-slate-100 text-[#0066a2]"
                      >
                        GELİŞTİRİCİ PORTALI (API)
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-xs font-black hover:bg-rose-50 text-rose-600 uppercase"
                      >
                        ÇIKIŞ YAP
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link href="/login" className="classic-btn-login flex items-center gap-1 px-3 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold transition-colors text-white uppercase whitespace-nowrap">
                  <LogIn size={13} />
                  Giriş Yap
                </Link>
                <Link href="/register" className="classic-btn-register hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-sm bg-sky-400 hover:bg-sky-300 text-slate-950 text-[11px] font-black transition-colors uppercase whitespace-nowrap">
                  <UserPlus size={13} />
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar - XenForo styled light bar (Desktop Only to save mobile screen height) */}
      <div className="hidden md:block bg-[#eef2f7] border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center h-[36px] overflow-x-auto no-scrollbar justify-between">
          <div className="flex items-center gap-4 lg:gap-6 text-xs font-bold text-slate-700 whitespace-nowrap py-1">
            <Link href="/" className="classic-subnav-link hover:text-[#0066a2] hover:underline transition-colors">Yeni Mesajlar</Link>
            <Link href="/search" className="classic-subnav-link hover:text-[#0066a2] hover:underline transition-colors flex items-center gap-1">
              <Search size={12} />
              Forumda Ara
            </Link>
            <Link href="/hesaplama" className="classic-subnav-link hover:text-[#0066a2] hover:underline transition-colors">Popüler Konular</Link>
            <Link href="/hesaplama" className="classic-subnav-link hover:text-[#0066a2] hover:underline transition-colors text-[#0066a2] font-extrabold">
              Hesaplama Araçları
            </Link>
            <Link href="/developers" className="classic-subnav-link hover:text-[#0066a2] hover:underline transition-colors text-slate-600">
              Geliştirici Portalı (API)
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay / Navigation menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 top-[48px] sm:top-[54px] bg-slate-900/60 backdrop-blur-xs z-40" 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="bg-white border-b border-slate-200 p-3.5 flex flex-col gap-3 max-h-[calc(100vh-50px)] overflow-y-auto animate-in slide-in-from-top-2 duration-150 text-slate-800 shadow-xl" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="flex items-center relative w-full">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Forumda ara..." 
                className="bg-slate-50 border border-slate-200 rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-[#185886] w-full placeholder:text-slate-400 text-slate-800"
              />
              <button type="submit" className="absolute right-2.5 text-slate-400 cursor-pointer" aria-label="Ara">
                <Search size={14} />
              </button>
            </form>

            {/* Mobile User Section if Logged In */}
            {user && profile && (
              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-sm">
                <div className="w-8 h-8 bg-[#eef2f7] rounded-full flex-shrink-0 border border-[#cbd5e1] flex items-center justify-center overflow-hidden">
                   {profile.avatar_url ? (
                     <img src={profile.avatar_url} alt={profile.username ? `${profile.username} profil resmi` : 'Kullanıcı profil resmi'} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-xs text-[#185886] font-bold uppercase">{profile.username?.substring(0, 2) || 'Ü'}</span>
                   )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-xs text-[#185886] truncate">@{profile.username}</div>
                  <div className="text-[10px] text-slate-500 font-bold">XP: {profile.xp || 0} • Seviye {profile.level || 1}</div>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-700">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-sm bg-slate-50 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Forumlar &amp; Başlıklar</span>
                <span className="text-[10px] text-slate-400">&rarr;</span>
              </Link>
              <Link 
                href="/hesaplama" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-sm bg-sky-50 text-[#0066a2] hover:bg-sky-100 flex items-center justify-between"
              >
                <span>Hesaplama Araçları (Balthazard / ÖTV / Haklar)</span>
                <span className="text-[10px] px-1 bg-[#185886] text-white rounded-xs font-extrabold">2026</span>
              </Link>
              <Link 
                href="/developers" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-sm bg-slate-50 hover:bg-slate-100 text-emerald-800 flex items-center justify-between"
              >
                <span>Geliştirici Portalı (OAuth 2.0 / REST API)</span>
                <span className="text-[10px] px-1 bg-emerald-600 text-white rounded-xs font-bold">API</span>
              </Link>
              <Link 
                href="/about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-sm bg-slate-50 hover:bg-slate-100"
              >
                Hakkımızda
              </Link>
              <Link 
                href="/help" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-sm bg-slate-50 hover:bg-slate-100"
              >
                Yardım / SSS
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAccessibilityOpen(true);
                }}
                className="p-2 rounded-sm bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 flex items-center justify-between font-bold text-left transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Accessibility size={14} className="text-indigo-600" />
                  <span>Erişilebilirlik Menüsü</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-600 text-white rounded-xs font-bold">AAA</span>
              </button>
              
              {profile && (profile.role === 'admin' || profile.role === 'moderator') && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-sm bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold flex items-center gap-2 border border-amber-200"
                >
                  <ShieldAlert size={14} />
                  Yönetim Paneli
                </Link>
              )}

              {user && profile && (
                <>
                  <div className="h-[1px] bg-slate-100 my-0.5"></div>
                  <Link 
                    href={`/profile/${profile.id || user.id}`} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-sm bg-slate-50 hover:bg-slate-100 text-[#185886]"
                  >
                    Profilim
                  </Link>
                  <Link 
                    href="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-sm bg-slate-50 hover:bg-slate-100"
                  >
                    Hesap Ayarları
                  </Link>
                  <Link 
                    href="/messages" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-sm bg-slate-50 hover:bg-slate-100"
                  >
                    Mesajlarım
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-sm bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs uppercase mt-0.5 cursor-pointer"
                  >
                    Çıkış Yap
                  </button>
                </>
              )}
            </div>
            
            {/* If unregistered user, show register in mobile drawer */}
            {!user && (
              <div className="flex gap-2 mt-1 border-t border-slate-100 pt-2.5">
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs uppercase"
                >
                  Giriş Yap
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-sm bg-[#185886] hover:bg-[#104f75] text-white font-black text-xs uppercase shadow-xs"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
