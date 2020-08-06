import React from 'react'
import { Header } from '../../components/header/Header'
import { ImportWalletForm } from '../../components/ImportWalletForm'

export function HomeScreen() {
  return (
    <div>
      <Header />
      <ImportWalletForm />
    </div>
  )
}
