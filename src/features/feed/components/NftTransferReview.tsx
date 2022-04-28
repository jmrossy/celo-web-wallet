import { Address, useSendToAddress } from 'src/components/Address'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { TransactionStatusProperty } from 'src/features/feed/components/CommonTransactionProperties'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { txReviewStyles } from 'src/features/feed/components/txReviewStyles'
import { getFeeFromConfirmedTx } from 'src/features/fees/utils'
import { useNftContracts } from 'src/features/nft/hooks'
import { NftTransferTx } from 'src/features/types'
import { Stylesheet } from 'src/styles/types'

interface Props {
  tx: NftTransferTx
}

export function NftTransferReview({ tx }: Props) {
  const contracts = useNftContracts()
  const { feeValue, feeCurrency } = getFeeFromConfirmedTx(tx)

  const onClickSendButton = useSendToAddress(tx.to)

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label="Sent NFT to:">
        <div css={txReviewStyles.value}>
          <Address address={tx.to} buttonType="copy" />
          <Button
            size="xs"
            margin="1.1em 0 0 1px"
            styles={txReviewStyles.actionButton}
            onClick={onClickSendButton}
          >
            Send Payment
          </Button>
        </div>
      </TransactionProperty>
      <TransactionProperty label="Fee">
        <Box styles={txReviewStyles.value}>
          <span css={style.amountLabel}>Fee: </span>
          <MoneyValue amountInWei={feeValue} token={feeCurrency} />
        </Box>
      </TransactionProperty>
      <TransactionProperty label="NFT Details">
        <Box styles={txReviewStyles.value}>
          <span css={style.amountLabel}>Contract: </span>
          <span css={style.amountLabel}>{contracts[tx.contract]?.name || tx.contract}</span>
        </Box>
        <Box styles={txReviewStyles.value}>
          <span css={style.amountLabel}>Token Id: </span>
          <span css={style.amountLabel}>{tx.tokenId}</span>
        </Box>
      </TransactionProperty>
    </TransactionPropertyGroup>
  )
}

const style: Stylesheet = {
  amountLabel: {
    display: 'inline-block',
    minWidth: '5em',
  },
}
