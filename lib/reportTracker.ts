// In-memory cheater report tracker — resets on server restart
// One report per IP per profile (anti-spam)

interface ReportedProfile {
  steamId: string
  name: string
  avatar: string
  reports: number
  lastReported: number
}

const reports = new Map<string, ReportedProfile>()
// ip:steamId → timestamp (to prevent duplicates)
const reportedBy = new Map<string, number>()

export function submitReport(steamId: string, name: string, avatar: string, ip: string): { ok: boolean; reason?: string; total: number } {
  const reportKey = `${ip}:${steamId}`
  const lastReport = reportedBy.get(reportKey)
  // Allow 1 report per IP per profile per hour
  if (lastReport && Date.now() - lastReport < 3600_000) {
    return { ok: false, reason: 'already_reported', total: reports.get(steamId)?.reports ?? 0 }
  }
  reportedBy.set(reportKey, Date.now())

  const existing = reports.get(steamId)
  if (existing) {
    existing.reports += 1
    existing.lastReported = Date.now()
    existing.name = name
    existing.avatar = avatar
    return { ok: true, total: existing.reports }
  } else {
    reports.set(steamId, { steamId, name, avatar, reports: 1, lastReported: Date.now() })
    return { ok: true, total: 1 }
  }
}

export function getReportCount(steamId: string): number {
  return reports.get(steamId)?.reports ?? 0
}

export function getTopReported(limit = 6): ReportedProfile[] {
  return [...reports.values()]
    .sort((a, b) => b.reports - a.reports)
    .slice(0, limit)
}
