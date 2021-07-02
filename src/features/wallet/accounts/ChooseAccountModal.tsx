import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { SignerType } from 'src/blockchain/signer'
import { Address } from 'src/components/Address'
import { Button, transparentButtonStyles } from 'src/components/buttons/Button'
import { DashedBorderButton } from 'src/components/buttons/DashedBorderButton'
import { KeyIcon } from 'src/components/icons/Key'
import { LedgerIcon } from 'src/components/icons/logos/Ledger'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { useModal } from 'src/components/modal/useModal'
import { Spinner } from 'src/components/Spinner'
import { EnterPasswordModal } from 'src/features/password/EnterPasswordModal'
import { hasPasswordCached } from 'src/features/password/password'
import { useAccountList, useWalletAddress } from 'src/features/wallet/hooks'
import { hasPasswordedAccount } from 'src/features/wallet/manager'
import { switchAccountActions, switchAccountSagaName } from 'src/features/wallet/switchAccount'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Styles, Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useSagaStatusNoModal } from 'src/utils/useSagaStatus'

export enum AccountModalScreen {
  ViewAccounts,
  AddAccount,
  CreateLocal,
  DeriveLocal,
  ImportMnemonic,
  ImportLedger,
}

export function useChooseAccountModal() {
  const { showModalWithContent, closeModal } = useModal()
  return () => {
    showModalWithContent({
      head: 'Your Accounts',
      headColor: Color.primaryGreen,
      content: <ChooseAccountModal close={closeModal} />,
    })
  }
}

interface ModalProps {
  close: () => void
}

export function ChooseAccountModal({ close }: ModalProps) {
  const activeAddress = useWalletAddress()
  const accounts = useAccountList()
  const [needsPasswordForAddr, setNeedsPassworForAddr] = useState<string | null>(null)
  const dispatch = useDispatch()

  const onClickAddress = (addr: string) => {
    if (addr === activeAddress || !accounts) return
    const accountType = accounts.find((a) => a.address === addr)?.type
    if (!accountType) return

    if (hasPasswordCached() || accountType === SignerType.Ledger) {
      dispatch(switchAccountActions.trigger({ toAddress: addr }))
    } else if (hasPasswordedAccount()) {
      setNeedsPassworForAddr(addr)
    }
  }
  const onSubmitPassword = (password: string) => {
    if (!needsPasswordForAddr) return
    dispatch(switchAccountActions.trigger({ toAddress: needsPasswordForAddr, password }))
    setNeedsPassworForAddr(null)
  }

  const sagaStatus = useSagaStatusNoModal(switchAccountSagaName, close)
  const onClickDismissError = () => {
    dispatch(switchAccountActions.reset())
  }

  const navigate = useNavigate()
  const onClickAdd = () => {
    navigate('/accounts/add')
    close()
  }
  const onClickManage = () => {
    navigate('/accounts')
    close()
  }

  if (needsPasswordForAddr) {
    return <EnterPasswordModal onSubmit={onSubmitPassword} />
  }

  if (!sagaStatus) {
    return (
      <Box direction="column" align="stretch">
        <Box direction="column" align="stretch" margin="-1.4em">
          {accounts &&
            accounts.map((a) => (
              <button
                css={
                  a.address === activeAddress && accounts.length > 1
                    ? activeAccountButton
                    : style.accountButton
                }
                key={`account-${a.address}`}
                onClick={() => onClickAddress(a.address)}
              >
                <Box align="center" justify="between" styles={style.accountContainer}>
                  <Address address={a.address} name={a.name} isTransparent={true} />
                  {a.type === SignerType.Local ? (
                    <KeyIcon color={Color.primaryBlack} styles={style.accountTypeIcon} />
                  ) : (
                    <LedgerIcon color={Color.primaryBlack} styles={style.accountTypeIcon} />
                  )}
                </Box>
              </button>
            ))}
          <DashedBorderButton onClick={onClickAdd} styles={style.addButton}>
            + Add new account
          </DashedBorderButton>
        </Box>
        <Box align="center" justify="between" margin="2.75em 0 0 0">
          <Button size="s" width="9.5em" onClick={onClickManage} margin="0 1em 0 0">
            Manage
          </Button>
          <Button size="s" width="9.5em" onClick={close} color={Color.primaryWhite}>
            Close
          </Button>
        </Box>
      </Box>
    )
  } else if (sagaStatus === SagaStatus.Started) {
    return (
      <Box direction="column" align="center" justify="center" styles={style.loadingContainer}>
        <h3 css={modalStyles.h3}>Switching Accounts...</h3>
        <div css={style.spinnerContainer}>
          <Spinner />
        </div>
      </Box>
    )
  } else if (sagaStatus === SagaStatus.Failure) {
    return (
      <Box direction="column" align="center">
        <h3 css={modalStyles.h3}>Error Switching Account</h3>
        <p css={modalStyles.p}>
          Looks like there was a problem switching your account, sorry! Please try again.
        </p>
        <Button
          size="s"
          width="10em"
          margin="2em 0 0 0"
          onClick={onClickDismissError}
          color={Color.primaryWhite}
        >
          Okay
        </Button>
      </Box>
    )
  } else {
    return <div></div>
  }
}

const style: Stylesheet = {
  accountButton: {
    ...transparentButtonStyles,
    ':hover': {
      backgroundColor: Color.fillLight,
    },
    ':active': {
      backgroundColor: Color.fillLighter,
    },
  },
  accountContainer: {
    margin: '0 1em',
    padding: '0.6em 0',
    borderBottom: `1px solid ${Color.borderMedium}`,
  },
  accountTypeIcon: {
    width: '1.2em',
    height: 'auto',
    marginLeft: '1em',
    marginRight: '0.5em',
    [mq[480]]: {
      marginLeft: '2em',
    },
  },
  addButton: {
    margin: '1.25em 1.1em 0 1.1em',
    padding: '0.7em 0',
    width: 'auto',
  },
  loadingContainer: {
    minHeight: '13em',
    minWidth: '18em',
    opacity: 0.85,
  },
  spinnerContainer: {
    marginTop: '2.5em',
    transform: 'scale(0.8)',
  },
}

const activeAccountButton: Styles = {
  ...style.accountButton,
  backgroundColor: Color.fillMedium,
}
