import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { TextArea } from 'src/components/input/TextArea'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { useSagaStatusWithErrorModal } from 'src/components/modal/useSagaStatusModal'
import { ImportWalletWarning } from 'src/features/onboarding/import/ImportWalletWarning'
import {
  importWalletActions,
  importWalletSagaName,
  isValidMnemonic,
} from 'src/features/wallet/importWallet'
import { SagaStatus } from 'src/utils/saga'

export function ImportWalletForm() {
  const [hasShownWarning, setHasShownWarning] = useState(false)
  const { showModalWithContent, closeModal } = useModal()
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

  const navigate = useNavigate()
  const onSuccess = () => {
    navigate('/set-pin')
  }
  const status = useSagaStatusWithErrorModal(
    importWalletSagaName,
    'Error Importing Wallet',
    'Something went wrong when importing your wallet, sorry! Please check your account key and try again.',
    onSuccess
  )

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
