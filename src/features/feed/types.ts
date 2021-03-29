import { utils } from 'ethers'
import { CeloContract } from 'src/config'

export interface BlockscoutTxBase {
  hash: string
  value: string
  from: string
  to: string
  input: string
  gas: string
  gasUsed: string
  gasPrice: string
  gatewayFee: string
  gatewayFeeRecipient: string
  feeCurrency: string
  nonce: string
  timeStamp: string
  contractAddress: string
  confirmations: string
  blockNumber: string
  blockHash: string
  cumulativeGasUsed: string
  transactionIndex: string
  isError?: string
}

export interface BlockscoutTx extends BlockscoutTxBase {
  tokenTransfers?: BlockscoutTokenTransfer[]
}

export interface BlockscoutTokenTransfer extends BlockscoutTxBase {
  tokenSymbol: string
  tokenName: string
  tokenDecimal: string
  logIndex: string
}

export type AbiInterfaceMap = Partial<Record<CeloContract, utils.Interface>>
