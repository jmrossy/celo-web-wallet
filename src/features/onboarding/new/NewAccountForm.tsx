import { Wallet } from 'ethers'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from 'src/app/hooks'
import { SignerType } from 'src/blockchain/types'
import { Button } from 'src/components/buttons/Button'
import { useModal } from 'src/components/modal/useModal'
import { Spinner } from 'src/components/Spinner'
import { NULL_ADDRESS } from 'src/consts'
import { useEnterPasswordModal } from 'src/features/password/EnterPasswordModal'
import { hasPasswordCached } from 'src/features/password/password'
import { AccountDetails } from 'src/features/wallet/accounts/AccountDetails'
import {
  importAccountActions,
  ImportAccountParams,
  importAccountSagaName,
} from 'src/features/wallet/importAccount'
import { createRandomAccount, hasPasswordedAccount } from 'src/features/wallet/manager'
import { setPendingAccountWithWallet } from 'src/features/wallet/pendingAccount'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useSagaStatus } from 'src/utils/useSagaStatus'

interface Props {
  navigateToSetPin: () => void
  accountName?: string
}

// Note, this is not really a form, but keeping consistent naming scheme
// with ImportAccount[Form|Screen] and LedgerImport[Form|Screen]
export function NewAccountForm(props: Props) {
  const [account, setAccount] = useState<Wallet | null>(null)
  const { showErrorModal } = useModal()
  useEffect(() => {
    // For smoother loading render
    setTimeout(() => {
      try {
        const newAccount = createRandomAccount()
        setAccount(newAccount)
      } catch (error) {
        showErrorModal('Error Creating Account', 'Unable to create a new account.', error)
      }
    }, 1000)
  }, [])

  const dispatch = useAppDispatch()
  const showPasswordModal = useEnterPasswordModal()
  const onClickContinue = () => {
    if (!account) return

    const triggerImport = (password?: string) => {
      const params: ImportAccountParams = {
        account: {
          type: SignerType.Local,
          mnemonic: account.mnemonic.phrase,
          derivationPath: account.mnemonic.path,
          name: props.accountName,
        },
        isExisting: false,
        password,
      }
      dispatch(importAccountActions.trigger(params))
    }

    if (hasPasswordCached()) {
      // If the user already logged in to a passworded account
      triggerImport()
    } else if (hasPasswordedAccount()) {
      // If the user has set a pass but logged in with Ledger
      showPasswordModal(triggerImport)
    } else {
      // User never set a password before
      setPendingAccountWithWallet(account, false)
      props.navigateToSetPin()
    }
  }

  const navigate = useNavigate()
  const status = useSagaStatus(
    importAccountSagaName,
    'Error Importing Account',
    'Something went wrong when importing your new account, sorry! Please try again.',
    () => navigate('/')
  )

  return (
    <>
      <div css={style.container}>
        {account ? (
          <div>
            <AccountDetails address={account.address} mnemonic={account.mnemonic.phrase} />
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
      <Button
        size="l"
        onClick={onClickContinue}
        margin="3em 0 0 0"
        disabled={!account || status === SagaStatus.Started}
      >
        Continue
      </Button>
    </>
  )
}

const style: Stylesheet = {
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
