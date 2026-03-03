export function isValidSteamId(id: string) {
  return /^[0-9]{17}$/.test(id)
}

export function normalizeSteamInput(input: string): string | null {
  input = (input || '').trim()
  // If already a 17-digit id
  if (isValidSteamId(input)) return input

  // If user pasted full profile URL like https://steamcommunity.com/profiles/<id>
  try {
    const u = new URL(input)
    // look for /profiles/<id>
    const parts = u.pathname.split('/').filter(Boolean)
    const idx = parts.indexOf('profiles')
    if (idx >= 0 && parts.length > idx + 1) {
      const candidate = parts[idx + 1]
      if (isValidSteamId(candidate)) return candidate
    }
  } catch (e) {
    // not a URL — try to extract digits
  }

  // Try to find 17 consecutive digits anywhere
  const m = input.match(/([0-9]{17})/)
  if (m) return m[1]

  return null
}
