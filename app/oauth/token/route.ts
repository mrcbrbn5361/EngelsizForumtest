/**
 * /oauth/token
 * Re-exports the unified OAuth 2.0 Token endpoint from /api/oauth/token
 * Supports both standard OAuth 2.0 clients (oauth_clients) and legacy clients (mastodon_apps).
 */
export { POST, OPTIONS } from '@/app/api/oauth/token/route';
