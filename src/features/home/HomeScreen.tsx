import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/Button'
import { Header } from 'src/components/header/Header'
import { TransactionFeed } from 'src/features/feed/TransactionFeed'
import { ImportWalletForm } from 'src/features/onboarding/import/ImportWalletForm'

export function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div>
      <Header />
      <ImportWalletForm />
      <Button onClick={() => navigate('send')} margin={10}>
        Send Payment
      </Button>
      <Button onClick={() => navigate('exchange')} margin={10}>
        Exchange Tokens
      </Button>
      <TransactionFeed />
    </div>
  )
}
