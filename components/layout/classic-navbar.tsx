'use client';

import Link from 'next/link';
import { Search, Bell, Mail, Menu, ChevronDown, Home, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ClassicNavbar() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="w-full flex flex-col shadow-sm">
      {/* Primary Navigation Bar */}
      <div className="bg-[#204060] text-white">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between h-[50px]">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button className="md:hidden p-1 hover:bg-white/10 rounded" aria-label="Menü">
              <Menu size={20} />
            </button>
            <Link href="/" className="text-xl font-bold tracking-tight hover:text-blue-100 transition-colors">
              ENGELSİZ<span className="font-light">FORUM</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center h-full">
            <Link href="/" className="px-4 h-full flex items-center bg-white/10 border-b-[3px] border-white font-semibold">
              Forumlar
            </Link>
            <Link href="/hesaplama" className="px-4 h-full flex items-center hover:bg-white/10 transition-colors">
              Hesaplamalar
            </Link>
            <Link href="/uyeler" className="px-4 h-full flex items-center hover:bg-white/10 transition-colors">
              Üyeler
            </Link>
            <Link href="/yardim" className="px-4 h-full flex items-center hover:bg-white/10 transition-colors">
              Yardım
            </Link>
          </nav>

          {/* User Controls / Search */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center relative">
              <input 
                type="text" 
                placeholder="Ara..." 
                className="bg-black/20 border border-white/20 rounded px-3 py-1 text-sm focus:outline-none focus:bg-white focus:text-slate-900 transition-all w-[150px] lg:w-[200px]"
              />
              <Search className="absolute right-2 text-white/50 pointer-events-none" size={14} />
            </div>
            
            {user ? (
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded relative" aria-label="Bildirimler">
                  <Bell size={18} />
                </button>
                <button className="p-2 hover:bg-white/10 rounded relative" aria-label="Mesajlar">
                  <Mail size={18} />
                </button>
                <div className="h-6 w-[1px] bg-white/20 mx-1 hidden sm:block"></div>
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 pl-2 hover:bg-white/10 rounded transition-colors group">
                    <div className="w-7 h-7 bg-slate-300 rounded-sm flex-shrink-0 border border-white/20 flex items-center justify-center overflow-hidden">
                       {profile?.avatar_url ? (
                         <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-[10px] text-slate-600 font-bold uppercase">{profile?.username?.substring(0, 2)}</span>
                       )}
                    </div>
                    <span className="text-sm font-medium hidden lg:block">{profile?.username || 'Üye'}</span>
                    <ChevronDown size={14} className="hidden lg:block opacity-60 group-hover:opacity-100" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50">
                    <div className="bg-white text-[#212529] border border-[#d8dee4] shadow-lg rounded-sm w-48 overflow-hidden">
                      <Link href={`/profile/${profile?.username}`} className="block px-4 py-2 text-sm hover:bg-[#eceff3]">Profil</Link>
                      <Link href="/account/settings" className="block px-4 py-2 text-sm hover:bg-[#eceff3]">Ayarlar</Link>
                      <hr className="border-[#d8dee4]" />
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 font-semibold"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors">
                  <LogIn size={14} />
                  Giriş Yap
                </Link>
                <Link href="/register" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18587a] hover:bg-[#124561] text-xs font-bold transition-colors">
                  <UserPlus size={14} />
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="bg-[#f4f6f8] border-b border-[#d8dee4]">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center h-[36px] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6 text-[13px] font-medium text-[#18587a] whitespace-nowrap">
            <Link href="/yeni-mesajlar" className="hover:underline">Yeni mesajlar</Link>
            <Link href="/konularda-ara" className="hover:underline">Forumda ara</Link>
            <Link href="/populer-konular" className="hover:underline">Popüler konular</Link>
            <Link href="/hesaplama" className="hover:underline font-bold text-[#204060]">Hesaplama Robotları</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
