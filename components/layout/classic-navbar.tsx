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
    <header className="w-full flex flex-col shadow-sm sticky top-0 z-50">
      {/* Primary Navigation Bar */}
      <div className="bg-[#0B0F19] text-white border-b border-white/[0.08]">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between h-[58px]">
          
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                closeAllDropdowns();
              }}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-sm focus:outline-none" 
              aria-label="Navigasyon Menüsü"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="text-xl font-black tracking-tight hover:text-sky-400 transition-colors shrink-0">
              ENGELSİZ<span className="text-sky-400 font-light">FORUM</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center h-full gap-1">
            <Link href="/" className="px-4 h-full flex items-center border-b-[3px] border-sky-400 bg-white/[0.04] font-bold text-sky-400 text-sm">
              Forumlar
            </Link>
            <Link href="/hesaplama" className="px-4 h-full flex items-center text-slate-300 hover:text-white hover:bg-white/[0.02] transition-all text-sm font-semibold">
              Hesaplamalar
            </Link>
            <Link href="/about" className="px-4 h-full flex items-center text-slate-300 hover:text-white hover:bg-white/[0.02] transition-all text-sm font-semibold">
              Hakkımızda
            </Link>
            <Link href="/help" className="px-4 h-full flex items-center text-slate-300 hover:text-white hover:bg-white/[0.02] transition-all text-sm font-semibold">
              Yardım / SSS
            </Link>
            {profile && (profile.role === 'admin' || profile.role === 'moderator') && (
              <Link href="/admin" className="px-4 h-full flex items-center text-amber-400 hover:text-amber-300 hover:bg-white/[0.02] transition-all text-sm font-extrabold uppercase tracking-wide gap-1 bg-amber-500/5 border-b-[3px] border-amber-500/40">
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
                className="bg-white/[0.06] border border-white/[0.08] rounded-sm px-3 py-1 text-xs focus:outline-none focus:bg-[#111726] focus:border-sky-500/50 transition-all w-[130px] lg:w-[180px] placeholder:text-slate-400 text-slate-200"
              />
              <button type="submit" className="absolute right-2 text-slate-400 hover:text-white" aria-label="Ara">
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
                className={`p-2 rounded-sm transition-colors focus:outline-none ${isAccessibilityOpen ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                aria-label="Erişilebilirlik Paneli"
                title="Erişilebilirlik Ayarları"
              >
                <Accessibility size={18} />
              </button>

              {/* Accessibility Dropdown menu */}
              {isAccessibilityOpen && (
                <div className="absolute right-0 mt-2 bg-[#111726] border border-white/[0.08] shadow-2xl rounded-sm w-[280px] p-4 text-slate-200 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <h3 className="text-xs font-black text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-white/[0.08] pb-1.5">
                    <Accessibility size={14} />
                    ERİŞİLEBİLİRLİK AYARLARI
                  </h3>
                  
                  <div className="flex flex-col gap-3 text-xs font-semibold">
                    {/* Contrast Mode */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-300">
                        <Eye size={14} className="text-sky-400" />
                        Yüksek Kontrast Modu
                      </span>
                      <button 
                        onClick={() => updateSettings({ highContrast: !highContrast })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${highContrast ? 'bg-emerald-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${highContrast ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Dyslexic Font */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-300">
                        <Type size={14} className="text-sky-400" />
                        Disleksi Dostu Yazı Tipi
                      </span>
                      <button 
                        onClick={() => updateSettings({ dyslexicFont: !dyslexicFont })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${dyslexicFont ? 'bg-emerald-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${dyslexicFont ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Bionic Reading */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-300">
                        <Sparkles size={14} className="text-sky-400" />
                        Biyonik Okuma (Bionic)
                      </span>
                      <button 
                        onClick={() => updateSettings({ bionicReading: !bionicReading })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${bionicReading ? 'bg-emerald-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${bionicReading ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Font Sizing Controls */}
                    <div className="border-t border-white/[0.08] pt-2.5 mt-1">
                      <span className="text-slate-400 block mb-2 text-[11px] uppercase tracking-wider font-bold">Yazı Boyutu Ayarı</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => updateSettings({ fontSize: size })}
                            className={`py-1 text-center border rounded-sm text-[11px] font-bold uppercase transition-all ${fontSize === size ? 'bg-sky-500 text-slate-950 border-sky-500 font-extrabold' : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.1]'}`}
                          >
                            {size === 'md' ? 'NORM' : size.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset button */}
                    <button 
                      onClick={resetSettings}
                      className="mt-2 text-center text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] py-1.5 rounded-sm transition-all"
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
                    className={`p-2 rounded-sm relative transition-colors focus:outline-none ${isNotificationsOpen ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'}`} 
                    aria-label="Bildirimler"
                  >
                    <Bell size={18} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B0F19]"></span>
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 bg-[#111726] border border-white/[0.08] shadow-2xl rounded-sm w-72 p-3 text-slate-200 z-50 animate-in fade-in duration-150">
                      <h4 className="text-xs font-black text-slate-100 border-b border-white/[0.08] pb-1.5 mb-2 uppercase tracking-wide">Bildirimler</h4>
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        <div className="text-xs text-slate-400 p-3 text-center italic bg-white/[0.02] border border-white/[0.04] rounded">
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
                    className="p-2 rounded-sm relative block transition-colors focus:outline-none text-slate-300 hover:text-white hover:bg-white/10"
                    aria-label="Özel Mesajlar"
                    title="Özel Mesajlar"
                  >
                    <Mail size={18} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-[#0B0F19]"></span>
                  </Link>
                </div>

                <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>

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
                    <div className="w-8 h-8 bg-slate-800 rounded-full flex-shrink-0 border border-white/20 flex items-center justify-center overflow-hidden">
                       {profile?.avatar_url ? (
                         <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-[11px] text-sky-400 font-bold uppercase">{profile?.username?.substring(0, 2) || 'Ü'}</span>
                       )}
                    </div>
                    <ChevronDown size={12} className="text-slate-400" />
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 bg-[#111726] text-slate-200 border border-white/[0.08] shadow-2xl rounded-sm w-48 overflow-hidden z-50 animate-in fade-in duration-150">
                      <div className="p-3 bg-white/[0.02] border-b border-white/[0.08]">
                        <span className="block text-xs text-slate-400">Giriş yapıldı</span>
                        <span className="block text-sm font-bold text-slate-100 truncate">{profile?.username || 'Üye'}</span>
                      </div>
                      <Link 
                        href={`/profile/${profile?.id || user?.id}`} 
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2.5 text-xs font-bold hover:bg-white/[0.04] border-b border-white/[0.04]"
                      >
                        PROFİLİM
                      </Link>
                      <Link 
                        href="/profile" 
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2.5 text-xs font-bold hover:bg-white/[0.04] border-b border-white/[0.04]"
                      >
                        HESAP AYARLARI
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-xs font-black hover:bg-red-500/10 text-red-400 uppercase"
                      >
                        ÇIKIŞ YAP
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link href="/login" className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-[11px] font-bold transition-colors text-slate-200 uppercase whitespace-nowrap">
                  <LogIn size={13} />
                  Giriş Yap
                </Link>
                <Link href="/register" className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-sm bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-black transition-colors uppercase whitespace-nowrap">
                  <UserPlus size={13} />
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar - FIXED 404 LINKS AND RESPONSIVENESS */}
      <div className="bg-[#111726] border-b border-white/[0.08]">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center h-[38px] overflow-x-auto no-scrollbar justify-between">
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-[13px] font-bold text-slate-300 whitespace-nowrap py-1">
            <Link href="/" className="hover:text-white hover:underline transition-colors">Yeni Mesajlar</Link>
            <Link href="/search" className="hover:text-white hover:underline transition-colors flex items-center gap-1">
              <Search size={12} />
              Forumda Ara
            </Link>
            <Link href="/hesaplama" className="hover:text-white hover:underline transition-colors">Popüler Konular</Link>
            <Link href="/hesaplama" className="hover:text-sky-300 hover:underline transition-colors text-sky-400 font-extrabold">
              Hesaplama Robotları
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay / Navigation menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[58px] bg-slate-950/80 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-[#111726] border-b border-white/[0.08] p-4 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="flex items-center relative w-full mb-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Forumda ara..." 
                className="bg-white/[0.06] border border-white/[0.08] rounded-sm px-3 py-2 text-sm focus:outline-none focus:bg-[#0B0F19] focus:border-sky-500 w-full placeholder:text-slate-400 text-slate-200"
              />
              <button type="submit" className="absolute right-3 text-slate-400" aria-label="Ara">
                <Search size={16} />
              </button>
            </form>

             {/* Mobile Navigation Links */}
             <div className="flex flex-col gap-3 text-sm font-bold text-slate-200">
               <Link 
                 href="/" 
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="p-2.5 rounded bg-white/[0.03] hover:bg-white/[0.08]"
               >
                 Forumlar
               </Link>
               <Link 
                 href="/hesaplama" 
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="p-2.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-sky-400"
               >
                 Hesaplama Robotları
               </Link>
               <Link 
                 href="/about" 
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="p-2.5 rounded bg-white/[0.03] hover:bg-white/[0.08]"
               >
                 Hakkımızda
               </Link>
               <Link 
                 href="/help" 
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="p-2.5 rounded bg-white/[0.03] hover:bg-white/[0.08]"
               >
                 Yardım / SSS
               </Link>
               {profile && (profile.role === 'admin' || profile.role === 'moderator') && (
                 <Link 
                   href="/admin" 
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="p-2.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-extrabold flex items-center gap-2 border border-amber-500/20"
                 >
                   <ShieldAlert size={15} />
                   Yönetim Paneli
                 </Link>
               )}
             </div>
            
            {/* If unregistered user, show register in mobile drawer */}
            {!user && (
              <div className="flex flex-col gap-2 mt-2 border-t border-white/[0.08] pt-3">
                <Link 
                  href="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded bg-sky-500 text-slate-950 font-black text-xs uppercase"
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
