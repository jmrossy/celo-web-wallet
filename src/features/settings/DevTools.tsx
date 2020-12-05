// Temporary stuff while screens are still in development
import { useDispatch } from 'react-redux'
import { getLatestBlockDetails } from 'src/blockchain/blocks'
import { fetchFeedActions } from 'src/features/feed/fetch'
import { ImportWalletForm } from 'src/features/onboarding/import/ImportWalletForm'
import { PincodeAction, pincodeActions } from 'src/features/pincode/pincode'
import { createWalletActions } from 'src/features/wallet/createWallet'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { saveWallet } from 'src/features/wallet/storage'

export function DevTools() {
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
    dispatch(pincodeActions.trigger({ value: '112233', action: PincodeAction.Unlock }))
  }

  const onClickFetchFeed = () => {
    dispatch(fetchFeedActions.trigger())
  }

  const onClickFetchBlock = async () => {
    const block = await getLatestBlockDetails()
    if (block) {
      alert(block.number)
    }
  }

  return (
    <div css={{ padding: '2em' }}>
      <div>
        <button onClick={onClickCreateWallet}>Create New Wallet</button>
        <button onClick={onClickFetchBalances}>Fetch balances</button>
      </div>
      <div>
        <button onClick={onClickSaveWallet}>Save Wallet</button>
        <button onClick={onClickLoadWallet}>Load Wallet</button>
      </div>
      <button onClick={onClickFetchFeed}>Fetch Transaction Feed</button>
      <button onClick={onClickFetchBlock}>Fetch Latest Block Number</button>
      <p>
        <a href="/loading">Loading Screen</a>
      </p>
      <p>
        <a href="/wallet">Wallet Home / Empty</a>
      </p>
      <ImportWalletForm />
    </div>
  )
}
