import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import {
  changePasswordActions,
  ChangePasswordParams,
  changePasswordSagaName,
  validate,
} from 'src/features/password/changePassword'
import { PasswordInputRow, PasswordInputType } from 'src/features/password/PasswordInput'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues = { value: '', newValue: '', valueConfirm: '' }

export function ChangePasswordForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = (values: ChangePasswordParams) => {
    dispatch(changePasswordActions.trigger(values))
  }

  const { values, errors, handleChange, handleSubmit } = useCustomForm<ChangePasswordParams>(
    initialValues,
    onSubmit,
    validate
  )

  const onClickCancel = () => {
    navigate(-1)
  }

  const { showModalAsync } = useModal()
  const onSuccess = async () => {
    await showModalAsync({
      head: 'Password Changed',
      body: `Your password has been successfully changed! Keep this password safe, it's the only way to unlock your account.`,
      size: 's',
    })
    navigate(-1)
  }

  const status = useSagaStatus(
    changePasswordSagaName,
    'Error Changing Password',
    'Please check your values and try again.',
    onSuccess
  )

  return (
    <Box direction="column" align="center">
      <form onSubmit={handleSubmit}>
        <div css={style.formContent}>
          <PasswordInputRow
            type={PasswordInputType.CurrentPassword}
            label="Current password"
            name="value"
            value={values.value}
            onChange={handleChange}
            autoFocus={true}
            {...errors['value']}
          />
          <PasswordInputRow
            type={PasswordInputType.NewPassword}
            label="New password"
            name="newValue"
            value={values.newValue}
            onChange={handleChange}
            {...errors['newValue']}
          />
          <PasswordInputRow
            type={PasswordInputType.NewPassword}
            label="Confirm password"
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
            color={Color.primaryWhite}
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
