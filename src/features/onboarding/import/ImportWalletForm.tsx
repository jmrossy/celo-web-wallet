import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { importWalletActions } from 'src/features/wallet/importWallet'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

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
    <Box direction="column" styles={style.container} align="center">
      <textarea
        value={mnemonic}
        onChange={onInputChange}
        placeholder="fish boot jump hand..."
        css={style.input}
      />
      <Button onClick={onClickImport} margin="2em 0 0 0">
        Import Account
      </Button>
    </Box>
  )
}

const style: Stylesheet = {
  container: { marginTop: '2em' },
  input: {
    padding: '0.5em',
    borderRadius: 3,
    outline: 'none',
    border: `2px solid ${Color.borderInactive}`,
    ':focus': {
      borderColor: Color.borderActive,
    },
    minWidth: '20em',
    maxWidth: '30em',
    minHeight: '5em',
    maxHeight: '8em',
  },
}
