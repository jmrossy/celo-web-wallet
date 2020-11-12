import { DevTools } from 'src/features/settings/DevTools'

// TODO put home screen content here
export function HomeScreen() {
  return <DevTools />
  // const openTransactionHash = useSelector((s: RootState) => s.feed.openTransaction)

  // return (
  //      {openTransactionHash ? <TransactionReview txHash={openTransactionHash} /> : <DevTools />}
  // )
}
