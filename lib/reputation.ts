import { supabaseServer } from './supabase-server';

export const ACTIONS = {
  CREATE_TOPIC: 50,
  CREATE_COMMENT: 15,
  GIVE_REACTION: 2,
  RECEIVE_REACTION: 5,
  TOPIC_SOLVED: 100,
};

export async function awardXP(userId: string, actionPoints: number) {
  if (!userId) return null;

  try {
    // Get current XP and Level
    const { data: profile, error: fetchError } = await supabaseServer
      .from('profiles')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Error fetching profile for XP award:', fetchError);
      return null;
    }

    const currentXP = profile.xp || 0;
    const currentLevel = profile.level || 1;
    const newXP = currentXP + actionPoints;
    
    // Simple level logic: level = floor(sqrt(xp / 100)) + 1
    // Level 1: 0-99 XP
    // Level 2: 100-399 XP
    // Level 3: 400-899 XP
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;

    const { data: updatedProfile, error: updateError } = await supabaseServer
      .from('profiles')
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile XP:', updateError);
      return null;
    }

    return {
      xpGained: actionPoints,
      totalXP: newXP,
      levelUp: newLevel > currentLevel,
      newLevel
    };
  } catch (error) {
    console.error('awardXP failed:', error);
    return null;
  }
}
