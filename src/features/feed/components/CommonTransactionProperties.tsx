import { getContract, getContractName } from 'src/blockchain/contracts'
import { Address } from 'src/components/Address'
import { Button } from 'src/components/buttons/Button'
import { TextLink } from 'src/components/buttons/TextLink'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { CeloContract, config } from 'src/config'
import { useAddContactModal } from 'src/features/contacts/AddContactModal'
import { TransactionProperty } from 'src/features/feed/components/TransactionPropertyGroup'
import { txReviewStyles } from 'src/features/feed/components/txReviewStyles'
import { getFeeFromConfirmedTx } from 'src/features/fees/utils'
import { CeloTransaction } from 'src/features/types'
import { CELO } from 'src/tokens'
import { useClipboardSet } from 'src/utils/clipboard'
import { logger } from 'src/utils/logger'

export function TransactionStatusProperty({ tx }: { tx: CeloTransaction }) {
  const { time, date } = getFormattedTime(tx.timestamp)

  return (
    <TransactionProperty label="Status">
      <div css={txReviewStyles.value}>{`Confirmed at ${time}`} </div>
      <div css={txReviewStyles.value}>{date} </div>
      <div css={[txReviewStyles.value, txReviewStyles.link]}>
        <TextLink link={`${config.blockscoutUrl}/tx/${tx.hash}`}>View on Celo Explorer</TextLink>
      </div>
    </TransactionProperty>
  )
}

function getFormattedTime(timestamp: number) {
  const date = new Date(timestamp * 1000)
  return {
    time: date.toLocaleTimeString(),
    date: date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }
}

export function TransactionAmountProperty({ tx }: { tx: CeloTransaction }) {
  const { feeValue, feeCurrency } = getFeeFromConfirmedTx(tx)
  return (
    <TransactionProperty label="Amount">
      <Box styles={txReviewStyles.value}>
        <span css={txReviewStyles.amountLabel}>Value: </span>
        <MoneyValue amountInWei={tx.value} token={CELO} />
      </Box>
      <Box styles={txReviewStyles.value}>
        <span css={txReviewStyles.amountLabel}>Fee: </span>
        <MoneyValue amountInWei={feeValue} token={feeCurrency} />
      </Box>
    </TransactionProperty>
  )
}

export function TransactionFeeProperty({ tx }: { tx: CeloTransaction }) {
  const { feeValue, feeCurrency } = getFeeFromConfirmedTx(tx)
  return (
    <TransactionProperty label="Fee">
      <Box styles={txReviewStyles.value}>
        <span css={txReviewStyles.feeLabel}>Fee: </span>
        <MoneyValue amountInWei={feeValue} token={feeCurrency} />
      </Box>
    </TransactionProperty>
  )
}

export function TransactionToAddressProperty({ tx }: { tx: CeloTransaction }) {
  const onClickCopyButton = useClipboardSet(tx.to)
  const onClickAddContact = useAddContactModal(tx.to)
  return (
    <TransactionProperty label="To Address">
      <div css={txReviewStyles.value}>
        <Address address={tx.to} />
        <Box align="center" margin="1.1em 0 0 0">
          <Button
            size="xs"
            margin="0 1.2em 0 1px"
            styles={txReviewStyles.actionButton}
            onClick={onClickCopyButton}
          >
            Copy Address
          </Button>
          <Button size="xs" styles={txReviewStyles.actionButton} onClick={onClickAddContact}>
            Add Contact
          </Button>
        </Box>
      </div>
    </TransactionProperty>
  )
}

export function TransactionContractProperty({ tx }: { tx: CeloTransaction }) {
  const contractDetails = getContractDetails(tx)
  return (
    <TransactionProperty label="Target Contract">
      <Box styles={txReviewStyles.value}>
        <div css={txReviewStyles.contractLabel}>Name: </div>
        <TextLink link={`${config.blockscoutUrl}/address/${tx.to}`}>
          {contractDetails.name || 'Unknown Contract'}
        </TextLink>
      </Box>
      <Box styles={txReviewStyles.value}>
        <div css={txReviewStyles.contractLabel}>Method: </div>
        <div>{contractDetails.method || 'Unknown Method'}</div>
      </Box>
    </TransactionProperty>
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
