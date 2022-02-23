import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Address } from 'src/components/Address'
import { TextButton } from 'src/components/buttons/TextButton'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { MoneyValue } from 'src/components/MoneyValue'
import { NULL_ADDRESS } from 'src/consts'
import { estimateFeeActions, estimateFeeSagaName } from 'src/features/fees/estimateFee'
import { useFee } from 'src/features/fees/utils'
import { getNativeToken } from 'src/features/tokens/utils'
import { TransactionType } from 'src/features/types'
import { WalletConnectMethod } from 'src/features/walletConnect/types'
import { identifyContractByAddress, translateTxFields } from 'src/features/walletConnect/utils'
import { failWcRequest } from 'src/features/walletConnect/walletConnectSlice'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { CELO } from 'src/tokens'
import { useSagaStatusNoModal } from 'src/utils/useSagaStatus'
import type { SessionTypes } from 'wcv2/types'

export function RequestDetails({
  requestEvent,
}: {
  requestEvent: SessionTypes.RequestEvent | null
}) {
  if (!requestEvent || !requestEvent.request) {
    throw new Error('WalletConnect request event is missing')
  }
  const { method, params } = requestEvent.request
  if (method === WalletConnectMethod.accounts) {
    return <AccountsRequest />
  }
  if (method === WalletConnectMethod.computeSharedSecret) {
    return <div css={modalStyles.p}>Method not yet supported.</div>
  }
  if (method === WalletConnectMethod.personalDecrypt) {
    return <div css={modalStyles.p}>Method not yet supported.</div>
  }
  if (method === WalletConnectMethod.sign || method === WalletConnectMethod.personalSign) {
    return <SignRequest data={params} />
  }
  if (
    method === WalletConnectMethod.sendTransaction ||
    method === WalletConnectMethod.signTransaction
  ) {
    const formattedTx = translateTxFields(params)
    return <TransactionRequest txRequest={formattedTx} />
  }
  if (method === WalletConnectMethod.signTypedData) {
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
  const contractName = to ? identifyContractByAddress(to) : null
  const txValue = BigNumber.from(value ?? 0)
  const feeToken = getNativeToken(feeCurrency) || CELO
  const gasPrepopulated = !!(gasPrice && gasLimit)

  const dispatch = useDispatch()
  useEffect(() => {
    if (!gasPrepopulated) {
      dispatch(
        estimateFeeActions.trigger({
          txs: [{ type: TransactionType.Other, tx: txRequest }],
          preferredToken: feeToken.address,
          forceGasEstimation: true,
        })
      )
    }
  }, [])

  const computedFee = useFee(txValue.toString())
  const feeAmount = gasPrepopulated
    ? BigNumber.from(gasPrice).mul(gasLimit).toString()
    : computedFee.feeAmount

  const onFeeFailure = () => {
    dispatch(failWcRequest('Unable to compute fee, the transaction may be invalid'))
  }
  useSagaStatusNoModal(estimateFeeSagaName, undefined, onFeeFailure)

  const [showData, setShowData] = useState(false)
  const onShowClick = () => {
    setShowData(true)
  }

  return (
    <>
      <Box align="center" justify="between" styles={style.txFieldRow}>
        <div css={style.txFieldLabel}>To:</div>
        <div css={style.txAddress}>
          <Address address={to || NULL_ADDRESS} />
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
        {feeAmount ? (
          <MoneyValue amountInWei={feeAmount} token={feeToken} baseFontSize={1} />
        ) : (
          // TODO a proper loader (need to update mocks)
          <div>Loading...</div>
        )}
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
