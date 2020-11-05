const CACHE_TIMEOUT = 300000 // 5 minutes
const PIN_LENGTH = 6

const PIN_BLACKLIST = [
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '123456',
  '654321',
]

export function isPinValid(pin: string) {
  return pin.length === PIN_LENGTH && !PIN_BLACKLIST.includes(pin)
}

interface SecretCache {
  timestamp?: number
  secret?: string
}
let pinCache: SecretCache = {}

export function getCachedPin() {
  if (pinCache.secret && pinCache.timestamp && Date.now() - pinCache.timestamp < CACHE_TIMEOUT) {
    return pinCache.secret
  } else {
    // Clear values in cache when they're expired
    clearPinCache()
    return null
  }
}

export function setCachedPin(pin: string | null | undefined) {
  if (pin) {
    pinCache.timestamp = Date.now()
    pinCache.secret = pin
  } else {
    clearPinCache()
  }
}

export function clearPinCache() {
  pinCache = {}
}
