import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import Nurture from 'src/components/icons/nurture.svg'
import { Box } from 'src/components/layout/Box'
import { FeedItem } from 'src/features/feed/FeedItem'
import { openTransaction } from 'src/features/feed/feedSlice'
import { TransactionMap } from 'src/features/types'
import { areBalancesEmpty } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function TransactionFeed(props: { collapsed?: boolean }) {
  const openTransactionHash = useSelector((s: RootState) => s.feed.openTransaction)
  const transactions = useSelector((s: RootState) => s.feed.transactions)
  const sortedTransaction = getSortedTransactions(transactions)
  const isFeedEmpty = !sortedTransaction.length
  const balances = useSelector((s: RootState) => s.wallet.balances)
  const isWalletEmpty = areBalancesEmpty(balances)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onFeedItemClick = (hash: string) => {
    dispatch(openTransaction(hash))
    navigate('/tx')
  }

  return (
    <div css={style.container}>
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
        <ol css={style.ol}>
          {/* TODO: Use some kind of flatlist or pagination */}
          {sortedTransaction.map((tx) => (
            <FeedItem
              tx={tx}
              tokens={balances.tokens}
              key={tx.hash}
              onClick={onFeedItemClick}
              isOpen={openTransactionHash === tx.hash}
              collapsed={props.collapsed}
            />
          ))}
        </ol>
      )}
    </div>
  )
}

function getSortedTransactions(transactions: TransactionMap) {
  return Object.values(transactions).sort((a, b) => b.timestamp - a.timestamp)
}

const style: Stylesheet = {
  container: {
    flex: 1,
    overflowX: 'hidden',
    overflowY: 'auto',
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
  ol: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
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
