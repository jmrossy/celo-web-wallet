import React from 'react'
import { Link } from 'react-router-dom'
import { Header } from 'src/components/header/Header'
import { TransactionFeed } from 'src/features/feed/TransactionFeed'
import { ImportWalletForm } from 'src/features/onboarding/import/ImportWalletForm'

export function HomeScreen() {
  return (
    <div>
      <Header />
      <ImportWalletForm />
      <Link to={'send'}>Send Payment</Link>
      <TransactionFeed />
    </div>
  )
}
