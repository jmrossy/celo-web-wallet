import { BigNumber, BigNumberish } from 'ethers'
import { getErc20Contract } from 'src/blockchain/contracts'
import { config } from 'src/config'
import { fetchBalancesActions } from 'src/features/balances/fetchBalances'
import { selectTokens } from 'src/features/tokens/hooks'
import { findTokenByAddress } from 'src/features/tokens/tokenList'
import { addToken as addTokenAction } from 'src/features/tokens/tokensSlice'
import { AddTokenParams, TokenMap } from 'src/features/tokens/types'
import { hasToken } from 'src/features/tokens/utils'
import { Token } from 'src/tokens'
import { isValidAddress, normalizeAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export function validate(params: AddTokenParams, tokens: TokenMap): ErrorState {
  const { address } = params
  if (!address) {
    return invalidInput('address', 'Token address is required')
  }
  if (!isValidAddress(address)) {
    logger.error(`Invalid token address: ${address}`)
    return invalidInput('address', 'Invalid token address')
  }
  if (hasToken(address, tokens)) {
    logger.error(`Token already exists in wallet: ${address}`)
    return invalidInput('address', 'Token already exists')
  }
  return { isValid: true }
}

function* addToken(params: AddTokenParams) {
  const tokens = yield* selectTokens()
  validateOrThrow(() => validate(params, tokens), 'Invalid Token')

  const newToken = yield* call(getTokenInfo, params.address)
  yield* put(addTokenAction(newToken))

  yield* put(fetchBalancesActions.trigger())
}

export function* addTokensByAddress(addresses: Set<string>) {
  if (!addresses?.size) return
  logger.info('Attempting to add tokens by address', addresses.size)
  for (const addr of addresses) {
    try {
      const knownToken = findTokenByAddress(addr)
      if (!knownToken) {
        logger.debug('Ignoring unknown token with address', addr)
        continue
      }
      const newToken = yield* call(getTokenInfo, knownToken.address)
      yield* put(addTokenAction(newToken))
    } catch (error) {
      logger.error(`Failed to add token ${addr}`, error)
    }
  }
}

async function getTokenInfo(tokenAddress: Address): Promise<Token> {
  const contract = getErc20Contract(tokenAddress)
  // Note this assumes the existence of decimals, symbols, and name methods,
  // which are technically optional. May revisit later
  const symbolP: Promise<string> = contract.symbol()
  const nameP: Promise<string> = contract.name()
  const decimalsP: Promise<BigNumberish> = contract.decimals()
  const [symbol, name, decimalsBN] = await Promise.all([symbolP, nameP, decimalsP])
  const decimals = BigNumber.from(decimalsBN).toNumber()
  if (!symbol || typeof symbol !== 'string') throw new Error('Invalid token symbol')
  if (!name || typeof name !== 'string') throw new Error('Invalid token name')
  if (decimals < 1 || decimals > 100) throw new Error('Invalid token decimals')
  return {
    symbol: symbol.substring(0, 8),
    name,
    address: normalizeAddress(tokenAddress),
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
