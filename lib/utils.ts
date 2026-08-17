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
 * Converts Turkish characters and special strings to a URL-friendly slug.
 */
export function slugify(text: string): string {
  if (!text) return '';
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
  };
  let str = text;
  for (const key in trMap) {
    str = str.replace(new RegExp(key, 'g'), trMap[key]);
  }
  return str.toLowerCase()
    .replace(/[^-a-zA-Z0-9\s]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
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
