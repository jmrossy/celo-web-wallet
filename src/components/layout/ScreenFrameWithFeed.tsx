import { PropsWithChildren } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import { Button } from 'src/components/buttons/Button'
import PlusIcon from 'src/components/icons/plus.svg'
import SendIcon from 'src/components/icons/send_payment.svg'
import ExchangeIcon from 'src/components/icons/swap.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenFrame } from 'src/components/layout/ScreenFrame'
import { exchangeReset } from 'src/features/exchange/exchangeSlice'
import { TransactionFeed } from 'src/features/feed/TransactionFeed'
import { HomeScreenWarnings } from 'src/features/home/HomeScreenWarnings'
import { sendReset } from 'src/features/send/sendSlice'
import { useAreBalancesEmpty } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { mq, useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function ScreenFrameWithFeed(props: PropsWithChildren<any>) {
  const frameState = useFrameState()

  return (
    <ScreenFrame>
      {frameState === FrameState.DesktopHome && (
        <DesktopHome isWalletEmpty={false}>{props.children}</DesktopHome>
      )}
      {frameState === FrameState.DesktopHomeEmpty && (
        <DesktopHome isWalletEmpty={true}>{props.children}</DesktopHome>
      )}
      {frameState === FrameState.MobileHome && <MobileHome>{props.children}</MobileHome>}
      {frameState === FrameState.MobileHomeEmpty && (
        <MobileHomeEmpty>{props.children}</MobileHomeEmpty>
      )}
      {frameState === FrameState.MobileNotHome && <MobileNotHome>{props.children}</MobileNotHome>}
      {frameState === FrameState.MobileNotHomeEmpty && (
        <MobileNotHomeEmpty>{props.children}</MobileNotHomeEmpty>
      )}
    </ScreenFrame>
  )
}

enum FrameState {
  DesktopHome,
  DesktopHomeEmpty, // i.e. empty wallet (0 balances)
  MobileHome,
  MobileHomeEmpty,
  MobileNotHome,
  MobileNotHomeEmpty,
  // Note: no DesktopNotHome needed as it would be the same as DesktopHome
}

function useFrameState() {
  const location = useLocation()
  const isHomeScreen = location.pathname === '/'
  const isMobile = useIsMobile()
  const isWalletEmpty = useAreBalancesEmpty()

  if (!isMobile && !isWalletEmpty) return FrameState.DesktopHome
  if (!isMobile && isWalletEmpty) return FrameState.DesktopHomeEmpty

  if (isMobile && isHomeScreen && !isWalletEmpty) return FrameState.MobileHome
  if (isMobile && isHomeScreen && isWalletEmpty) return FrameState.MobileHomeEmpty
  if (isMobile && !isHomeScreen && !isWalletEmpty) return FrameState.MobileNotHome
  if (isMobile && !isHomeScreen && isWalletEmpty) return FrameState.MobileNotHomeEmpty

  throw new Error('Unhandled frame state case')
}

interface DesktopHomeProps {
  isWalletEmpty: boolean
}

function DesktopHome(props: PropsWithChildren<DesktopHomeProps>) {
  return (
    <Box direction="row" styles={style.contentContainer}>
      <Box direction="column" styles={style.feedContainer}>
        <ButtonRow disabled={props.isWalletEmpty} />
        <TransactionFeed />
      </Box>
      <div css={style.childContent}>{props.children}</div>
    </Box>
  )
}

function MobileHome(props: PropsWithChildren<any>) {
  return (
    <Box direction="column" styles={style.contentContainer}>
      <HomeScreenWarnings />
      <div>{props.children}</div>
      <ButtonRow disabled={false} mobile={true} />
      <TransactionFeed />
    </Box>
  )
}

function MobileHomeEmpty(props: PropsWithChildren<any>) {
  return (
    <Box direction="column" styles={style.contentContainer}>
      <HomeScreenWarnings />
      <div>{props.children}</div>
    </Box>
  )
}

function MobileNotHome(props: PropsWithChildren<any>) {
  const navigate = useNavigate()

  const onButtonClick = () => {
    // TODO something more user friendly, for now just going home
    navigate('/')
  }

  return (
    <Box direction="row" styles={style.contentContainer}>
      <Box direction="column" align="center" styles={style.feedContainer}>
        <Button onClick={onButtonClick} margin={'0.75em 0'} size="icon" width="34px" height="34px">
          <img width="22px" height="22px" src={PlusIcon} alt="Plus" />
        </Button>
        <TransactionFeed collapsed={true} />
      </Box>
      <div css={style.childContent}>{props.children}</div>
    </Box>
  )
}

function MobileNotHomeEmpty(props: PropsWithChildren<any>) {
  return (
    <Box direction="column" styles={style.contentContainer}>
      <div>{props.children}</div>
    </Box>
  )
}

function ButtonRow(props: { disabled: boolean; mobile?: boolean }) {
  const { mobile, disabled } = props

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onNewSendClick = () => {
    dispatch(sendReset())
    navigate('/send')
  }

  const onNewExchangeClick = () => {
    dispatch(exchangeReset())
    navigate('/exchange')
  }

  const buttonWidth = mobile ? '44%' : '9.75em'
  const buttonHeight = mobile ? '2.75em' : '2.5em'

  return (
    <Box direction="row" align="center" justify="evenly" styles={style.buttonContainer}>
      <Button
        onClick={onNewSendClick}
        margin={'0.75em 0'}
        size="m"
        disabled={disabled}
        icon={SendIcon}
        width={buttonWidth}
        height={buttonHeight}
      >
        Send
      </Button>
      <Button
        onClick={onNewExchangeClick}
        margin={'0.75em 0'}
        size="m"
        disabled={disabled}
        icon={ExchangeIcon}
        width={buttonWidth}
        height={buttonHeight}
      >
        Exchange
      </Button>
    </Box>
  )
}

const style: Stylesheet = {
  contentContainer: {
    height: '100%',
  },
  feedContainer: {
    borderRight: `1px solid ${Color.borderLight}`,
    [mq[768]]: {
      width: '22em',
    },
  },
  buttonContainer: {
    borderTop: `1px solid ${Color.borderLight}`,
    borderBottom: `1px solid ${Color.borderLight}`,
    [mq[768]]: {
      borderTop: 'none',
    },
  },
  childContent: {
    overflow: 'auto',
    flex: 1,
  },
}
