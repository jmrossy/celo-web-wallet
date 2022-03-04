import { validateAddress } from 'src/utils/addresses'

const URL_BASE = 'celo://wallet/pay'

export interface CeloQrUriDataType {
  address: Address
  displayName?: string
  e164PhoneNumber?: string
  currencyCode?: string
  amount?: string
  comment?: string
  token?: string
}

export function encodeAddressForQr(address: Address): string {
  validateAddress(address, 'QR Code')
  const data: CeloQrUriDataType = { address }
  const serialized = new URLSearchParams(data as any).toString()
  return `${URL_BASE}?${serialized}`
}
