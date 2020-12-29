import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { useSagaStatusWithErrorModal } from 'src/components/modal/useSagaStatusModal'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import {
  pincodeActions,
  PincodeParams,
  pincodeSagaName,
  validate,
} from 'src/features/pincode/pincode'
import { PincodeInputRow, PincodeInputType } from 'src/features/pincode/PincodeInput'
import { PincodeTypeToggle } from 'src/features/pincode/PincodeTypeToggle'
import { PincodeAction, SecretType } from 'src/features/pincode/types'
import { secretTypeToLabel } from 'src/features/pincode/utils'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

const initialValues = { action: PincodeAction.Set, value: '', valueConfirm: '' }

export function SetPincodeForm() {
  const [secretType, setSecretType] = useState<SecretType>('pincode')
  const [label, labelC] = secretTypeToLabel(secretType)
  const inputType =
    secretType === 'pincode' ? PincodeInputType.NewPincode : PincodeInputType.NewPassword

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = (values: PincodeParams) => {
    if (!areInputsValid()) return
    dispatch(pincodeActions.trigger({ ...values, type: secretType }))
  }

  const { values, touched, handleChange, handleSubmit, resetValues } = useCustomForm<PincodeParams>(
    initialValues,
    onSubmit
  )

  const { inputErrors, areInputsValid, clearInputErrors } = useInputValidation(touched, () =>
    validate({ ...values, type: secretType })
  )

  const onToggleSecretType = (index: number) => {
    resetValues(initialValues)
    clearInputErrors()
    setSecretType(index === 0 ? 'pincode' : 'password')
  }

  const onSuccess = () => {
    navigate('/', { replace: true })
  }
  const status = useSagaStatusWithErrorModal(
    pincodeSagaName,
    `Error Setting ${labelC}`,
    `Something went wrong when setting your ${label}, sorry! Please try again.`,
    onSuccess
  )

  return (
    <Box direction="column" align="center">
      <div css={style.description}>{`Don't lose this ${label}, it unlocks your account!`}</div>
      <PincodeTypeToggle onToggle={onToggleSecretType} />
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
              {...inputErrors['value']}
            />
            <PincodeInputRow
              type={inputType}
              label={`Confirm ${labelC}`}
              name="valueConfirm"
              value={values.valueConfirm}
              onChange={handleChange}
              autoFocus={false}
              {...inputErrors['valueConfirm']}
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
    margin: '0 0.5em 1.5em 0.5em',
  },
  inputContainer: {
    marginLeft: '-1.5em',
    [mq[480]]: {
      marginLeft: '-9em',
    },
  },
}
