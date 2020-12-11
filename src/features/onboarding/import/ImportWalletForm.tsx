import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { TextArea } from 'src/components/input/TextArea'
import { Box } from 'src/components/layout/Box'
import { useSagaStatusWithErrorModal } from 'src/components/modal/useSagaStatusModal'
import { ImportWalletWarning } from 'src/features/onboarding/import/ImportWalletWarning'
import {
  importWalletActions,
  importWalletSagaName,
  isValidMnemonic,
} from 'src/features/wallet/importWallet'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { SagaStatus } from 'src/utils/saga'

export function ImportWalletForm() {
  const [hasShownWarning, setHasShownWarning] = useState(false)
  const [mnemonic, setMnemonic] = useState('')
  const [isMnemonicValid, setIsMnemonicValid] = useState(true)
  const dispatch = useDispatch()

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsMnemonicValid(true)
    setMnemonic(e.target.value)
  }

  const onClickImport = () => {
    if (!isValidMnemonic(mnemonic)) {
      setIsMnemonicValid(false)
      return
    }

    dispatch(importWalletActions.trigger(mnemonic))
  }

  const navigate = useNavigate()
  const onSuccess = () => {
    navigate('/setup/set-pin')
  }
  const status = useSagaStatusWithErrorModal(
    importWalletSagaName,
    'Error Importing Wallet',
    'Something went wrong when importing your wallet, sorry! Please check your account key and try again.',
    onSuccess
  )

  return (
    <Box direction="column" align="center">
      {!hasShownWarning && (
        <Box direction="column" align="center" styles={styles.warningBox}>
          <ImportWalletWarning />
          <Button onClick={() => setHasShownWarning(true)} margin="2em 0 0 0">
            I Understand
          </Button>
        </Box>
      )}
      {hasShownWarning && (
        <Box direction="column" align="center" margin="-1em 0 0 0">
          <p css={styles.description}>Enter your account key (mnemonic phrase).</p>
          <p css={styles.description}>Only import on devices you trust.</p>
          <Box direction="column" align="center" margin="2em 0 0 0">
            <TextArea
              name="mnemonic"
              value={mnemonic}
              error={!isMnemonicValid}
              helpText={!isMnemonicValid ? 'invalid account key' : undefined}
              placeholder="fish boot jump hand..."
              onChange={onInputChange}
              minWidth="22em"
              maxWidth="26em"
              minHeight="6.5em"
              maxHeight="8em"
            />
            <Button
              onClick={onClickImport}
              margin="2em 0 0 0"
              disabled={status === SagaStatus.Started}
              size="l"
            >
              Import Account
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}

const styles = {
  warningBox: {
    borderRadius: 4,
    padding: '0 1em 1em 1em',
    background: `${Color.accentBlue}11`,
  },
  description: {
    ...Font.body,
    margin: '1em 0 0 0',
  },
}
