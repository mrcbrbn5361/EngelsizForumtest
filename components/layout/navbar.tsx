'use client';
import { toast } from 'sonner';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, MessageSquare, Users, Info, LogIn, User, Search, Menu, X, AlertCircle, Shield, ChevronRight, Accessibility, Eye, Zap, Type, Contrast, MoveHorizontal, Target, RotateCcw } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md high-contrast:bg-background high-contrast:opacity-100" role="navigation" aria-label="Ana Navigasyon">
      <div className="bg-slate-900 border-b border-slate-800 px-2 sm:px-3 py-1.5 text-center text-[10px] sm:text-xs font-bold tracking-wider text-slate-200 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <span className="inline-flex items-center justify-center bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black animate-pulse shadow-sm">PROTOTİP & DEMO</span>
        <span className="text-slate-300 font-medium">Bu site EngelsizForum&apos;un prototip ve demo sürümüdür. Tüm modüller aktif ve çalışır durumdadır.</span>
      </div>
      <div className="w-full max-w-7xl mx-auto flex min-h-16 items-center justify-between px-4 sm:px-6 py-2">
        <Link 
          href="/" 
          className="flex items-center gap-2 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group shrink-0"
          aria-label="EngelsizForum Ana Sayfa"
        >
          <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-blue-600 text-white font-black rounded-2xl select-none shadow-xl shadow-blue-500/25 transition-all group-hover:rotate-6 group-hover:scale-105" aria-hidden="true" suppressHydrationWarning>
            <span className="text-xl md:text-2xl font-black" suppressHydrationWarning>E</span>
          </div>
          <span className="select-none text-xl md:text-2xl font-black tracking-tighter uppercase leading-none" suppressHydrationWarning>
            engelsiz<span className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 transition-colors" suppressHydrationWarning>forum</span>
          </span>
        </Link>

        {/* Desktop & Header Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/discussions" icon={<MessageSquare size={16} aria-hidden="true" />} label="TARTIŞMALAR" />
            <NavLink href="/communities" icon={<Users size={16} aria-hidden="true" />} label="TOPLULUKLAR" />
            <NavLink href="/webmcp" icon={<Zap size={16} aria-hidden="true" />} label="AI AGENTS & MCP" />
            <NavLink href="/about" icon={<Info size={16} aria-hidden="true" />} label="HAKKIMIZDA" />
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Accessibility Menu */}
            {mounted ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="hidden sm:flex items-center justify-center rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-primary transition-all outline-none focus:ring-4 focus:ring-primary/20"
                    aria-label="Erişilebilirlik Araçlarını Aç"
                  >
                    <Accessibility size={22} aria-hidden="true" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content 
                    className="z-[100] min-w-[280px] bg-background border border-border p-3 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200"
                    align="end"
                    sideOffset={8}
                  >
                  <DropdownMenu.Label className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border mb-2">
                    Erişilebilirlik Araçları
                  </DropdownMenu.Label>
                  
                  {/* Font Size */}
                  <div className="px-3 py-2 space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <Type size={14} className="text-primary" /> Metin Boyutu
                    </label>
                    <div className="flex gap-1.5">
                      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => updateSettings({ fontSize: size })}
                          className={cn(
                            "flex-1 rounded-lg py-1.5 text-[10px] font-black uppercase transition-all",
                            fontSize === size 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : "bg-muted hover:bg-accent text-muted-foreground"
                          )}
                          aria-pressed={fontSize === size}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <DropdownMenu.Separator className="h-px bg-border my-2" />

                  {/* Toggles */}
                  <div className="space-y-1">
                    <AccessibilityToggle 
                      icon={<Zap size={16} />} 
                      label="Biyonik Okuma" 
                      active={bionicReading} 
                      onClick={() => updateSettings({ bionicReading: !bionicReading })} 
                    />
                    <AccessibilityToggle 
                      icon={<Eye size={16} />} 
                      label="Yüksek Kontrast" 
                      active={highContrast} 
                      onClick={() => updateSettings({ highContrast: !highContrast })} 
                    />
                    <AccessibilityToggle 
                      icon={<Contrast size={16} />} 
                      label="Disleksi Fontu" 
                      active={dyslexicFont} 
                      onClick={() => updateSettings({ dyslexicFont: !dyslexicFont })} 
                    />
                    <AccessibilityToggle 
                      icon={<MoveHorizontal size={16} />} 
                      label="Hareketi Azalt" 
                      active={reducedMotion} 
                      onClick={() => updateSettings({ reducedMotion: !reducedMotion })} 
                    />
                    <AccessibilityToggle 
                      icon={<Target size={16} />} 
                      label="Odak Modu" 
                      active={focusMode} 
                      onClick={() => updateSettings({ focusMode: !focusMode })} 
                    />
                  </div>

                  <DropdownMenu.Separator className="h-px bg-border my-2" />

                  <div className="px-1 flex flex-col gap-1">
                    <button
                      onClick={resetSettings}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2 text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-colors"
                    >
                      <RotateCcw size={14} /> Varsayılana Dön
                    </button>

                    <DropdownMenu.Item asChild>
                      <Link 
                        href="/accessibility"
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground outline-none cursor-pointer transition-colors"
                      >
                        <Info size={14} />
                        Erişilebilirlik Raporu
                      </Link>
                    </DropdownMenu.Item>
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            ) : (
              <button
                className="hidden sm:flex items-center justify-center rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-primary transition-all outline-none"
                aria-label="Erişilebilirlik Araçlarını Aç"
              >
                <Accessibility size={22} aria-hidden="true" />
              </button>
            )}

            <Link
              href="/search"
              className="hidden sm:flex items-center justify-center rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-primary transition-all outline-none focus:ring-4 focus:ring-primary/20"
              aria-label="Arama sayfasına git"
            >
              <Search size={22} aria-hidden="true" />
            </Link>

            {!loading && (
              user ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <NotificationCenter />
                  {isStaff && (
                    <Link
                      href="/admin"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest animate-pulse border border-white/20 hover:scale-105 transition-transform"
                      aria-label={`${profile?.role} Paneline Git`}
                    >
                      <Shield size={12} aria-hidden="true" /> {profile?.role}
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-xl border border-border bg-card p-1 pr-1 sm:pr-3 text-xs md:text-sm font-bold text-foreground transition-all hover:border-primary focus:ring-4 focus:ring-primary/20 shadow-sm group shrink-0"
                    aria-label="Profilim ve Ayarlar"
                  >
                    <UserAvatar 
                      src={profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture}
                      username={profile?.username}
                      name={profile?.full_name || user.user_metadata?.full_name}
                      size="sm"
                    />
                    <span className="hidden sm:inline uppercase tracking-widest font-black">PROFİL</span>
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
                    className="hidden sm:flex items-center justify-center p-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    aria-label="Çıkış Yap"
                    title="Çıkış Yap"
                  >
                    <LogIn className="rotate-180" size={20} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="vibe-button-primary h-10 sm:h-12 px-4 sm:px-6 text-xs"
                  aria-label="Giriş yap veya Kayıt ol"
                >
                  <LogIn size={18} aria-hidden="true" className="mr-1 sm:mr-2" />
                  GİRİŞ
                </Link>
              )
            )}
            
            {loading && (
              <div className="h-8 w-8 animate-pulse bg-muted rounded-full ml-1" aria-hidden="true"></div>
            )}

            {/* Mobile Menu Toggle with Radix Dialog */}
            <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
              <Dialog.Trigger asChild>
                <button
                  className="flex md:hidden items-center justify-center rounded-xl p-2.5 bg-card hover:bg-primary hover:text-primary-foreground text-foreground border-2 border-border transition-all outline-none focus:ring-2 focus:ring-primary shrink-0 ml-1 shadow-sm active:scale-95"
                  aria-label={isOpen ? "Menüyü Kapat" : "Menüyü Aç"}
                  suppressHydrationWarning
                >
                  <Menu size={22} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm DialogOverlay" />
                <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm bg-background p-0 shadow-2xl focus:outline-none focus:ring-0 DialogContentRight border-l border-border flex flex-col">
                  <Dialog.Title className="sr-only">Navigasyon Menüsü</Dialog.Title>
                  <Dialog.Description className="sr-only">Forum sayfalarına hızlı erişim menüsü.</Dialog.Description>
                  
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 outline-none focus:ring-2 focus:ring-primary rounded-lg px-1 group">
                      <div className="flex items-center justify-center h-10 w-10 bg-primary text-primary-foreground rounded-xl font-black text-xl shadow-lg shadow-primary/20" suppressHydrationWarning>E</div>
                      <span className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none" suppressHydrationWarning>
                        engelsiz<span className="text-primary/80" suppressHydrationWarning>forum</span>
                      </span>
                    </Link>
                    <Dialog.Close asChild>
                      <button className="rounded-xl p-2.5 hover:bg-muted text-muted-foreground transition-all active:scale-90" aria-label="Menüyü Kapat">
                        <X size={22} />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <h4 className="vibe-label ml-4 mb-4">NAVİGASYON</h4>
                    <MobileNavLink href="/" icon={<Home size={20} />} label="ANA SAYFA" onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/search" icon={<Search size={20} />} label="ARAMA YAP" onClick={() => setIsOpen(false)} />

                    <div className="pt-6 mt-6 border-t border-border">
                      <h4 className="vibe-label ml-4 mb-4">PLATFORM</h4>
                      <MobileNavLink href="/discussions" icon={<MessageSquare size={20} />} label="TARTIŞMALAR" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/communities" icon={<Users size={20} />} label="TOPLULUKLAR" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/webmcp" icon={<Zap size={20} />} label="AI AGENTS & MCP" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/about" icon={<Info size={20} />} label="HAKKIMIZDA" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/help" icon={<AlertCircle size={20} />} label="YARDIM MERKEZİ" onClick={() => setIsOpen(false)} />
                    </div>

                    <div className="pt-6 mt-6 border-t border-border">
                      <h4 className="vibe-label ml-4 mb-4">GÜVENLİK</h4>
                      <MobileNavLink href="/security" icon={<Shield size={20} />} label="BİLGİ GÜVENLİĞİ" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/privacy" icon={<Shield size={20} />} label="GİZLİLİK POLİTİKASI" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/terms" icon={<Info size={20} />} label="KULLANIM ŞARTLARI" onClick={() => setIsOpen(false)} />
                      <MobileNavLink href="/accessibility" icon={<Info size={20} />} label="ERİŞİLEBİLİRLİK BEYANI" onClick={() => setIsOpen(false)} />
                    </div>
                    
                    <div className="pt-6 mt-6 border-t border-border">
                      <h4 className="vibe-label ml-4 mb-4">HESAP</h4>
                      {isStaff && (
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="mx-2 mb-2 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-between hover:bg-primary/20 active:scale-[0.98] transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary text-primary-foreground rounded-lg shadow-sm">
                              <Shield size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 text-primary/70">Admin Paneli</p>
                              <p className="text-xs font-bold uppercase tracking-tighter">{profile?.role}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} />
                        </Link>
                      )}
                      
                      {user ? (
                        <div className="px-2 pt-2">
                          <Link 
                            href="/profile" 
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors mb-2"
                          >
                            <UserAvatar 
                              src={profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture}
                              username={profile?.username}
                              name={profile?.full_name || user.user_metadata?.full_name}
                              size="md"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-bold truncate">{profile?.full_name || user.email}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Profilim</p>
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
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-destructive/5 px-4 py-4 text-sm font-black text-destructive hover:bg-destructive/10 transition-all active:scale-95 border border-destructive/10"
                          >
                            <LogIn className="rotate-180" size={18} /> Çıkış Yap
                          </button>
                        </div>
                      ) : (
                        <div className="px-2 pt-2">
                          <Link
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 active:scale-95 transition-all"
                          >
                            <LogIn size={18} /> Hemen Başla
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-border bg-muted/30">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      v1.4.0 • EngelsizForum
                    </p>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
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
        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-all outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary uppercase tracking-widest min-h-[44px]",
        isActive 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
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
        "flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-black transition-all active:scale-[0.98] outline-none min-h-[52px]",
        isActive 
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg shrink-0",
        isActive ? "bg-white/20 text-white" : "bg-muted text-primary"
      )}>
        {icon}
      </div>
      <span className="uppercase tracking-widest">{label}</span>
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
        "flex w-full items-center justify-between px-3 py-2 rounded-xl transition-colors outline-none",
        active ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-1.5 rounded-lg",
          active ? "bg-primary text-primary-foreground" : "bg-muted text-primary/60"
        )}>
          {icon}
        </div>
        <span className="text-xs font-bold">{label}</span>
      </div>
      <div className={cn(
        "h-4 w-8 rounded-full border border-border relative transition-colors",
        active ? "bg-primary" : "bg-muted"
      )}>
        <div className={cn(
          "absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform",
          active ? "translate-x-4" : "translate-x-0"
        )} />
      </div>
    </button>
  );
}
