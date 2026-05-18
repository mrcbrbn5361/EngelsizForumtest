'use client';

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
          <div className="flex items-center justify-center h-9 w-9 md:h-11 md:w-11 bg-primary text-primary-foreground rounded-xl md:rounded-2xl select-none shadow-md transition-all group-hover:rotate-6 group-hover:scale-105" aria-hidden="true">
            <span className="text-lg md:text-xl font-black">e</span>
          </div>
          <span className="select-none text-xl md:text-2xl font-black tracking-tighter lowercase leading-none">
            engelsiz<span className="text-primary/80 group-hover:text-primary transition-colors">forum</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/discussions" icon={<MessageSquare size={16} />} label="Tartışmalar" />
            <NavLink href="/communities" icon={<Users size={16} />} label="Topluluklar" />
            <NavLink href="/about" icon={<Info size={16} />} label="Hakkımızda" />
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
                  <span className="hidden sm:inline">Profil</span>
                </Link>
                <button
                  onClick={async () => {
                    const { supabase } = await import('@/lib/supabase');
                    await supabase.auth.signOut();
                    window.location.href = '/';
                  }}
                  className="hidden sm:flex ml-1 items-center justify-center p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                  aria-label="Çıkış Yap"
                  title="Çıkış Yap"
                >
                  <LogIn className="rotate-180" size={18} />
                </button>
              </div>
              ) : (
                <Link
                  href="/auth"
                  className="ml-1 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs md:text-sm font-black text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 focus:ring-4 focus:ring-primary/20 shadow-md uppercase tracking-wider"
                  aria-label="Giriş yap veya Kayıt ol"
                >
                  <LogIn size={18} aria-hidden="true" />
                  <span>Giriş</span>
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
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[80vw] max-w-sm bg-background p-6 shadow-2xl focus:outline-none focus:ring-0">
                  <Dialog.Title className="sr-only">Navigasyon Menüsü</Dialog.Title>
                  <Dialog.Description className="sr-only">Forum sayfalarına hızlı erişim menüsü.</Dialog.Description>
                  <div className="flex items-center justify-between mb-8">
                    <Link href="/" onClick={() => setIsOpen(false)} className="text-xl font-black tracking-tighter">
                      engelsiz<span className="text-primary">forum</span>
                    </Link>
                    <Dialog.Close asChild>
                      <button className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="Kapat">
                        <X size={20} />
                      </button>
                    </Dialog.Close>
                  </div>
                  <div className="flex flex-col gap-2">
                    <MobileNavLink href="/" icon={<Home size={20} />} label="Ana Sayfa" onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/discussions" icon={<MessageSquare size={20} />} label="Tartışmalar" onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/communities" icon={<Users size={20} />} label="Topluluklar" onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/about" icon={<Info size={20} />} label="Hakkımızda" onClick={() => setIsOpen(false)} />
                    
                    <div className="my-4 border-t border-border"></div>
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-4 mb-2">Hızlı Erişim</h4>
                    {isStaff && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="mx-4 mb-4 p-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-between hover:opacity-90 active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Shield size={20} />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Yetkili Paneli</p>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">{profile?.role}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} />
                      </Link>
                    )}
                    <MobileNavLink href="/search" icon={<Search size={20} />} label="Arama Yap" onClick={() => setIsOpen(false)} />
                    
                    {!user && (
                      <Link
                        href="/auth"
                        onClick={() => setIsOpen(false)}
                        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-base font-bold text-primary-foreground shadow-lg active:scale-95"
                      >
                        <LogIn size={20} /> Hemen Başla
                      </Link>
                    )}
                    {user && (
                      <button
                        onClick={async () => {
                          const { supabase } = await import('@/lib/supabase');
                          await supabase.auth.signOut();
                          window.location.href = '/';
                        }}
                        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-destructive/10 px-4 py-4 text-base font-bold text-destructive hover:bg-destructive/20 transition-all active:scale-95"
                      >
                        <LogIn className="rotate-180" size={20} /> Çıkış Yap
                      </button>
                    )}
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
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-4 rounded-xl px-4 py-4 text-base font-bold text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary focus:ring-2 focus:ring-primary active:scale-95"
    >
      <div className="p-2 bg-muted rounded-lg text-primary">{icon}</div>
      {label}
    </Link>
  );
}
