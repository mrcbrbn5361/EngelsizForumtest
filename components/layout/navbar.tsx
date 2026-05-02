'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, MessageSquare, Users, Info, LogIn, User, Search, Menu, X } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Accessible Navbar for EngelsizForum.
 */
export function Navbar() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md high-contrast:bg-background high-contrast:opacity-100" role="navigation" aria-label="Ana Navigasyon">
      <div className="container mx-auto flex min-h-16 items-center justify-between px-4 py-2">
        <Link 
          href="/" 
          className="flex items-center gap-2 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
          aria-label="EngelsizForum Ana Sayfa"
        >
          <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-primary text-primary-foreground rounded-2xl select-none shadow-[0_8px_16px_-4px_rgba(var(--primary-rgb),0.3)] transition-all group-hover:rotate-12 group-hover:scale-110" aria-hidden="true">
            <span className="text-xl md:text-2xl font-black">e</span>
          </div>
          <span className="select-none text-2xl md:text-3xl font-black tracking-tighter lowercase leading-none">
            engelsiz<span className="text-primary/30 group-hover:text-primary transition-colors">forum</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-1 sm:gap-4 lg:gap-6">
          <div className="hidden md:flex items-center gap-1 lg:gap-4">
            <NavLink href="/discussions" icon={<MessageSquare size={18} />} label="Tartışmalar" />
            <NavLink href="/communities" icon={<Users size={18} />} label="Topluluklar" />
            <NavLink href="/about" icon={<Info size={18} />} label="Hakkımızda" />
          </div>
          
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className="flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary transition-all outline-none focus:ring-2 focus:ring-primary"
              aria-label="Arama"
            >
              <Search size={22} strokeWidth={2.5} />
            </Link>

            {!loading && (
              user ? (
                <Link
                  href="/profile"
                  className="ml-1 sm:ml-2 flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 p-1 sm:px-4 sm:py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary shadow-sm group shrink-0"
                  aria-label="Profil Ayarları"
                >
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border border-primary/20 group-hover:border-white">
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
                      <User size={18} />
                    </div>
                  )}
                  <span className="hidden lg:inline">Profil Ayarları</span>
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="ml-1 sm:ml-2 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg"
                >
                  <LogIn size={20} />
                  <span className="hidden sm:inline">Giriş Yap</span>
                </Link>
              )
            )}
            
            {loading && (
              <div className="h-10 w-10 animate-pulse bg-muted rounded-full ml-2 border-2 border-muted"></div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="ml-2 flex md:hidden items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary transition-all outline-none focus:ring-2 focus:ring-primary"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Menüyü Kapat" : "Menüyü Aç"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
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
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              <MobileNavLink href="/" icon={<Home size={20} />} label="Ana Sayfa" onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/discussions" icon={<MessageSquare size={20} />} label="Tartışmalar" onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/communities" icon={<Users size={20} />} label="Topluluklar" onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/about" icon={<Info size={20} />} label="Hakkımızda" onClick={() => setIsOpen(false)} />
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
