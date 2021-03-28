import { CeloTransaction, TransactionType } from 'src/features/types'
import { getTokenById, Tokens } from 'src/tokens'
import { trimToLength } from 'src/utils/string'

export function getTransactionDescription(tx: CeloTransaction, tokens: Tokens, useComment = true) {
  if (
    tx.type === TransactionType.StableTokenTransfer ||
    tx.type === TransactionType.CeloNativeTransfer ||
    tx.type === TransactionType.CeloTokenTransfer ||
    tx.type === TransactionType.OtherTokenTransfer
  ) {
    return tx.comment && useComment
      ? trimToLength(tx.comment, 24)
      : tx.isOutgoing
      ? 'Payment Sent'
      : 'Payment Received'
  }

  if (
    tx.type === TransactionType.StableTokenApprove ||
    tx.type === TransactionType.CeloTokenApprove
  ) {
    return 'Transfer Approval'
  }

  if (tx.type === TransactionType.TokenExchange) {
    const fromToken = getTokenById(tx.fromTokenId, tokens)
    const toToken = getTokenById(tx.toTokenId, tokens)
    return `${fromToken.symbol} to ${toToken.symbol} Exchange`
  }

  if (tx.type === TransactionType.EscrowTransfer || tx.type === TransactionType.EscrowWithdraw) {
    return tx.isOutgoing ? 'Escrow Payment' : 'Escrow Withdrawal'
  }

  if (tx.type === TransactionType.LockCelo || tx.type === TransactionType.RelockCelo) {
    return 'Lock CELO'
  }
  if (tx.type === TransactionType.UnlockCelo) {
    return 'Unlock CELO'
  }
  if (tx.type === TransactionType.WithdrawLockedCelo) {
    return 'Withdraw CELO'
  }

  if (tx.type === TransactionType.ValidatorVoteCelo) {
    return 'Vote for Validator'
  }
  if (tx.type === TransactionType.ValidatorActivateCelo) {
    return 'Activate Validator Vote'
  }
  if (
    tx.type === TransactionType.ValidatorRevokeActiveCelo ||
    tx.type === TransactionType.ValidatorRevokePendingCelo
  ) {
    return 'Revoke Validator Vote'
  }

  if (tx.type === TransactionType.GovernanceVote) {
    return 'Governance Vote'
  }

  return 'Transaction Sent'
}
