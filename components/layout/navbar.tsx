'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Home, 
  MessageSquare, 
  Users, 
  Info, 
  LogIn, 
  Search, 
  Menu, 
  X, 
  AlertCircle, 
  Shield, 
  ChevronRight, 
  Accessibility, 
  Eye, 
  Zap, 
  Type, 
  Contrast, 
  MoveHorizontal, 
  Target, 
  RotateCcw,
  Calculator
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '@/components/providers/auth-provider';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { NotificationCenter } from '@/components/ui/notification-center';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';

/**
 * Accessible Navbar for EngelsizForum.
 */
export function Navbar() {
  const { user, profile, loading } = useAuth();
  const { 
    fontSize, 
    highContrast, 
    dyslexicFont, 
    reducedMotion, 
    bionicReading,
    focusMode,
    updateSettings, 
    resetSettings 
  } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';

  return (
    <nav 
      id="main-navigation" 
      className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors" 
      role="navigation" 
      aria-label="Ana Navigasyon"
    >
      {/* Top Status & Announcement Bar */}
      <div 
        id="prototype-announcement-bar"
        className="bg-slate-900 border-b border-slate-800 px-2.5 sm:px-4 py-1.5 text-center text-xs font-medium text-slate-300 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
      >
        <span className="inline-flex items-center justify-center bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold tracking-wide shrink-0">
          PROTOTİP &amp; DEMO
        </span>
        <span className="text-slate-300 text-[11px] sm:text-xs leading-snug">
          EngelsizForum canlı prototip sürümüdür. Tüm modüller ve araçlar aktiftir.
        </span>
      </div>

      {/* Main Bar */}
      <div className="w-full max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between px-2.5 sm:px-6 py-2 gap-1.5 sm:gap-3">
        {/* Brand Logo */}
        <Link 
          href="/" 
          id="navbar-brand-logo"
          className="flex items-center gap-1.5 sm:gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg p-0.5 group shrink-0 transition-opacity hover:opacity-90 min-w-0"
          aria-label="EngelsizForum Ana Sayfa"
        >
          <div 
            className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 font-black rounded-lg sm:rounded-xl select-none shadow-xs transition-transform group-hover:scale-105 shrink-0" 
            aria-hidden="true" 
            suppressHydrationWarning
          >
            <span className="text-base sm:text-lg font-black">E</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="select-none text-sm sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase leading-none truncate" suppressHydrationWarning>
              engelsiz<span className="text-sky-600 dark:text-sky-400">forum</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase leading-tight mt-0.5 hidden md:inline">
              Erişilebilir Topluluk
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink href="/discussions" icon={<MessageSquare size={16} aria-hidden="true" />} label="Tartışmalar" />
          <NavLink href="/communities" icon={<Users size={16} aria-hidden="true" />} label="Topluluklar" />
          <NavLink href="/hesaplama" icon={<Calculator size={16} aria-hidden="true" />} label="Hak &amp; Maaş Hesabı" />
          <NavLink href="/webmcp" icon={<Zap size={16} aria-hidden="true" />} label="AI Agents &amp; MCP" />
          <NavLink href="/about" icon={<Info size={16} aria-hidden="true" />} label="Hakkımızda" />
        </div>

        {/* Right Header Action Items */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Accessibility Quick Menu */}
          {mounted ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  id="accessibility-quick-menu-button"
                  className="flex items-center justify-center rounded-lg h-8.5 w-8.5 sm:h-9 sm:w-9 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0"
                  aria-label="Erişilebilirlik Araçlarını Aç"
                  title="Erişilebilirlik Menüsü"
                >
                  <Accessibility size={18} aria-hidden="true" className="sm:w-5 sm:h-5" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  id="accessibility-quick-menu-content"
                  className="z-[100] min-w-[280px] max-w-[92vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-150"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenu.Label className="px-2 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-2">
                    Erişilebilirlik Tercihleri
                  </DropdownMenu.Label>
                  
                  {/* Font Size Selector */}
                  <div className="px-2 py-2 space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Type size={14} className="text-sky-600 dark:text-sky-400" /> Metin Boyutu
                    </label>
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => updateSettings({ fontSize: size })}
                          className={cn(
                            "rounded-md py-1.5 text-xs font-bold uppercase transition-colors border",
                            fontSize === size 
                              ? "bg-sky-600 text-white border-sky-600 shadow-xs" 
                              : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                          )}
                          aria-pressed={fontSize === size}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <DropdownMenu.Separator className="h-px bg-slate-100 dark:border-slate-800 my-2" />

                  {/* Accessibility Toggles */}
                  <div className="space-y-1">
                    <AccessibilityToggle 
                      icon={<Zap size={15} />} 
                      label="Biyonik Okuma" 
                      active={bionicReading} 
                      onClick={() => updateSettings({ bionicReading: !bionicReading })} 
                    />
                    <AccessibilityToggle 
                      icon={<Eye size={15} />} 
                      label="Yüksek Kontrast" 
                      active={highContrast} 
                      onClick={() => updateSettings({ highContrast: !highContrast })} 
                    />
                    <AccessibilityToggle 
                      icon={<Contrast size={15} />} 
                      label="Disleksi Fontu" 
                      active={dyslexicFont} 
                      onClick={() => updateSettings({ dyslexicFont: !dyslexicFont })} 
                    />
                    <AccessibilityToggle 
                      icon={<MoveHorizontal size={15} />} 
                      label="Hareketi Azalt" 
                      active={reducedMotion} 
                      onClick={() => updateSettings({ reducedMotion: !reducedMotion })} 
                    />
                    <AccessibilityToggle 
                      icon={<Target size={15} />} 
                      label="Odak Modu" 
                      active={focusMode} 
                      onClick={() => updateSettings({ focusMode: !focusMode })} 
                    />
                  </div>

                  <DropdownMenu.Separator className="h-px bg-slate-100 dark:border-slate-800 my-2" />

                  <div className="px-1 pt-1 flex flex-col gap-1.5">
                    <button
                      onClick={resetSettings}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw size={13} /> Varsayılan Ayarlara Dön
                    </button>

                    <DropdownMenu.Item asChild>
                      <Link 
                        href="/accessibility"
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 outline-none cursor-pointer transition-colors"
                      >
                        <Info size={13} />
                        Erişilebilirlik Raporu &amp; Standartlar
                      </Link>
                    </DropdownMenu.Item>
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <button
              className="flex items-center justify-center rounded-lg h-8.5 w-8.5 sm:h-9 sm:w-9 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none shrink-0"
              aria-label="Erişilebilirlik Araçlarını Aç"
            >
              <Accessibility size={18} aria-hidden="true" className="sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Search Button */}
          <Link
            href="/search"
            id="navbar-search-link"
            className="flex items-center justify-center rounded-lg h-8.5 w-8.5 sm:h-9 sm:w-9 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0"
            aria-label="Arama sayfasına git"
            title="Forumda Ara"
          >
            <Search size={18} aria-hidden="true" className="sm:w-5 sm:h-5" />
          </Link>

          {/* Auth State Controls */}
          {!loading && (
            user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <NotificationCenter />
                {isStaff && (
                  <Link
                    href="/admin"
                    id="navbar-admin-badge"
                    className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/80 transition-colors"
                    aria-label={`${profile?.role} Yönetim Paneline Git`}
                  >
                    <Shield size={13} aria-hidden="true" />
                    <span className="capitalize">{profile?.role}</span>
                  </Link>
                )}
                
                <Link
                  href="/profile"
                  id="navbar-user-profile-link"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 sm:px-2.5 sm:py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors hover:border-sky-400 dark:hover:border-sky-600 shadow-xs shrink-0 h-8.5 sm:h-9"
                  aria-label="Profilim ve Hesap Ayarları"
                >
                  <UserAvatar 
                    src={profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture}
                    username={profile?.username}
                    name={profile?.full_name || user.user_metadata?.full_name}
                    size="sm"
                  />
                  <span className="hidden md:inline font-bold max-w-[90px] truncate">
                    {profile?.username || profile?.full_name || 'Profil'}
                  </span>
                </Link>

                <button
                  onClick={async () => {
                    try {
                      const { supabase } = await import('@/lib/supabase');
                      await supabase.auth.signOut();
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Error signing out:', error);
                      toast.error('Çıkış yapılırken bir hata oluştu.');
                    }
                  }}
                  id="navbar-logout-button"
                  className="hidden sm:flex items-center justify-center h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-lg text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0"
                  aria-label="Çıkış Yap"
                  title="Oturumu Kapat"
                >
                  <LogIn className="rotate-180" size={17} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                id="navbar-login-button"
                className="inline-flex items-center justify-center whitespace-nowrap shrink-0 h-8.5 sm:h-9 px-2.5 sm:px-3.5 rounded-lg bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
                aria-label="Giriş Yap veya Kayıt Ol"
              >
                <LogIn size={14} aria-hidden="true" className="mr-1 sm:mr-1.5 shrink-0" />
                <span className="whitespace-nowrap">Giriş Yap</span>
              </Link>
            )
          )}
          
          {loading && (
            <div className="h-8 w-8 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-full ml-0.5" aria-hidden="true" />
          )}

          {/* Mobile Menu Button with Radix Dialog */}
          <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Trigger asChild>
              <button
                id="navbar-mobile-menu-trigger"
                className="flex lg:hidden items-center justify-center rounded-lg h-8.5 w-8.5 sm:h-9 sm:w-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0 ml-0.5"
                aria-label={isOpen ? "Menüyü Kapat" : "Menüyü Aç"}
                suppressHydrationWarning
              >
                <Menu size={18} className="sm:w-5 sm:h-5" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm DialogOverlay" />
              <Dialog.Content 
                id="navbar-mobile-drawer"
                className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm bg-white dark:bg-slate-900 p-0 shadow-2xl focus:outline-none focus:ring-0 DialogContentRight border-l border-slate-200 dark:border-slate-800 flex flex-col"
              >
                <Dialog.Title className="sr-only">Navigasyon Menüsü</Dialog.Title>
                <Dialog.Description className="sr-only">Forum sayfalarına hızlı erişim menüsü.</Dialog.Description>
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
                  <Link 
                    href="/" 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg group"
                  >
                    <div className="flex items-center justify-center h-8 w-8 bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 rounded-lg font-black text-base shadow-xs" suppressHydrationWarning>
                      E
                    </div>
                    <span className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase leading-none" suppressHydrationWarning>
                      engelsiz<span className="text-sky-600 dark:text-sky-400">forum</span>
                    </span>
                  </Link>
                  <Dialog.Close asChild>
                    <button 
                      className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors h-9 w-9 flex items-center justify-center" 
                      aria-label="Menüyü Kapat"
                    >
                      <X size={20} />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Drawer Content Body */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
                  {/* Primary Nav */}
                  <div>
                    <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Ana Menü
                    </h4>
                    <div className="space-y-1">
                      <MobileNavLink href="/" icon={<Home size={18} />} label="Ana Sayfa" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/discussions" icon={<MessageSquare size={18} />} label="Tartışmalar" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/communities" icon={<Users size={18} />} label="Topluluklar" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/hesaplama" icon={<Calculator size={18} />} label="Hak &amp; Maaş Hesaplama" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/webmcp" icon={<Zap size={18} />} label="AI Agents &amp; MCP" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/search" icon={<Search size={18} />} label="Detaylı Arama" onClick={() => setIsOpen(false)} />
                    </div>
                  </div>

                  {/* Information & Platform */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Bilgi &amp; Destek
                    </h4>
                    <div className="space-y-1">
                      <MobileNavLink href="/about" icon={<Info size={18} />} label="Hakkımızda" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/help" icon={<AlertCircle size={18} />} label="Yardım &amp; Rehber" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/accessibility" icon={<Accessibility size={18} />} label="Erişilebilirlik Beyanı" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/security" icon={<Shield size={18} />} label="Güvenlik Politikası" onClick={() => setIsOpen(false)} />
                    </div>
                  </div>

                  {/* Account Section */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Kullanıcı Hesabı
                    </h4>
                    {isStaff && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="mx-1 mb-2.5 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 flex items-center justify-between hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-sky-600 text-white rounded-lg shadow-xs">
                            <Shield size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Yönetim Paneli</p>
                            <p className="text-xs font-semibold capitalize">{profile?.role}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} />
                      </Link>
                    )}
                    
                    {user ? (
                      <div className="space-y-2">
                        <Link 
                          href="/profile" 
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <UserAvatar 
                            src={profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture}
                            username={profile?.username}
                            name={profile?.full_name || user.user_metadata?.full_name}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                              {profile?.full_name || profile?.username || user.email}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Profilimi Yönet</p>
                          </div>
                        </Link>

                        <button
                          onClick={async () => {
                            try {
                              const { supabase } = await import('@/lib/supabase');
                              await supabase.auth.signOut();
                              window.location.href = '/';
                            } catch (error) {
                              console.error('Error signing out:', error);
                              toast.error('Çıkış yapılırken bir hata oluştu.');
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 px-3 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors border border-rose-200 dark:border-rose-900/40 min-h-[44px]"
                        >
                          <LogIn className="rotate-180" size={16} /> Oturumu Kapat
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 px-4 py-3 text-sm font-bold text-white dark:text-slate-950 shadow-xs transition-colors min-h-[44px]"
                        >
                          <LogIn size={16} /> Giriş Yap / Kayıt Ol
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Drawer Footer */}
                <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-center">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    EngelsizForum • v1.4.0
                  </p>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[40px]",
        isActive 
          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800" 
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
      )}
    >
      <span className={cn(isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500")}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function MobileNavLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors outline-none min-h-[44px]",
        isActive 
          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800" 
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-md shrink-0",
        isActive ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
      )}>
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
}

function AccessibilityToggle({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex w-full items-center justify-between px-2.5 py-2 rounded-lg transition-colors outline-none",
        active 
          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold" 
          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className={cn(
          "p-1.5 rounded-md",
          active 
            ? "bg-indigo-600 text-white" 
            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
        )}>
          {icon}
        </div>
        <span className="text-xs">{label}</span>
      </div>
      <div className={cn(
        "h-4 w-7 rounded-full border relative transition-colors",
        active 
          ? "bg-indigo-600 border-indigo-600" 
          : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
      )}>
        <div className={cn(
          "absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform",
          active ? "translate-x-3" : "translate-x-0"
        )} />
      </div>
    </button>
  );
}
