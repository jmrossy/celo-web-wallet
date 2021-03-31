import { FeeEstimate } from 'src/features/fees/types'

interface WalletConnectTxData {
  to: string
}

export interface WalletConnectParams {
  //TODO
  data: WalletConnectTxData
  feeEstimate?: FeeEstimate
}
