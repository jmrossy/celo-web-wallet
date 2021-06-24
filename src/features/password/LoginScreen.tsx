import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLogoutModal } from 'src/app/logout/useLogoutModal'
import type { RootState } from 'src/app/rootReducer'
import { Address } from 'src/components/Address'
import { Button, transparentButtonStyles } from 'src/components/buttons/Button'
import { ChevronIcon } from 'src/components/icons/Chevron'
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
import { getAccounts } from 'src/features/wallet/manager'
import { StoredAccountData } from 'src/features/wallet/storage'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues = { action: PasswordAction.Unlock, value: '' }

export function LoginScreen() {
  const previousAddress = useSelector((s: RootState) => s.wallet.address)
  const [selectedAddress, setSelectedAddress] = useState<string | null>(previousAddress)
  const [accounts, setAccounts] = useState<StoredAccountData[] | null>(null)

  useEffect(() => {
    // Get account list on screen mount
    const storedAccounts = getAccounts()
    if (!storedAccounts.size) throw new Error('No accounts found')
    const accountList = Array.from(storedAccounts.values())
    setAccounts(accountList)
    if (!selectedAddress || (previousAddress && !storedAccounts.has(previousAddress))) {
      setSelectedAddress(accountList[0].address)
    }
  }, [])

  const dispatch = useDispatch()

  const onSubmit = (values: PasswordParams) => {
    if (!selectedAddress) return
    dispatch(passwordActions.trigger({ ...values, type: 'password' }))
  }

  const validateForm = (values: PasswordParams) => validate({ ...values, type: 'password' })

  const { values, errors, handleChange, handleSubmit } = useCustomForm<PasswordParams>(
    initialValues,
    onSubmit,
    validateForm
  )

  const onLogout = useLogoutModal()

  const status = useSagaStatus(
    passwordSagaName,
    'Error Unlocking Account',
    'Unable to unlock your account, please check your password and try again.'
  )

  const onClickAddress = () => {
    alert('hi')
  }

  // TODO add 15 tries before account nuke logic here or in saga

  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Unlock Your Wallet</h1>
      <div css={style.description}>Enter your password to unlock your wallet</div>
      {selectedAddress &&
        accounts &&
        (accounts.length == 1 ? (
          <Address address={selectedAddress} />
        ) : (
          <button type="button" css={style.addressButton} onClick={onClickAddress}>
            <Box align="center">
              <Address address={selectedAddress} isTransparent={true} />
              <ChevronIcon direction="s" styles={style.addressChevron} />
            </Box>
          </button>
        ))}
      <Box direction="column" align="center" margin="1.75em 0 0 0">
        <form onSubmit={handleSubmit}>
          <PasswordInput
            type={PasswordInputType.CurrentPassword}
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
  addressButton: {
    ...transparentButtonStyles,
    ':hover': {
      backgroundColor: Color.fillLighter,
    },
    ':active': {
      backgroundColor: Color.fillLight,
    },
    border: `1px solid ${Color.borderMedium}`,
    borderRadius: 6,
    padding: '0.5em',
    boxShadow: '0 2px 4px 0px rgba(0, 0, 0, 0.1)',
  },
  addressChevron: {
    width: '1em',
    margin: '0 0.1em 0 0.5em',
    opacity: 0.9,
  },
}
