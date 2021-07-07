import { BigNumber } from 'ethers'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { Address } from 'src/components/Address'
import { Button } from 'src/components/buttons/Button'
import SendPaymentIcon from 'src/components/icons/send_payment.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MoneyValue } from 'src/components/MoneyValue'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { FeeHelpIcon } from 'src/features/fees/FeeHelpIcon'
import { useFee } from 'src/features/fees/utils'
import {
  createTransferTx,
  getTokenTransferType,
  sendTokenActions,
  sendTokenSagaName,
} from 'src/features/send/sendToken'
import { txFlowCanceled } from 'src/features/txFlow/txFlowSlice'
import { TxFlowType } from 'src/features/txFlow/types'
import { useTxFlowStatusModals } from 'src/features/txFlow/useTxFlowStatusModals'
import { useTokens } from 'src/features/wallet/hooks'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { isNativeToken, NativeTokenId } from 'src/tokens'
import { logger } from 'src/utils/logger'

export function SendConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const tokens = useTokens()
  const tx = useSelector((state: RootState) => state.txFlow.transaction)

  useEffect(() => {
    // Make sure we belong on this screen
    if (!tx || tx.type !== TxFlowType.Send) {
      navigate('/send')
      return
    }
    const { tokenId, recipient, amountInWei } = tx.params
    const type = getTokenTransferType(tx.params)
    if (isNativeToken(tokenId)) {
      const txToken = tokenId as NativeTokenId
      dispatch(estimateFeeActions.trigger({ txs: [{ type }], txToken }))
    } else {
      // There are no gas pre-computes for non-native tokens, need to get real tx to estimate
      const token = tokens[tokenId]
      const txRequestP = createTransferTx(token, recipient, BigNumber.from(amountInWei))
      txRequestP
        .then((txRequest) =>
          dispatch(
            estimateFeeActions.trigger({ txs: [{ type, tx: txRequest }], forceGasEstimation: true })
          )
        )
        .catch((e) => logger.error('Error computing token transfer gas', e))
    }
  }, [tx])

  if (!tx || tx.type !== TxFlowType.Send) return null
  const params = tx.params
  const txToken = tokens[params.tokenId]

  const { amount, total, feeAmount, feeCurrency, feeEstimates } = useFee(params.amountInWei)

  const onGoBack = () => {
    dispatch(sendTokenActions.reset())
    dispatch(txFlowCanceled())
    navigate(-1)
  }

  const onSend = () => {
    if (!tx || !feeEstimates) return
    dispatch(sendTokenActions.trigger({ ...params, feeEstimate: feeEstimates[0] }))
  }

  const { isWorking } = useTxFlowStatusModals({
    sagaName: sendTokenSagaName,
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
      <div css={style.content}>
        <h1 css={Font.h2Green}>Review Payment</h1>

        <Box align="center" styles={style.inputRow} justify="between">
          <label css={style.labelCol}>To</label>
          <Box direction="row" align="center" justify="end" styles={style.valueCol}>
            <Address address={params.recipient} />
          </Box>
        </Box>

        {params.comment && (
          <Box direction="row" styles={style.inputRow} justify="between">
            <label css={style.labelCol}>Comment</label>
            <label css={[style.valueLabel, style.valueCol]}>{params.comment}</label>
          </Box>
        )}

        <Box direction="row" styles={style.inputRow} justify="between">
          <label css={style.labelCol}>Value</label>
          <Box justify="end" align="end" styles={style.valueCol}>
            <MoneyValue amountInWei={amount} token={txToken} baseFontSize={1.2} />
          </Box>
        </Box>

        <Box
          direction="row"
          styles={{ ...style.inputRow, ...style.bottomBorder }}
          align="end"
          justify="between"
        >
          <Box
            direction="row"
            justify="between"
            align="end"
            styles={{ ...style.labelCol, width: '10em' }}
          >
            <label>
              Fee <FeeHelpIcon />
            </label>
          </Box>
          {feeAmount && feeCurrency ? (
            <Box justify="end" align="end" styles={style.valueCol}>
              <label>+</label>
              <MoneyValue
                amountInWei={feeAmount}
                token={feeCurrency}
                baseFontSize={1.2}
                margin="0 0 0 0.25em"
              />
            </Box>
          ) : (
            // TODO a proper loader (need to update mocks)
            <div css={style.valueCol}>...</div>
          )}
        </Box>

        <Box direction="row" styles={style.inputRow} justify="between">
          <label css={[style.labelCol, style.totalLabel]}>Total</label>
          <Box justify="end" align="end" styles={style.valueCol}>
            <MoneyValue amountInWei={total} token={txToken} baseFontSize={1.2} fontWeight={500} />
          </Box>
        </Box>

        <Box direction="row" justify="between" margin="3em 0 0 0">
          <Button
            type="button"
            size="m"
            color={Color.primaryWhite}
            onClick={onGoBack}
            disabled={isWorking || !feeAmount}
            margin="0 2em 0 0"
            width="5em"
          >
            Back
          </Button>
          <Button
            type="submit"
            size="m"
            onClick={onSend}
            icon={SendPaymentIcon}
            disabled={isWorking || !feeAmount}
          >
            Send Payment
          </Button>
        </Box>
      </div>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  content: {
    width: '100%',
    maxWidth: '23em',
  },
  inputRow: {
    marginBottom: '1.4em',
    [mq[1200]]: {
      marginBottom: '1.6em',
    },
  },
  labelCol: {
    ...Font.inputLabel,
    color: Color.primaryGrey,
    width: '9em',
    marginRight: '1em',
    [mq[1200]]: {
      width: '11em',
    },
  },
  valueCol: {
    width: '12em',
    textAlign: 'end',
  },
  totalLabel: {
    ...Font.bold,
    color: Color.primaryGrey,
  },
  valueLabel: {
    ...Font.body,
    fontSize: '1.2em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bottomBorder: {
    paddingBottom: '1.25em',
    borderBottom: `1px solid ${Color.borderMedium}`,
  },
}
