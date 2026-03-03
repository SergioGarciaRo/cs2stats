import { NextResponse } from 'next/server'
import { submitVote } from '../../../../lib/voteTracker'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  if (!/^[0-9]{17}$/.test(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'local'
  const body = await req.json().catch(() => ({}))
  const vote = body.vote
  if (vote !== 'yes' && vote !== 'no') {
    return NextResponse.json({ error: 'invalid_vote' }, { status: 400 })
  }

  const result = submitVote(id, body.name || 'Unknown', body.avatar || '', ip, vote)
  if (!result.ok) {
    return NextResponse.json({ error: result.reason, yes: result.yes, no: result.no }, { status: 429 })
  }
  return NextResponse.json({ ok: true, yes: result.yes, no: result.no })
}
