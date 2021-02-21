import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { ModalOkAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
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
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues = { action: PincodeAction.Change, value: '', newValue: '', valueConfirm: '' }

export function ChangePincodeForm() {
  const currentSecretType = useSelector((s: RootState) => s.wallet.secretType)
  const [currentLabel, currentLabelC] = secretTypeToLabel(currentSecretType)
  const currentInputType =
    currentSecretType === 'pincode'
      ? PincodeInputType.CurrentPincode
      : PincodeInputType.CurrentPassword

  const [secretType] = useState<SecretType>('password')
  const [, newLabelC] = secretTypeToLabel(secretType)
  const newInputType =
    secretType === 'pincode' ? PincodeInputType.NewPincode : PincodeInputType.NewPassword

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = (values: PincodeParams) => {
    dispatch(pincodeActions.trigger({ ...values, type: secretType }))
  }

  const validateForm = (values: PincodeParams) => validate({ ...values, type: secretType })

  const { values, errors, handleChange, handleSubmit } = useCustomForm<PincodeParams>(
    initialValues,
    onSubmit,
    validateForm
  )

  // const onToggleSecretType = (index: number) => {
  //   // Reset but exclude current pincode field
  //   resetValues({ ...initialValues, value: values.value })
  //   setSecretType(index === 0 ? 'pincode' : 'password')
  // }

  const onClickCancel = () => {
    navigate(-1)
  }

  const { showModalAsync } = useModal()
  const onSuccess = async () => {
    await showModalAsync(
      `${currentLabelC} Changed`,
      `Your ${currentLabel} has been successfully changed! Keep this password safe, it's the only way to unlock your account.`,
      ModalOkAction,
      undefined,
      's'
    )
    navigate(-1)
  }

  const status = useSagaStatus(
    pincodeSagaName,
    `Error Changing ${currentLabelC}`,
    'Please check your values and try again.',
    onSuccess
  )

  return (
    <Box direction="column" align="center">
      <form onSubmit={handleSubmit}>
        <div css={style.formContent}>
          <PincodeInputRow
            type={currentInputType}
            label={`Current ${currentLabelC}`}
            name="value"
            value={values.value}
            onChange={handleChange}
            autoFocus={true}
            {...errors['value']}
          />
          {/* <PincodeTypeToggle onToggle={onToggleSecretType} margin="1.5em 0 0 8em" /> */}
          <PincodeInputRow
            type={newInputType}
            label={`New ${newLabelC}`}
            name="newValue"
            value={values.newValue}
            onChange={handleChange}
            {...errors['newValue']}
          />
          <PincodeInputRow
            type={newInputType}
            label={`Confirm ${newLabelC}`}
            name="valueConfirm"
            value={values.valueConfirm}
            onChange={handleChange}
            {...errors['valueConfirm']}
          />
        </div>
        <Box direction="row" margin="3em 0 0 0">
          <Button
            type="button"
            size="m"
            color={Color.altGrey}
            onClick={onClickCancel}
            margin="0 1em 0 0"
            disabled={status === SagaStatus.Started}
          >
            Cancel
          </Button>
          <Button
            size="m"
            type="submit"
            disabled={status === SagaStatus.Started}
            margin="0 0 0 1em"
          >
            Change
          </Button>
        </Box>
      </form>
    </Box>
  )
}

const style: Stylesheet = {
  formContent: {
    [mq[480]]: {
      marginLeft: '-1.3em',
    },
  },
}
