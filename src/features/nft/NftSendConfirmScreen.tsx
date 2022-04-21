import { BigNumber } from 'ethers'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from 'src/app/hooks'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { useFee } from 'src/features/fees/utils'
import { useFlowTransaction } from 'src/features/txFlow/hooks'
import { txFlowCanceled } from 'src/features/txFlow/txFlowSlice'
import { TxFlowType } from 'src/features/txFlow/types'
import { useTxFlowStatusModals } from 'src/features/txFlow/useTxFlowStatusModals'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { logger } from 'src/utils/logger'

export function NftSendConfirmScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const tx = useFlowTransaction()

  useEffect(() => {
    // Make sure we belong on this screen
    if (tx?.type !== TxFlowType.NftSend) {
      navigate('/nft')
      return
    }

    // There are no gas pre-computes for nft transfers, need to get real tx to estimate
    const txRequestP = createNftTransferTx(token, recipient, BigNumber.from(amountInWei))
    txRequestP
      .then((txRequest) =>
        dispatch(
          estimateFeeActions.trigger({ txs: [{ type, tx: txRequest }], forceGasEstimation: true })
        )
      )
      .catch((e) => logger.error('Error computing token transfer gas', e))
  }, [tx])

  if (tx?.type !== TxFlowType.NftSend) return null
  const params = tx.params

  const { amount, total, feeAmount, feeCurrency, feeEstimates } = useFee(params.amountInWei)

  const onGoBack = () => {
    dispatch(sendNftActions.reset())
    dispatch(txFlowCanceled())
    navigate(-1)
  }

  const onSend = () => {
    if (!tx || !feeEstimates) return
    dispatch(sendNftActions.trigger({ ...params, feeEstimate: feeEstimates[0] }))
  }

  const { isWorking } = useTxFlowStatusModals({
    sagaName: sendNftSagaName,
    signaturesNeeded: 1,
    loadingTitle: 'Sending Payment...',
    successTitle: 'Payment Sent!',
    successMsg: 'Your payment has been sent successfully',
    errorTitle: 'Payment Failed',
    errorMsg: 'Your payment could not be processed',
    reqSignatureWarningLabel: params.comment ? 'payments with comments' : undefined,
  })

  return (
    <ScreenContentFrame>
      <h1 css={style.h1}>{`Send ${name}`}</h1>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  h1: {
    ...Font.h2Green,
    marginBottom: '1.5em',
  },
}
