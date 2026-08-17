'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '@/components/providers/auth-provider';
import { UserAvatar } from '@/components/ui/user-avatar';
import { 
  User, 
  MessageSquare, 
  Settings, 
  Shield, 
  LogIn, 
  Sparkles, 
  Accessibility,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Dropdown user navigation component for header and navbar.
 */
export function UserNav() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="h-9 w-9 rounded-xl bg-[#161f33] animate-pulse border border-white/[0.08]" aria-hidden="true" />
    );
  }

  if (!user || !profile) {
    return (
      <Link
        href="/login"
        id="user-nav-login-btn"
        className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-xs transition-all active:scale-95"
      >
        <LogIn size={14} />
        <span>Giriş Yap</span>
      </Link>
    );
  }

  const isStaff = profile.role === 'admin' || profile.role === 'moderator';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Başarıyla çıkış yapıldı.');
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
      toast.error('Çıkış yapılırken bir hata oluştu.');
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          id="user-nav-trigger"
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#111726] p-1 sm:px-2.5 sm:py-1 text-xs font-semibold text-slate-200 transition-colors hover:border-sky-500/40 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer select-none"
          aria-label="Kullanıcı Menüsü"
        >
          <UserAvatar 
            src={profile.avatar_url}
            username={profile.username}
            name={profile.full_name}
            size="sm"
          />
          <span className="hidden md:inline font-bold max-w-[100px] truncate text-slate-200">
            {profile.full_name || profile.username}
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          id="user-nav-content"
          className="z-[100] min-w-[220px] bg-[#111726] border border-white/[0.08] p-1.5 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-100"
          align="end"
          sideOffset={8}
        >
          <div className="px-2.5 py-2 border-b border-white/[0.08] mb-1">
            <p className="text-xs font-bold text-slate-100 truncate">{profile.full_name || profile.username}</p>
            <p className="text-[11px] text-slate-400 truncate">@{profile.username}</p>
            {isStaff && (
              <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Shield size={10} /> {profile.role}
              </span>
            )}
          </div>

          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#161f33] hover:text-white outline-none cursor-pointer transition-colors"
            >
              <User size={14} className="text-sky-400" />
              <span>Profilim</span>
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/messages"
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#161f33] hover:text-white outline-none cursor-pointer transition-colors"
            >
              <MessageSquare size={14} className="text-sky-400" />
              <span>Özel Mesajlar</span>
            </Link>
          </DropdownMenu.Item>

          {isStaff && (
            <DropdownMenu.Item asChild>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-sky-400 hover:bg-sky-500/10 outline-none cursor-pointer transition-colors"
              >
                <Shield size={14} />
                <span>Yönetim Paneli</span>
              </Link>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator className="h-px bg-white/[0.08] my-1" />

          <DropdownMenu.Item
            onClick={handleSignOut}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 outline-none cursor-pointer transition-colors"
          >
            <LogOut size={14} />
            <span>Oturumu Kapat</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
