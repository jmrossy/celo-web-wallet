import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/Button'
import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { useSagaStatusWithErrorModal } from 'src/components/modal/useSagaStatusModal'
import { Spinner } from 'src/components/Spinner'
import { createWalletActions, createWalletSagaName } from 'src/features/wallet/createWallet'
import { WalletDetails } from 'src/features/wallet/WalletDetails'
import { clearWallet } from 'src/features/wallet/walletSlice'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { logger } from 'src/utils/logger'
import { SagaStatus } from 'src/utils/saga'

export function NewWalletScreen() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const address = useSelector((s: RootState) => s.wallet.address)

  useEffect(() => {
    dispatch(createWalletActions.reset())

    if (address) {
      // TODO show warning modal here
      logger.warn('Attempting to create new address when one is already assigned')
      dispatch(clearWallet())
    }

    // For smoother loading render
    setTimeout(() => {
      dispatch(createWalletActions.trigger())
    }, 1000)
  }, [])

  const status = useSagaStatusWithErrorModal(
    createWalletSagaName,
    'Error Creating Wallet',
    'Something went wrong when creating your new wallet, sorry! Please try again.'
  )

  const onClickContinue = () => {
    navigate('/setup/set-pin')
  }

  const isLoading = !address && (!status || status === SagaStatus.Started)
  const isDone = address || status === SagaStatus.Success || status === SagaStatus.Failure

  return (
    <OnboardingScreenFrame>
      <h1 css={style.header}>Your New Celo Account</h1>
      {isLoading && (
        <div css={style.container}>
          <WalletDetails />
          <div css={style.spinnerContainer}>
            <Spinner />
          </div>
        </div>
      )}
      {isDone && <WalletDetails />}
      <Button
        size="l"
        onClick={onClickContinue}
        margin={'3em 0 0 0'}
        disabled={status !== SagaStatus.Success && !address}
      >
        Continue
      </Button>
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  header: {
    ...Font.h1Green,
    marginBottom: '2em',
  },
  container: {
    position: 'relative',
  },
  spinnerContainer: {
    zIndex: 100,
    position: 'absolute',
    left: -20,
    right: -20,
    top: -20,
    bottom: -20,
    backgroundColor: '#f5f6f7',
    opacity: 0.4,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}
