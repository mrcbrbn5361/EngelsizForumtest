'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, MessageSquare, Users, Info, LogIn, User, Search, Menu, X, AlertCircle, Database, Shield } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Accessible Navbar for EngelsizForum.
 */
export function Navbar() {
  const { user, profile, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';

  const toggleMenu = () => setIsOpen(!isOpen);

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
            engelsiz<span className="text-primary/30 group-hover:text-primary transition-colors">forum</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/discussions" icon={<MessageSquare size={16} />} label="Tartışmalar" />
            <NavLink href="/communities" icon={<Users size={16} />} label="Topluluklar" />
            <NavLink href="/about" icon={<Info size={16} />} label="Hakkımızda" />
          </div>
          
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className="flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary transition-all outline-none focus:ring-2 focus:ring-primary"
              aria-label="Arama"
            >
              <Search size={20} />
            </Link>

            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  {isStaff && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest animate-pulse border border-white/20">
                      <Shield size={12} /> {profile?.role}
                    </div>
                  )}
                  <Link
                    href="/profile"
                    className="ml-1 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 p-1 px-2 md:px-3 md:py-1.5 text-xs md:text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary shadow-sm group shrink-0"
                    aria-label="Profil Ayarları"
                  >
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <div className="relative h-6 w-6 md:h-7 md:w-7 rounded-full overflow-hidden border border-primary/20 group-hover:border-white">
                      <Image 
                        src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                        alt="" 
                        fill
                        unoptimized
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full bg-primary/10">
                      <User size={14} />
                    </div>
                  )}
                  <span className="hidden sm:inline">Profil</span>
                </Link>
              </div>
              ) : (
                <Link
                  href="/auth"
                  className="ml-1 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs md:text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 focus:ring-2 focus:ring-primary shadow-md"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Giriş</span>
                </Link>
              )
            )}
            
            {loading && (
              <div className="h-8 w-8 animate-pulse bg-muted rounded-full ml-1 md:ml-2"></div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="ml-1 flex md:hidden items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary transition-all outline-none focus:ring-2 focus:ring-primary"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Menüyü Kapat" : "Menüyü Aç"}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden h-[calc(100vh-64px)] overflow-y-auto"
          >
            <div className="flex flex-col p-4 gap-2">
              <MobileNavLink href="/" icon={<Home size={20} />} label="Ana Sayfa" onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/discussions" icon={<MessageSquare size={20} />} label="Tartışmalar" onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/communities" icon={<Users size={20} />} label="Topluluklar" onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/about" icon={<Info size={20} />} label="Hakkımızda" onClick={() => setIsOpen(false)} />
              
              <div className="my-4 border-t border-border"></div>
              <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-4 mb-2">Hızlı Erişim</h4>
              {isStaff && (
                <div className="mx-4 mb-4 p-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={20} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Yetkili Paneli</p>
                      <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">{profile?.role}</p>
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                </div>
              )}
              <MobileNavLink href="/communities" icon={<AlertCircle size={20} />} label="Görme Engelliler" onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/communities" icon={<Database size={20} />} label="İşitme Engelliler" onClick={() => setIsOpen(false)} />
              
              {!user && (
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-base font-bold text-primary-foreground shadow-lg active:scale-95"
                >
                  <LogIn size={20} /> Hemen Başla
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-muted-foreground transition-all hover:bg-muted hover:text-primary outline-none focus:ring-2 focus:ring-primary uppercase tracking-widest"
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
