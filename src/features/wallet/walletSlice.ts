import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import { SignerType } from 'src/blockchain/signer'
import { SecretType } from 'src/features/pincode/types'
import { Balances } from 'src/features/wallet/types'
import { isValidDerivationPath } from 'src/features/wallet/utils'
import { assert } from 'src/utils/validation'

interface Wallet {
  address: string | null
  type: SignerType | null
  derivationPath: string | null
  balances: Balances
  secretType: SecretType | null
  isUnlocked: boolean
  account: AccountStatus
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
    cUsd: '0',
    celo: '0',
    lockedCelo: {
      locked: '0',
      pendingBlocked: '0',
      pendingFree: '0',
    },
    lastUpdated: null,
  },
  secretType: null,
  isUnlocked: false,
  account: {
    isRegistered: false,
    voteSignerFor: null,
    lastUpdated: null,
  },
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
      const { cUsd, celo, lockedCelo, lastUpdated } = action.payload
      assert(cUsd && celo && lockedCelo && lastUpdated, 'Invalid balance')
      state.balances = action.payload
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
    setAccountStatus: (state, action: PayloadAction<AccountStatus>) => {
      state.account = action.payload
    },
    resetWallet: () => walletInitialState,
  },
})

export const {
  setAddress,
  updateBalances,
  setWalletUnlocked,
  setSecretType,
  setAccountStatus,
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
