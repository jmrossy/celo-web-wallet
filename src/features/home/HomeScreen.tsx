import React from 'react'
import { Header } from 'src/components/header/Header'
import { ImportWalletForm } from 'src/components/ImportWalletForm'

export function HomeScreen() {
  return (
    <div>
      <Header />
      <ImportWalletForm />
    </div>
  )
}
