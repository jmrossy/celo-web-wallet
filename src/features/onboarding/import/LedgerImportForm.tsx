import { BigNumber } from 'ethers'
import { useAppDispatch } from 'src/app/hooks'
import { SignerType } from 'src/blockchain/types'
import { Button } from 'src/components/buttons/Button'
import { NumberInput } from 'src/components/input/NumberInput'
import { Box } from 'src/components/layout/Box'
import { CELO_DERIVATION_PATH, DERIVATION_PATH_MAX_INDEX } from 'src/consts'
import { DeviceAnimation } from 'src/features/ledger/animation/DeviceAnimation'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import {
  importAccountActions,
  ImportAccountParams,
  importAccountSagaName,
} from 'src/features/wallet/importAccount'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useSagaStatus } from 'src/utils/useSagaStatus'
import { ErrorState, invalidInput } from 'src/utils/validation'

interface ImportForm {
  index: string
}

const initialValues: ImportForm = { index: '0' }

interface Props {
  onSuccess: () => void
  accountName?: string
}

export function LedgerImportForm(props: Props) {
  const dispatch = useAppDispatch()

  const onSubmit = (values: ImportForm) => {
    const params: ImportAccountParams = {
      account: {
        type: SignerType.Ledger,
        derivationPath: `${CELO_DERIVATION_PATH}/${values.index}`,
        name: props.accountName,
      },
      isExisting: true,
    }
    dispatch(importAccountActions.trigger(params))
  }

  const { values, errors, handleChange, handleSubmit } = useCustomForm<ImportForm>(
    initialValues,
    onSubmit,
    validateForm
  )

  const status = useSagaStatus(
    importAccountSagaName,
    'Error Importing Wallet',
    'Something went wrong, sorry! Please ensure your Ledger is connected, unlocked, and running the latest Celo app.',
    props.onSuccess
  )

  return (
    <>
      <p css={onboardingStyles.description}>
        To import an account, connect your Ledger and open the Celo application.
      </p>
      <div css={style.animationContainer}>
        <DeviceAnimation xOffset={48} />
      </div>
      <form onSubmit={handleSubmit}>
        <Box direction="row" align="center" justify="center" styles={style.inputContainer}>
          <label css={style.inputLabel}>Address Index</label>
          <NumberInput
            step="1"
            name="index"
            value={values.index.toString()}
            onChange={handleChange}
            width="2em"
            {...errors['index']}
          />
        </Box>
        <Button margin="2em 0 0 0" disabled={status === SagaStatus.Started} size="l" type="submit">
          Import Account
        </Button>
      </form>
    </>
  )
}

function validateForm(params: ImportForm): ErrorState {
  const { index } = params
  if (!index) {
    return invalidInput('index', 'Index required')
  }
  const indexBn = BigNumber.from(index)
  if (indexBn.lt(0) || indexBn.gt(DERIVATION_PATH_MAX_INDEX)) {
    return invalidInput('index', 'Invalid index')
  }
  return { isValid: true }
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
