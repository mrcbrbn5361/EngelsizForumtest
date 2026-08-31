'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { supabase } from '@/lib/supabase';

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
    <header className="w-full flex flex-col shadow-md sticky top-0 z-50">
      {/* Primary Navigation Bar */}
      <div className="bg-[#185886] text-white border-b border-[#104f75]">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between h-[58px]">
          
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                closeAllDropdowns();
              }}
              className="md:hidden p-2 text-sky-100 hover:text-white hover:bg-white/10 rounded-sm focus:outline-none" 
              aria-label="Navigasyon Menüsü"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="text-xl font-black tracking-tight hover:text-sky-200 transition-colors shrink-0">
              ENGELSİZ<span className="text-sky-300 font-light">FORUM</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center h-full gap-1">
            <Link href="/" className="px-4 h-full flex items-center border-b-[3px] border-sky-300 bg-white/10 font-bold text-white text-sm">
              Forumlar
            </Link>
            <Link href="/hesaplama" className="px-4 h-full flex items-center text-sky-100 hover:text-white hover:bg-white/[0.05] transition-all text-sm font-semibold">
              Hesaplamalar
            </Link>
            <Link href="/about" className="px-4 h-full flex items-center text-sky-100 hover:text-white hover:bg-white/[0.05] transition-all text-sm font-semibold">
              Hakkımızda
            </Link>
            <Link href="/help" className="px-4 h-full flex items-center text-sky-100 hover:text-white hover:bg-white/[0.05] transition-all text-sm font-semibold">
              Yardım / SSS
            </Link>
            {profile && (profile.role === 'admin' || profile.role === 'moderator') && (
              <Link href="/admin" className="px-4 h-full flex items-center text-amber-200 hover:text-white hover:bg-white/[0.05] transition-all text-sm font-extrabold uppercase tracking-wide gap-1 bg-amber-500/10 border-b-[3px] border-amber-400">
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
                className="bg-sky-950/40 border border-sky-400/20 rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:bg-sky-950/60 focus:border-sky-300 transition-all w-[130px] lg:w-[180px] placeholder:text-sky-200 text-white"
              />
              <button type="submit" className="absolute right-2 text-sky-200 hover:text-white" aria-label="Ara">
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
                className={`p-2 rounded-sm transition-colors focus:outline-none ${isAccessibilityOpen ? 'bg-sky-400 text-slate-950 font-bold' : 'text-sky-100 hover:text-white hover:bg-white/10'}`}
                aria-label="Erişilebilirlik Paneli"
                title="Erişilebilirlik Ayarları"
              >
                <Accessibility size={18} />
              </button>

              {/* Accessibility Dropdown menu */}
              {isAccessibilityOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-sm w-[280px] p-4 text-slate-800 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <h3 className="text-xs font-black text-[#185886] uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
                    <Accessibility size={14} />
                    ERİŞİLEBİLİRLİK AYARLARI
                  </h3>
                  
                  <div className="flex flex-col gap-3 text-xs font-semibold">
                    {/* Contrast Mode */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Eye size={14} className="text-[#185886]" />
                        Yüksek Kontrast Modu
                      </span>
                      <button 
                        onClick={() => updateSettings({ highContrast: !highContrast })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${highContrast ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${highContrast ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Dyslexic Font */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Type size={14} className="text-[#185886]" />
                        Disleksi Dostu Yazı Tipi
                      </span>
                      <button 
                        onClick={() => updateSettings({ dyslexicFont: !dyslexicFont })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${dyslexicFont ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${dyslexicFont ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Bionic Reading */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Sparkles size={14} className="text-[#185886]" />
                        Biyonik Okuma (Bionic)
                      </span>
                      <button 
                        onClick={() => updateSettings({ bionicReading: !bionicReading })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${bionicReading ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${bionicReading ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Font Sizing Controls */}
                    <div className="border-t border-slate-100 pt-2.5 mt-1">
                      <span className="text-slate-500 block mb-2 text-[11px] uppercase tracking-wider font-bold">Yazı Boyutu Ayarı</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => updateSettings({ fontSize: size })}
                            className={`py-1 text-center border rounded-sm text-[11px] font-bold uppercase transition-all ${fontSize === size ? 'bg-[#185886] text-white border-[#185886] font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                          >
                            {size === 'md' ? 'NORM' : size.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset button */}
                    <button 
                      onClick={resetSettings}
                      className="mt-2 text-center text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1.5 rounded-sm transition-all"
                    >
                      Ayarları Sıfırla
                    </button>
                  </div>
                </div>
              )}
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
                    className="p-2 rounded-sm relative block transition-colors focus:outline-none text-sky-100 hover:text-white hover:bg-white/10"
                    aria-label="Özel Mesajlar"
                    title="Özel Mesajlar"
                  >
                    <Mail size={18} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-sky-300 rounded-full border-2 border-[#185886]"></span>
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
                         <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
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
                        href={`/profile/${profile?.username || profile?.id || user?.id}`} 
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
                <Link href="/login" className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold transition-colors text-white uppercase whitespace-nowrap">
                  <LogIn size={13} />
                  Giriş Yap
                </Link>
                <Link href="/register" className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-sm bg-sky-400 hover:bg-sky-300 text-slate-950 text-[11px] font-black transition-colors uppercase whitespace-nowrap">
                  <UserPlus size={13} />
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar - XenForo styled light bar */}
      <div className="bg-[#eef2f7] border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center h-[38px] overflow-x-auto no-scrollbar justify-between">
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-[13px] font-bold text-slate-700 whitespace-nowrap py-1">
            <Link href="/" className="hover:text-[#0066a2] hover:underline transition-colors">Yeni Mesajlar</Link>
            <Link href="/search" className="hover:text-[#0066a2] hover:underline transition-colors flex items-center gap-1">
              <Search size={12} />
              Forumda Ara
            </Link>
            <Link href="/hesaplama" className="hover:text-[#0066a2] hover:underline transition-colors">Popüler Konular</Link>
            <Link href="/hesaplama" className="hover:text-[#0066a2] hover:underline transition-colors text-[#0066a2] font-extrabold">
              Hesaplama Robotları
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay / Navigation menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[58px] bg-slate-900/60 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white border-b border-slate-200 p-4 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200 text-slate-800" onClick={(e) => e.stopPropagation()}>
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="flex items-center relative w-full mb-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Forumda ara..." 
                className="bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:bg-white focus:border-[#185886] w-full placeholder:text-slate-400 text-slate-800"
              />
              <button type="submit" className="absolute right-3 text-slate-400" aria-label="Ara">
                <Search size={16} />
              </button>
            </form>

            {/* Mobile User Section if Logged In */}
            {user && profile && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-sm mb-1">
                <div className="w-10 h-10 bg-[#eef2f7] rounded-full flex-shrink-0 border border-[#cbd5e1] flex items-center justify-center overflow-hidden">
                   {profile.avatar_url ? (
                     <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-xs text-[#185886] font-bold uppercase">{profile.username?.substring(0, 2) || 'Ü'}</span>
                   )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-sm text-[#185886] truncate">@{profile.username}</div>
                  <div className="text-[11px] text-slate-500 font-bold">XP: {profile.xp || 0} • Seviye {profile.level || 1}</div>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-2.5 text-sm font-bold text-slate-700">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded bg-slate-50 hover:bg-slate-100"
              >
                Forumlar
              </Link>
              <Link 
                href="/hesaplama" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded bg-slate-50 hover:bg-slate-100 text-[#0066a2]"
              >
                Hesaplama Robotları
              </Link>
              <Link 
                href="/about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded bg-slate-50 hover:bg-slate-100"
              >
                Hakkımızda
              </Link>
              <Link 
                href="/help" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded bg-slate-50 hover:bg-slate-100"
              >
                Yardım / SSS
              </Link>
              
              {profile && (profile.role === 'admin' || profile.role === 'moderator') && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold flex items-center gap-2 border border-amber-200"
                >
                  <ShieldAlert size={15} />
                  Yönetim Paneli (Özel Sekme)
                </Link>
              )}

              {user && profile && (
                <>
                  <div className="h-[1px] bg-slate-100 my-1"></div>
                  <Link 
                    href={`/profile/${profile.username || profile.id || user.id}`} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded bg-slate-50 hover:bg-slate-100 text-[#185886]"
                  >
                    Profilim
                  </Link>
                  <Link 
                    href="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded bg-slate-50 hover:bg-slate-100"
                  >
                    Hesap Ayarları
                  </Link>
                  <Link 
                    href="/messages" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded bg-slate-50 hover:bg-slate-100"
                  >
                    Mesajlarım
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm uppercase mt-1"
                  >
                    Çıkış Yap
                  </button>
                </>
              )}
            </div>
            
            {/* If unregistered user, show register in mobile drawer */}
            {!user && (
              <div className="flex flex-col gap-2 mt-2 border-t border-slate-100 pt-3">
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs uppercase"
                >
                  Giriş Yap
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded bg-[#185886] hover:bg-[#104f75] text-white font-black text-xs uppercase"
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

// Typo fix support helper
function setIsMobileMenuOpenOpen(val: boolean) {}
