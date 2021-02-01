import { ExchangeTokenParams } from 'src/features/exchange/types'
import { LockTokenParams } from 'src/features/lock/types'
import { SendTokenParams } from 'src/features/send/types'

// As new tx flows are added, an entry must be added here
// This allows code reuse across the different flows
export enum TxFlowType {
  Send = 'send',
  Exchange = 'exchange',
  Lock = 'lock',
  Stake = 'stake',
  Vote = 'vote',
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

// export interface StakeFlowTx {
//   type: TxFlowType.Stake
//   params: ValidatorStakeParams
// }

// export interface VoteFlowTx {
//   type: TxFlowType.Vote
//   params: GovernanceVoteParams
// }

export type TxFlowTransaction = SendFlowTx | ExchangeFlowTx | LockFlowTx
