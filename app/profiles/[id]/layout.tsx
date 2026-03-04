import type { Metadata } from 'next'
import { fetchSteamProfile, fetchFaceitLevel } from '../../../lib/steam'

const SITE_URL = 'https://cs2stats-68cc.vercel.app'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const result = await fetchSteamProfile(params.id)

  if (!result.ok || !result.profile) {
    return {
      title: 'CS2 Player Stats – Lookup & Legit Check',
      description: 'Look up any CS2 player. Check Premier rating, FACEIT level, K/D, inventory value and detect smurfs or cheaters.',
      robots: { index: false, follow: false },
    }
  }

  const { name, avatar, vacBanned } = result.profile
  const steamId = params.id
  const url = `${SITE_URL}/profiles/${steamId}`

  let faceitLevel: number | null = null
  try {
    const fr = await fetchFaceitLevel(steamId)
    if (fr.ok) faceitLevel = fr.level ?? null
  } catch {}

  const faceitStr = faceitLevel ? ` · FACEIT Level ${faceitLevel}` : ''
  const vacStr = vacBanned ? ' ⚠ VAC Banned' : ''

  const title = `${name} CS2 Stats – Premier Rating, Inventory & Legit Check${vacStr}`
  const description = `Check CS2 stats for ${name}${faceitStr}. View Premier rating, match history, inventory value and detect smurfs, cheaters or purchased accounts. Free CS2 player lookup.`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      siteName: 'CS2 Stats',
      images: avatar
        ? [{ url: avatar, width: 184, height: 184, alt: `${name} Steam avatar` }]
        : [{ url: '/og-default.png', width: 1200, height: 630, alt: 'CS2 Stats' }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: avatar ? [avatar] : ['/og-default.png'],
    },
  }
}

// Server component: renders JSON-LD + children
export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const result = await fetchSteamProfile(params.id)
  const steamId = params.id
  const url = `${SITE_URL}/profiles/${steamId}`

  let name = 'CS2 Player'
  let avatar: string | undefined

  if (result.ok && result.profile) {
    name = result.profile.name
    avatar = result.profile.avatar || undefined
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': url,
        url,
        name: `${name} CS2 Stats`,
        mainEntity: {
          '@type': 'Person',
          '@id': `${url}#player`,
          name,
          identifier: steamId,
          image: avatar,
          url: `https://steamcommunity.com/profiles/${steamId}`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: name, item: url },
        ],
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#app`,
        name: 'CS2 Stats',
        url: SITE_URL,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        description: 'Free CS2 player stats tracker. Check Premier rating, FACEIT level, K/D, inventory value and legit score.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
