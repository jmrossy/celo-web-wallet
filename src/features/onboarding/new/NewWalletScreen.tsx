import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { Spinner } from 'src/components/Spinner'
import { config } from 'src/config'
import { NULL_ADDRESS } from 'src/consts'
import { WebWalletWarning } from 'src/features/download/WebWalletWarning'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { AccountDetails } from 'src/features/wallet/accounts/AccountDetails'
import { createRandomAccount, setPendingAccount } from 'src/features/wallet/manager'
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

  useEffect(() => {
    if (addressInStore) throw new Error('Account already exists in store')
    // For smoother loading render
    setTimeout(() => {
      const newAccount = createRandomAccount()
      if (!newAccount) throw new Error('Unable to create new random account')
      setAccount(newAccount)
    }, 1000)
  }, [addressInStore])

  const navigate = useNavigate()
  const onClickContinue = () => {
    if (!account) return
    setPendingAccount(account.mnemonic, account.derivationPath)
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
