import { useNavigate } from 'react-router-dom'
import { Address } from 'src/components/Address'
import { Button, transparentButtonStyles } from 'src/components/buttons/Button'
import { PencilIcon } from 'src/components/icons/Pencil'
import { PlusIcon } from 'src/components/icons/Plus'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { useWalletAddress } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Styles, Stylesheet } from 'src/styles/types'

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
  const navigate = useNavigate()

  const accounts = [
    { address: activeAddress, balance: '$9231.12' },
    { address: '0xa2972a33550c33ecfa4a02a0ea212ac98e77fa55', balance: '$0.01' },
  ]

  const onClickAddress = (addr: string) => {
    alert('Clicked' + addr)
  }

  const onClickAdd = () => {
    navigate('/accounts/add')
    close()
  }

  const onClickManage = () => {
    navigate('/accounts')
    close()
  }

  return (
    <Box direction="column" align="stretch">
      <Box direction="column" align="stretch" margin="-1.4em">
        {accounts.map((a) => (
          <button
            css={a.address === activeAddress ? activeAccountButton : style.accountButton}
            key={`account-${a.address}`}
            onClick={() => onClickAddress(a.address)}
          >
            <Box align="center" justify="between" styles={style.accountContainer}>
              <Address address={a.address} isTransparent={true} />
              <div css={style.accountValue}>{a.balance}</div>
            </Box>
          </button>
        ))}
      </Box>
      <Box align="center" justify="between" margin="3em 0 0 0">
        <Button
          size="s"
          width="10em"
          onClick={onClickAdd}
          icon={<PlusIcon width="0.9em" height="0.9em" />}
        >
          Add
        </Button>
        <Button
          size="s"
          width="10em"
          onClick={onClickManage}
          icon={<PencilIcon width="0.9em" height="0.9em" />}
        >
          Manage
        </Button>
      </Box>
    </Box>
  )
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
    padding: '0.75em 0',
    borderBottom: `1px solid ${Color.borderMedium}`,
  },
  accountValue: {
    ...Font.bold,
    marginLeft: '1em',
    [mq[480]]: {
      marginLeft: '2em',
    },
  },
}

const activeAccountButton: Styles = {
  ...style.accountButton,
  backgroundColor: Color.fillMedium,
}
