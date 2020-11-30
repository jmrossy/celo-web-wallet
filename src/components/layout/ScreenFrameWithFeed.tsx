import { PropsWithChildren } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import PlusWhite from 'src/components/icons/plus_white.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenFrame } from 'src/components/layout/ScreenFrame'
import { openTransaction } from 'src/features/feed/feedSlice'
import { TransactionFeed } from 'src/features/feed/TransactionFeed'
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
    </ScreenFrame>
  )
}

enum FrameState {
  DesktopHomeEmpty, // i.e. empty wallet (0 balances)
  MobileHomeEmpty,
  DesktopHome,
  MobileHome,
  MobileNotHome,
  // Note: no DesktopNotHome needed as it would be the same as DesktopHome
}

function useFrameState() {
  const location = useLocation()
  const isHomeScreen = location.pathname === '/'
  const isMobile = useIsMobile()
  const isWalletEmpty = useAreBalancesEmpty()

  if (!isMobile && isWalletEmpty) return FrameState.DesktopHomeEmpty
  if (!isMobile && !isWalletEmpty) return FrameState.DesktopHome

  if (isMobile && isHomeScreen && isWalletEmpty) return FrameState.MobileHomeEmpty
  if (isMobile && isHomeScreen && !isWalletEmpty) return FrameState.MobileHome
  if (isMobile && !isHomeScreen) return FrameState.MobileNotHome

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
      <div>{props.children}</div>
      <ButtonRow disabled={false} />
      <TransactionFeed />
    </Box>
  )
}

function MobileHomeEmpty(props: PropsWithChildren<any>) {
  return (
    <Box direction="column" styles={style.contentContainer}>
      <div>{props.children}</div>
    </Box>
  )
}

function MobileNotHome(props: PropsWithChildren<any>) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onButtonClick = () => {
    dispatch(openTransaction(null))
    // TODO something more user friendly, for now just going home
    navigate('/')
  }

  return (
    <Box direction="row" styles={style.contentContainer}>
      <Box direction="column" align="center" styles={style.feedContainer}>
        <Button onClick={onButtonClick} margin={'0.75em 0'} size="icon" icon={PlusWhite} />
        <TransactionFeed collapsed={true} />
      </Box>
      <div css={style.childContent}>{props.children}</div>
    </Box>
  )
}

function ButtonRow(props: { disabled: boolean }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onNewSendClick = () => {
    dispatch(openTransaction(null))
    navigate('/send')
  }

  const onNewExchangeClick = () => {
    dispatch(openTransaction(null))
    navigate('/exchange')
  }

  return (
    <Box direction="row" align="center" justify="around" styles={style.buttonContainer}>
      <Button onClick={onNewSendClick} margin={'0.75em 0'} size="s" disabled={props.disabled}>
        New Payment
      </Button>
      <Button onClick={onNewExchangeClick} margin={'0.75em 0'} size="s" disabled={props.disabled}>
        New Exchange
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
