import React from 'react'
import { Link } from 'react-router-dom'
import { Header } from 'src/components/header/Header'
import { ImportWalletForm } from 'src/components/ImportWalletForm'

export function HomeScreen() {
  return (
    <div>
      <Header />
      <ImportWalletForm />
      <Link to={'send'}>Send Payment</Link>
    </div>
  )
}
