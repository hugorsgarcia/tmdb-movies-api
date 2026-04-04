import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https://image.tmdb.org https://ui-avatars.com data:",
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


