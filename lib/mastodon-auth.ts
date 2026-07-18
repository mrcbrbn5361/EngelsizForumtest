import { NextRequest } from 'next/server';
import { supabaseServer } from './supabase-server';

export interface TokenPayload {
  userId: string;
  clientId: string;
  createdAt: number;
}

/**
 * Extracts and decodes the stateless Mastodon access token from the Authorization header.
 */
export function getPayloadFromRequest(req: NextRequest): TokenPayload | null {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token.startsWith('ef_token_')) {
    return null;
  }

  try {
    const rawToken = token.substring(9); // strip 'ef_token_'
    const cleanToken = rawToken.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = Buffer.from(cleanToken, 'base64').toString('utf8');
    const payload = JSON.parse(jsonStr) as TokenPayload;
    
    if (payload && payload.userId) {
      return payload;
    }
  } catch (e) {
    console.error('Error decoding mastodon auth token:', e);
  }

  return null;
}

/**
 * Verifies the request and returns the corresponding user profile from Supabase.
 */
export async function verifyMastodonRequest(req: NextRequest) {
  const payload = getPayloadFromRequest(req);
  if (!payload) {
    return null;
  }

  try {
    const { data: profile, error } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', payload.userId)
      .single();

    if (error || !profile) {
      console.warn('Mastodon auth: profile not found or error for ID:', payload.userId, error);
      return null;
    }

    return profile;
  } catch (err) {
    console.error('Exception in verifyMastodonRequest:', err);
    return null;
  }
}
