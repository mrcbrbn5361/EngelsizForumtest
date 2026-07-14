'use client';
import { toast } from 'sonner';
import { Flag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';

export function ReportButton({ topicId, commentId }: { topicId?: string; commentId?: string }) {
  const { user } = useAuth();

  const handleReport = async () => {
    if (!user) {
      toast.error('Raporlamak için giriş yapmalısınız.');
      return;
    }
    const reason = window.prompt('Neden bildirmek istiyorsunuz? (Spam, Hakaret, Uygunsuz İçerik vb.)');
    if (!reason || reason.trim().length < 3) return;
    
    try {
      const { error } = await supabase.from('reports').insert({ 
        topic_id: topicId || null, 
        comment_id: commentId || null,
        reporter_id: user.id, 
        reason: reason.trim() 
      });
      
      if (error) throw error;
      toast.success('Rapor başarıyla gönderildi. İncelemeye alınacaktır.');
    } catch (err: any) {
      toast.error('Rapor gönderilemedi: ' + err.message);
    }
  };

  return (
    <button 
      onClick={handleReport} 
      className="text-muted-foreground hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-all group/report"
      title="Bildir"
    >
      <Flag size={18} className="group-hover/report:scale-110 transition-transform" />
    </button>
  );
}
