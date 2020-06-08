import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../app/rootReducer'
import { createWalletActions } from '../../features/wallet/createWallet'
import { fetchBalancesActions } from '../../features/wallet/fetchBalances'

export function Header() {
  const { address, balances } = useSelector((s: RootState) => ({
    address: s.wallet.address,
    balances: s.wallet.balances,
  }))
  const dispatch = useDispatch()

  const onClickCreateWallet = useCallback(() => {
    dispatch(createWalletActions.trigger())
  }, [])

  const onClickFetchBalances = useCallback(() => {
    dispatch(fetchBalancesActions.trigger())
  }, [])

  return (
    <div>
      <h1
        css={{
          backgroundColor: 'yellow',
        }}
      >
        Your address is {address}
      </h1>
      <h1>Your dollar balance is {balances.cUsd}</h1>
      <h1>Your gold balance is {balances.cGld}</h1>
      <button onClick={onClickCreateWallet}>Create New Wallet</button>
      <button onClick={onClickFetchBalances}>Fetch balances</button>
    </div>
  )
}
