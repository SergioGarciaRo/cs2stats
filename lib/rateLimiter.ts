type Entry = { count: number; reset: number };
const windowMs   = 60_000;  // 1 minute
const maxRequests = 60;
const map = new Map<string, Entry>();

// Purge expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, e] of map) {
    if (now > e.reset) map.delete(ip);
  }
}, 5 * 60_000).unref?.();

export function isRateLimited(ip: string) {
  const now = Date.now();
  const e = map.get(ip);
  if (!e) {
    map.set(ip, { count: 1, reset: now + windowMs });
    return false;
  }
  if (now > e.reset) {
    map.set(ip, { count: 1, reset: now + windowMs });
    return false;
  }
  e.count++;
  if (e.count > maxRequests) return true;
  return false;
}
