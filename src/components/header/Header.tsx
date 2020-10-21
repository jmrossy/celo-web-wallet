import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Identicon } from 'src/components/Identicon'
import { NULL_ADDRESS } from 'src/consts'
import { createWalletActions } from 'src/features/wallet/createWallet'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { loadWalletActions, saveWallet } from 'src/features/wallet/storage'

export function Header() {
  const { address, balances } = useSelector((s: RootState) => ({
    address: s.wallet.address,
    balances: s.wallet.balances,
  }))

  const addressOrDefault = address || NULL_ADDRESS

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

  return (
    <div>
      <h1
        css={{
          backgroundColor: 'yellow',
        }}
      >
        Your address is {addressOrDefault}
      </h1>
      <Identicon address={addressOrDefault} />
      <h1>Your cUsd balance is {balances.cUsd}</h1>
      <h1>Your CELO balance is {balances.celo}</h1>
      <div>
        <button onClick={onClickCreateWallet}>Create New Wallet</button>
        <button onClick={onClickFetchBalances}>Fetch balances</button>
      </div>
      <div>
        <button onClick={onClickSaveWallet}>Save Wallet</button>
        <button onClick={onClickLoadWallet}>Load Wallet</button>
      </div>
    </div>
  )
}
