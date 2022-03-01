import { appSelect } from 'src/app/appSelect'
import { addTokensByAddress } from 'src/features/tokens/addToken'
import { markMigrated } from 'src/features/tokens/tokensSlice'
import { isNativeTokenAddress } from 'src/features/tokens/utils'
import { Token } from 'src/tokens'
import { normalizeAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { call, put, select } from 'typed-redux-saga'

// Tokens used to live in the walletSlice under the balances object
// Now, balances and tokens both have their own slice
// This separation of concerns helps handle edge cases better like tokens that are renamed
// To avoid users needing to re-add their custom tokens, this attempts to migrate old state
// TODO this whole thing can be safely removed after around 2022/12/31
export function* getMigratedTokens() {
  const { isMigrated, byAddress } = yield* appSelect((state) => state.tokens)
  if (isMigrated) {
    return byAddress
  } else {
    yield* call(migrateOldTokenData)
    // Select again to get latest updates
    const tokens = yield* appSelect((state) => state.tokens.byAddress)
    return tokens
  }
}

function* migrateOldTokenData() {
  try {
    // Need to ignore state type as balances no longer exists on walletSlice type
    const balances = yield* select((state: any) => state.wallet.balances)
    const tokenMap = balances?.tokens
    if (tokenMap && typeof tokenMap === 'object') {
      const tokens = Object.values(tokenMap) as Token[]
      const addresses = tokens
        .map((t) => normalizeAddress(t.address))
        .filter((a) => !isNativeTokenAddress(a))
      const addressSet = new Set(addresses)
      yield* call(addTokensByAddress, addressSet)
    }
  } catch (error) {
    // Not an essential operation so simply proceed if it fails
    logger.error('Error migrating old token data', error)
  }
  yield* put(markMigrated())
}
