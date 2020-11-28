import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/Button'
import { TextArea } from 'src/components/input/TextArea'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { ImportWalletWarning } from 'src/features/onboarding/import/ImportWalletWarning'
import { importWalletActions, isValidMnemonic } from 'src/features/wallet/importWallet'
import { SagaStatus } from 'src/utils/saga'

export function ImportWalletForm() {
  const [hasShownWarning, setHasShownWarning] = useState(false)
  const { showModalWithContent, showErrorModal, closeModal } = useModal()
  const onInputFocus = () => {
    if (hasShownWarning) return
    // TODO lock logo in modal header
    showModalWithContent(
      'Security Warning',
      <ImportWalletWarning />,
      { key: 'ImportUnderstandButton', label: 'I Understand' },
      () => {
        setHasShownWarning(true)
        closeModal()
      },
      null,
      false
    )
  }

  const [mnemonic, setMnemonic] = useState('')
  const [isMnemonicValid, setIsMnemonicValid] = useState(true)
  const dispatch = useDispatch()

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsMnemonicValid(true)
    setMnemonic(e.target.value)
  }

  const onClickImport = () => {
    if (!isValidMnemonic(mnemonic)) {
      // TODO help text for textarea
      setIsMnemonicValid(false)
      return
    }

    dispatch(importWalletActions.trigger(mnemonic))
  }

  const { status, error } = useSelector((state: RootState) => state.saga.importWallet)
  const navigate = useNavigate()
  useEffect(() => {
    if (status === SagaStatus.Success) {
      navigate('/set-pin')
    } else if (status === SagaStatus.Failure) {
      showErrorModal(
        'Error Importing Wallet',
        error,
        'Something went wrong when importing your wallet, sorry! Please check your account key and try again.'
      )
    }
  }, [status, error])

  return (
    <Box direction="column" margin="2em 0 0 0" align="center">
      <TextArea
        name="mnemonic"
        value={mnemonic}
        error={!isMnemonicValid}
        placeholder="fish boot jump hand..."
        onChange={onInputChange}
        onFocus={onInputFocus}
        minWidth="20em"
        maxWidth="25em"
        minHeight="5em"
        maxHeight="7em"
      />
      <Button onClick={onClickImport} margin="2em 0 0 0" disabled={status === SagaStatus.Started}>
        Import Account
      </Button>
    </Box>
  )
}
