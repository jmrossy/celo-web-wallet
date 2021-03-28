import {
  TransactionAmountProperty,
  TransactionContractProperty,
  TransactionStatusProperty,
  TransactionToAddressProperty,
} from 'src/features/feed/components/CommonTransactionProperties'
import { TransactionPropertyGroup } from 'src/features/feed/components/TransactionPropertyGroup'
import { CeloTransaction } from 'src/features/types'

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
