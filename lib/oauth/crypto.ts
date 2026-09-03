import crypto from 'crypto';

export interface OAuthTokenPayload {
  sub: string; // user_id
  client_id: string;
  scope: string;
  iat: number;
  exp: number;
  iss: string;
}

/**
 * Returns the secret key used for signing OAuth JWT access tokens.
 * Uses OAUTH_JWT_SECRET, SUPABASE_SERVICE_ROLE_KEY or a secure fallback.
 */
export function getJwtSecret(): string {
  const secret =
    process.env.OAUTH_JWT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.MASTODON_TOKEN_SECRET ||
    'engelsizforum-oauth-identity-provider-secret-fallback-2026';
  return secret;
}

/**
 * Hashes client_secret securely using a random 16-byte salt and HMAC-SHA256.
 * Format: s256:<salt_hex>:<hash_hex>
 */
export function hashClientSecret(plainSecret: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(plainSecret).digest('hex');
  return `s256:${salt}:${hash}`;
}

/**
 * Verifies a client_secret against its stored hash using timingSafeEqual to prevent timing attacks.
 */
export function verifyClientSecret(plainSecret: string, storedHash: string): boolean {
  try {
    if (!plainSecret || !storedHash) return false;

    // Salted SHA-256 format: s256:<salt>:<hash>
    if (storedHash.startsWith('s256:')) {
      const parts = storedHash.split(':');
      if (parts.length !== 3) return false;
      const salt = parts[1];
      const expectedHash = parts[2];

      const computedHash = crypto.createHmac('sha256', salt).update(plainSecret).digest('hex');
      const bufA = Buffer.from(computedHash, 'utf8');
      const bufB = Buffer.from(expectedHash, 'utf8');

      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    }

    // Direct constant-time comparison fallback (if stored as plain text during initial test/seeding)
    const bufPlain = Buffer.from(plainSecret, 'utf8');
    const bufStored = Buffer.from(storedHash, 'utf8');
    if (bufPlain.length !== bufStored.length) return false;
    return crypto.timingSafeEqual(bufPlain, bufStored);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically random authorization code (64 hex characters).
 */
export function generateAuthorizationCode(): string {
  return `ef_code_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Generates a cryptographically random client ID (e.g. ef_client_...).
 */
export function generateClientId(): string {
  return `ef_client_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Generates a cryptographically secure client secret (e.g. ef_sec_...).
 */
export function generateClientSecret(): string {
  return `ef_sec_${crypto.randomBytes(24).toString('hex')}`;
}

/**
 * Base64URL encoder conforming to RFC 7515 / RFC 7519.
 */
function base64UrlEncode(strOrBuffer: string | Buffer): string {
  const buf = Buffer.isBuffer(strOrBuffer) ? strOrBuffer : Buffer.from(strOrBuffer, 'utf8');
  return buf.toString('base64url');
}

/**
 * Base64URL decoder conforming to RFC 7515 / RFC 7519.
 */
function base64UrlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8');
}

/**
 * Generates and signs an RFC 7519 standard JWT Access Token (HS256).
 */
export function generateAccessToken(
  userId: string,
  clientId: string,
  scope: string = 'read',
  expiresInSeconds: number = 3600
): { access_token: string; expires_in: number; token_type: string; scope: string } {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInSeconds;

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload: OAuthTokenPayload = {
    sub: userId,
    client_id: clientId,
    scope: scope || 'read',
    iat: now,
    exp: exp,
    iss: 'https://www.engelsizforum.com',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(dataToSign)
    .digest('base64url');

  const accessToken = `${encodedHeader}.${encodedPayload}.${signature}`;

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: expiresInSeconds,
    scope: payload.scope,
  };
}

/**
 * Verifies an OAuth JWT Access Token with timingSafeEqual signature check and expiration validation.
 */
export function verifyAccessToken(token: string): {
  valid: boolean;
  payload?: OAuthTokenPayload;
  error?: string;
} {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'missing_token' };
    }

    // Also support Mastodon-style ef_token_ prefix if needed
    const cleanToken = token.startsWith('ef_token_') ? token.substring(9) : token;
    const parts = cleanToken.split('.');

    // Standard JWT has 3 parts: header.payload.signature
    if (parts.length === 3) {
      const [encodedHeader, encodedPayload, signature] = parts;
      const dataToSign = `${encodedHeader}.${encodedPayload}`;

      const expectedSignature = crypto
        .createHmac('sha256', getJwtSecret())
        .update(dataToSign)
        .digest('base64url');

      const bufSig = Buffer.from(signature, 'utf8');
      const bufExpected = Buffer.from(expectedSignature, 'utf8');

      if (bufSig.length !== bufExpected.length || !crypto.timingSafeEqual(bufSig, bufExpected)) {
        return { valid: false, error: 'invalid_signature' };
      }

      const payload: OAuthTokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        return { valid: false, error: 'token_expired' };
      }

      return { valid: true, payload };
    }

    // Legacy 2-part ef_token format support (payloadB64.signatureB64)
    if (parts.length === 2) {
      const [payloadB64, signatureB64] = parts;
      const expectedSig = crypto
        .createHmac('sha256', getJwtSecret())
        .update(payloadB64)
        .digest('base64url');

      const bufA = Buffer.from(signatureB64, 'utf8');
      const bufB = Buffer.from(expectedSig, 'utf8');

      if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
        return { valid: false, error: 'invalid_signature' };
      }

      const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      const nowMs = Date.now();
      if (decoded.expiresAt && decoded.expiresAt < nowMs) {
        return { valid: false, error: 'token_expired' };
      }

      return {
        valid: true,
        payload: {
          sub: decoded.userId,
          client_id: decoded.clientId,
          scope: decoded.scope || 'read',
          iat: Math.floor((decoded.createdAt || nowMs) / 1000),
          exp: Math.floor((decoded.expiresAt || nowMs + 3600000) / 1000),
          iss: 'https://www.engelsizforum.com',
        },
      };
    }

    return { valid: false, error: 'malformed_token' };
  } catch (err: unknown) {
    return { valid: false, error: 'token_parsing_error' };
  }
}
