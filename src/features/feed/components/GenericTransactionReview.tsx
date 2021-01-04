import { getContractName } from 'src/blockchain/contracts'
import { Address } from 'src/components/Address'
import { MoneyValue } from 'src/components/MoneyValue'
import { config } from 'src/config'
import { Currency } from 'src/currency'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { TransactionStatusProperty } from 'src/features/feed/components/TransactionStatusProperty'
import { getFeeFromConfirmedTx } from 'src/features/fees/utils'
import { CeloTransaction } from 'src/features/types'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

interface Props {
  tx: CeloTransaction
}

export function GenericTransactionReview({ tx }: Props) {
  const { feeValue, feeCurrency } = getFeeFromConfirmedTx(tx)

  const contractName = getContractName(tx.to)

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label="To Address">
        <div css={style.value}>
          <Address address={tx.to} />
        </div>
      </TransactionProperty>
      <TransactionProperty label="Amount">
        <div css={style.value}>
          <span css={style.amountLabel}>Value: </span>
          <MoneyValue amountInWei={tx.value} currency={Currency.CELO} />
        </div>
        <div css={style.value}>
          <span css={style.amountLabel}>Fee: </span>
          <MoneyValue amountInWei={feeValue} currency={feeCurrency} />
        </div>
      </TransactionProperty>
      {contractName && (
        <TransactionProperty label={'Target Contract'}>
          <div css={style.value}>
            <a
              href={config.blockscoutUrl + `/address/${tx.to}`}
              target="_blank"
              rel="noopener noreferrer"
              css={Font.linkLight}
            >
              {contractName}
            </a>
          </div>
        </TransactionProperty>
      )}
    </TransactionPropertyGroup>
  )
}

const style: Stylesheet = {
  value: {
    marginTop: '0.75em',
  },
  amountLabel: {
    display: 'inline-block',
    minWidth: '4em',
  },
}
