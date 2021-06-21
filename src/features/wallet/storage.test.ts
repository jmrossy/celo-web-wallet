import { SignerType } from 'src/blockchain/signer'
import {
  addAccount,
  getAccounts,
  removeAccount,
  removeAllAccounts,
} from 'src/features/wallet/storage'

const TEST_ADDRESS1 = '0x35b74Ed5038bf0488Ff33bD9819b9D12D10A7560'
const DERIVATION_PATH1 = "m/44'/52752'/0'/0/0"
const ENCRYPTED_MNEMONIC1 =
  'AFjlYRX/fY/9FKryMn0RCn4G4LBOUCsVW7O9FQuEh3++lgeU0sVim++/9lrVgM56Wg8VNB8y0551dAQ4CfvIjJULvtkisAIe09gc5MM9zIazbfQggEqw95iDXxoQ5ePZ7uheOyLds/7DbDIq3soqxsTUNKUtmj/79xdqn/JCy6hMKsD1qDLvrj3LBnsaHNl8PlaQJx3U3SbyfMwxXKSuIV8Ihyb6Z6+Ab0Y='
const TEST_ADDRESS2 = '0xa2972a33550c33ecfa4a02a0ea212ac98e77fa55'
const TEST_ADDRESS3 = '0xfF1668e08B50148379C9D515C3dF49f4BE4bF8e2'
const ACCOUNT1 = {
  address: TEST_ADDRESS1,
  type: SignerType.Local,
  derivationPath: DERIVATION_PATH1,
  encryptedMnemonic: ENCRYPTED_MNEMONIC1,
}
const ACCOUNT2 = {
  address: TEST_ADDRESS2,
  type: SignerType.Ledger,
  derivationPath: DERIVATION_PATH1,
}

describe('Wallet Storage', () => {
  it('Adds a local account', () => {
    addAccount(ACCOUNT1)
    expect(getAccounts()).toEqual([ACCOUNT1])
  })
  it('Adds a ledger account', () => {
    addAccount(ACCOUNT2)
    expect(getAccounts()).toEqual([ACCOUNT1, ACCOUNT2])
  })
  it('Rejects invalid accounts', () => {
    // Duplicate account
    try {
      addAccount(ACCOUNT2)
      fail('expected throw on dupe account')
    } catch (e) {
      /* Expected */
    }
    try {
      addAccount({
        address: TEST_ADDRESS3,
        type: SignerType.Local,
        derivationPath: DERIVATION_PATH1,
      })
      fail('expected throw on missing mnemonic')
    } catch (e) {
      /* Expected */
    }
  })
  it('Removes account', () => {
    // Duplicate account
    try {
      removeAccount(TEST_ADDRESS3)
      fail('expected throw on missing account')
    } catch (e) {
      /* Expected */
    }
    removeAccount(TEST_ADDRESS2)
    expect(getAccounts()).toEqual([ACCOUNT1])
  })
  it('Removes all accounts', () => {
    removeAllAccounts()
    expect(getAccounts()).toEqual([])
  })
})
