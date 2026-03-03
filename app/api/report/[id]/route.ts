import { NextResponse } from 'next/server'
import { submitReport } from '../../../../lib/reportTracker'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  if (!/^[0-9]{17}$/.test(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'local'
  const body = await req.json().catch(() => ({}))
  const name = body.name || 'Unknown'
  const avatar = body.avatar || ''

  const result = submitReport(id, name, avatar, ip)
  if (!result.ok) {
    return NextResponse.json({ error: result.reason, total: result.total }, { status: 429 })
  }
  return NextResponse.json({ ok: true, total: result.total })
}
