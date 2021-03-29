import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { FixedSizeList } from 'react-window'
import { RootState } from 'src/app/rootReducer'
import Nurture from 'src/components/icons/nurture.svg'
import { Box } from 'src/components/layout/Box'
import {
  FeedItem,
  FeedItemData,
  FEED_ITEM_HEIGHT_COMPACT,
  FEED_ITEM_HEIGHT_NORMAL,
} from 'src/features/feed/FeedItem'
import { openTransaction } from 'src/features/feed/feedSlice'
import { useAreBalancesEmpty, useTokens } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { useDimensionsResizeObserver } from 'src/styles/useResizeObserver'

type FeedState = 'normal' | 'mobile' | 'collapsed'

let scrollOffset = 0
let widthEstimate = 330
let heightEstimate = 500

export function TransactionFeed(props: { feedState?: FeedState }) {
  const feedState = props.feedState || 'normal'

  const openTransactionHash = useSelector((s: RootState) => s.feed.openTransaction)
  const transactions = useSelector((s: RootState) => s.feed.transactions)
  const isWalletEmpty = useAreBalancesEmpty()
  const tokens = useTokens()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const onFeedItemClick = (hash: string) => {
    dispatch(openTransaction(hash))
    navigate('/tx')
  }

  const { setNodeRef, width, height } = useDimensionsResizeObserver(widthEstimate, heightEstimate)
  heightEstimate = height
  widthEstimate = width

  // 480 const here must correspond with where font sizes drop in index.html
  const itemSize =
    feedState === 'mobile' && width < 480 ? FEED_ITEM_HEIGHT_COMPACT : FEED_ITEM_HEIGHT_NORMAL

  const itemData = useMemo(() => {
    const sortedTransaction = Object.values(transactions).sort((a, b) => b.timestamp - a.timestamp)
    return sortedTransaction.map(
      (tx): FeedItemData => ({
        tx,
        tokens,
        itemSize,
        isOpen: openTransactionHash === tx.hash,
        onClick: onFeedItemClick,
        collapsed: feedState === 'collapsed',
      })
    )
  }, [transactions, tokens, openTransactionHash, feedState, itemSize])

  const isFeedEmpty = !itemData.length

  const onScroll = useCallback((onScrollProps: { scrollOffset: number }) => {
    scrollOffset = onScrollProps.scrollOffset
  }, [])

  return (
    <div css={style.container} ref={setNodeRef}>
      {isFeedEmpty ? (
        <Box direction="column" align="center" justify="center" styles={style.tipContainer}>
          <div>
            <img width="110em" height="110em" src={Nurture} alt="Plant seed" css={style.logo} />
          </div>
          <div style={style.tipText}>You have no wallet activity yet.</div>
          <div style={style.tipText}>
            {isWalletEmpty
              ? 'Start by adding funds to your account.'
              : 'Try a payment or an exchange.'}
          </div>
        </Box>
      ) : (
        <FixedSizeList
          height={height}
          width="100%"
          itemSize={itemSize}
          itemCount={itemData.length}
          itemData={itemData}
          initialScrollOffset={scrollOffset}
          onScroll={onScroll}
        >
          {FeedItem as any}
        </FixedSizeList>
      )}
    </div>
  )
}

const style: Stylesheet = {
  container: {
    flex: 1,
    width: '100%',
    overflowX: 'hidden',
    overflowY: 'hidden',
    '& > div': {
      scrollbarWidth: 'none',
      '::-webkit-scrollbar': {
        width: 0,
      },
      [mq[768]]: {
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--thumbBG) #fcfcfc',
        '::-webkit-scrollbar': {
          width: 6,
          height: 6,
          borderLeft: `1px solid ${Color.borderLight}`,
          backgroundColor: '#fcfcfc',
        },
      },
    },
  },
  tipContainer: {
    height: '100%',
    padding: '0 2em 3.2em 2em',
    opacity: 0.8,
  },
  tipText: {
    ...Font.body2,
    color: Color.primaryBlack,
    marginTop: '1em',
  },
}
