import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/Button'
import { TextArea } from 'src/components/input/TextArea'
import { Box } from 'src/components/layout/Box'
import { importWalletActions, isValidMnemonic } from 'src/features/wallet/importWallet'
import { SagaStatus } from 'src/utils/saga'

export function ImportWalletForm() {
  const [mnemonic, setMnemonic] = useState('')
  const dispatch = useDispatch()

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMnemonic(e.target.value)
  }

  const onClickImport = () => {
    if (!isValidMnemonic(mnemonic)) {
      // TODO
      alert('Invalid backup phrase')
      return
    }

    dispatch(importWalletActions.trigger(mnemonic))
  }

  const sagaStatus = useSelector((state: RootState) => state.saga.importWallet.status)
  const navigate = useNavigate()

  useEffect(() => {
    if (sagaStatus === SagaStatus.Success) {
      navigate('/')
    } else if (sagaStatus === SagaStatus.Failure) {
      //TODO
      alert('Importing wallet failed')
    }
  }, [sagaStatus])

  return (
    <Box direction="column" margin="2em 0 0 0" align="center">
      <TextArea
        name="mnemonic"
        value={mnemonic}
        placeholder="fish boot jump hand..."
        onChange={onInputChange}
        minWidth="20em"
        maxWidth="25em"
        minHeight="5em"
        maxHeight="7em"
      />
      <Button onClick={onClickImport} margin="2em 0 0 0">
        Import Account
      </Button>
    </Box>
  )
}
