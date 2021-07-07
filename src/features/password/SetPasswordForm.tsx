import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { SignerType } from 'src/blockchain/types'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { ModalAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import { PasswordInputRow, PasswordInputType } from 'src/features/password/PasswordInput'
import { PasswordStrengthBar } from 'src/features/password/PasswordStrengthBar'
import { validatePasswordValue } from 'src/features/password/utils'
import {
  importAccountActions,
  ImportAccountParams,
  importAccountSagaName,
} from 'src/features/wallet/importAccount'
import { getPendingAccount, PendingAccount } from 'src/features/wallet/pendingAccount'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useSagaStatus } from 'src/utils/useSagaStatus'
import { ErrorState, invalidInput } from 'src/utils/validation'

interface PasswordForm {
  value: string
  valueConfirm: string
}

const initialValues: PasswordForm = { value: '', valueConfirm: '' }

interface Props {
  onSuccess: () => void
}

// This form receives the password value, validates it, and then
// triggers the account import with it using the pending account
export function SetPasswordForm(props: Props) {
  const navigate = useNavigate()
  const [pendingAccount, setPendingAccount] = useState<PendingAccount | undefined>()
  useEffect(() => {
    // A pending account must have been created before reaching here
    const pending = getPendingAccount()
    if (pending) {
      setPendingAccount(pending)
    } else {
      navigate(-1)
    }
  }, [])

  const dispatch = useDispatch()
  const onConfirm = (values: PasswordForm) => {
    if (!pendingAccount) return
    const params: ImportAccountParams = {
      account: {
        type: SignerType.Local,
        mnemonic: pendingAccount.wallet.mnemonic.phrase,
        derivationPath: pendingAccount.wallet.mnemonic.path,
      },
      password: values.value,
      isExisting: pendingAccount.isImported,
    }
    dispatch(importAccountActions.trigger(params))
  }

  const { showModal, closeModal } = useModal()
  const onSubmit = (values: PasswordForm) => {
    const onActionClick = (action: ModalAction) => {
      if (action.key === 'confirm') onConfirm(values)
      closeModal()
    }
    showModal({
      head: 'Keep This Password Safe',
      body: "This password is the only way to unlock your account. It cannot be recovered if it's lost. Please keep it in a safe place!",
      actions: [
        { key: 'back', label: 'Back', color: Color.altGrey },
        { key: 'confirm', label: 'I Understand', color: Color.primaryGreen },
      ],
      onActionClick,
      size: 's',
    })
  }

  const { values, errors, handleChange, handleSubmit } = useCustomForm<PasswordForm>(
    initialValues,
    onSubmit,
    validateForm
  )

  const status = useSagaStatus(
    importAccountSagaName,
    'Error Saving Account',
    'Something went wrong when saving your new account, sorry! Please try again.',
    props.onSuccess
  )

  return (
    <form onSubmit={handleSubmit}>
      <Box direction="column" align="center" margin="0.5em 0 0 0">
        <div css={style.inputContainer}>
          <PasswordInputRow
            type={PasswordInputType.NewPassword}
            label="Enter Password"
            name="value"
            value={values.value}
            onChange={handleChange}
            autoFocus={true}
            {...errors['value']}
          />
          <PasswordInputRow
            type={PasswordInputType.NewPassword}
            label="Confirm Password"
            name="valueConfirm"
            value={values.valueConfirm}
            onChange={handleChange}
            autoFocus={false}
            {...errors['valueConfirm']}
          />
        </div>
        <PasswordStrengthBar value={values.value} />
        <Button
          size="l"
          type="submit"
          margin="1.5em 0 0 0"
          disabled={status === SagaStatus.Started}
        >
          Set Password
        </Button>
      </Box>
    </form>
  )
}

function validateForm(params: PasswordForm): ErrorState {
  const { value, valueConfirm } = params
  let errors: ErrorState = { isValid: true }
  if (!value) {
    return invalidInput('value', 'Value is required')
  } else {
    errors = { ...errors, ...validatePasswordValue(value, 'value') }
  }
  if (!valueConfirm) {
    errors = { ...errors, ...invalidInput('valueConfirm', 'Confirm value is required') }
  } else if (value !== valueConfirm) {
    errors = { ...errors, ...invalidInput('valueConfirm', 'Values do not match') }
  }
  return errors
}

const style: Stylesheet = {
  description: {
    ...onboardingStyles.description,
    maxWidth: '22em',
    margin: '0 0.5em 0.5em 0.5em',
  },
  inputContainer: {
    marginLeft: '-2em',
    [mq[480]]: {
      marginLeft: '-9em',
    },
  },
}
