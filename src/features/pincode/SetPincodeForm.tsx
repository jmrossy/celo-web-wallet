import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/buttons/Button'
import { ButtonToggle } from 'src/components/buttons/ButtonToggle'
import { BasicHelpIconModal, HelpIcon } from 'src/components/icons/HelpIcon'
import { Box } from 'src/components/layout/Box'
import { useSagaStatusWithErrorModal } from 'src/components/modal/useSagaStatusModal'
import {
  PincodeAction,
  pincodeActions,
  PincodeParams,
  pincodeSagaName,
  validate,
} from 'src/features/pincode/pincode'
import { PincodeInputRow, PincodeInputType } from 'src/features/pincode/PincodeInput'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

const initialValues = { action: PincodeAction.Set, value: '', valueConfirm: '' }

export function SetPincodeForm() {
  const [usingPin, setUsingPin] = useState(true)
  const [label, labelC] = usingPin ? ['pin', 'Pin'] : ['password', 'Password']
  const inputType = usingPin ? PincodeInputType.NewPincode : PincodeInputType.NewPassword

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = (values: PincodeParams) => {
    if (areInputsValid()) {
      dispatch(pincodeActions.trigger({ action: PincodeAction.Set, value: values.value }))
    }
  }

  const { values, touched, handleChange, handleSubmit, resetValues } = useCustomForm<PincodeParams>(
    initialValues,
    onSubmit
  )

  const { inputErrors, areInputsValid, clearInputErrors } = useInputValidation(touched, () =>
    validate(values)
  )

  const onToggleSecretType = (index: number) => {
    resetValues(initialValues)
    clearInputErrors()
    setUsingPin(index === 0)
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
      <div css={style.buttonToggleContainer}>
        <ButtonToggle label1="Pincode" label2="Password" onToggle={onToggleSecretType} />
        <div css={style.helpIcon}>
          <HelpIcon width="1.5em" modal={{ head: 'Pincode vs Password', content: <HelpModal /> }} />
        </div>
      </div>
      <div css={[style.description, Font.extraBold]}>
        {`Don't lose this ${label}, you need it to unlock your account!`}
      </div>
      <div css={style.inputRowContainer}>
        <form onSubmit={handleSubmit}>
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
          <Box styles={{ width: '100%' }} justify="end">
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
      </div>
    </Box>
  )
}

function HelpModal() {
  return (
    <BasicHelpIconModal>
      <p>
        You can use a 6-digit pincode or a password to secure your account, whichever you prefer.
        Pincodes are more convenient but passwords are more secure.
      </p>
      <p>
        Note, there is no way to recover your pin or password,{' '}
        <strong>you need to keep it safe!</strong> Using a password manager is recommended.
      </p>
    </BasicHelpIconModal>
  )
}

const style: Stylesheet = {
  buttonToggleContainer: {
    position: 'relative',
    marginTop: '0.1em',
  },
  helpIcon: {
    position: 'absolute',
    right: -52,
    top: 6,
  },
  description: {
    ...Font.body,
    margin: '1.75em 0.5em 0.75em 0.5em',
  },
  inputRowContainer: {
    marginLeft: '-9em',
  },
}
