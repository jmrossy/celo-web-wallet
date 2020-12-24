import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { NumberInput } from 'src/components/input/NumberInput'
import { Box } from 'src/components/layout/Box'
import { useSagaStatusWithErrorModal } from 'src/components/modal/useSagaStatusModal'
import { DeviceAnimation } from 'src/features/ledger/animation/DeviceAnimation'
import {
  importLedgerWalletActions,
  importLedgerWalletSagaName,
  ImportWalletParams,
  validate,
} from 'src/features/ledger/importWallet'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

const initialValues = { index: '0' }

export function LedgerImportScreen() {
  const dispatch = useDispatch()

  const onSubmit = (values: ImportWalletParams) => {
    if (areInputsValid()) {
      dispatch(importLedgerWalletActions.trigger(values))
    }
  }

  const { values, touched, handleChange, handleSubmit } = useCustomForm<ImportWalletParams>(
    initialValues,
    onSubmit
  )

  const { inputErrors, areInputsValid } = useInputValidation(touched, () => validate(values))

  const navigate = useNavigate()
  const onSuccess = () => {
    navigate('/', { replace: true })
  }
  const status = useSagaStatusWithErrorModal(
    importLedgerWalletSagaName,
    'Error Importing Wallet',
    'Something went wrong, sorry! Please ensure your Ledger is connected, unlocked, and running the latest Celo app.',
    onSuccess
  )

  return (
    <OnboardingScreenFrame current={3} total={3}>
      <h1 css={Font.h1Green}>Import Your Ledger Account</h1>
      <p css={onboardingStyles.description}>
        To import, connect your Ledger, open the Celo application, and verify your address.
      </p>
      <div css={style.animationContainer}>
        <DeviceAnimation xOffset={48} />
      </div>
      <form onSubmit={handleSubmit}>
        <Box direction="row" align="center" justify="center" styles={style.inputContainer}>
          <label css={style.inputLabel}>Address Index</label>
          <NumberInput
            name="index"
            value={'' + values.index}
            onChange={handleChange}
            width="2em"
            {...inputErrors['index']}
          />
        </Box>
        <Button margin="2em 0 0 0" disabled={status === SagaStatus.Started} size="l" type="submit">
          Import Account
        </Button>
      </form>
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  animationContainer: {
    margin: '2em 1em',
  },
  inputContainer: {
    input: {
      textAlign: 'center',
    },
  },
  inputLabel: {
    ...Font.inputLabel,
    marginRight: '1.5em',
  },
}
