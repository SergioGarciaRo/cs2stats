// Edge runtime — runs on Cloudflare PoPs, not AWS/Vercel Node.js
// Steam inventory endpoint works from Cloudflare IPs
export const runtime = 'edge'

const j = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export async function GET(req: Request) {
  const url = new URL(req.url)
  const steamId = url.searchParams.get('steamId')
  if (!steamId || !/^[0-9]{17}$/.test(steamId)) {
    return j({ error: 'invalid_steamId' }, 400)
  }

  try {
    const res = await fetch(
      `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://steamcommunity.com/',
          'Origin': 'https://steamcommunity.com',
        },
      }
    )

    if (res.status === 403 || res.status === 400) return j({ error: 'private' })
    if (!res.ok) return j({ error: `steam_${res.status}` })

    const data = await res.json() as unknown
    return j(data)
  } catch (e) {
    return j({ error: String(e) })
  }
}
