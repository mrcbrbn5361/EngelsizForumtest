'use client';
import { Flag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';

export function ReportButton({ topicId }: { topicId: string }) {
  const { user } = useAuth();

  const handleReport = async () => {
    if (!user) return;
    const reason = prompt('Neden bildirmek istiyorsunuz?');
    if (!reason) return;
    try {
      await supabase.from('reports').insert({ topic_id: topicId, reporter_id: user.id, reason });
      alert('Rapor başarıyla gönderildi.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={handleReport} className="text-muted-foreground hover:text-red-500">
      <Flag size={18} />
    </button>
  );
}
