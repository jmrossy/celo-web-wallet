import { useDispatch } from 'react-redux'
import { useLogoutModal } from 'src/app/logout/useLogoutModal'
import { Address } from 'src/components/Address'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import {
  pincodeActions,
  PincodeParams,
  pincodeSagaName,
  validate,
} from 'src/features/pincode/pincode'
import { PincodeInput, PincodeInputType } from 'src/features/pincode/PincodeInput'
import { PincodeAction } from 'src/features/pincode/types'
import { secretTypeToLabel, useSecretType } from 'src/features/pincode/utils'
import { useWalletAddress } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues = { action: PincodeAction.Unlock, value: '' }

export function EnterPincodeScreen() {
  const address = useWalletAddress()
  const secretType = useSecretType()

  const [label] = secretTypeToLabel(secretType)
  const inputType =
    secretType === 'pincode' ? PincodeInputType.CurrentPincode : PincodeInputType.CurrentPassword

  const dispatch = useDispatch()

  const onSubmit = (values: PincodeParams) => {
    dispatch(pincodeActions.trigger({ ...values, type: secretType }))
  }

  const validateForm = (values: PincodeParams) => validate({ ...values, type: secretType })

  const { values, errors, handleChange, handleSubmit } = useCustomForm<PincodeParams>(
    initialValues,
    onSubmit,
    validateForm
  )

  const onLogout = useLogoutModal()

  const status = useSagaStatus(
    pincodeSagaName,
    'Error Unlocking Account',
    `Unable to unlock your account, please check your ${label} and try again.`
  )

  // TODO add 15 tries before account nuke logic here or in saga

  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Unlock Your Account</h1>
      <div css={style.description}>{`Enter your ${label} to unlock your account.`}</div>
      <Address address={address} />
      <Box direction="column" align="center" margin="1.75em 0 0 0">
        <form onSubmit={handleSubmit}>
          <PincodeInput
            type={inputType}
            name="value"
            value={values.value}
            onChange={handleChange}
            autoFocus={true}
            {...errors['value']}
          />
          <Box direction="column" margin={'2em 0 0 0'}>
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
