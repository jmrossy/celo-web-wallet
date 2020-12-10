import { utils } from 'ethers'

const URL_BASE = 'celo://wallet/pay'

export interface CeloQrUriDataType {
  address: string
  displayName?: string
  e164PhoneNumber?: string
  currencyCode?: string
  amount?: string
  comment?: string
  token?: string
}

export function encodeAddressForQr(address: string): string {
  if (!utils.isAddress(address)) {
    throw new Error('Invalid address')
  }

  const data: CeloQrUriDataType = { address }
  const serialized = new URLSearchParams(data as any).toString()

  return `${URL_BASE}?${serialized}`
}
