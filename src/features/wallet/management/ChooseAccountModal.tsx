import { useNavigate } from 'react-router-dom'
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
  const address = useWalletAddress()
  const navigate = useNavigate()

  const onClickAdd = () => {
    navigate('/accounts/add')
    close()
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

const style: Stylesheet = {
  p: {
    ...modalStyles.p,
    marginBottom: '1.5em',
  },
}
