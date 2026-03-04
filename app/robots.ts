import type { MetadataRoute } from 'next'

const SITE_URL = 'https://cs2stats-68cc.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/profiles/',
          '/top-viewed',
          '/top-cheaters',
          '/cs2-legit-checker',
        ],
        disallow: [
          '/api/',
          '/alias/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
