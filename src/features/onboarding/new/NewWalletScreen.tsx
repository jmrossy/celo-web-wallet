import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { Spinner } from 'src/components/Spinner'
import { config } from 'src/config'
import { WebWalletWarning } from 'src/features/download/WebWalletWarning'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { createWalletActions, createWalletSagaName } from 'src/features/wallet/createWallet'
import { WalletDetails } from 'src/features/wallet/WalletDetails'
import { resetWallet } from 'src/features/wallet/walletSlice'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { logger } from 'src/utils/logger'
import { SagaStatus } from 'src/utils/saga'

export function NewWalletScreen() {
  const [hasShownWarning, setHasShownWarning] = useState(config.isElectron)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const address = useSelector((s: RootState) => s.wallet.address)

  useEffect(() => {
    dispatch(createWalletActions.reset())

    if (address) {
      // TODO show warning modal here
      logger.warn('Attempting to create new address when one is already assigned')
      dispatch(resetWallet())
    }

    // For smoother loading render
    setTimeout(() => {
      dispatch(createWalletActions.trigger())
    }, 1000)
  }, [])

  const status = useSagaStatus(
    createWalletSagaName,
    'Error Creating Wallet',
    'Something went wrong when creating your new wallet, sorry! Please try again.',
    undefined,
    false
  )

  const onClickContinue = () => {
    navigate('/setup/set-pin', { state: { pageNumber: 3 } })
  }

  const isLoading = !address || !status || status === SagaStatus.Started

  return (
    <OnboardingScreenFrame current={2} total={3}>
      <h1 css={style.header}>Your New Celo Account</h1>
      {!hasShownWarning && (
        <WebWalletWarning type="create" onClose={() => setHasShownWarning(true)} />
      )}
      {hasShownWarning && (
        <>
          <div css={style.container}>
            <div css={isLoading ? style.contentLoading : null}>
              <WalletDetails />
            </div>
            {isLoading && (
              <div css={style.spinner}>
                <Spinner />
              </div>
            )}
          </div>
          <Button
            size="l"
            onClick={onClickContinue}
            margin={'3em 0 0 0'}
            disabled={status !== SagaStatus.Success || !address}
          >
            Continue
          </Button>
        </>
      )}
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  header: {
    ...Font.h1Green,
    [mq[768]]: {
      marginBottom: '2em',
    },
  },
  container: {
    position: 'relative',
  },
  contentLoading: {
    opacity: 0.7,
    filter: 'blur(3px)',
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    opacity: 0.7,
  },
}
