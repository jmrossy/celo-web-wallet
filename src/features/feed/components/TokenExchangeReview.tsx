import { Box } from '../../../components/layout/Box'
import { MoneyValue } from '../../../components/MoneyValue'
import { computeToCeloRate } from 'src/features/exchange/utils'
import { TransactionFeeProperty, TransactionStatusProperty } from './CommonTransactionProperties'
import { TransactionProperty, TransactionPropertyGroup } from './TransactionPropertyGroup'
import { TokenExchangeTx } from '../../types'
import { useTokens } from '../../wallet/hooks'
import { Stylesheet } from '../../../styles/types'
import { CELO, getTokenById } from '../../../tokens'

interface Props {
  tx: TokenExchangeTx
}

export function TokenExchangeReview({ tx }: Props) {
  const tokens = useTokens()
  const rate = computeToCeloRate(tx)

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label="Amount">
        <Box styles={style.value}>
          <span css={style.amountLabel}>In: </span>
          <MoneyValue amountInWei={tx.fromValue} token={getTokenById(tx.fromTokenId, tokens)} />
        </Box>
        <Box styles={style.value}>
          <span css={style.amountLabel}>Out: </span>
          <MoneyValue amountInWei={tx.toValue} token={getTokenById(tx.toTokenId, tokens)} />
        </Box>
      </TransactionProperty>
      <TransactionFeeProperty tx={tx} />
      <TransactionProperty label="Rate">
        <Box styles={style.value}>
          <MoneyValue amountInWei={rate.weiBasis} token={CELO} />
          <span css={style.rateDivider}> : </span>
          <MoneyValue amountInWei={rate.weiRate} token={getTokenById(rate.otherTokenId, tokens)} />
        </Box>
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
    minWidth: '3em',
  },
  rateDivider: {
    padding: '0 0.5em',
  },
}
