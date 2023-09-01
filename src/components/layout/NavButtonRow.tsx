import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from 'src/app/hooks'
import { Button } from 'src/components/buttons/Button'
import BarChartIcon from 'src/components/icons/chart_bar_small.svg'
import { ChevronIcon } from 'src/components/icons/Chevron'
import CoinStackIcon from 'src/components/icons/coin_stack.svg'
import CubeIcon from 'src/components/icons/cube.svg'
import LockIcon from 'src/components/icons/lock_small.svg'
import NftIcon from 'src/components/icons/nft.svg'
import SendIcon from 'src/components/icons/send_payment.svg'
import ExchangeIcon from 'src/components/icons/swap.svg'
import VoteIcon from 'src/components/icons/vote_small.svg'
import { Box } from 'src/components/layout/Box'
import { DropdownBox, useDropdownBox } from 'src/components/modal/DropdownBox'
import { config } from 'src/config'
import { useDownloadDesktopModal } from 'src/features/download/DownloadDesktopModal'
import { useAddressQrCodeModal } from 'src/features/qr/QrCodeModal'
import { txFlowReset } from 'src/features/txFlow/txFlowSlice'
import { useWalletAddress } from 'src/features/wallet/hooks'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Styles, Stylesheet } from 'src/styles/types'

interface Props {
  disabled: boolean
  mobile?: boolean
}

export function NavButtonRow({ mobile, disabled }: Props) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const address = useWalletAddress()
  const showQrModal = useAddressQrCodeModal()
  // const showWalletConnectModal = useWalletConnectModal()
  const showDownloadDesktopModal = useDownloadDesktopModal()
  const { isDropdownVisible, showDropdown, hideDropdown } = useDropdownBox()

  const onSendClick = () => {
    dispatch(txFlowReset())
    navigate('/send')
  }

  const onMoreClick = () => {
    showDropdown()
  }

  const onReceiveClick = () => {
    hideDropdown()
    showQrModal(address)
  }

  const onExchangeClick = () => {
    hideDropdown()
    dispatch(txFlowReset())
    navigate('/exchange')
  }

  const onBalancesClick = () => {
    hideDropdown()
    navigate('/balances')
  }

  const onLockClick = () => {
    hideDropdown()
    if (config.isElectron) {
      dispatch(txFlowReset())
      navigate('/lock')
    } else {
      showDownloadDesktopModal()
    }
  }

  const onStakeClick = () => {
    hideDropdown()
    if (config.isElectron) {
      dispatch(txFlowReset())
      navigate('/validators')
    } else {
      showDownloadDesktopModal()
    }
  }

  const onTrackClick = () => {
    hideDropdown()
    if (config.isElectron) {
      navigate('/stake-rewards')
    } else {
      showDownloadDesktopModal()
    }
  }

  const onGovernClick = () => {
    hideDropdown()
    if (config.isElectron) {
      dispatch(txFlowReset())
      navigate('/governance')
    } else {
      showDownloadDesktopModal()
    }
  }

  const onNftClick = () => {
    hideDropdown()
    navigate('/nft')
  }

  // const onConnectClick = () => {
  //   hideDropdown()
  //   showWalletConnectModal()
  // }

  const buttonWidth = mobile ? '44%' : '9.75em'
  const buttonHeight = mobile ? '2.75em' : '2.5em'

  return (
    <nav>
      <Box direction="row" align="center" justify="evenly" styles={style.container}>
        <Button
          onClick={onSendClick}
          margin="0.75em 0"
          size="m"
          disabled={disabled}
          icon={SendIcon}
          width={buttonWidth}
          height={buttonHeight}
        >
          Send
        </Button>
        <Button
          onClick={onMoreClick}
          margin="0.75em 0"
          size="m"
          disabled={disabled}
          iconPosition="end"
          width={buttonWidth}
          height={buttonHeight}
        >
          More{' '}
          <ChevronIcon
            direction={isDropdownVisible ? 'n' : 's'}
            width="13px"
            height="7.5px"
            color="#FFFFFF"
            styles={style.moreButtonIcon}
          />
        </Button>

        {isDropdownVisible && (
          <DropdownBox hide={hideDropdown} styles={style.menu}>
            <MenuItem
              icon={SendIcon}
              title="Receive"
              description="Show QR code"
              onClick={onReceiveClick}
              iconStyles={style.receiveButtonIcon}
            />
            <MenuItem
              icon={ExchangeIcon}
              title="Exchange"
              description="Swap Celo tokens"
              onClick={onExchangeClick}
            />
            <MenuItem
              icon={CoinStackIcon}
              title="Balance"
              description="View balances"
              onClick={onBalancesClick}
            />
            <MenuItem
              icon={LockIcon}
              title="Lock"
              description="Lock or unlock"
              onClick={onLockClick}
            />
            <MenuItem
              icon={CubeIcon}
              title="Stake"
              description="Vote for validators"
              onClick={onStakeClick}
            />
            <MenuItem
              icon={BarChartIcon}
              title="Track"
              description="See staking rewards"
              onClick={onTrackClick}
            />
            <MenuItem
              icon={VoteIcon}
              title="Govern"
              description="Vote for proposals"
              onClick={onGovernClick}
            />
            <MenuItem icon={NftIcon} title="NFTs" description="Manage NFTs" onClick={onNftClick} />
            {/* <MenuItem
              icon={WalletConnectIcon}
              title="Connect"
              description="Use WalletConnect"
              onClick={onConnectClick}
              iconStyles={style.walletConnectIcon}
            /> */}
          </DropdownBox>
        )}
      </Box>
    </nav>
  )
}

interface MenuItemProps {
  icon: string
  title: string
  description: string
  onClick: () => void
  iconStyles?: Styles
}

function MenuItem(props: MenuItemProps) {
  const { icon, title, description, onClick, iconStyles } = props
  return (
    <Box direction="row" align="center" margin="0 0 1.4em 0">
      <Button
        onClick={onClick}
        size="icon"
        margin="0 0.4em 0 0"
        icon={icon}
        width="2.5em"
        height="2.5em"
        iconStyles={{ ...style.menuIcon, ...iconStyles }}
      />
      <div css={style.menuTextContainer} onClick={onClick}>
        <div css={style.menuTitle}>{title}</div>
        <div css={style.menuDescription}>{description}</div>
      </div>
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    position: 'relative',
    borderTop: `1px solid ${Color.borderLight}`,
    borderBottom: `1px solid ${Color.borderLight}`,
    [mq[768]]: {
      borderTop: 'none',
    },
  },
  moreButtonIcon: {
    marginLeft: 6,
  },
  receiveButtonIcon: {
    height: '1em',
    transform: 'rotate(180deg)',
  },
  walletConnectIcon: {
    width: 17,
    height: 14,
    filter: 'brightness(5)',
  },
  menu: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    top: '4.3em',
    right: '0.2em',
    width: '20.7em',
    padding: '1.3em 0.2em 0 0.8em',
    [mq[768]]: {
      top: '4.1em',
      left: '0.1em',
      right: 'unset',
    },
    ':before': {
      position: 'absolute',
      top: -13,
      left: '75%',
      marginLeft: -2,
      content: "''",
      borderLeft: '13px solid transparent',
      borderRight: '13px solid transparent',
      borderBottom: `13px solid ${Color.fillLight}`,
    },
    ':after': {
      position: 'absolute',
      top: -11,
      left: '75%',
      content: "''",
      borderLeft: '11px solid transparent',
      borderRight: '11px solid transparent',
      borderBottom: '11px solid #FFFFFF',
    },
  },
  menuIcon: {
    height: '1.1em',
  },
  menuTextContainer: {
    width: '7.4em',
    overflow: 'hidden',
    cursor: 'pointer',
    ':hover': {
      div: {
        ':first-of-type': {
          textDecoration: 'underline',
        },
      },
    },
  },
  menuTitle: {
    ...Font.bold,
    fontSize: '0.95em',
    paddingBottom: '0.2em',
  },
  menuDescription: {
    ...Font.subtitle,
  },
}
