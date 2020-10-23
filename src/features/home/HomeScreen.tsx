import { useDispatch } from 'react-redux'
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed'
import { fetchFeedActions } from 'src/features/feed/fetch'
import { ImportWalletForm } from 'src/features/onboarding/import/ImportWalletForm'
import { createWalletActions } from 'src/features/wallet/createWallet'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { loadWalletActions, saveWallet } from 'src/features/wallet/storage'

export function HomeScreen() {
  const dispatch = useDispatch()

  const onClickCreateWallet = () => {
    dispatch(createWalletActions.trigger())
  }

  const onClickFetchBalances = () => {
    dispatch(fetchBalancesActions.trigger())
  }

  const onClickSaveWallet = async () => {
    await saveWallet('112233')
  }

  const onClickLoadWallet = () => {
    dispatch(loadWalletActions.trigger({ pincode: '112233' }))
  }

  const onClickFetchFeed = () => {
    dispatch(fetchFeedActions.trigger())
  }

  return (
    <ScreenFrameWithFeed>
      <div css={{ margin: '2rem' }}>
        <div>
          <button onClick={onClickCreateWallet}>Create New Wallet</button>
          <button onClick={onClickFetchBalances}>Fetch balances</button>
        </div>
        <div>
          <button onClick={onClickSaveWallet}>Save Wallet</button>
          <button onClick={onClickLoadWallet}>Load Wallet</button>
        </div>
        <button onClick={onClickFetchFeed}>Fetch Transaction Feed</button>
        <ImportWalletForm />
      </div>
    </ScreenFrameWithFeed>
  )
}
