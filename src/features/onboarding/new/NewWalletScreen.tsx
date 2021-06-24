import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { useModal } from 'src/components/modal/useModal'
import { Spinner } from 'src/components/Spinner'
import { config } from 'src/config'
import { NULL_ADDRESS } from 'src/consts'
import { WebWalletWarning } from 'src/features/download/WebWalletWarning'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { AccountDetails } from 'src/features/wallet/accounts/AccountDetails'
import { createPendingAccount } from 'src/features/wallet/pendingAccount'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface Account {
  address: string
  derivationPath: string
  mnemonic: string
}

export function NewWalletScreen() {
  const [hasShownWarning, setHasShownWarning] = useState(config.isElectron)
  const [account, setAccount] = useState<Account | null>(null)
  const addressInStore = useSelector((s: RootState) => s.wallet.address)
  const { showErrorModal } = useModal()

  useEffect(() => {
    if (addressInStore) throw new Error('Account already exists in store')
    // For smoother loading render
    setTimeout(() => {
      try {
        const newAccount = createPendingAccount()
        setAccount(newAccount)
      } catch (error) {
        showErrorModal('Error Creating Account', 'Unable to create a new account.', error)
      }
    }, 1000)
  }, [addressInStore])

  const navigate = useNavigate()
  const onClickContinue = () => {
    if (!account) return
    navigate('/setup/set-pin', { state: { pageNumber: 3 } })
  }

  return (
    <OnboardingScreenFrame current={2} total={3}>
      <h1 css={style.header}>Your New Celo Account</h1>
      {hasShownWarning ? (
        <WebWalletWarning type="create" onClose={() => setHasShownWarning(true)} />
      ) : (
        <>
          <div css={style.container}>
            {account ? (
              <div>
                <AccountDetails address={account.address} mnemonic={account.mnemonic} />
              </div>
            ) : (
              <>
                <div css={style.contentLoading}>
                  <AccountDetails address={NULL_ADDRESS} />
                </div>
                <div css={style.spinner}>
                  <Spinner />
                </div>
              </>
            )}
          </div>
          <Button size="l" onClick={onClickContinue} margin="3em 0 0 0" disabled={!account}>
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
