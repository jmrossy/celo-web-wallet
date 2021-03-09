import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import { SignerType } from 'src/blockchain/signer'
import { CELO, cEUR, cUSD } from 'src/currency'
import { SecretType } from 'src/features/pincode/types'
import { Balances } from 'src/features/wallet/types'
import { isValidDerivationPath } from 'src/features/wallet/utils'
import { assert } from 'src/utils/validation'

interface Wallet {
  address: string | null
  type: SignerType | null
  derivationPath: string | null
  balances: Balances
  account: AccountStatus
  voterBalances: Balances | null // if account is vote signer for another, balance of voter
  secretType: SecretType | null
  isUnlocked: boolean
}

interface SetWalletAction {
  address: string
  type: SignerType
  derivationPath: string
}

// Data about status in the Account contract
interface AccountStatus {
  isRegistered: boolean
  voteSignerFor: string | null
  lastUpdated: number | null
}

export const walletInitialState: Wallet = {
  address: null,
  type: null,
  derivationPath: null,
  balances: {
    tokens: {
      CELO: {
        ...CELO,
        value: '0',
      },
      cUSD: {
        ...cUSD,
        value: '0',
      },
      cEUR: {
        ...cEUR,
        value: '0',
      },
    },
    lockedCelo: {
      locked: '0',
      pendingBlocked: '0',
      pendingFree: '0',
    },
    lastUpdated: null,
  },
  account: {
    isRegistered: false,
    voteSignerFor: null,
    lastUpdated: null,
  },
  voterBalances: null,
  secretType: null,
  isUnlocked: false,
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState: walletInitialState,
  reducers: {
    setAddress: (state, action: PayloadAction<SetWalletAction>) => {
      const { address, type, derivationPath } = action.payload
      assert(address && address.length === 42, `Invalid address ${address}`)
      assert(type === SignerType.Local || type === SignerType.Ledger, `Invalid type ${address}`)
      assert(isValidDerivationPath(derivationPath), `Invalid derivation path ${derivationPath}`)
      state.address = address
      state.type = type
      state.derivationPath = derivationPath
    },
    updateBalances: (state, action: PayloadAction<Balances>) => {
      const { tokens, lockedCelo, lastUpdated } = action.payload
      assert(tokens && lockedCelo && lastUpdated, 'Invalid balance')
      state.balances = action.payload
    },
    setAccountStatus: (state, action: PayloadAction<AccountStatus>) => {
      state.account = action.payload
    },
    setAccountIsRegistered: (state, action: PayloadAction<boolean>) => {
      state.account.isRegistered = action.payload
    },
    setVoterBalances: (state, action: PayloadAction<Balances | null>) => {
      state.voterBalances = action.payload
    },
    setWalletUnlocked: (state, action: PayloadAction<boolean>) => {
      state.isUnlocked = action.payload
    },
    setSecretType: (state, action: PayloadAction<SecretType>) => {
      const secretType = action.payload
      assert(
        secretType === 'pincode' || secretType === 'password',
        `Invalid secret type ${secretType}`
      )
      state.secretType = secretType
    },
    resetWallet: () => walletInitialState,
  },
})

export const {
  setAddress,
  updateBalances,
  setAccountStatus,
  setAccountIsRegistered,
  setVoterBalances,
  setWalletUnlocked,
  setSecretType,
  resetWallet,
} = walletSlice.actions
const walletReducer = walletSlice.reducer

const walletPersistConfig = {
  key: 'wallet',
  storage: storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['address', 'balances', 'type', 'derivationPath', 'secretType', 'account'], //we don't want to persist everything in the wallet store
}
export const persistedWalletReducer = persistReducer<ReturnType<typeof walletReducer>>(
  walletPersistConfig,
  walletReducer
)
