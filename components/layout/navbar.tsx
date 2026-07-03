'use client';
import { toast } from 'sonner';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, MessageSquare, Users, Info, LogIn, User, Search, Menu, X, AlertCircle, Database, Shield, ChevronRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';

/**
 * Accessible Navbar for EngelsizForum.
 */
export function Navbar() {
  const { user, profile, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md high-contrast:bg-background high-contrast:opacity-100" role="navigation" aria-label="Ana Navigasyon">
      <div className="w-full max-w-7xl mx-auto flex min-h-16 items-center justify-between px-4 sm:px-6 py-2">
        <Link 
          href="/" 
          className="flex items-center gap-2 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group shrink-0"
          aria-label="EngelsizForum Ana Sayfa"
        >
          <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-primary text-primary-foreground rounded-2xl select-none shadow-xl shadow-primary/20 transition-all group-hover:rotate-6 group-hover:scale-105" aria-hidden="true" suppressHydrationWarning>
            <span className="text-xl md:text-2xl font-black" suppressHydrationWarning>E</span>
          </div>
          <span className="select-none text-xl md:text-2xl font-black tracking-tighter uppercase leading-none" suppressHydrationWarning>
            engelsiz<span className="text-primary/80 group-hover:text-primary transition-colors" suppressHydrationWarning>forum</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/discussions" icon={<MessageSquare size={16} aria-hidden="true" />} label="TARTIŞMALAR" />
            <NavLink href="/communities" icon={<Users size={16} aria-hidden="true" />} label="TOPLULUKLAR" />
            <NavLink href="/about" icon={<Info size={16} aria-hidden="true" />} label="HAKKIMIZDA" />
          </div>
          
          <div className="flex items-center gap-1 min-w-[32px] sm:min-w-[48px]">
            <Link
              href="/search"
              className="flex items-center justify-center rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-primary transition-all outline-none focus:ring-4 focus:ring-primary/20"
              aria-label="Arama sayfasına git"
            >
              <Search size={22} aria-hidden="true" />
            </Link>

            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
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
                    className="ml-1 flex items-center gap-3 rounded-xl border border-border bg-card p-1 pr-3 md:pr-4 text-xs md:text-sm font-bold text-foreground transition-all hover:border-primary focus:ring-4 focus:ring-primary/20 shadow-sm group shrink-0"
                    aria-label="Profilim ve Ayarlar"
                  >
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <div className="relative h-7 w-7 md:h-8 md:w-8 rounded-lg overflow-hidden border border-border group-hover:border-primary/30">
                      <Image 
                        src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                        alt="Profil resmim" 
                        fill
                        unoptimized
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <User size={16} aria-hidden="true" />
                    </div>
                  )}
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
                  className="hidden sm:flex ml-1 items-center justify-center p-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                  aria-label="Çıkış Yap"
                  title="Çıkış Yap"
                >
                  <LogIn className="rotate-180" size={20} />
                </button>
              </div>
              ) : (
                <Link
                  href="/auth"
                  className="vibe-button-primary h-12 px-6 text-xs"
                  aria-label="Giriş yap veya Kayıt ol"
                >
                  <LogIn size={18} aria-hidden="true" className="mr-2" />
                  GİRİŞ
                </Link>
              )
            )}
            
            {loading && (
              <div className="h-8 w-8 animate-pulse bg-muted rounded-full ml-1 md:ml-2" aria-hidden="true"></div>
            )}

            {/* Mobile Menu Toggle with Radix Dialog */}
            <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
              <Dialog.Trigger asChild>
                <button
                  className="ml-1 flex md:hidden items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary transition-all outline-none focus:ring-2 focus:ring-primary"
                  aria-label={isOpen ? "Menüyü Kapat" : "Menüyü Aç"}
                >
                  <Menu size={20} />
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
                            <div className="h-10 w-10 rounded-full border border-border overflow-hidden">
                              {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                                <Image 
                                  src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                                  alt="" 
                                  width={40} 
                                  height={40} 
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary">
                                  <User size={20} />
                                </div>
                              )}
                            </div>
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
                            href="/auth"
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
