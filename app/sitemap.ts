import type { MetadataRoute } from 'next'

const SITE_URL = 'https://cs2stats-68cc.vercel.app'

// Static pages always included
const staticPages: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  },
  {
    url: `${SITE_URL}/top-viewed`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/top-cheaters`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/cs2-legit-checker`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPages
}
