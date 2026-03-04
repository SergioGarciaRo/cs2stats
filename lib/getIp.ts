/**
 * Returns the real client IP from the request.
 * On Vercel, `x-real-ip` is set by the edge and cannot be spoofed.
 * `x-forwarded-for` can be injected by the client, so we only use it
 * as a last resort (local dev) and take the LAST entry (the trusted proxy).
 */
export function getIp(req: Request): string {
  // Vercel sets this — most trustworthy
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp

  // x-forwarded-for: "client, proxy1, proxy2" — rightmost is added by trusted proxy
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const ips = forwarded.split(',').map(s => s.trim()).filter(Boolean)
    // Take the rightmost IP (last trusted hop), not the leftmost (user-supplied)
    return ips[ips.length - 1] ?? 'local'
  }

  return 'local'
}
