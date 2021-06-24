import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import {
  passwordActions,
  PasswordParams,
  passwordSagaName,
  validate,
} from 'src/features/password/password'
import { PasswordInputRow, PasswordInputType } from 'src/features/password/PasswordInput'
import { PasswordAction } from 'src/features/password/types'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues = { action: PasswordAction.Change, value: '', newValue: '', valueConfirm: '' }

export function ChangePasswordForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = (values: PasswordParams) => {
    dispatch(passwordActions.trigger({ ...values, type: 'password' }))
  }

  const validateForm = (values: PasswordParams) => validate({ ...values, type: 'password' })

  const { values, errors, handleChange, handleSubmit } = useCustomForm<PasswordParams>(
    initialValues,
    onSubmit,
    validateForm
  )

  const onClickCancel = () => {
    navigate(-1)
  }

  const { showModalAsync } = useModal()
  const onSuccess = async () => {
    await showModalAsync({
      head: `Password Changed`,
      body: `Your password has been successfully changed! Keep this password safe, it's the only way to unlock your account.`,
      size: 's',
    })
    navigate(-1)
  }

  const status = useSagaStatus(
    passwordSagaName,
    `Error Changing Password`,
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
