import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { SignerType } from 'src/blockchain/types'
import { Button } from 'src/components/buttons/Button'
import { ButtonToggle } from 'src/components/buttons/ButtonToggle'
import { TextArea } from 'src/components/input/TextArea'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import {
  DerivationPathForm,
  DerivationPathFormValues,
  derivationPathInitialValues,
  toDerivationPath,
} from 'src/features/onboarding/import/DerivationPathForm'
import { useEnterPasswordModal } from 'src/features/password/EnterPasswordModal'
import { hasPasswordCached } from 'src/features/password/password'
import {
  importAccountActions,
  ImportAccountParams,
  importAccountSagaName,
} from 'src/features/wallet/importAccount'
import { hasPasswordedAccount } from 'src/features/wallet/manager'
import { setPendingAccount } from 'src/features/wallet/pendingAccount'
import { isValidDerivationPath, isValidMnemonic } from 'src/features/wallet/utils'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useSagaStatus } from 'src/utils/useSagaStatus'
import { ErrorState, invalidInput } from 'src/utils/validation'

interface ImportFormValues extends DerivationPathFormValues {
  mnemonic: string
}

const initialValues: ImportFormValues = {
  ...derivationPathInitialValues,
  mnemonic: '',
}

interface Props {
  navigateToSetPin: () => void
  accountName?: string
  hideDescription?: boolean // Is the form in the add flow instead of onboarding flow
}

export function ImportAccountForm(props: Props) {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')
  const onToggleMode = (index: number) => {
    resetValues(initialValues)
    setMode(index === 0 ? 'simple' : 'advanced')
  }

  const dispatch = useDispatch()
  const { showErrorModal } = useModal()
  const showPasswordModal = useEnterPasswordModal()
  const onSubmit = (values: ImportFormValues) => {
    try {
      const mnemonic = values.mnemonic
      const derivationPath = toDerivationPath(values)

      const triggerImport = (password?: string) => {
        const params: ImportAccountParams = {
          account: {
            type: SignerType.Local,
            mnemonic,
            derivationPath,
            name: props.accountName,
          },
          isExisting: true,
          password,
        }
        dispatch(importAccountActions.trigger(params))
      }

      if (hasPasswordCached()) {
        // If the user already logged in to a passworded account
        triggerImport()
      } else if (hasPasswordedAccount()) {
        // If the user has set a pass but logged in with Ledger
        showPasswordModal(triggerImport)
      } else {
        // User never set a password before
        setPendingAccount(mnemonic, derivationPath, true)
        props.navigateToSetPin()
      }
    } catch (error) {
      showErrorModal(
        'Error Importing Account',
        'Unable to import your account, please check your input and try again.',
        error
      )
    }
  }

  const { values, errors, handleChange, handleBlur, handleSubmit, setValues, resetValues } =
    useCustomForm<ImportFormValues>(initialValues, onSubmit, validateForm)

  const navigate = useNavigate()
  const status = useSagaStatus(
    importAccountSagaName,
    'Error Importing Account',
    'Something went wrong when importing your new account, sorry! Please try again.',
    () => navigate('/')
  )

  return (
    <Box direction="column" align="center">
      <ButtonToggle label1="Simple" label2="Advanced" onToggle={onToggleMode} />
      {!props.hideDescription && (
        <>
          <p css={{ ...style.description, marginTop: '1.3em' }}>
            Enter your recovery (seed) phrase.
          </p>
          <p css={style.description}>Only import on devices you trust.</p>
        </>
      )}
      <form onSubmit={handleSubmit}>
        <Box direction="column" align="center">
          {mode === 'advanced' && (
            <DerivationPathForm
              values={values}
              onChange={handleChange}
              onBlur={handleBlur}
              setValues={setValues}
            />
          )}
          <TextArea
            name="mnemonic"
            value={values.mnemonic}
            placeholder="fish boot jump hand..."
            onChange={handleChange}
            minWidth="calc(min(22em, 85vw))"
            maxWidth="26em"
            minHeight="6.5em"
            maxHeight="8em"
            margin="1.5em 0 0 0"
            {...errors['mnemonic']}
          />
          <Button
            type="submit"
            margin="1.8em 0 0 0"
            disabled={status === SagaStatus.Started}
            size="l"
          >
            Import Account
          </Button>
        </Box>
      </form>
    </Box>
  )
}

function validateForm(values: ImportFormValues): ErrorState {
  if (!isValidMnemonic(values.mnemonic)) {
    return invalidInput('mnemonic', 'Invalid recovery phrase')
  }

  const derivationPath = toDerivationPath(values)
  if (derivationPath && !isValidDerivationPath(derivationPath)) {
    return invalidInput('index', 'Invalid derivation path')
  }

  return { isValid: true }
}

const style: Stylesheet = {
  description: {
    ...Font.body,
    textAlign: 'center',
    margin: '0.5em 0 0 0',
  },
}
