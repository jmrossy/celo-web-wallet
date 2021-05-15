import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Address } from 'src/components/Address'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MoneyValue } from 'src/components/MoneyValue'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { FeeHelpIcon } from 'src/features/fees/FeeHelpIcon'
import { useFee } from 'src/features/fees/utils'
import { txFlowCanceled } from 'src/features/txFlow/txFlowSlice'
import { TxFlowType } from 'src/features/txFlow/types'
import { useTxFlowStatusModals } from 'src/features/txFlow/useTxFlowStatusModals'
import { TransactionType } from 'src/features/types'
import { createWalletConnectTxRequest } from 'src/features/walletConnect/walletConnect'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { logger } from 'src/utils/logger'

export function WalletConnectConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const tx = useSelector((state: RootState) => state.txFlow.transaction)

  useEffect(() => {
    // Make sure we belong on this screen
    if (!tx || tx.type !== TxFlowType.WalletConnect) {
      navigate('/')
      return
    }
    // There are no gas pre-computes for non-native tokens, need to get real tx to estimate
    const txRequestP = createWalletConnectTxRequest(tx.params)
    const type = TransactionType.Other
    txRequestP
      .then((txRequest) =>
        dispatch(
          estimateFeeActions.trigger({ txs: [{ type, tx: txRequest }], forceGasEstimation: true })
        )
      )
      .catch((e) => logger.error('Error computing token transfer gas', e))
  }, [tx])

  if (!tx || tx.type !== TxFlowType.WalletConnect) return null
  const params = tx.params

  const { feeAmount, feeCurrency, feeEstimates } = useFee('0')

  const onCancel = () => {
    // dispatch(walletConnectRequestActions.reset())
    dispatch(txFlowCanceled())
    navigate('/')
  }

  const onSend = () => {
    if (!tx || !feeEstimates) return
    // dispatch(walletConnectRequestActions.trigger({ ...params, feeEstimate: feeEstimates[0] }))
  }

  const { isWorking } = useTxFlowStatusModals({
    sagaName: 'TODO',
    signaturesNeeded: 1,
    loadingTitle: 'Sending Transaction...',
    successTitle: 'Transaction Sent!',
    successMsg: 'Your transaction has been sent',
    errorTitle: 'Transaction Failed',
    errorMsg: 'Your transaction could not be processed',
    reqSignatureWarningLabel: 'WalletConnect transactions',
  })

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={Font.h2Green}>Review WalletConnect Transaction</h1>

        <Box align="center" styles={style.inputRow} justify="between">
          <label css={style.labelCol}>To</label>
          <Box direction="row" align="center" justify="end" styles={style.valueCol}>
            <Address address={params.data.to} />
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

        <Box direction="row" justify="between" margin="3em 0 0 0">
          <Button
            type="button"
            size="m"
            color={Color.altGrey}
            onClick={onCancel}
            disabled={isWorking || !feeAmount}
            margin="0 2em 0 0"
            width="5em"
          >
            Cancel
          </Button>
          <Button type="submit" size="m" onClick={onSend} disabled={isWorking || !feeAmount}>
            Send Transaction
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
}
