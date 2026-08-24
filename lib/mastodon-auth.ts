import { NextRequest } from 'next/server';
import { supabaseServer } from './supabase-server';
import crypto from 'crypto';

export interface TokenPayload {
  userId: string;
  clientId: string;
  createdAt: number;
  expiresAt: number;
  scope: string;
}

const getSecret = () => {
  const secret = process.env.MASTODON_TOKEN_SECRET;
  if (!secret) {
    throw new Error('MASTODON_TOKEN_SECRET environment variable is required (fail-closed)');
  }
  return secret;
};

/**
 * Extracts and cryptographically verifies the stateless Mastodon access token from the Authorization header.
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
    const raw = token.substring(9); // strip 'ef_token_'
    const parts = raw.split('.');
    if (parts.length !== 2) {
      // Reject old unsigned tokens
      return null;
    }

    const [payloadB64, signatureB64] = parts;
    if (!payloadB64 || !signatureB64) {
      return null;
    }

    const secret = getSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadB64)
      .digest('base64url');

    const sigBuffer = Buffer.from(signatureB64);
    const expBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      return null;
    }

    const jsonStr = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const payload = JSON.parse(jsonStr) as TokenPayload;

    if (!payload || !payload.userId || typeof payload.createdAt !== 'number' || typeof payload.expiresAt !== 'number') {
      return null;
    }

    // Mandatory expiration check
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    // createdAt cannot be in the future
    if (payload.createdAt > Date.now()) {
      return null;
    }

    // expiresAt - createdAt max 30 days
    const maxDuration = 30 * 24 * 60 * 60 * 1000;
    if (payload.expiresAt - payload.createdAt > maxDuration) {
      return null;
    }

    // Validate clientId and scope (strict allowlist, no includes)
    if (!payload.clientId || typeof payload.clientId !== 'string') {
      return null;
    }

    const validScopes = ['read', 'write', 'follow', 'read write', 'read write follow', 'write follow', 'read follow'];
    if (!payload.scope || typeof payload.scope !== 'string' || !validScopes.includes(payload.scope)) {
      return null;
    }

    return payload;
  } catch (e) {
    // Never log token or secret
    return null;
  }
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
      .select('id, username, full_name, avatar_url, role')
      .eq('id', payload.userId)
      .single();

    if (error || !profile) {
      return null;
    }

    return profile;
  } catch (err) {
    return null;
  }
}

