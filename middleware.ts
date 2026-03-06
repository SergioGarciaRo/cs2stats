import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cs2stats-68cc.vercel.app'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  // ── Patrón 1: <steamId17>.tuti → redirect a /profiles/<id>
  // Ejemplo: 76561198261520885.tuti
  const subdomainMatch = host.match(/^([0-9]{17})\.tuti(:[0-9]+)?$/)
  if (subdomainMatch) {
    const id = subdomainMatch[1]
    return NextResponse.redirect(new URL(`/profiles/${id}`, APP_URL))
  }

  // ── Patrón 2: steamcommunity.tuti/profiles/<steamId64>
  // ── Patrón 3: steamcommunity.tuti/id/<vanityname>
  // Ejemplo: steamcommunity.tuti/profiles/76561198261520885
  //          steamcommunity.tuti/id/somevanityname
  if (host.endsWith('.tuti') || host.endsWith('.tuti:3000')) {
    // /profiles/<steamId64>
    const profilesMatch = pathname.match(/^\/profiles\/([0-9]{17})(?:\/.*)?$/)
    if (profilesMatch) {
      return NextResponse.redirect(new URL(`/profiles/${profilesMatch[1]}`, APP_URL))
    }

    // /id/<vanityname> — la profile page resuelve el vanity a SteamID64
    const idMatch = pathname.match(/^\/id\/([^/]+)(?:\/.*)?$/)
    if (idMatch) {
      return NextResponse.redirect(new URL(`/profiles/${idMatch[1]}`, APP_URL))
    }
  }

  return undefined
}

export const config = {
  matcher: ['/:path*'],
}
