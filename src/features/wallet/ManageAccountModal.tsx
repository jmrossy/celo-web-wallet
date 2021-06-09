import { Dispatch, SetStateAction, useState } from 'react'
import { useNavigate } from 'react-router'
import { Address } from 'src/components/Address'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { useModal } from 'src/components/modal/useModal'
import { useWalletAddress } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

export enum AccountModalScreen {
  ViewAccounts,
  AddAccount,
  CreateLocal,
  DeriveLocal,
  ImportMnemonic,
  ImportLedger,
}

export function useManageAccountModal() {
  const { showModalWithContent, closeModal } = useModal()
  return (initialScreen?: AccountModalScreen) => {
    showModalWithContent({
      head: 'Your Accounts',
      headColor: Color.primaryGreen,
      content: <ManageAccountModal close={closeModal} initialScreen={initialScreen} />,
    })
  }
}

interface ModalProps {
  close: () => void
  initialScreen?: AccountModalScreen
}

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<AccountModalScreen>>
  close: () => void
}

export function ManageAccountModal({ close, initialScreen }: ModalProps) {
  const [screen, setScreen] = useState(initialScreen ?? AccountModalScreen.ViewAccounts)

  return (
    <div>
      {screen === AccountModalScreen.ViewAccounts && (
        <ViewAccounts setScreen={setScreen} close={close} />
      )}
      {screen === AccountModalScreen.AddAccount && (
        <AddAccount setScreen={setScreen} close={close} />
      )}
    </div>
  )
}

function ViewAccounts({ setScreen, close }: ScreenProps) {
  const address = useWalletAddress()
  const navigate = useNavigate()

  const onClickAdd = () => {
    setScreen(AccountModalScreen.AddAccount)
  }

  const onClickManage = () => {
    navigate('/accounts')
    close()
  }

  return (
    <Box direction="column" align="center">
      <Address address={address} />
      <Box align="center">
        <Button size="s" onClick={onClickAdd}>
          Add Account
        </Button>
        <Button size="s" onClick={onClickManage}>
          Manage Accounts
        </Button>
      </Box>
    </Box>
  )
}

function AddAccount({ setScreen, close }: ScreenProps) {
  return <div>TODO</div>
}

const style: Stylesheet = {
  p: {
    ...modalStyles.p,
    marginBottom: '1.5em',
  },
}
