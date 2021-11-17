import { Address, useSendToAddress } from '../../../components/Address'
import { Button } from '../../../components/buttons/Button'
import { Box } from '../../../components/layout/Box'
import { MoneyValue } from '../../../components/MoneyValue'
import { useAddContactModal } from '../../contacts/AddContactModal'
import { TransactionStatusProperty } from './CommonTransactionProperties'
import { TransactionProperty, TransactionPropertyGroup } from './TransactionPropertyGroup'
import { getFeeFromConfirmedTx } from '../../fees/utils'
import { EscrowTransaction, TokenTransfer } from '../../types'
import { useTokens } from '../../wallet/hooks'
import { Color } from '../../../styles/Color'
import { Stylesheet } from '../../../styles/types'
import { getTokenById } from '../../../tokens'

interface Props {
  tx: TokenTransfer | EscrowTransaction
}

export function TokenTransferReview({ tx }: Props) {
  const tokens = useTokens()
  const amountLabel = tx.isOutgoing ? 'Sent: ' : 'Received: '
  const addressLabel = tx.isOutgoing ? 'Sent To' : 'Received From'
  const address = tx.isOutgoing ? tx.to : tx.from

  const { feeValue, feeCurrency } = getFeeFromConfirmedTx(tx)

  const onClickSendButton = useSendToAddress(address)
  const onClickAddContact = useAddContactModal(address)

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label={addressLabel}>
        <div css={style.value}>
          <Address address={address} buttonType="copy" />
          <Box align="center" margin="1.1em 0 0 0">
            <Button size="xs" margin="0 1.2em 0 1px" width="8em" onClick={onClickSendButton}>
              Send Payment
            </Button>
            <Button size="xs" width="8em" onClick={onClickAddContact}>
              Add Contact
            </Button>
          </Box>
        </div>
      </TransactionProperty>
      <TransactionProperty label="Amount">
        <Box styles={style.value}>
          <span css={style.amountLabel}>{amountLabel}</span>
          <MoneyValue amountInWei={tx.value} token={getTokenById(tx.tokenId, tokens)} />
        </Box>
        {tx.isOutgoing && (
          <Box styles={style.value}>
            <span css={style.amountLabel}>Fee: </span>
            <MoneyValue amountInWei={feeValue} token={feeCurrency} />
          </Box>
        )}
      </TransactionProperty>
      <TransactionProperty label="Comment">
        <div css={[style.value, !tx.comment && { color: Color.textGrey }]}>
          {tx.comment || 'No comment included'}
        </div>
      </TransactionProperty>
    </TransactionPropertyGroup>
  )
}

const style: Stylesheet = {
  value: {
    marginTop: '1em',
  },
  amountLabel: {
    display: 'inline-block',
    minWidth: '5em',
  },
}
