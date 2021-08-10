import type { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { signTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import { ACCOUNT_STATUS_STALE_TIME } from 'src/consts'
import { FeeEstimate } from 'src/features/fees/types'
import { setAccountStatus } from 'src/features/wallet/walletSlice'
import { areAddressesEqual, isValidAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

export function* fetchAccountStatus(force = false) {
  const { address, account } = yield* select((state: RootState) => state.wallet)
  if (!address) throw new Error('Cannot fetch account status before address is set')

  if (isStale(account.lastUpdated, ACCOUNT_STATUS_STALE_TIME) || force) {
    const accountUpdated = yield* call(fetchAccountRegistrationStatus, address)
    yield* put(setAccountStatus(accountUpdated))
    return accountUpdated
  } else {
    return account
  }
}

async function fetchAccountRegistrationStatus(address: string) {
  const accounts = getContract(CeloContract.Accounts)
  const isRegistered: boolean = await accounts.isAccount(address)
  let voteSignerFor: string | null
  if (isRegistered) {
    // Registered accounts can't be signers
    voteSignerFor = null
  } else {
    voteSignerFor = await fetchVoteSignerAccount(address)
  }
  return { isRegistered, voteSignerFor, lastUpdated: Date.now() }
}

async function fetchVoteSignerAccount(address: string) {
  try {
    const accounts = getContract(CeloContract.Accounts)
    // Throws if address isn't registered and isn't a signer
    const mainAccount: string = await accounts.voteSignerToAccount(address)
    if (!mainAccount || !isValidAddress(mainAccount)) throw new Error('Invalid main account')
    if (areAddressesEqual(mainAccount, address)) return null
    else return mainAccount
  } catch (error) {
    logger.debug('Account does not seem to be a vote signer', error)
    return null
  }
}

export async function createAccountRegisterTx(feeEstimate: FeeEstimate, nonce: number) {
  const accounts = getContract(CeloContract.Accounts)
  /**
   * Just using createAccount for now but if/when DEKs are
   * supported than using setAccount here would make sense.
   * Can't use DEKs until comment encryption is added
   * because Valora assumes any recipient with a DEK is also Valora.
   */
  const tx = await accounts.populateTransaction.createAccount()
  tx.nonce = nonce
  logger.info('Signing account register tx')
  return signTransaction(tx, feeEstimate)
}
