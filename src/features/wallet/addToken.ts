import { BigNumber, BigNumberish, utils } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getTokenContract } from 'src/blockchain/contracts'
import { config } from 'src/config'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { AddTokenParams, Balances } from 'src/features/wallet/types'
import { addToken as addTokenAction } from 'src/features/wallet/walletSlice'
import { Color } from 'src/styles/Color'
import { CELO, Token } from 'src/tokens'
import { areAddressesEqual } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export function validate(params: AddTokenParams, balances: Balances): ErrorState {
  const { address } = params
  if (!address) {
    return invalidInput('address', 'Token address is required')
  }
  if (!utils.isAddress(address)) {
    logger.error(`Invalid token address: ${address}`)
    return invalidInput('address', 'Invalid token address')
  }
  const currentTokenAddrs = Object.values(balances.tokens).map((t) => t.address)
  const alreadyExists = currentTokenAddrs.some((a) => areAddressesEqual(a, address))
  if (alreadyExists) {
    logger.error(`Token already exists in wallet: ${address}`)
    return invalidInput('address', 'Token already exists')
  }
  return { isValid: true }
}

function* addToken(params: AddTokenParams) {
  const balances = yield* select((state: RootState) => state.wallet.balances)
  validateOrThrow(() => validate(params, balances), 'Invalid Token')

  const newToken = yield* call(getTokenInfo, params.address)
  yield* put(addTokenAction(newToken))

  yield* put(fetchBalancesActions.trigger())
}

async function getTokenInfo(tokenAddress: string): Promise<Token> {
  const contract = getTokenContract(tokenAddress)
  // Note this assumes the existence of decimals, symbols, and name methods,
  // which are technically optional. May revisit later
  const symbolP: Promise<string> = contract.symbol()
  const nameP: Promise<string> = contract.name()
  const decimalsP: Promise<BigNumberish> = contract.decimals()
  const [symbol, name, decimalsBN] = await Promise.all([symbolP, nameP, decimalsP])
  const decimals = BigNumber.from(decimalsBN).toNumber()
  if (!symbol || typeof symbol !== 'string') throw new Error('Invalid token symbol')
  if (!name || typeof name !== 'string') throw new Error('Invalid token name')
  if (decimals !== CELO.decimals) throw new Error('Invalid token decimals') // TODO only 18 is supported atm
  return {
    id: symbol,
    symbol: symbol.substring(0, 8),
    name,
    color: Color.accentBlue,
    minValue: CELO.minValue,
    displayDecimals: CELO.displayDecimals,
    address: tokenAddress,
    decimals,
    chainId: config.chainId,
  }
}

export const {
  name: addTokenSagaName,
  wrappedSaga: addTokenSaga,
  reducer: addTokenReducer,
  actions: addTokenActions,
} = createMonitoredSaga<AddTokenParams>(addToken, 'addToken')
