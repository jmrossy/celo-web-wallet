import {
  TransactionAmountProperty,
  TransactionContractProperty,
  TransactionStatusProperty,
  TransactionToAddressProperty,
} from './CommonTransactionProperties'
import { TransactionPropertyGroup } from './TransactionPropertyGroup'
import { CeloTransaction } from '../../types'

export function GenericTransactionReview({ tx }: { tx: CeloTransaction }) {
  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionToAddressProperty tx={tx} />
      <TransactionAmountProperty tx={tx} />
      <TransactionContractProperty tx={tx} />
    </TransactionPropertyGroup>
  )
}
