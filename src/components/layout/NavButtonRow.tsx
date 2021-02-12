import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/buttons/Button'
import ChartIcon from 'src/components/icons/chart_small.svg'
import { ChevronIcon } from 'src/components/icons/Chevron'
import CubeIcon from 'src/components/icons/cube.svg'
import LockIcon from 'src/components/icons/lock_small.svg'
import SendIcon from 'src/components/icons/send_payment.svg'
import ExchangeIcon from 'src/components/icons/swap.svg'
import VoteIcon from 'src/components/icons/vote_small.svg'
import { Box } from 'src/components/layout/Box'
import { Backdrop, backdropZIndex } from 'src/components/modal/Backdrop'
import { useAddressQrCodeModal } from 'src/features/qr/QrCodeModal'
import { txFlowReset } from 'src/features/txFlow/txFlowSlice'
import { useWalletAddress } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Styles, Stylesheet } from 'src/styles/types'

interface Props {
  disabled: boolean
  mobile?: boolean
}

export function NavButtonRow({ mobile, disabled }: Props) {
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const address = useWalletAddress()
  const showQrModal = useAddressQrCodeModal()

  const onSendClick = () => {
    dispatch(txFlowReset())
    navigate('/send')
  }

  const onMoreClick = () => {
    setShowDropdown(true)
  }

  const onReceiveClick = () => {
    setShowDropdown(false)
    showQrModal(address)
  }

  const onExchangeClick = () => {
    setShowDropdown(false)
    dispatch(txFlowReset())
    navigate('/exchange')
  }

  const onLockClick = () => {
    setShowDropdown(false)
    dispatch(txFlowReset())
    navigate('/lock')
  }

  const onTrackClick = () => {
    setShowDropdown(false)
    navigate('/stake-rewards')
  }

  const onStakeClick = () => {
    setShowDropdown(false)
    dispatch(txFlowReset())
    navigate('/validators')
  }

  const onGovernClick = () => {
    setShowDropdown(false)
    dispatch(txFlowReset())
    navigate('/governance')
  }

  const buttonWidth = mobile ? '44%' : '9.75em'
  const buttonHeight = mobile ? '2.75em' : '2.5em'

  return (
    <>
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
            direction={showDropdown ? 'n' : 's'}
            width={11}
            height={7}
            styles={style.moreButtonIcon}
          />
        </Button>

        {showDropdown && (
          <div css={style.menu}>
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
              icon={LockIcon}
              title="Lock"
              description="Lock or unlock"
              onClick={onLockClick}
            />
            <MenuItem
              icon={ChartIcon}
              title="Track"
              description="See your rewards"
              onClick={onTrackClick}
            />
            <MenuItem
              icon={CubeIcon}
              title="Stake"
              description="Vote for validators"
              onClick={onStakeClick}
            />
            <MenuItem
              icon={VoteIcon}
              title="Govern"
              description="Vote for proposals"
              onClick={onGovernClick}
            />
          </div>
        )}
      </Box>
      {showDropdown && (
        <Backdrop
          opacity={0.01}
          color={Color.primaryWhite}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
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
    filter: 'brightness(8)',
    paddingBottom: 1,
    marginLeft: 6,
  },
  receiveButtonIcon: {
    height: '1em',
    transform: 'rotate(180deg)',
  },
  menu: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    position: 'absolute',
    top: '4.3em',
    right: '0.2em',
    width: '20.7em',
    padding: '1.3em 0.2em 0 0.8em',
    borderRadius: 3,
    zIndex: backdropZIndex + 1,
    background: Color.primaryWhite,
    border: `1px solid ${Color.fillLight}`,
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.08)',
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
