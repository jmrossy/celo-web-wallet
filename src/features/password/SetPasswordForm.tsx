import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { ModalAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import {
  passwordActions,
  PasswordParams,
  passwordSagaName,
  validate,
} from 'src/features/password/password'
import { PasswordInputRow, PasswordInputType } from 'src/features/password/PasswordInput'
import { PasswordStrengthBar } from 'src/features/password/PasswordStrengthBar'
import { PasswordAction, SecretType } from 'src/features/password/types'
import { secretTypeToLabel } from 'src/features/password/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues = { action: PasswordAction.Set, value: '', valueConfirm: '' }

export function SetPasswordForm() {
  const [secretType] = useState<SecretType>('password')
  const [label, labelC] = secretTypeToLabel(secretType)
  const inputType =
    secretType === 'pincode' ? PasswordInputType.NewPincode : PasswordInputType.NewPassword

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showModal, closeModal } = useModal()

  const onSubmit = (values: PasswordParams) => {
    const backAction = {
      key: 'back',
      label: 'Back',
      color: Color.altGrey,
    }
    const confirmAction = {
      key: 'confirm',
      label: 'I Understand',
      color: Color.primaryGreen,
    }
    const onActionClick = (action: ModalAction) => {
      if (action.key === 'confirm') {
        dispatch(passwordActions.trigger({ ...values, type: secretType }))
      }
      closeModal()
    }
    showModal({
      head: 'Keep This Password Safe',
      body: "This password is the only way to unlock your account. It cannot be recovered if it's lost. Please keep it in a safe place!",
      actions: [backAction, confirmAction],
      onActionClick,
      size: 's',
    })
  }

  const validateForm = (values: PasswordParams) => validate({ ...values, type: secretType })

  const { values, errors, handleChange, handleSubmit } = useCustomForm<PasswordParams>(
    initialValues,
    onSubmit,
    validateForm
  )

  // const onToggleSecretType = (index: number) => {
  //   resetValues(initialValues)
  //   setSecretType(index === 0 ? 'pincode' : 'password')
  // }

  const onSuccess = () => {
    navigate('/', { replace: true })
  }
  const status = useSagaStatus(
    passwordSagaName,
    `Error Setting ${labelC}`,
    `Something went wrong when setting your ${label}, sorry! Please try again.`,
    onSuccess
  )

  return (
    <Box direction="column" align="center">
      <div css={style.description}>{`Don't lose this ${label}, it unlocks your account!`}</div>
      {/* <PasswordTypeToggle onToggle={onToggleSecretType} /> */}
      <form onSubmit={handleSubmit}>
        <Box direction="column" align="center" margin="0.5em 0 0 0">
          <div css={style.inputContainer}>
            <PasswordInputRow
              type={inputType}
              label={`Enter ${labelC}`}
              name="value"
              value={values.value}
              onChange={handleChange}
              autoFocus={true}
              {...errors['value']}
            />
            <PasswordInputRow
              type={inputType}
              label={`Confirm ${labelC}`}
              name="valueConfirm"
              value={values.valueConfirm}
              onChange={handleChange}
              autoFocus={false}
              {...errors['valueConfirm']}
            />
          </div>
          <PasswordStrengthBar type={secretType} value={values.value} />
          <Button
            size="l"
            type="submit"
            margin="1.5em 0 0 0"
            disabled={status === SagaStatus.Started}
          >
            {`Set ${labelC}`}
          </Button>
        </Box>
      </form>
    </Box>
  )
}

const style: Stylesheet = {
  description: {
    ...onboardingStyles.description,
    ...Font.extraBold,
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
