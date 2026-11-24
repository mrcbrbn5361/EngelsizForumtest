import type { NextConfig } from 'next';

/**
 * Returns the hostname of the configured storage project, or an empty string when none is set.
 */
function resolveStorageHost(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname;
  } catch {
    return '';
  }
}

const storageHost = resolveStorageHost();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  generateEtags: true,
  allowedDevOrigins: ['ais-dev-ix4syl6g7zxz77ys7mkpvf-91223103933.europe-west2.run.app', '*.run.app', 'ai.studio', '*.ai.studio', '*.google.com', 'localhost:3000', '127.0.0.1:3000'],
  images: {
    unoptimized: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: storageHost ? [{ protocol: 'https', hostname: storageHost }] : [],
  },
  async redirects() {
    return [
      {
        source: '/forum',
        destination: '/',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*(png|jpg|jpeg|gif|svg|ico|webp|avif)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
          {
            key: 'Timing-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https: wss:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; media-src 'self' https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
