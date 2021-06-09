import { PropsWithChildren } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from 'src/components/buttons/Button'
import PlusIcon from 'src/components/icons/plus.svg'
import { Box } from 'src/components/layout/Box'
import { HeaderFooterFrame } from 'src/components/layout/HeaderFooterFrame'
import { NavButtonRow } from 'src/components/layout/NavButtonRow'
import { TransactionFeed } from 'src/features/feed/TransactionFeed'
import { HomeScreenWarnings } from 'src/features/home/HomeScreenWarnings'
import { useAreBalancesEmpty } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { isWindowSizeMobile, isWindowSizeSmallMobile, useWindowSize } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

const SCREENS_WITHOUT_FEED: Record<string, boolean> = {
  '/wallet': true,
  '/accounts': true,
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
        <DesktopNotHome>{props.children}</DesktopNotHome>
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
  hideWarnings?: boolean
}

function DesktopHome(props: PropsWithChildren<DesktopHomeProps>) {
  return (
    <Box direction="row" styles={style.contentContainer}>
      <Box direction="column" styles={style.feedContainer}>
        <NavButtonRow disabled={props.isWalletEmpty} />
        <TransactionFeed />
      </Box>
      <div css={style.childContentContainer}>
        {!props.hideWarnings && <HomeScreenWarnings />}
        <div css={style.childContent}>{props.children}</div>
      </div>
    </Box>
  )
}

function DesktopNotHome(props: PropsWithChildren<any>) {
  return (
    <DesktopHome isWalletEmpty={false} hideWarnings={true}>
      {props.children}
    </DesktopHome>
  )
}

function DesktopNotHomeNoFeed(props: PropsWithChildren<any>) {
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
      <NavButtonRow disabled={false} mobile={true} />
      <TransactionFeed feedState="mobile" />
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
      <Box direction="column" align="center" styles={style.feedContainerCollapsed}>
        <Button onClick={onButtonClick} margin="0.75em 0" size="icon" width="34px" height="34px">
          <img width="18px" height="18px" src={PlusIcon} alt="Plus" />
        </Button>
        <TransactionFeed feedState="collapsed" />
      </Box>
      <div css={style.childContentContainer}>{props.children}</div>
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

const style: Stylesheet = {
  contentContainer: {
    height: '100%',
  },
  contentContainerNoFeed: {
    height: '100%',
    backgroundColor: '#FAFAFA',
  },
  feedContainer: {
    width: '22em',
    borderRight: `1px solid ${Color.borderLight}`,
  },
  feedContainerCollapsed: {
    width: '4em',
    borderRight: `1px solid ${Color.borderLight}`,
  },
  childContentContainer: {
    overflow: 'auto',
    flex: 1,
  },
  childContent: {
    height: '100%',
  },
  childContentNoFeed: {
    flex: 1,
    backgroundColor: Color.primaryWhite,
    borderRight: `1px solid ${Color.borderLight}`,
    borderLeft: `1px solid ${Color.borderLight}`,
    boxShadow: '-1px 0px 1px rgba(0, 0, 0, 0.05), 1px 0px 1px rgba(0, 0, 0, 0.05)',
  },
}
