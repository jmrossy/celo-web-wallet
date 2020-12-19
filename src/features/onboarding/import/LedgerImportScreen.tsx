import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { TextInput } from 'src/components/input/TextInput'
import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { useSagaStatusWithErrorModal } from 'src/components/modal/useSagaStatusModal'
import {
  importLedgerWalletActions,
  importLedgerWalletSagaName,
  ImportWalletParams,
  validate,
} from 'src/features/ledger/importWallet'
import { setWalletUnlocked } from 'src/features/wallet/walletSlice'
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
    dispatch(setWalletUnlocked(true))
    navigate('/', { replace: true })
  }
  const status = useSagaStatusWithErrorModal(
    importLedgerWalletSagaName,
    'Error Importing Wallet',
    'Something went wrong, sorry! Please ensure your Ledger is connected, unlocked, and running the latest Celo app.',
    onSuccess
  )

  // TODO: show loader, handle errors, go to home
  // need to skip whole pin logic for ledger wallets
  // And show ledger animation if not to hard

  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Import Your Ledger Account</h1>
      <p css={style.description}>Connect your Ledger and open the Celo application on it.</p>
      <form onSubmit={handleSubmit}>
        {/* TODO use number input instead */}
        <TextInput
          name="index"
          value={'' + values.index}
          onChange={handleChange}
          width="5em"
          {...inputErrors['index']}
        />
        <Button margin="2em 0 0 0" disabled={status === SagaStatus.Started} size="l" type="submit">
          Import Account
        </Button>
      </form>
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  description: {
    ...Font.body,
    margin: '1em 0 0 0',
  },
}
