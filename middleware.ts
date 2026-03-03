import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  // ── Patrón 1: <steamId17>.tuti → /profiles/<id>
  // Ejemplo: 76561198261520885.tuti
  const subdomainMatch = host.match(/^([0-9]{17})\.tuti(:[0-9]+)?$/)
  if (subdomainMatch) {
    const id = subdomainMatch[1]
    const url = req.nextUrl.clone()
    url.pathname = `/profiles/${id}`
    return NextResponse.rewrite(url)
  }

  // ── Patrón 2: *.tuti/profiles/<steamId17>
  // Ejemplo: steamcommunity.tuti/profiles/76561198261520885
  if (host.endsWith('.tuti') || host.endsWith('.tuti:3000')) {
    const pathMatch = pathname.match(/^\/profiles\/([0-9]{17})(?:\/.*)?$/)
    if (pathMatch) {
      // Already points to /profiles/<id>, just rewrite to serve it
      const url = req.nextUrl.clone()
      url.pathname = `/profiles/${pathMatch[1]}`
      return NextResponse.rewrite(url)
    }

    // *.tuti/id/<steamId17> shorthand
    const idMatch = pathname.match(/^\/id\/([0-9]{17})(?:\/.*)?$/)
    if (idMatch) {
      const url = req.nextUrl.clone()
      url.pathname = `/profiles/${idMatch[1]}`
      return NextResponse.rewrite(url)
    }
  }

  return undefined
}

export const config = {
  matcher: ['/:path*'],
}
