import { BigNumber } from 'ethers'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from 'src/app/hooks'
import { Address } from 'src/components/Address'
import { Fade } from 'src/components/animation/Fade'
import { Button } from 'src/components/buttons/Button'
import { HrDivider } from 'src/components/HrDivider'
import SendPaymentIcon from 'src/components/icons/send_payment.svg'
import WarningIcon from 'src/components/icons/warning.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MoneyValue } from 'src/components/MoneyValue'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { FeeHelpIcon } from 'src/features/fees/FeeHelpIcon'
import { useFee } from 'src/features/fees/utils'
import { useIsAddressContract } from 'src/features/send/addressContractCheck'
import {
  createTransferTx,
  getTokenTransferType,
  sendTokenActions,
  sendTokenSagaName,
} from 'src/features/send/sendToken'
import { useTokens } from 'src/features/tokens/hooks'
import { isNativeTokenAddress } from 'src/features/tokens/utils'
import { useFlowTransaction } from 'src/features/txFlow/hooks'
import { txFlowCanceled } from 'src/features/txFlow/txFlowSlice'
import { TxFlowType } from 'src/features/txFlow/types'
import { useTxFlowStatusModals } from 'src/features/txFlow/useTxFlowStatusModals'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { logger } from 'src/utils/logger'

export function SendConfirmationScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const tokens = useTokens()
  const tx = useFlowTransaction()

  useEffect(() => {
    // Make sure we belong on this screen
    if (tx?.type !== TxFlowType.Send) {
      navigate('/send')
      return
    }

    const { tokenAddress, recipient, amountInWei } = tx.params
    const type = getTokenTransferType(tx.params)
    if (isNativeTokenAddress(tokenAddress)) {
      dispatch(estimateFeeActions.trigger({ txs: [{ type }], txToken: tokenAddress }))
    } else {
      // There are no gas pre-computes for non-native tokens, need to get real tx to estimate
      const token = tokens[tokenAddress]
      createTransferTx(token, recipient, BigNumber.from(amountInWei))
        .then((txRequest) =>
          dispatch(
            estimateFeeActions.trigger({ txs: [{ type, tx: txRequest }], forceGasEstimation: true })
          )
        )
        .catch((e) => logger.error('Error computing token transfer gas', e))
    }
  }, [tx])

  const isRecipientContract = useIsAddressContract(
    tx?.type === TxFlowType.Send ? tx.params.recipient : undefined
  )

  if (tx?.type !== TxFlowType.Send) return null
  const params = tx.params
  const txToken = tokens[params.tokenAddress]

  const { amount, total, feeAmount, feeCurrency, feeEstimates } = useFee(params.amountInWei)
  // Only show total if it's relevant b.c. fee currency and token match
  const showTotal = feeCurrency?.address === params.tokenAddress

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

        <Fade show={isRecipientContract}>
          <Box align="center" styles={{ ...style.inputRow, ...style.warningBox }} justify="between">
            <img src={WarningIcon} width="23px" height="20px" />
            <div css={style.warningText}>
              Warning: this recipient address is a contract, not a simple account.
            </div>
          </Box>
        </Fade>

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

        <Box direction="row" styles={style.inputRow} align="end" justify="between">
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
              {showTotal && <label>+</label>}
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

        {showTotal && (
          <>
            <HrDivider styles={style.inputRow} />
            <Box direction="row" styles={style.inputRow} justify="between">
              <label css={[style.labelCol, style.totalLabel]}>Total</label>
              <Box justify="end" align="end" styles={style.valueCol}>
                <MoneyValue
                  amountInWei={total}
                  token={txToken}
                  baseFontSize={1.2}
                  fontWeight={500}
                />
              </Box>
            </Box>
          </>
        )}

        <Box direction="row" justify="between" margin="3em 0 0 0">
          <Button
            type="button"
            size="m"
            color={Color.primaryWhite}
            onClick={onGoBack}
            disabled={isWorking}
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
    [mq[1024]]: {
      marginBottom: '1.7em',
    },
    [mq[1200]]: {
      marginBottom: '2em',
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
  warningBox: {
    background: Color.fillWarning,
    padding: '0.6em 0.8em',
    borderRadius: 6,
    opacity: 0.95,
  },
  warningText: {
    ...Font.body2,
    lineHeight: '1.4em',
    marginLeft: '0.8em',
  },
}
