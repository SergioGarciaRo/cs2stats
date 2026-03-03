import { NextResponse } from 'next/server'
import { getTopProfiles } from '../../../lib/viewTracker'
import { getTopSuspected } from '../../../lib/voteTracker'

export async function GET() {
  return NextResponse.json({
    mostViewed: getTopProfiles(6),
    mostReported: getTopSuspected(10),
  })
}
