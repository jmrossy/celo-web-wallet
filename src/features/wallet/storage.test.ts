import { SignerType } from 'src/blockchain/types'
import {
  addAccount,
  getAccounts,
  modifyAccounts,
  removeAccount,
  removeAllAccounts,
} from 'src/features/wallet/storage'
import {
  MOCK_ACCOUNT1,
  MOCK_ACCOUNT2,
  MOCK_ADDRESS2,
  MOCK_ADDRESS3,
  MOCK_DERIVATION_PATH1,
} from 'src/test/values'

describe('Wallet Storage', () => {
  it('Adds a local account', () => {
    addAccount(MOCK_ACCOUNT1)
    expect(getAccounts()).toEqual([MOCK_ACCOUNT1])
  })
  it('Adds a ledger account', () => {
    addAccount(MOCK_ACCOUNT2)
    expect(getAccounts()).toEqual([MOCK_ACCOUNT1, MOCK_ACCOUNT2])
  })
  it('Modifies an account', () => {
    const modifiedAcc = {
      ...MOCK_ACCOUNT2,
      name: 'NewName',
    }
    modifyAccounts([modifiedAcc])
    expect(getAccounts()).toEqual([MOCK_ACCOUNT1, modifiedAcc])
  })
  it('Rejects invalid accounts', () => {
    // Duplicate account
    try {
      addAccount(MOCK_ACCOUNT2)
      fail('expected throw on dupe account')
    } catch (e) {
      /* Expected */
    }
    try {
      addAccount({
        address: MOCK_ADDRESS3,
        name: 'Account 3',
        type: SignerType.Local,
        derivationPath: MOCK_DERIVATION_PATH1,
      })
      fail('expected throw on missing mnemonic')
    } catch (e) {
      /* Expected */
    }
  })
  it('Removes account', () => {
    // Duplicate account
    try {
      removeAccount(MOCK_ADDRESS3)
      fail('expected throw on missing account')
    } catch (e) {
      /* Expected */
    }
    removeAccount(MOCK_ADDRESS2)
    expect(getAccounts()).toEqual([MOCK_ACCOUNT1])
  })
  it('Removes all accounts', () => {
    removeAllAccounts()
    expect(getAccounts()).toEqual([])
  })
})
