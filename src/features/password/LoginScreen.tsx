import { useDispatch, useSelector } from 'react-redux'
import { showLogoutModal } from 'src/app/logout/useLogoutModal'
import type { RootState } from 'src/app/rootReducer'
import { SignerType } from 'src/blockchain/signer'
import { Address } from 'src/components/Address'
import { Button, transparentButtonStyles } from 'src/components/buttons/Button'
import { ChevronIcon } from 'src/components/icons/Chevron'
import { KeyIcon } from 'src/components/icons/Key'
import { LedgerIcon } from 'src/components/icons/logos/Ledger'
import { Box } from 'src/components/layout/Box'
import { DropdownBox, useDropdownBox } from 'src/components/modal/DropdownBox'
import { useModal } from 'src/components/modal/useModal'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { DeviceAnimation } from 'src/features/ledger/animation/DeviceAnimation'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import { PasswordInput, PasswordInputType } from 'src/features/password/PasswordInput'
import { useAccountList } from 'src/features/wallet/hooks'
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

const initialValues: UnlockWalletParams = {
  activeAddress: '',
  type: SignerType.Local,
  password: '',
}

export function LoginScreen() {
  const dispatch = useDispatch()
  const onSubmit = (values: UnlockWalletParams) => {
    // TODO handle migration for old accounts
    dispatch(unlockWalletActions.trigger(values))
  }
  const initialFormValues = useFormInitialValues()
  const { values, setValues, errors, handleChange, handleBlur, handleSubmit } =
    useCustomForm<UnlockWalletParams>(initialFormValues, onSubmit, validate)

  const accounts = useAccountList((accs) => {
    const activeAddr = values.activeAddress
    if (!activeAddr || !accs.find((a) => a.address === activeAddr)) {
      const firstAccount = accs[0]
      setValues({ activeAddress: firstAccount.address, type: firstAccount.type, password: '' })
    }
  })

  const { isDropdownVisible, showDropdown, hideDropdown } = useDropdownBox()
  const onSelectAddress = (address: string) => {
    const type = getAccountType(address, accounts)
    setValues({ ...values, activeAddress: address, type })
    hideDropdown()
  }

  const isLocalAcc = values.type === SignerType.Local

  const status = useSagaStatus(
    unlockWalletSagaName,
    'Unable to Unlock',
    isLocalAcc
      ? 'Unable to unlock your wallet. Please check your password and try again.'
      : 'Unable to unlock your wallet. Please ensure your Ledger is connected, unlocked, and running the latest Celo app.'
  )

  const { showModalAsync } = useModal()
  const onClickHelp = async () => {
    const answer = await showModalAsync({
      head: 'Having Trouble Unlocking?',
      body: isLocalAcc
        ? "Local accounts can only be unlocked with your password. If you've lost your password, those accounts can unfortunately never be unlocked. But if you have your Account Keys, you can logout to re-import them."
        : 'Ledger accounts do not need a password to be unlocked. First open the Celo app on your device, and then click the Unlock button.',
      actions: [
        { key: 'back', label: 'Back', color: Color.primaryWhite },
        { key: 'logout', label: 'Logout', color: Color.primaryRed },
      ],
    })
    if (answer && answer.key === 'logout') {
      await showLogoutModal(showModalAsync, dispatch)
    }
  }

  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Unlock Your Wallet</h1>
      {values.activeAddress &&
        accounts &&
        (accounts.length == 1 ? (
          <Address address={values.activeAddress} />
        ) : (
          <div css={style.addressContainer}>
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
                <Box direction="column" align="stretch" styles={style.addressDropdownContainer}>
                  {accounts.map((a) => (
                    <button
                      type="button"
                      css={style.addressDropdownButton}
                      onClick={() => onSelectAddress(a.address)}
                      key={`account-button-${a.address}`}
                    >
                      <Box align="center">
                        <Address address={a.address} isTransparent={true} />
                        {a.type === SignerType.Local ? (
                          <KeyIcon color={Color.primaryBlack} styles={style.addressDropdownIcon} />
                        ) : (
                          <LedgerIcon
                            color={Color.primaryBlack}
                            styles={style.addressDropdownIcon}
                          />
                        )}
                      </Box>
                    </button>
                  ))}
                </Box>
              </DropdownBox>
            )}
          </div>
        ))}
      <form onSubmit={handleSubmit}>
        <Box direction="column" align="center" margin="1.75em 0 0 0">
          <div css={style.description}>
            {isLocalAcc
              ? 'Enter your password to unlock your wallet'
              : 'To unlock your wallet, connect your Ledger and confirm your address'}
          </div>
          {isLocalAcc ? (
            <PasswordInput
              type={PasswordInputType.CurrentPassword}
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus={true}
              {...errors['password']}
            />
          ) : (
            <div css={style.animationContainer}>
              <DeviceAnimation xOffset={48} />
            </div>
          )}
          <Button
            type="submit"
            margin="2.5em 0 0 0"
            disabled={status === SagaStatus.Started}
            size="l"
          >
            Unlock
          </Button>
          <Button
            type="button"
            margin="1em 0 0 0"
            size="s"
            width="12.5em"
            color={Color.primaryWhite}
            disabled={status === SagaStatus.Started}
            onClick={onClickHelp}
          >
            Help
          </Button>
        </Box>
      </form>
    </OnboardingScreenFrame>
  )
}

function useFormInitialValues(): UnlockWalletParams {
  const { address: previousAddress, type: previousType } = useSelector((s: RootState) => s.wallet)
  return {
    ...initialValues,
    activeAddress: previousAddress || initialValues.activeAddress,
    type: previousType || initialValues.type,
  }
}

function getAccountType(address: string | null, accounts: StoredAccountData[] | null): SignerType {
  if (!address || !accounts) return SignerType.Local
  const account = accounts.find((a) => a.address === address)
  if (!account) return SignerType.Local
  else return account.type
}

const style: Stylesheet = {
  description: {
    ...onboardingStyles.description,
    marginBottom: '1.5em',
  },
  addressContainer: {
    position: 'relative',
  },
  addressButton: {
    ...transparentButtonStyles,
    border: `1px solid ${Color.borderMedium}`,
    borderRadius: 12,
    padding: '0.5em 1em',
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
    margin: '0 0.25em 0 0.75em',
    opacity: 0.9,
  },
  addressDropdownContainer: {
    maxHeight: '15em',
    overflowY: 'auto',
  },
  addressDropdownButton: {
    ...transparentButtonStyles,
    padding: '0.5em 1em',
    borderBottom: `1px solid ${Color.borderMedium}`,
    ':hover': {
      backgroundColor: Color.fillLighter,
    },
    ':active': {
      backgroundColor: Color.fillLight,
    },
  },
  addressDropdownIcon: {
    margin: '0 0 0 0.7em',
    width: '1.1em',
    height: 'auto',
  },
  animationContainer: {
    margin: '1em 1em 0 1em',
  },
}
