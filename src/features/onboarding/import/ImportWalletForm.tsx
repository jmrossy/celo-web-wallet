import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { importWalletActions } from 'src/features/wallet/importWallet'

export function ImportWalletForm() {
  const [mnemonic, setMnemonic] = useState('')
  const dispatch = useDispatch()

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMnemonic(e.target.value)
  }

  const onClickImport = () => {
    dispatch(importWalletActions.trigger(mnemonic))
  }

  return (
    <div
      css={{
        marginTop: 20,
      }}
    >
      <Box
        direction="column"
        styles={{
          margin: 20,
          width: 200,
        }}
      >
        <textarea value={mnemonic} onChange={onInputChange} />
        <Button onClick={onClickImport}>Import Wallet</Button>
      </Box>
    </div>
  )
}
