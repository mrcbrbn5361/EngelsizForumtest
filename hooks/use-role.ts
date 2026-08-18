import { useAuth } from '@/components/providers/auth-provider';

export function useRole() {
  const { profile } = useAuth();

  return {
    isAdmin: profile?.role === 'admin',
    isModerator: profile?.role === 'moderator',
    isStaff: profile?.role === 'admin' || profile?.role === 'moderator',
    role: profile?.role || 'user',
  };
}
