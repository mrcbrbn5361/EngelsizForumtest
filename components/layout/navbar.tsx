'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Calculator,
  User,
  LogOut,
  Code2
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '@/components/providers/auth-provider';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { NotificationCenter } from '@/components/ui/notification-center';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';

/**
 * Accessible, Responsive Navbar for EngelsizForum.
 */
export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Başarıyla çıkış yapıldı.');
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
      toast.error('Çıkış yapılırken bir sorun oluştu.');
    }
  };

  return (
    <nav 
      id="main-navigation" 
      className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#090a0f]/95 backdrop-blur-md transition-colors" 
      role="navigation" 
      aria-label="Ana Navigasyon"
    >
      {/* Top Status & Announcement Bar */}
      <div 
        id="prototype-announcement-bar"
        className="bg-[#0b0f19] border-b border-white/[0.08] px-2.5 sm:px-4 py-1.5 text-center text-xs font-medium text-slate-300 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
      >
        <span className="inline-flex items-center justify-center bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold shrink-0">
          Rehber &amp; Topluluk
        </span>
        <span className="text-slate-300 text-[11px] sm:text-xs leading-snug">
          EngelsizForum DEMO SÜRÜMÜDÜR. Canlı veriler ve tüm modüller aktiftir.
        </span>
      </div>

      {/* Main Bar */}
      <div className="w-full max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between px-2.5 sm:px-6 py-2 gap-1.5 sm:gap-3">
        {/* Brand Logo */}
        <Link 
          href="/" 
          id="navbar-brand-logo"
          className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg p-0.5 group shrink min-w-0 transition-opacity hover:opacity-90 select-none"
          aria-label="EngelsizForum Ana Sayfa"
        >
          <div className="flex flex-col min-w-0 select-none pointer-events-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <span className="select-none text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-100 leading-none truncate">
              Engelsiz<span className="text-sky-400">Forum</span>
            </span>
            <span className="select-none text-[10px] font-medium tracking-wide text-slate-400 leading-tight mt-0.5 hidden md:inline">
              Erişilebilir Topluluk Platformu
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink href="/" icon={<Home size={15} />} label="Ana Sayfa" />
          <NavLink href="/discussions" icon={<MessageSquare size={15} />} label="Tartışmalar" />
          <NavLink href="/communities" icon={<Users size={15} />} label="Topluluklar" />
          <NavLink href="/hesaplama" icon={<Calculator size={15} />} label="Hesaplayıcılar" />
          <NavLink href="/about" icon={<Info size={15} />} label="Hakkımızda" />
        </div>

        {/* Right Header Action Items */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Accessibility Quick Menu */}
          {mounted && (
            <button
              id="accessibility-quick-menu-button"
              onClick={() => {
                const panel = document.getElementById("floating-accessibility-panel");
                if (!panel) {
                  // Panel is closed, trigger toggle button to open it
                  document.getElementById("floating-accessibility-toggle-btn")?.click();
                } else {
                  // Already open, scroll it into view and focus
                  panel.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center justify-center rounded-lg h-8.5 w-8.5 sm:h-9 sm:w-9 text-slate-300 hover:bg-[#161f33] hover:text-sky-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0 cursor-pointer"
              aria-label="Erişilebilirlik Araçlarını Aç"
              title="Erişilebilirlik Menüsü"
            >
              <Accessibility size={18} aria-hidden="true" className="sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Messages Icon-Only Button */}
          <Link
            href="/messages"
            id="navbar-messages-icon-link"
            className={cn(
              "flex items-center justify-center rounded-lg h-8.5 w-8.5 sm:h-9 sm:w-9 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0 cursor-pointer",
              pathname === '/messages' || pathname.startsWith('/messages/')
                ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                : "text-slate-300 hover:bg-[#161f33] hover:text-sky-400"
            )}
            aria-label="Mesajlar"
            title="Mesajlar"
          >
            <MessageSquare size={18} aria-hidden="true" className="sm:w-5 sm:h-5" />
          </Link>

          {/* Search Button */}
          <Link
            href="/search"
            id="navbar-search-link"
            className="flex items-center justify-center rounded-lg h-8.5 w-8.5 sm:h-9 sm:w-9 text-slate-300 hover:bg-[#161f33] hover:text-sky-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0"
            aria-label="Arama sayfasına git"
            title="Forumda Ara"
          >
            <Search size={18} aria-hidden="true" className="sm:w-5 sm:h-5" />
          </Link>

          {/* Auth State Controls */}
          {loading ? (
            <div className="h-8.5 w-8.5 sm:h-9 sm:w-9 animate-pulse bg-[#161f33] rounded-xl border border-white/[0.08]" aria-hidden="true" />
          ) : user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <NotificationCenter />

              {isStaff && (
                <Link
                  href="/admin"
                  id="navbar-admin-badge"
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold hover:bg-sky-500/20 transition-colors"
                  aria-label={`${profile?.role} Yönetim Paneline Git`}
                >
                  <Shield size={13} aria-hidden="true" />
                  <span className="capitalize">{profile?.role}</span>
                </Link>
              )}
              
              <Link
                href="/profile"
                id="navbar-user-profile-link"
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#111726] p-1 sm:px-2.5 sm:py-1 text-xs font-semibold text-slate-200 transition-colors hover:border-sky-500/40 shadow-xs shrink-0 h-8.5 sm:h-9 cursor-pointer"
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
                onClick={handleSignOut}
                id="navbar-logout-button"
                className="hidden sm:flex items-center justify-center h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-xl border border-white/[0.08] bg-[#111726] text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors shrink-0 cursor-pointer"
                aria-label="Oturumu Kapat"
                title="Oturumu Kapat"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              id="navbar-login-button"
              className="inline-flex items-center justify-center whitespace-nowrap shrink-0 h-8.5 sm:h-9 px-3 sm:px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-label="Giriş Yap veya Kayıt Ol"
            >
              <LogIn size={14} aria-hidden="true" className="mr-1.5 shrink-0" />
              <span className="whitespace-nowrap">Giriş Yap</span>
            </Link>
          )}

          {/* Hamburger Menu Button with Radix Dialog */}
          <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Trigger asChild>
              <button
                id="navbar-mobile-menu-trigger"
                className="flex items-center justify-center rounded-xl h-8.5 w-8.5 sm:h-9 sm:w-9 bg-[#111726] hover:bg-[#161f33] text-slate-200 border border-white/[0.08] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0 ml-0.5 cursor-pointer"
                aria-label={isOpen ? "Menüyü Kapat" : "Menüyü Aç"}
                title="Tüm Sayfalar ve Menü"
              >
                <Menu size={18} className="sm:w-5 sm:h-5" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity" />
              <Dialog.Content 
                id="navbar-mobile-drawer"
                className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm bg-[#0b0f19] p-0 shadow-2xl focus:outline-none border-l border-white/[0.08] flex flex-col text-slate-100 animate-in slide-in-from-right duration-200"
                onEscapeKeyDown={() => setIsOpen(false)}
              >
                <Dialog.Title className="sr-only">Navigasyon Menüsü</Dialog.Title>
                <Dialog.Description className="sr-only">Forum sayfalarına hızlı erişim menüsü.</Dialog.Description>
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08]">
                  <Link 
                    href="/" 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg group select-none"
                    aria-label="EngelsizForum Ana Sayfa"
                  >
                    <span className="text-lg font-black tracking-tight text-slate-100 uppercase leading-none">
                      engelsiz<span className="text-sky-400">forum</span>
                    </span>
                  </Link>
                  <Dialog.Close asChild>
                    <button 
                      className="rounded-xl p-2 hover:bg-[#161f33] text-slate-400 hover:text-slate-200 transition-colors h-9 w-9 flex items-center justify-center border border-white/[0.08] cursor-pointer" 
                      aria-label="Menüyü Kapat"
                    >
                      <X size={18} />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Drawer Content Body */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
                  {/* Primary Nav */}
                  <div>
                    <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Ana Menü
                    </h4>
                    <div className="space-y-1">
                      <MobileNavLink href="/" icon={<Home size={18} />} label="Ana Sayfa" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/discussions" icon={<MessageSquare size={18} />} label="Tartışmalar" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/messages" icon={<MessageSquare size={18} />} label="Mesajlar" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/communities" icon={<Users size={18} />} label="Topluluklar" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/hesaplama" icon={<Calculator size={18} />} label="Hak &amp; Maaş Hesaplama" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/webmcp" icon={<Zap size={18} />} label="AI Agents &amp; MCP" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/search" icon={<Search size={18} />} label="Detaylı Arama" onClick={() => setIsOpen(false)} />
                    </div>
                  </div>

                  {/* Information & Platform */}
                  <div className="pt-3 border-t border-white/[0.08]">
                    <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                  <div className="pt-3 border-t border-white/[0.08]">
                    <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Kullanıcı Hesabı
                    </h4>
                    {isStaff && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="mx-1 mb-2.5 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-between hover:bg-sky-500/20 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-sky-500 text-slate-950 rounded-lg shadow-xs">
                            <Shield size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Yönetim Paneli</p>
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
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-white/[0.08] bg-[#111726] hover:bg-[#161f33] transition-colors"
                        >
                          <UserAvatar 
                            src={profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture}
                            username={profile?.username}
                            name={profile?.full_name || user.user_metadata?.full_name}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-100 truncate">
                              {profile?.full_name || profile?.username || user.email}
                            </p>
                            <p className="text-xs text-slate-400">Profilimi ve Tercihlerimi Yönet</p>
                          </div>
                        </Link>

                        <Link 
                          href="/developers" 
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-white/[0.08] bg-[#111726] hover:bg-[#161f33] transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                            <Code2 size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-100">Geliştirici Portalı</p>
                            <p className="text-xs text-slate-400">OAuth 2.0 &amp; API Entegrasyonu</p>
                          </div>
                        </Link>

                        <button
                          onClick={async () => {
                            setIsOpen(false);
                            await handleSignOut();
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors border border-rose-500/20 px-3 py-2.5 text-xs font-bold min-h-[44px] cursor-pointer"
                        >
                          <LogOut size={16} /> Oturumu Kapat
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-xs transition-colors min-h-[44px]"
                        >
                          <LogIn size={16} /> Giriş Yap / Kayıt Ol
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Drawer Footer */}
                <div className="p-3.5 border-t border-white/[0.08] bg-[#090a0f] text-center">
                  <p className="text-[11px] font-semibold text-slate-400">
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
  const isActive = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
  
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2.5 lg:px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0",
        isActive 
          ? "bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30 shadow-xs" 
          : "text-slate-300 hover:bg-[#161f33] hover:text-white border border-transparent"
      )}
    >
      <span className={cn(isActive ? "text-sky-400" : "text-slate-400")}>
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
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors outline-none min-h-[44px]",
        isActive 
          ? "bg-sky-500/10 text-sky-400 font-bold border border-sky-500/30" 
          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-md shrink-0",
        isActive ? "bg-sky-500 text-slate-950" : "bg-slate-800 text-slate-400"
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
        "flex w-full items-center justify-between px-2.5 py-2 rounded-lg transition-colors outline-none cursor-pointer",
        active 
          ? "bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20" 
          : "hover:bg-slate-800/80 text-slate-300"
      )}
      aria-pressed={active}
    >
      <div className="flex items-center gap-2.5">
        <div className={cn(
          "p-1.5 rounded-md",
          active 
            ? "bg-sky-500 text-slate-950" 
            : "bg-slate-800 text-slate-400"
        )}>
          {icon}
        </div>
        <span className="text-xs">{label}</span>
      </div>
      <div className={cn(
        "h-4 w-7 rounded-full border relative transition-colors",
        active 
          ? "bg-sky-500 border-sky-500" 
          : "bg-slate-800 border-slate-700"
      )}>
        <div className={cn(
          "absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform",
          active ? "translate-x-3" : "translate-x-0"
        )} />
      </div>
    </button>
  );
}
