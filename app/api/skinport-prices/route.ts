// Edge runtime — Cloudflare handles Brotli decompression natively
// Skinport requires Accept-Encoding: br, which Node.js serverless cannot decompress
export const runtime = 'edge'

export async function GET() {
  try {
    const res = await fetch('https://api.skinport.com/v1/items?app_id=730&currency=USD', {
      headers: {
        'Accept-Encoding': 'br',
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `skinport_${res.status}` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await res.text()
    return new Response(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
