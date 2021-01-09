import { PropsWithChildren } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import { Button } from 'src/components/buttons/Button'
import PlusIcon from 'src/components/icons/plus.svg'
import SendIcon from 'src/components/icons/send_payment.svg'
import ExchangeIcon from 'src/components/icons/swap.svg'
import { Box } from 'src/components/layout/Box'
import { HeaderFooterFrame } from 'src/components/layout/HeaderFooterFrame'
import { exchangeReset } from 'src/features/exchange/exchangeSlice'
import { TransactionFeed } from 'src/features/feed/TransactionFeed'
import { HomeScreenWarnings } from 'src/features/home/HomeScreenWarnings'
import { sendReset } from 'src/features/send/sendSlice'
import { useAreBalancesEmpty } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import {
  isWindowSizeMobile,
  isWindowSizeSmallMobile,
  mq,
  useWindowSize,
} from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

const SCREENS_WITHOUT_FEED: Record<string, boolean> = {
  '/wallet': true,
  '/change-pin': true,
  '/settings': true,
}

export function ScreenFrame(props: PropsWithChildren<any>) {
  const frameState = useFrameState()

  return (
    <HeaderFooterFrame>
      {frameState === FrameState.DesktopHome && (
        <DesktopHome isWalletEmpty={false}>{props.children}</DesktopHome>
      )}
      {frameState === FrameState.DesktopHomeEmpty && (
        <DesktopHome isWalletEmpty={true}>{props.children}</DesktopHome>
      )}
      {frameState === FrameState.DesktopNotHome && (
        <DesktopHome isWalletEmpty={false}>{props.children}</DesktopHome>
      )}
      {frameState === FrameState.DesktopNotHomeNoFeed && (
        <DesktopNotHomeNoFeed>{props.children}</DesktopNotHomeNoFeed>
      )}
      {frameState === FrameState.MobileHome && <MobileHome>{props.children}</MobileHome>}
      {frameState === FrameState.MobileHomeEmpty && (
        <MobileHomeEmpty>{props.children}</MobileHomeEmpty>
      )}
      {frameState === FrameState.MobileNotHome && <MobileNotHome>{props.children}</MobileNotHome>}
      {frameState === FrameState.MobileNotHomeNoFeed && (
        <MobileNotHomeNoFeed>{props.children}</MobileNotHomeNoFeed>
      )}
    </HeaderFooterFrame>
  )
}

enum FrameState {
  DesktopHome,
  DesktopHomeEmpty, // i.e. empty wallet (0 balances)
  DesktopNotHome,
  DesktopNotHomeNoFeed,
  MobileHome,
  MobileHomeEmpty,
  MobileNotHome,
  MobileNotHomeNoFeed,
}

function useFrameState() {
  const location = useLocation()
  const windowSize = useWindowSize()
  const isMobile = isWindowSizeMobile(windowSize.width)
  const isSmallMobile = isWindowSizeSmallMobile(windowSize.width)
  const isWalletEmpty = useAreBalancesEmpty()

  const path = location.pathname
  const isHomeScreen = path === '/'
  const hideFeed = SCREENS_WITHOUT_FEED[path] || (isMobile && isWalletEmpty) || isSmallMobile

  if (!isMobile && isHomeScreen && !isWalletEmpty) return FrameState.DesktopHome
  if (!isMobile && isHomeScreen && isWalletEmpty) return FrameState.DesktopHomeEmpty
  if (!isMobile && !isHomeScreen && !hideFeed) return FrameState.DesktopNotHome
  if (!isMobile && !isHomeScreen && hideFeed) return FrameState.DesktopNotHomeNoFeed

  if (isMobile && isHomeScreen && !isWalletEmpty) return FrameState.MobileHome
  if (isMobile && isHomeScreen && isWalletEmpty) return FrameState.MobileHomeEmpty
  if (isMobile && !isHomeScreen && !hideFeed) return FrameState.MobileNotHome
  if (isMobile && !isHomeScreen && hideFeed) return FrameState.MobileNotHomeNoFeed

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

function DesktopNotHomeNoFeed(props: PropsWithChildren<any>) {
  // TODO max size and center
  return (
    <Box direction="column" align="center" styles={style.contentContainerNoFeed}>
      <div css={style.childContentNoFeed}>{props.children}</div>
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
        <Button onClick={onButtonClick} margin="0.75em 0" size="icon" width="34px" height="34px">
          <img width="22px" height="22px" src={PlusIcon} alt="Plus" />
        </Button>
        <TransactionFeed collapsed={true} />
      </Box>
      <div css={style.childContent}>{props.children}</div>
    </Box>
  )
}

function MobileNotHomeNoFeed(props: PropsWithChildren<any>) {
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
  contentContainerNoFeed: {
    height: '100%',
    backgroundColor: '#FAFAFA',
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
  childContentNoFeed: {
    overflow: 'auto',
    flex: 1,
    backgroundColor: Color.primaryWhite,
    borderRight: `1px solid ${Color.borderLight}`,
    borderLeft: `1px solid ${Color.borderLight}`,
    boxShadow: '-1px 0px 1px rgba(0, 0, 0, 0.05), 1px 0px 1px rgba(0, 0, 0, 0.05)',
  },
}
