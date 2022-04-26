import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from 'src/app/hooks'
import { Address } from 'src/components/Address'
import { BackButton } from 'src/components/buttons/BackButton'
import { Button } from 'src/components/buttons/Button'
import SendPaymentIcon from 'src/components/icons/send_payment.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MoneyValue } from 'src/components/MoneyValue'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { useFee } from 'src/features/fees/utils'
import { useResolvedNftAndContract } from 'src/features/nft/hooks'
import { NftImageWithInfo } from 'src/features/nft/NftImage'
import { createNftTransferTx, sendNftActions, sendNftSagaName } from 'src/features/nft/sendNft'
import { useFlowTransaction } from 'src/features/txFlow/hooks'
import { txFlowCanceled } from 'src/features/txFlow/txFlowSlice'
import { TxFlowType } from 'src/features/txFlow/types'
import { useTxFlowStatusModals } from 'src/features/txFlow/useTxFlowStatusModals'
import { TransactionType } from 'src/features/types'
import { useWalletAddress } from 'src/features/wallet/hooks'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { logger } from 'src/utils/logger'

export function NftSendConfirmScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const activeAddress = useWalletAddress()

  const tx = useFlowTransaction()

  useEffect(() => {
    // Make sure we belong on this screen
    if (tx?.type !== TxFlowType.SendNft) {
      navigate('/nft')
      return
    }

    // There are no gas pre-computes for nft transfers, need to get real tx to estimate
    createNftTransferTx(activeAddress, tx.params)
      .then((txRequest) =>
        dispatch(
          estimateFeeActions.trigger({
            txs: [{ type: TransactionType.NftTransfer, tx: txRequest }],
            forceGasEstimation: true,
          })
        )
      )
      .catch((e) => logger.error('Error computing nft transfer gas', e))
  }, [tx])

  if (tx?.type !== TxFlowType.SendNft) return null
  const params = tx.params

  const { feeAmount, feeCurrency, feeEstimates } = useFee('0')

  const { contract, nft } = useResolvedNftAndContract(params.contract, params.tokenId)

  const onClickBack = () => {
    dispatch(sendNftActions.reset())
    dispatch(txFlowCanceled())
    navigate(-1)
  }

  const onClickSend = () => {
    if (!tx || !feeEstimates) return
    dispatch(sendNftActions.trigger({ ...params, feeEstimate: feeEstimates[0] }))
  }

  const { isWorking } = useTxFlowStatusModals({
    sagaName: sendNftSagaName,
    signaturesNeeded: 1,
    loadingTitle: 'Sending NFT...',
    successTitle: 'NFT Sent!',
    successMsg: 'Your NFT has been sent successfully',
    errorTitle: 'Transfer Failed',
    errorMsg: 'Your NFT transfer could not be processed',
  })

  return (
    <ScreenContentFrame>
      <Box align="center">
        <BackButton iconStyles={style.navButtonIcon} onGoBack={onClickBack} />
        <h1 css={style.h1}>Confirm NFT Transfer</h1>
      </Box>
      <Box margin="2em 0 0 0">
        <div css={style.content}>
          <Box align="center" styles={style.inputRow} justify="between">
            <label css={style.labelCol}>To</label>
            <Box direction="row" align="center" justify="end" styles={style.valueCol}>
              <Address address={params.recipient} />
            </Box>
          </Box>

          <Box styles={style.inputRow} justify="between">
            <label css={style.labelCol}>Project</label>
            <label css={[style.valueLabel, style.valueCol]}>
              {contract?.name || 'Unknown Project'}
            </label>
          </Box>

          <Box styles={style.inputRow} justify="between">
            <label css={style.labelCol}>Identifier</label>
            <label css={[style.valueLabel, style.valueCol]}>{'#' + params.tokenId}</label>
          </Box>

          <Box styles={style.inputRow} justify="between">
            <label css={style.labelCol}>Fee</label>
            {feeAmount && feeCurrency ? (
              <Box justify="end" align="end" styles={style.valueCol}>
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

          <Box direction="row" justify="between" margin="2.5em 0 0 0">
            <Button
              type="button"
              size="m"
              color={Color.primaryWhite}
              onClick={onClickBack}
              disabled={isWorking}
              margin="0 2em 0 0"
              width="5em"
            >
              Back
            </Button>
            <Button
              type="submit"
              size="m"
              onClick={onClickSend}
              icon={SendPaymentIcon}
              disabled={isWorking || !feeAmount || !nft || !contract}
            >
              Send NFT
            </Button>
          </Box>
        </div>
        <div css={style.imageContainer}>
          <NftImageWithInfo nft={nft} contract={contract} styles={style.nftImage} />
        </div>
      </Box>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  h1: {
    ...Font.h2,
    margin: '0 0 0 1em',
  },
  content: {
    width: '100%',
    maxWidth: '23em',
  },
  inputRow: {
    marginBottom: '1.5em',
    [mq[1024]]: {
      marginBottom: '2em',
    },
  },
  labelCol: {
    ...Font.inputLabel,
    color: Color.primaryGrey,
    width: '9em',
    marginRight: '1em',
  },
  valueCol: {
    width: '12em',
    textAlign: 'end',
  },
  imageContainer: {
    display: 'none',
    [mq[1024]]: {
      display: 'block',
      marginLeft: '3em',
    },
  },
  nftImage: {
    ':hover': undefined,
  },
}
