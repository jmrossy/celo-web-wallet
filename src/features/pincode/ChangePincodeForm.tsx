import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { useSagaStatusWithErrorModal } from 'src/components/modal/useSagaStatusModal'
import {
  PincodeAction,
  pincodeActions,
  PincodeParams,
  pincodeSagaName,
  validate,
} from 'src/features/pincode/pincode'
import { PincodeInputRow } from 'src/features/pincode/PincodeInput'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

const initialValues = { action: PincodeAction.Change, value: '', newValue: '', valueConfirm: '' }

export function ChangePincodeForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = (values: PincodeParams) => {
    if (areInputsValid()) {
      dispatch(pincodeActions.trigger(values))
    }
  }

  const { values, touched, handleChange, handleSubmit } = useCustomForm<PincodeParams, any>(
    initialValues,
    onSubmit
  )

  const { inputErrors, areInputsValid } = useInputValidation(touched, () => validate(values))

  const onClickCancel = () => {
    navigate(-1)
  }

  const { showModalAsync } = useModal()
  const onSuccess = async () => {
    await showModalAsync('Pincode Changed', 'Your pincode has been successfully changed')
    onClickCancel()
  }

  const status = useSagaStatusWithErrorModal(
    pincodeSagaName,
    'Error Changing Pin',
    'Please check your pins and try again.',
    onSuccess
  )

  return (
    <Box direction="column" align="center">
      <div css={style.description}>You Pincode protects your account on this device.</div>
      <div css={style.description}>Use six numbers (0-9).</div>
      <div>
        <form onSubmit={handleSubmit}>
          <PincodeInputRow
            label="Current Pin"
            name="value"
            value={values.value}
            onChange={handleChange}
            {...inputErrors['value']}
            autoFocus={true}
          />
          <PincodeInputRow
            label="New Pin"
            name="newValue"
            value={values.newValue}
            onChange={handleChange}
            {...inputErrors['newValue']}
          />
          <PincodeInputRow
            label="Re-Enter New Pin"
            name="valueConfirm"
            value={values.valueConfirm}
            onChange={handleChange}
            {...inputErrors['valueConfirm']}
          />
          <Box direction="row" margin="3em 0 0 0">
            <Button
              type="button"
              size={'m'}
              color={Color.altGrey}
              onClick={onClickCancel}
              margin={'0 3em 0 0'}
              disabled={status === SagaStatus.Started}
            >
              Cancel
            </Button>
            <Button size="m" type="submit" disabled={status === SagaStatus.Started}>
              Change
            </Button>
          </Box>
        </form>
      </div>
    </Box>
  )
}

const style: Stylesheet = {
  description: {
    ...Font.body,
    marginBottom: '0.75em',
  },
}
