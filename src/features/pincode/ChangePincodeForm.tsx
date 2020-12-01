import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
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
import { setChangingPin } from 'src/features/wallet/walletSlice'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

export function ChangePincodeForm() {
  const dispatch = useDispatch()

  useEffect(() => {
    pincodeActions.reset() //need to clear this out each time we enter this screen
  }, [])

  const onSubmit = (values: PincodeParams) => {
    if (areInputsValid()) {
      dispatch(pincodeActions.trigger(values))
    }
  }

  const { values, touched, handleChange, handleSubmit } = useCustomForm<PincodeParams, any>(
    { action: PincodeAction.Change, value: '', newValue: '', valueConfirm: '' },
    onSubmit
  )

  const doValidation = () => {
    const validation = validate(values)
    return validation
  }

  const { inputErrors, areInputsValid } = useInputValidation(touched, doValidation)

  const onClickCancel = () => {
    dispatch(setChangingPin(false))
  }

  const { showModalAsync } = useModal()
  const onSuccess = async () => {
    await showModalAsync('Pincode Changed', 'Your pincode has been successfully changed')
    onClickCancel()
  }

  const status = useSagaStatusWithErrorModal(
    pincodeSagaName,
    'Error Changing Pin',
    'Please correct the error and try again.',
    onSuccess
  )

  return (
    <Box direction="column" align="center">
      <div css={style.description}>You pincode protects your account on this device.</div>
      <div css={style.description}>Use six numbers (0-9).</div>
      <div css={style.inputRowContainer}>
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
            <Button size={'m'} type="submit" disabled={status === SagaStatus.Started}>
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
  inputRowContainer: {
    // marginLeft: '-8em',
  },
}
