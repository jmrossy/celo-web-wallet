import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { ModalAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import {
  pincodeActions,
  PincodeParams,
  pincodeSagaName,
  validate,
} from 'src/features/pincode/pincode'
import { PincodeInputRow, PincodeInputType } from 'src/features/pincode/PincodeInput'
import { PincodeAction, SecretType } from 'src/features/pincode/types'
import { secretTypeToLabel } from 'src/features/pincode/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues = { action: PincodeAction.Set, value: '', valueConfirm: '' }

export function SetPincodeForm() {
  const [secretType] = useState<SecretType>('password')
  const [label, labelC] = secretTypeToLabel(secretType)
  const inputType =
    secretType === 'pincode' ? PincodeInputType.NewPincode : PincodeInputType.NewPassword

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showModal, closeModal } = useModal()

  const onSubmit = (values: PincodeParams) => {
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
        dispatch(pincodeActions.trigger({ ...values, type: secretType }))
      }
      closeModal()
    }
    showModal(
      'Keep This Password Safe',
      "This password is the only way to unlock your account. It cannot be recovered if it's lost. Please keep it in a safe place!",
      [backAction, confirmAction],
      undefined,
      's',
      onActionClick
    )
  }

  const validateForm = (values: PincodeParams) => validate({ ...values, type: secretType })

  const { values, errors, handleChange, handleSubmit } = useCustomForm<PincodeParams>(
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
    pincodeSagaName,
    `Error Setting ${labelC}`,
    `Something went wrong when setting your ${label}, sorry! Please try again.`,
    onSuccess
  )

  return (
    <Box direction="column" align="center">
      <div css={style.description}>{`Don't lose this ${label}, it unlocks your account!`}</div>
      {/* <PincodeTypeToggle onToggle={onToggleSecretType} /> */}
      <form onSubmit={handleSubmit}>
        <Box direction="column" align="center" margin="0.5em 0 0 0">
          <div css={style.inputContainer}>
            <PincodeInputRow
              type={inputType}
              label={`Enter ${labelC}`}
              name="value"
              value={values.value}
              onChange={handleChange}
              autoFocus={true}
              {...errors['value']}
            />
            <PincodeInputRow
              type={inputType}
              label={`Confirm ${labelC}`}
              name="valueConfirm"
              value={values.valueConfirm}
              onChange={handleChange}
              autoFocus={false}
              {...errors['valueConfirm']}
            />
          </div>
          <Button
            size="l"
            type="submit"
            margin="2.5em 0 0 0"
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
