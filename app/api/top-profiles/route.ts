import { NextResponse } from 'next/server'
import { getTopProfiles } from '../../../lib/viewTracker'
import { getTopSuspected } from '../../../lib/voteTracker'

export async function GET() {
  const [mostViewed, mostReported] = await Promise.all([
    getTopProfiles(6),
    getTopSuspected(10),
  ])
  return NextResponse.json({ mostViewed, mostReported })
}
