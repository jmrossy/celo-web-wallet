import { shallowEqual, useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { SignerType } from 'src/blockchain/types'
import { logger } from 'src/utils/logger'

export class PasswordCache {
  private readonly _password: string
  private readonly _unlockedTimestamp: number

  constructor(password: string) {
    this._password = password
    this._unlockedTimestamp = Date.now()
    Object.freeze(this)
  }

  read() {
    return { password: this._password, unlockedTimestamp: this._unlockedTimestamp }
  }
}

let cachedPassword: PasswordCache | null = null

export function setPasswordCache(password: string) {
  if (cachedPassword) logger.warn('Overwriting cached password')
  cachedPassword = new PasswordCache(password)
}

export function getPasswordCache() {
  if (cachedPassword) return cachedPassword.read()
  else return null
}

export function hasPasswordCached() {
  return !!cachedPassword
}

export function clearPasswordCache() {
  return (cachedPassword = null)
}

export function useAccountLockStatus() {
  // Using individual selects here to avoid re-renders this high-level
  // components that use this hook
  const address = useSelector((s: RootState) => s.wallet.address, shallowEqual)
  const type = useSelector((s: RootState) => s.wallet.type, shallowEqual)
  const isWalletUnlocked = useSelector((s: RootState) => s.wallet.isUnlocked, shallowEqual)

  // Call to hasPasswordCached() is for security reasons (so user can't change a persisted value in local storage)
  // and isWalletUnlocked is for flow reasons - so the UI reacts to changes after authenticating
  const isUnlocked = !!(
    address &&
    isWalletUnlocked &&
    (hasPasswordCached() || type === SignerType.Ledger)
  )

  return { address, type, isUnlocked }
}
