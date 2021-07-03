import { SignerType } from 'src/blockchain/types'

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

const MOCK_ACCOUNTS = [MOCK_ACCOUNT1, MOCK_ACCOUNT2]
