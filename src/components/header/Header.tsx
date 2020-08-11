import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { createWalletActions } from 'src/features/wallet/createWallet'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'

export function Header() {
  const { address, balances } = useSelector((s: RootState) => ({
    address: s.wallet.address,
    balances: s.wallet.balances,
  }))
  const dispatch = useDispatch()

  const onClickCreateWallet = () => {
    dispatch(createWalletActions.trigger())
  }

  const onClickFetchBalances = () => {
    dispatch(fetchBalancesActions.trigger())
  }

  return (
    <div>
      <h1
        css={{
          backgroundColor: 'yellow',
        }}
      >
        Your address is {address}
      </h1>
      <h1>Your cUsd balance is {balances.cUsd}</h1>
      <h1>Your CELO balance is {balances.celo}</h1>
      <button onClick={onClickCreateWallet}>Create New Wallet</button>
      <button onClick={onClickFetchBalances}>Fetch balances</button>
    </div>
  )
}
