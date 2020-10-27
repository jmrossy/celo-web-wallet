import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed'
import { TransactionReview } from 'src/features/home/TransactionReview'
import { DevTools } from 'src/features/settings/DevTools'

export function HomeScreen() {
  const openTransactionHash = useSelector((s: RootState) => s.feed.openTransaction)

  return (
    <ScreenFrameWithFeed>
      {openTransactionHash ? <TransactionReview txHash={openTransactionHash} /> : <DevTools />}
    </ScreenFrameWithFeed>
  )
}
