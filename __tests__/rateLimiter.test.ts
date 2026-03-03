import { isRateLimited } from '../lib/rateLimiter'

test('rate limiter blocks after threshold', () => {
  const ip = '1.2.3.4'
  // reset environment: call once to ensure entry exists
  for (let i = 0; i < 61; i++) {
    // after 60 requests, it should be limited
    const limited = isRateLimited(ip)
    if (i < 60) {
      expect(limited).toBe(false)
    } else {
      expect(limited).toBe(true)
    }
  }
})
