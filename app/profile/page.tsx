'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Loader2 } from 'lucide-react';

export default function ProfileRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(`/profile/${user.id}`);
      } else {
        router.replace('/auth');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
      <Loader2 className="animate-spin text-primary size-10" />
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">
        Profiliniz yükleniyor...
      </p>
    </div>
  );
}
