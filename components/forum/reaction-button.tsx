'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';

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
    if (!user) return;
    try {
      if (hasLiked) {
        // Unlike
        await supabase.from('reactions').delete().eq('topic_id', topicId).eq('user_id', user.id);
        setCount(prev => Math.max(0, prev - 1));
        setHasLiked(false);
      } else {
        // Like
        await supabase.from('reactions').insert({ topic_id: topicId, user_id: user.id, reaction_type: 'like' });
        setCount(prev => prev + 1);
        setHasLiked(true);
      }
    } catch (err) {
      console.error(err);
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
