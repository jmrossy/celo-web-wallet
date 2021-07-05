import { SignerType } from 'src/blockchain/types'
import { TransactionMap } from 'src/features/types'

export const MOCK_MNEMONIC =
  'hamster bulb chef popular soft hip flight chest enhance reveal game throw hen oxygen despair fish forest skate melody apple outdoor extend alien polar'
export const MOCK_ADDRESS1 = '0x35b74Ed5038bf0488Ff33bD9819b9D12D10A7560'
export const MOCK_DERIVATION_PATH1 = "m/44'/52752'/0'/0/0"
export const MOCK_ENCRYPTED_MNEMONIC1 =
  'AFjlYRX/fY/9FKryMn0RCn4G4LBOUCsVW7O9FQuEh3++lgeU0sVim++/9lrVgM56Wg8VNB8y0551dAQ4CfvIjJULvtkisAIe09gc5MM9zIazbfQggEqw95iDXxoQ5ePZ7uheOyLds/7DbDIq3soqxsTUNKUtmj/79xdqn/JCy6hMKsD1qDLvrj3LBnsaHNl8PlaQJx3U3SbyfMwxXKSuIV8Ihyb6Z6+Ab0Y='
export const MOCK_ADDRESS2 = '0xa2972a33550c33ecfa4a02a0ea212ac98e77fa55'
export const MOCK_ADDRESS3 = '0xfF1668e08B50148379C9D515C3dF49f4BE4bF8e2'
export const MOCK_ACCOUNT1 = {
  address: MOCK_ADDRESS1,
  name: 'Account 1',
  type: SignerType.Local,
  derivationPath: MOCK_DERIVATION_PATH1,
  encryptedMnemonic: MOCK_ENCRYPTED_MNEMONIC1,
}
export const MOCK_ACCOUNT2 = {
  address: MOCK_ADDRESS2,
  name: 'Account 2',
  type: SignerType.Ledger,
  derivationPath: MOCK_DERIVATION_PATH1,
}

export const MOCK_FEED_DATA: TransactionMap = {
  '0xa6c3969ad06abf78ccbbee47bbdf4b87ea217d3502ab2d003e95a3aa4fe77141': {
    type: 11,
    hash: '0xa6c3969ad06abf78ccbbee47bbdf4b87ea217d3502ab2d003e95a3aa4fe77141',
    from: '0x35b74ed5038bf0488ff33bd9819b9d12d10a7560',
    to: '0xe383394b913d7302c49f794c7d3243c429d53d1d',
    value: '0',
    inputData:
      '0x8ab1a5d4000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000077ea55457cba30000000000000000000000000000000000000000000000000000000000000000',
    blockNumber: 6496373,
    nonce: 35,
    timestamp: 1620058392,
    gasPrice: '2314501140',
    gasUsed: '188900',
    // @ts-ignore
    feeCurrency: 'CELO',
    gatewayFee: '0',
    gatewayFeeRecipient: '',
    fromTokenId: 'cEUR',
    toTokenId: 'CELO',
    fromValue: '10000000000000000',
    toValue: '2141698869764583',
  },
  '0xba6f513c54e16440ffb1c36f2792ab89ec3a253ba08c95f239e6b7563c3a5ab9': {
    type: 2,
    hash: '0xba6f513c54e16440ffb1c36f2792ab89ec3a253ba08c95f239e6b7563c3a5ab9',
    from: '0x2e272d55cbd07c64eb04cccc85ab3f712438ca8e',
    to: '0x35b74ed5038bf0488ff33bd9819b9d12d10a7560',
    value: '0',
    inputData:
      '0x8ab1a5d4000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000077ea55457cba30000000000000000000000000000000000000000000000000000000000000000',
    blockNumber: 6497102,
    nonce: 8,
    timestamp: 1625436947,
    gasPrice: '2314501140',
    gasUsed: '188900',
    // @ts-ignore
    feeCurrency: 'CELO',
    gatewayFee: '0',
    gatewayFeeRecipient: '',
  },
}
