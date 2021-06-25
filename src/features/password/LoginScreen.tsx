import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLogoutModal } from 'src/app/logout/useLogoutModal'
import type { RootState } from 'src/app/rootReducer'
import { Address } from 'src/components/Address'
import { Button, transparentButtonStyles } from 'src/components/buttons/Button'
import { ChevronIcon } from 'src/components/icons/Chevron'
import { Box } from 'src/components/layout/Box'
import { DropdownBox, useDropdownBox } from 'src/components/modal/DropdownBox'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import { PasswordInput, PasswordInputType } from 'src/features/password/PasswordInput'
import { getAccounts } from 'src/features/wallet/manager'
import { StoredAccountData } from 'src/features/wallet/storage'
import {
  unlockWalletActions,
  UnlockWalletParams,
  unlockWalletSagaName,
  validate,
} from 'src/features/wallet/unlockWallet'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues: UnlockWalletParams = { activeAddress: '', password: '' }

export function LoginScreen() {
  const previousAddress = useSelector((s: RootState) => s.wallet.address)
  const [accounts, setAccounts] = useState<StoredAccountData[] | null>(null)

  const dispatch = useDispatch()
  const onSubmit = (values: UnlockWalletParams) => {
    // TODO handle migration for old accounts
    dispatch(unlockWalletActions.trigger(values))
  }

  const { values, setValues, errors, handleChange, handleSubmit } =
    useCustomForm<UnlockWalletParams>(
      { ...initialValues, activeAddress: previousAddress || '' },
      onSubmit,
      validate
    )

  useEffect(() => {
    // Get account list on screen mount
    const storedAccounts = getAccounts()
    if (!storedAccounts.size) throw new Error('No accounts found')
    const accountList = Array.from(storedAccounts.values())
    setAccounts(accountList)
    if (!values.activeAddress || !storedAccounts.has(values.activeAddress)) {
      setValues({ activeAddress: accountList[0].address })
    }
  }, [])

  const { isDropdownVisible, showDropdown, hideDropdown } = useDropdownBox()
  const onSelectAddress = (address: string) => {
    setValues({ activeAddress: address })
    hideDropdown()
  }

  const onLogout = useLogoutModal()

  const status = useSagaStatus(
    unlockWalletSagaName,
    'Error Unlocking Account',
    'Unable to unlock your account, please check your password and try again.'
  )

  // TODO add 15 tries before account nuke logic here or in saga

  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Unlock Your Wallet</h1>
      <div css={style.description}>Enter your password to unlock your wallet</div>
      {values.activeAddress &&
        accounts &&
        (accounts.length == 1 ? (
          <Address address={values.activeAddress} />
        ) : (
          <div css={{ position: 'relative' }}>
            <button type="button" css={style.addressButton} onClick={showDropdown}>
              <Box align="center">
                <Address address={values.activeAddress} isTransparent={true} />
                <ChevronIcon
                  direction={isDropdownVisible ? 'n' : 's'}
                  styles={style.addressChevron}
                />
              </Box>
            </button>
            {isDropdownVisible && (
              <DropdownBox hide={hideDropdown}>
                <Box direction="column" align="center" styles={style.addressDropdownContainer}>
                  {accounts.map((a) => (
                    <button
                      type="button"
                      css={style.addressDropdownButton}
                      onClick={() => onSelectAddress(a.address)}
                      key={`account-button-${a.address}`}
                    >
                      <Address address={a.address} isTransparent={true} />
                    </button>
                  ))}
                </Box>
              </DropdownBox>
            )}
          </div>
        ))}
      <Box direction="column" align="center" margin="1.75em 0 0 0">
        <form onSubmit={handleSubmit}>
          <PasswordInput
            type={PasswordInputType.CurrentPassword}
            name="password"
            value={values.password}
            onChange={handleChange}
            autoFocus={true}
            {...errors['password']}
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
    border: `1px solid ${Color.borderMedium}`,
    borderRadius: 6,
    padding: '0.5em 0.75em',
    boxShadow: '0 2px 4px 0px rgba(0, 0, 0, 0.1)',
    ':hover': {
      backgroundColor: Color.fillLighter,
    },
    ':active': {
      backgroundColor: Color.fillLight,
    },
  },
  addressChevron: {
    width: '1em',
    margin: '0 0.1em 0 0.5em',
    opacity: 0.9,
  },
  addressDropdownContainer: {
    maxHeight: '15em',
    overflowY: 'auto',
  },
  addressDropdownButton: {
    ...transparentButtonStyles,
    padding: '0.5em 1.4em',
    borderBottom: `1px solid ${Color.borderMedium}`,
    ':hover': {
      backgroundColor: Color.fillLighter,
    },
    ':active': {
      backgroundColor: Color.fillLight,
    },
  },
}
