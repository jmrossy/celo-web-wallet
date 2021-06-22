import { useDispatch, useSelector } from 'react-redux'
import { useLogoutModal } from 'src/app/logout/useLogoutModal'
import type { RootState } from 'src/app/rootReducer'
import { Address } from 'src/components/Address'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import {
  passwordActions,
  PasswordParams,
  passwordSagaName,
  validate,
} from 'src/features/password/password'
import { PasswordInput, PasswordInputType } from 'src/features/password/PasswordInput'
import { PasswordAction } from 'src/features/password/types'
import { secretTypeToLabel, useSecretType } from 'src/features/password/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { logger } from 'src/utils/logger'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues = { action: PasswordAction.Unlock, value: '' }

export function EnterPasswordScreen() {
  const address = useSelector((s: RootState) => s.wallet.address)

  const secretType = useSecretType()
  const [label] = secretTypeToLabel(secretType)
  const inputType =
    secretType === 'pincode' ? PasswordInputType.CurrentPincode : PasswordInputType.CurrentPassword

  const dispatch = useDispatch()

  const onSubmit = (values: PasswordParams) => {
    if (address) {
      dispatch(passwordActions.trigger({ ...values, type: secretType }))
    } else {
      logger.error('No address found, possible redux-persist bug. Initiating recovery.')
      dispatch(
        passwordActions.trigger({
          value: values.value,
          action: PasswordAction.UnlockAndRecover,
          type: secretType,
        })
      )
    }
  }

  const validateForm = (values: PasswordParams) => validate({ ...values, type: secretType })

  const { values, errors, handleChange, handleSubmit } = useCustomForm<PasswordParams>(
    initialValues,
    onSubmit,
    validateForm
  )

  const onLogout = useLogoutModal()

  const status = useSagaStatus(
    passwordSagaName,
    'Error Unlocking Account',
    `Unable to unlock your account, please check your ${label} and try again.`
  )

  // TODO add 15 tries before account nuke logic here or in saga

  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Unlock Your Account</h1>
      <div css={style.description}>{`Enter your ${label} to unlock your account.`}</div>
      {address && <Address address={address} />}
      <Box direction="column" align="center" margin="1.75em 0 0 0">
        <form onSubmit={handleSubmit}>
          <PasswordInput
            type={inputType}
            name="value"
            value={values.value}
            onChange={handleChange}
            autoFocus={true}
            {...errors['value']}
          />
          <Box direction="column" margin="2em 0 0 0">
            <Button type="submit" disabled={status === SagaStatus.Started} size="l">
              Unlock
            </Button>
            <Button
              type="button"
              margin="1em 0 0 0"
              size="s"
              width="12.5em"
              color={Color.altGrey}
              disabled={status === SagaStatus.Started}
              onClick={onLogout}
            >
              Logout
            </Button>
          </Box>
        </form>
      </Box>
    </OnboardingScreenFrame>
  )
}
const style: Stylesheet = {
  description: {
    ...onboardingStyles.description,
    marginBottom: '1.5em',
  },
}
