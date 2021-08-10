import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import type { SessionTypes } from '@walletconnect/types'
import { BigNumber } from 'ethers'
import { useState } from 'react'
import {} from 'src/blockchain/contracts'
import { Address } from 'src/components/Address'
import { TextButton } from 'src/components/buttons/TextButton'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { MoneyValue } from 'src/components/MoneyValue'
import { WalletConnectMethods } from 'src/features/walletConnect/types'
import {
  identifyContractByAddress,
  identifyFeeToken,
  translateTxFields,
} from 'src/features/walletConnect/utils'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { CELO } from 'src/tokens'

export function RequestDetails({
  requestEvent,
}: {
  requestEvent: SessionTypes.RequestEvent | null
}) {
  if (!requestEvent || !requestEvent.request) {
    throw new Error('WalletConnect request event is missing')
  }
  const { method, params } = requestEvent.request
  if (method === WalletConnectMethods.accounts) {
    return <AccountsRequest />
  }
  if (method === WalletConnectMethods.computeSharedSecret) {
    return <div css={modalStyles.p}>Method not yet supported.</div>
  }
  if (method === WalletConnectMethods.personalDecrypt) {
    return <div css={modalStyles.p}>Method not yet supported.</div>
  }
  if (method === WalletConnectMethods.sign || method === WalletConnectMethods.personalSign) {
    return <SignRequest data={params} />
  }
  if (
    method === WalletConnectMethods.sendTransaction ||
    method === WalletConnectMethods.signTransaction
  ) {
    const formattedTx = translateTxFields(params)
    return <TransactionRequest txRequest={formattedTx} />
  }
  if (method === WalletConnectMethods.signTypedData) {
    return <div css={modalStyles.p}>Method not yet supported.</div>
  } else {
    throw new Error(`Unsupported WalletConnect method: ${method}`)
  }
}

function AccountsRequest() {
  return (
    <>
      <label css={style.label}>Request details:</label>
      <div css={modalStyles.p}>
        This request will share your account address. No private information will be shared.
      </div>
    </>
  )
}

function TransactionRequest({ txRequest }: { txRequest: CeloTransactionRequest }) {
  const { to, value, gasPrice, gasLimit, feeCurrency, data } = txRequest
  if (!to || !gasPrice || !gasLimit)
    throw new Error('Cannot display invalid WalletConnect transaction request')

  const contractName = to ? identifyContractByAddress(to) : null
  const txValue = BigNumber.from(value ?? 0)
  const feeEstimate = BigNumber.from(gasPrice).mul(gasLimit)
  const feeToken = identifyFeeToken(feeCurrency)

  const [showData, setShowData] = useState(false)
  const onShowClick = () => {
    setShowData(true)
  }

  return (
    <>
      <Box align="center" justify="between" styles={style.txFieldRow}>
        <div css={style.txFieldLabel}>To:</div>
        <div css={style.txAddress}>
          <Address address={to} />
        </div>
      </Box>
      {contractName && (
        <Box align="center" justify="between" styles={style.txFieldRow}>
          <div css={style.txFieldLabel}>Contract Name:</div>
          <div css={style.txFieldValue}>{contractName}</div>
        </Box>
      )}
      {txValue.gt(0) && (
        <Box align="center" justify="between" styles={style.txFieldRow}>
          <div css={style.txFieldLabel}>Value:</div>
          <MoneyValue amountInWei={txValue} token={CELO} baseFontSize={1} />
        </Box>
      )}
      <Box align="center" justify="between" styles={style.txFieldRow}>
        <div css={style.txFieldLabel}>Fee:</div>
        <MoneyValue amountInWei={feeEstimate} token={feeToken} baseFontSize={1} />
      </Box>
      {data && (
        <Box align="center" justify="between" styles={style.txFieldRow}>
          <div css={style.txFieldLabel}>Data:</div>
          {showData ? (
            <div css={style.txFieldDetails}>{data}</div>
          ) : (
            <TextButton onClick={onShowClick}>Show Data</TextButton>
          )}
        </Box>
      )}
    </>
  )
}

function SignRequest({ data }: { data: string }) {
  return (
    <>
      <label css={style.label}>Request data:</label>
      <div css={style.detailsSmall}>{JSON.stringify(data)}</div>
    </>
  )
}

const style: Stylesheet = {
  label: {
    ...modalStyles.p,
    ...Font.bold,
  },
  detailsSmall: {
    ...modalStyles.p,
    fontSize: '0.875em',
  },
  txFieldRow: {
    width: '22em',
    padding: '0 2em',
    marginTop: '0.75em',
  },
  txAddress: {
    // TODO using scale for convenience for now but ideally
    // this would use sizing in the Address component instead
    transform: 'scale(0.8)',
    transformOrigin: 'right',
  },
  txFieldLabel: {
    ...modalStyles.pMargin0,
    ...Font.bold,
  },
  txFieldValue: modalStyles.pMargin0,
  txFieldDetails: {
    fontSize: '0.85em',
    lineHeight: '1.6em',
    textAlign: 'left',
    overflowWrap: 'break-word',
    maxWidth: '15em',
  },
}
