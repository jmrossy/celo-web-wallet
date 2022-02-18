import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { TokenMap } from 'src/features/tokens/types'
import { NativeTokens, Token } from 'src/tokens'
import { normalizeAddress } from 'src/utils/addresses'
import { assert } from 'src/utils/validation'

interface TokensState {
  byAddress: TokenMap
}

const defaultTokens = Object.values(NativeTokens).reduce<TokenMap>((result, token: Token) => {
  result[token.address] = token
  return result
}, {})

const initialState: TokensState = {
  byAddress: defaultTokens,
}

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    addToken: (state, action: PayloadAction<Token>) => {
      const newToken = action.payload
      assert(newToken, 'No new token provided')
      assert(
        newToken.address && newToken.address === normalizeAddress(newToken.address),
        'No new token address invalid'
      )
      assert(!state.byAddress[newToken.address], 'Token already exists')
      state.byAddress[newToken.address] = newToken
    },
    removeToken: (state, action: PayloadAction<string>) => {
      const tokenAddr = action.payload
      assert(state.byAddress[tokenAddr], 'Token does not exist')
      assert(!defaultTokens[tokenAddr], 'Token is native')
      delete state.byAddress[tokenAddr]
    },
    resetTokens: () => initialState,
  },
})

export const { addToken, removeToken, resetTokens } = tokensSlice.actions
const tokenReducer = tokensSlice.reducer

const persistConfig = {
  key: 'tokens',
  storage: storage,
  whitelist: ['byAddress'],
}

export const persistedTokensReducer = persistReducer<ReturnType<typeof tokenReducer>>(
  persistConfig,
  tokenReducer
)
