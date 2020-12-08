import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { isSignerSet } from 'src/blockchain/signer'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { useSagaStatusWithErrorModal } from 'src/components/modal/useSagaStatusModal'
import {
  PincodeAction,
  pincodeActions,
  PincodeParams,
  pincodeSagaName,
  validate,
} from 'src/features/pincode/pincode'
import { PincodeInputRow } from 'src/features/pincode/PincodeInput'
import { setWalletUnlocked } from 'src/features/wallet/walletSlice'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

const initialValues = { action: PincodeAction.Set, value: '', valueConfirm: '' }

export function SetPincodeForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSignerSet()) {
      navigate('/', { replace: true })
    }
  }, [])

  const onSubmit = (values: PincodeParams) => {
    if (areInputsValid()) {
      dispatch(pincodeActions.trigger({ action: PincodeAction.Set, value: values.value }))
    }
  }

  const { values, touched, handleChange, handleSubmit } = useCustomForm<PincodeParams, any>(
    initialValues,
    onSubmit
  )

  const { inputErrors, areInputsValid } = useInputValidation(touched, () => validate(values))

  const onSuccess = () => {
    dispatch(setWalletUnlocked(true))
    navigate('/', { replace: true })
  }
  const status = useSagaStatusWithErrorModal(
    pincodeSagaName,
    'Error Setting Pin',
    'Something went wrong when setting your pin, sorry! Please try again.',
    onSuccess
  )

  return (
    <Box direction="column" align="center">
      <div css={style.description}>You pincode protects your account on this device.</div>
      <div css={style.description}>Use six numbers (0-9).</div>
      <div css={style.inputRowContainer}>
        <form onSubmit={handleSubmit}>
          <PincodeInputRow
            label="Enter Pin"
            name="value"
            value={values.value}
            onChange={handleChange}
            {...inputErrors['value']}
          />
          <PincodeInputRow
            label="Re-Enter Pin"
            name="valueConfirm"
            value={values.valueConfirm}
            onChange={handleChange}
            {...inputErrors['valueConfirm']}
          />
          <Box styles={{ width: '100%' }} justify="end">
            <Button
              size="l"
              type="submit"
              margin={'3em 0 0 0'}
              disabled={status === SagaStatus.Started}
            >
              Set Pin
            </Button>
          </Box>
        </form>
      </div>
    </Box>
  )
}

const style: Stylesheet = {
  description: {
    ...Font.body,
    marginBottom: '0.75em',
  },
  inputRowContainer: {
    marginLeft: '-8em',
  },
}
