import type { NextConfig } from "next";

// CSP differs between dev and prod:
// - dev needs 'unsafe-eval' (React/Turbopack stack reconstruction)
// - dev fonts may load from fonts.gstatic.com before full self-hosting kicks in
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // INFRA-001: 'standalone' removed — project deploys to Vercel (not Docker/self-hosted)
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // SEC-004: 'unsafe-eval' only in dev — React/Turbopack requires it for
              // stack reconstruction; never needed in production Next.js
              isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                : "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              // SEC-002: font-src — next/font/google self-hosts in prod (covered by 'self');
              // Turbopack dev may still load from fonts.gstatic.com before build optimisation.
              // use.typekit.net is loaded by Adobe Typekit (injected externally).
              isDev
                ? "font-src 'self' data: https://fonts.gstatic.com https://use.typekit.net"
                : "font-src 'self' data: https://use.typekit.net",
              "img-src 'self' https://image.tmdb.org https://ui-avatars.com https://*.supabase.co data:",
              "connect-src 'self' https://*.supabase.co",
              "frame-src https://www.youtube.com",
            ].join('; ')
          },
        ],
      },
    ];
  },
};

export default nextConfig;


