import { NextResponse } from 'next/server'
import { submitVote } from '../../../../lib/voteTracker'
import { getIp } from '../../../../lib/getIp'

const MAX_NAME_LEN = 64
const STEAM_AVATAR_RE = new RegExp('^https://(avatars.steamstatic.com|cdn.akamai.steamstatic.com|steamcdn-a.akamaihd.net|community.cloudflare.steamstatic.com)/')

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  if (!/^[0-9]{17}$/.test(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  const contentLength = Number(req.headers.get('content-length') ?? 0)
  if (contentLength > 4096) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 })
  }

  const ip = getIp(req)
  const body = await req.json().catch(() => ({}))
  const vote = body.vote
  if (vote !== 'yes' && vote !== 'no') {
    return NextResponse.json({ error: 'invalid_vote' }, { status: 400 })
  }

  const rawName: string = typeof body.name === 'string' ? body.name : 'Unknown'
  const safeName = rawName.replace(/<[^>]*>/g, '').slice(0, MAX_NAME_LEN).trim() || 'Unknown'

  const rawAvatar: string = typeof body.avatar === 'string' ? body.avatar : ''
  const safeAvatar = STEAM_AVATAR_RE.test(rawAvatar) ? rawAvatar : ''

  const result = await submitVote(id, safeName, safeAvatar, ip, vote)
  if (!result.ok) {
    return NextResponse.json({ error: result.reason, yes: result.yes, no: result.no }, { status: 429 })
  }
  return NextResponse.json({ ok: true, yes: result.yes, no: result.no })
}
