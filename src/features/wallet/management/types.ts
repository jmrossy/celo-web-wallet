import { SignerType } from 'src/blockchain/signer'

export const AccountDataWhitelist = ['address', 'type', 'derivationPath', 'encryptedMnemonic']

export interface AccountData {
  address: string
  type: SignerType
  derivationPath: string
  // accountContract: {
  //   isRegistered: boolean
  //   voteSignerFor: string | null
  //   lastUpdated: number | null
  // }
  encryptedMnemonic?: string // Only SignerType.local accounts will have this
}

export type AccountsData = Array<AccountData>

// TODO cleanup
// export const AccountKeyWhitelist = ['address, derivationPath, encryptedMnemonic']

// export interface AccountKey {
//   address: string
//   derivationPath: string
//   encryptedMnemonic: string
// }

// export type AccountKeys = Array<AccountKey>
