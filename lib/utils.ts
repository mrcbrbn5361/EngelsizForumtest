import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS class names with clsx and twMerge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generates a standard RFC4122 v4 UUID with fallback for all browser and server environments.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generates a short, random alphanumeric identifier (e.g. for collision-resistant slugs).
 */
export function generateShortId(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Converts Turkish characters and special strings to a URL-friendly slug.
 */
export function slugify(text: string, maxLength = 80): string {
  if (!text) return '';
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
  };
  let str = text;
  for (const key in trMap) {
    str = str.replace(new RegExp(key, 'g'), trMap[key]);
  }
  let slug = str.toLowerCase()
    .replace(/[^-a-zA-Z0-9\s]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();

  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(/-+$/, '');
  }
  return slug;
}

/**
 * Generates a unique, URL-safe slug with a short random token to prevent unique constraint collisions (e.g. topics_slug_key).
 */
export function generateUniqueSlug(text: string, suffixLength = 6): string {
  const base = slugify(text, 60);
  const suffix = generateShortId(suffixLength);
  if (!base) {
    return `konu-${suffix}`;
  }
  return `${base}-${suffix}`;
}

/**
 * Safely extracts a readable error message from unknown errors.
 */
export function getErrorMessage(error: unknown, defaultMessage = 'Beklenmeyen bir hata oluştu'): string {
  if (!error) return defaultMessage;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message;
  }
  return defaultMessage;
}

/**
 * Formats a number to compact Turkish locale string (e.g. 1.5B, 2.3M).
 */
export function formatCompactNumber(num: number): string {
  if (isNaN(num) || num === 0) return '0';
  return new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
}

/**
 * Strips dangerous HTML tags from user-provided Markdown or raw text.
 */
export function sanitizeSnippet(text: string, maxLength = 200): string {
  if (!text) return '';
  const stripped = text
    .replace(/<[^>]*>?/gm, '')
    .replace(/[#*`_~\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength) + '...';
}

/**
 * Converts a base64 audio string to a blob URL to comply with CSP media-src policies.
 */
export function base64ToBlobUrl(base64: string, mimeType = 'audio/mp3'): string {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Error creating blob from base64:', e);
    return `data:${mimeType};base64,${base64}`;
  }
}

