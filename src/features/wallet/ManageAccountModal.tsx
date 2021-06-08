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

export function useManageAccountModal() {
  const { showModalWithContent, closeModal } = useModal()
  return () => {
    showModalWithContent({
      head: 'Your Accounts',
      headColor: Color.primaryGreen,
      content: <ManageAccountModal close={closeModal} />,
    })
  }
}

enum Screen {
  ViewAccounts,
  AddAccount,
  CreateLocal,
  DeriveLocal,
  ImportMnemonic,
  ImportLedger,
}

interface ModalProps {
  close: () => void
  initialScreen?: Screen
}

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<Screen>>
  close: () => void
}

export function ManageAccountModal({ close, initialScreen }: ModalProps) {
  const [screen, setScreen] = useState(initialScreen ?? Screen.ViewAccounts)

  return (
    <div>
      {screen === Screen.ViewAccounts && <ViewAccounts setScreen={setScreen} close={close} />}
      {screen === Screen.AddAccount && <AddAccount setScreen={setScreen} close={close} />}
    </div>
  )
}

function ViewAccounts({ setScreen, close }: ScreenProps) {
  const address = useWalletAddress()
  const navigate = useNavigate()

  const onClickAdd = () => {
    setScreen(Screen.AddAccount)
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
