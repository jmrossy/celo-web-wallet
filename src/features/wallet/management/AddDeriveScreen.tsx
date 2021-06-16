import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getSigner, SignerType } from 'src/blockchain/signer'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { Mnemonic } from 'src/components/Mnemonic'
import { PLACEHOLDER_MNEMONIC } from 'src/consts'
import {
  DerivationPathForm,
  DerivationPathFormValues,
  derivationPathInitialValues,
  toDerivationPath,
} from 'src/features/onboarding/import/DerivationPathForm'
import { isValidDerivationPath } from 'src/features/wallet/utils'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { useCustomForm } from 'src/utils/useCustomForm'
import { ErrorState, invalidInput } from 'src/utils/validation'

export function AddDeriveScreen() {
  const dispatch = useDispatch()
  const onSubmit = (values: DerivationPathFormValues) => {
    //TODO
    alert(JSON.stringify(values))
    // dispatch(importWalletActions.trigger(toImportWalletParams(values)))
  }

  const { values, handleChange, handleBlur, handleSubmit, setValues, resetValues } =
    useCustomForm<DerivationPathFormValues>(derivationPathInitialValues, onSubmit, validate)

  const navigate = useNavigate()
  const onSuccess = () => {
    // TODO
    // navigate('/setup/set-pin', { state: { pageNumber: 4 } })
  }
  // const status = useSagaStatus(
  //   importWalletSagaName,
  //   'Error Importing Wallet',
  //   'Something went wrong when importing your wallet, sorry! Please check your account key and try again.',
  //   onSuccess
  // )

  // TODO get mnemonic in way that handles multi-account and handle error when no mnemonic exists yet
  let mnemonicPhrase: string = PLACEHOLDER_MNEMONIC
  let mnemonicUnavailable = false
  const signer = getSigner()
  if (signer.type === SignerType.Local) {
    mnemonicPhrase = signer.signer.mnemonic.phrase
  } else if (signer.type === SignerType.Ledger) {
    mnemonicUnavailable = true
  }

  return (
    <>
      <h2 css={Font.h2Center}>Derive Another Account</h2>
      <h4 css={Font.h4Center}>Set a derivation path to import another account.</h4>
      <h4 css={Font.h4Center}>This will use your existing account key.</h4>
      <form onSubmit={handleSubmit}>
        <Box direction="column" align="center">
          <div css={{ margin: '0.5em 0 2em 0' }}>
            <DerivationPathForm
              values={values}
              onChange={handleChange}
              onBlur={handleBlur}
              setValues={setValues}
            />
          </div>
          <Mnemonic mnemonic={mnemonicPhrase} unavailable={mnemonicUnavailable} />
          <Button
            type="submit"
            margin="2em 0 0 0"
            // disabled={status === SagaStatus.Started}
            size="l"
          >
            Import Account
          </Button>
        </Box>
      </form>
    </>
  )
}

// TODO move to saga?
function validate(values: DerivationPathFormValues): ErrorState {
  const derivationPath = toDerivationPath(values)
  if (derivationPath && !isValidDerivationPath(derivationPath)) {
    return invalidInput('index', 'Invalid derivation path')
  }

  return { isValid: true }
}

const style: Stylesheet = {}
