import { ExchangeTokenParams } from 'src/features/exchange/types'
import { GovernanceVoteParams } from 'src/features/governance/types'
import { LockTokenParams } from 'src/features/lock/types'
import { SendTokenParams } from 'src/features/send/types'
import { StakeTokenParams } from 'src/features/validators/types'

// As new tx flows are added, an entry must be added here
// This allows code reuse across the different flows
export enum TxFlowType {
  Send,
  Exchange,
  Lock,
  Stake,
  Governance,
  WalletConnect,
}

export interface SendFlowTx {
  type: TxFlowType.Send
  params: SendTokenParams
}

export interface ExchangeFlowTx {
  type: TxFlowType.Exchange
  params: ExchangeTokenParams
}

export interface LockFlowTx {
  type: TxFlowType.Lock
  params: LockTokenParams
}

export interface StakeFlowTx {
  type: TxFlowType.Stake
  params: StakeTokenParams
}

export interface GovernanceFlowTx {
  type: TxFlowType.Governance
  params: GovernanceVoteParams
}

export type TxFlowTransaction =
  | SendFlowTx
  | ExchangeFlowTx
  | LockFlowTx
  | StakeFlowTx
  | GovernanceFlowTx
