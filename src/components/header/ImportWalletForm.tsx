import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { importWalletTrigger } from '../../features/wallet/importWallet'

export function ImportWalletForm() {
  const [mnemonic, setMnemonic] = useState('')
  const dispatch = useDispatch()

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMnemonic(e.target.value)
  }

  const onClickImport = () => {
    dispatch(importWalletTrigger(mnemonic))
  }

  return (
    <div
      css={{
        marginTop: 20,
      }}
    >
      <textarea value={mnemonic} onChange={onInputChange} />
      <button onClick={onClickImport}>Import Wallet</button>
    </div>
  )
}
