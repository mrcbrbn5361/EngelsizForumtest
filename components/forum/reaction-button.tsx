'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { toggleReactionAction } from '@/app/actions';
import { toast } from 'sonner';

export function ReactionButton({ topicId, initialCount }: { topicId: string, initialCount: number }) {
  const { user } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchReactions = async () => {
      // Get count
      const { count: reactionCount } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topicId);
      
      if (reactionCount !== null) setCount(reactionCount);

      // Check if user liked
      if (user) {
        const { data } = await supabase
          .from('reactions')
          .select('id')
          .eq('topic_id', topicId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) setHasLiked(true);
      }
    };

    fetchReactions();
  }, [topicId, user]);

  const handleReaction = async () => {
    if (!user) {
      toast.error('Beğenmek için giriş yapmalısınız.');
      return;
    }
    try {
      const result = await toggleReactionAction(topicId);
      if (!result.success) throw new Error(result.error || 'Beğeni işlemi başarısız.');
      const nextLiked = Boolean(result.reacted);
      setCount(prev => Math.max(0, prev + (nextLiked ? 1 : -1)));
      setHasLiked(nextLiked);
    } catch (err: any) {
      console.error('Reaction failed:', err);
      toast.error(err?.message || 'Beğeni işlemi başarısız.');
    }
  };

  return (
    <button 
      onClick={handleReaction} 
      className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-primary' : 'hover:text-primary text-muted-foreground'}`}
    >
      <Heart size={18} fill={hasLiked ? 'currentColor' : 'none'} />
      <span className="text-xs font-bold">{count}</span>
    </button>
  );
}
