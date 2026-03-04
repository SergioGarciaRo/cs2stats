/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',  value: 'on' },
  { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",       // Next.js needs these
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://*.steamstatic.com https://*.akamaihd.net https://*.steamusercontent.com https://steamcdn-a.akamaihd.net https://community.cloudflare.steamstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig = {
  reactStrictMode: true,

  // Allow Steam avatar images to be optimized via next/image
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.steamstatic.com' },
      { protocol: 'https', hostname: '*.akamaihd.net' },
      { protocol: 'https', hostname: '*.steamusercontent.com' },
      { protocol: 'https', hostname: 'avatars.fastly.steamstatic.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      // Security headers on all routes
      { source: '/(.*)', headers: securityHeaders },

      // Long-lived cache for static assets (JS, CSS, fonts, images)
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },

      // Cache player profile pages for 10 minutes at the CDN edge
      {
        source: '/profiles/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=300' }],
      },

      // Cache API responses at the CDN edge for 10 minutes
      {
        source: '/api/profile/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=300' }],
      },

      // Sitemap and robots — cache for 1 hour
      {
        source: '/(sitemap.xml|robots.txt)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=600' }],
      },
    ]
  },

  // Compress responses
  compress: true,
}

module.exports = nextConfig
