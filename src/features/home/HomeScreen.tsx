import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/Button'
import { ScreenFrame } from 'src/components/layout/ScreenFrame'
import { TransactionFeed } from 'src/features/feed/TransactionFeed'
import { ImportWalletForm } from 'src/features/onboarding/import/ImportWalletForm'
import { createWalletActions } from 'src/features/wallet/createWallet'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { loadWalletActions, saveWallet } from 'src/features/wallet/storage'

export function HomeScreen() {
  const navigate = useNavigate()

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
    <ScreenFrame>
      <div css={{ marginTop: '2rem' }}>
        <button onClick={onClickCreateWallet}>Create New Wallet</button>
        <button onClick={onClickFetchBalances}>Fetch balances</button>
      </div>
      <div>
        <button onClick={onClickSaveWallet}>Save Wallet</button>
        <button onClick={onClickLoadWallet}>Load Wallet</button>
      </div>
      <ImportWalletForm />
      <Button onClick={() => navigate('send')} margin={10}>
        Send Payment
      </Button>
      <Button onClick={() => navigate('exchange')} margin={10}>
        Exchange Tokens
      </Button>
      <TransactionFeed />
    </ScreenFrame>
  )
}
