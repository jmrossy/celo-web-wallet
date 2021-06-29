import { useNavigate } from 'react-router-dom'
import { Address } from 'src/components/Address'
import { Button, transparentButtonStyles } from 'src/components/buttons/Button'
import { DashedBorderButton } from 'src/components/buttons/DashedBorderButton'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { useAccountList, useWalletAddress } from 'src/features/wallet/hooks'
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
  const accounts = useAccountList()
  // TODO real balance
  const accountsWithBalance = accounts?.map((a) => ({ address: a.address, balance: '0' })) || []

  const onClickAddress = (addr: string) => {
    if (addr === activeAddress) return
    //TODO
    alert('Clicked' + addr)
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

  return (
    <Box direction="column" align="stretch">
      <Box direction="column" align="stretch" margin="-1.4em">
        {accountsWithBalance.map((a) => (
          <button
            css={
              a.address === activeAddress && accountsWithBalance.length > 1
                ? activeAccountButton
                : style.accountButton
            }
            key={`account-${a.address}`}
            onClick={() => onClickAddress(a.address)}
          >
            <Box align="center" justify="between" styles={style.accountContainer}>
              <Address address={a.address} isTransparent={true} />
              <div css={style.accountValue}>{a.balance}</div>
            </Box>
          </button>
        ))}
        <DashedBorderButton onClick={onClickAdd} styles={style.addButton}>
          + Add new account
        </DashedBorderButton>
      </Box>
      <Box align="center" justify="between" margin="2.75em 0 0 0">
        <Button size="s" width="10em" onClick={onClickManage} margin="0 1em 0 0">
          Manage
        </Button>
        <Button size="s" width="10em" onClick={close} color={Color.primaryWhite}>
          Close
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
    [mq[768]]: {
      marginLeft: '2.5em',
    },
  },
  addButton: {
    margin: '1.25em 1.1em 0 1.1em',
    padding: '0.9em 0',
    width: 'auto',
  },
}

const activeAccountButton: Styles = {
  ...style.accountButton,
  backgroundColor: Color.fillMedium,
}
