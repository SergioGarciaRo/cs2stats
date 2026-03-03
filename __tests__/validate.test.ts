import { isValidSteamId } from '../lib/validate'

test('valid steam id 17 digits', () => {
  expect(isValidSteamId('76561198260035986')).toBe(true)
})

test('invalid steam id short', () => {
  expect(isValidSteamId('123')).toBe(false)
})

test('invalid steam id contains letters', () => {
  expect(isValidSteamId('7656119abcd0035986')).toBe(false)
})

test('normalize URL to steam id', () => {
  const { normalizeSteamInput } = require('../lib/validate')
  expect(normalizeSteamInput('https://steamcommunity.com/profiles/76561198260035986')).toBe('76561198260035986')
  expect(normalizeSteamInput('profile: 76561198260035986')).toBe('76561198260035986')
  expect(normalizeSteamInput('nope')).toBe(null)
})
