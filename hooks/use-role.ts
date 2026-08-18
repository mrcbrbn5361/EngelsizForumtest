import { useAuth } from '@/components/providers/auth-provider';
import { isStaff, isAdmin, isAccountActive } from '@/lib/permissions';

export function useRole() {
  const { profile } = useAuth();

  const role = profile?.role || 'user';
  const accountStatus = profile?.account_status || 'active';

  return {
    isFounder: role === 'founder',
    isOwner: role === 'owner',
    isAdmin: isAdmin(profile),
    isModerator: role === 'moderator',
    isStaff: isStaff(profile),
    isActive: isAccountActive(profile),
    isSuspended: accountStatus === 'suspended',
    isBanned: accountStatus === 'banned',
    accountStatus,
    role,
  };
}

