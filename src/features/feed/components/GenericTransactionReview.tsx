import { getContract, getContractName } from 'src/blockchain/contracts'
import { Address, useCopyAddress } from 'src/components/Address'
import { Button } from 'src/components/buttons/Button'
import { TextLink } from 'src/components/buttons/TextLink'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { CeloContract, config } from 'src/config'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { TransactionStatusProperty } from 'src/features/feed/components/TransactionStatusProperty'
import { getFeeFromConfirmedTx } from 'src/features/fees/utils'
import { CeloTransaction } from 'src/features/types'
import { Stylesheet } from 'src/styles/types'
import { CELO } from 'src/tokens'
import { logger } from 'src/utils/logger'

interface Props {
  tx: CeloTransaction
}

export function GenericTransactionReview({ tx }: Props) {
  const { feeValue, feeCurrency } = getFeeFromConfirmedTx(tx)

  const onClickCopyButton = useCopyAddress(tx.to)

  const contractDetails = getContractDetails(tx)

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label="To Address">
        <div css={style.value}>
          <Address address={tx.to} />
          <Button size="xs" margin="1.1em 0 0 0" onClick={onClickCopyButton}>
            Copy Address
          </Button>
        </div>
      </TransactionProperty>
      <TransactionProperty label="Amount">
        <Box styles={style.value}>
          <span css={style.amountLabel}>Value: </span>
          <MoneyValue amountInWei={tx.value} token={CELO} />
        </Box>
        <Box styles={style.value}>
          <span css={style.amountLabel}>Fee: </span>
          <MoneyValue amountInWei={feeValue} token={feeCurrency} />
        </Box>
      </TransactionProperty>
      <TransactionProperty label="Target Contract">
        <Box styles={style.value}>
          <span css={style.amountLabel}>Name: </span>
          <TextLink link={`${config.blockscoutUrl}/address/${tx.to}`}>
            {contractDetails.name || 'Unknown Contract'}
          </TextLink>
        </Box>
        <Box styles={style.value}>
          <span css={style.amountLabel}>Method: </span>
          <div>{contractDetails.method || 'Unknown Method'}</div>
        </Box>
      </TransactionProperty>
    </TransactionPropertyGroup>
  )
}

function getContractDetails(tx: CeloTransaction) {
  const details: {
    name: CeloContract | null
    method: string | null
  } = {
    name: null,
    method: null,
  }
  try {
    const data = tx.inputData
    const contractName = getContractName(tx.to)
    details.name = contractName
    if (!contractName || !data) return details
    const contract = getContract(contractName)
    const txDescription = contract.interface.parseTransaction({ data })
    details.method = txDescription?.name
    return details
  } catch (error) {
    logger.warn('Unable to parse tx contract details', error)
    return details
  }
}

const style: Stylesheet = {
  value: {
    marginTop: '1em',
  },
  amountLabel: {
    display: 'inline-block',
    minWidth: '4em',
  },
}
