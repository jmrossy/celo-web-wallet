import { utils } from 'ethers'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { AddTokenParams, Balances } from 'src/features/wallet/types'
import { addToken as addTokenAction } from 'src/features/wallet/walletSlice'
import { CELO } from 'src/tokens'
import { areAddressesEqual } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export function validate(params: AddTokenParams, balances?: Balances): ErrorState {
  const { address } = params
  if (!utils.isAddress(address)) {
    logger.error(`Invalid token address: ${address}`)
    return invalidInput('address', 'Invalid token address')
  }
  if (balances) {
    const currentTokenAddrs = Object.values(balances.tokens).map((t) => t.address)
    const alreadyExists = currentTokenAddrs.some((a) => areAddressesEqual(a, address))
    if (alreadyExists) {
      logger.error(`Token already exists in wallet: ${address}`)
      return invalidInput('address', 'Token already exists')
    }
  }
  return { isValid: true }
}

function* addToken(params: AddTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)
  validateOrThrow(() => validate(params, balances), 'Invalid Token')

  const newToken = CELO // TODO
  yield* put(addTokenAction(newToken))

  yield* put(fetchBalancesActions.trigger())
}

export const {
  name: addTokenSagaName,
  wrappedSaga: addTokenSaga,
  reducer: addTokenReducer,
  actions: addTokenActions,
} = createMonitoredSaga<AddTokenParams>(addToken, 'addToken')
