import React from 'react'
import { Link } from 'react-router-dom'
import { Header } from 'src/components/header/Header'
import { ImportWalletForm } from 'src/components/ImportWalletForm'
import { TransactionFeed } from 'src/features/feed/TransactionFeed'

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
