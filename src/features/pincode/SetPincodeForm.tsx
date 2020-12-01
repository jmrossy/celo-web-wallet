import { ChangeEvent, FormEvent, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { useSagaStatusWithErrorModal } from 'src/components/modal/useSagaStatusModal'
import {
  isPinValid,
  PincodeAction,
  pincodeActions,
  pincodeSagaName,
} from 'src/features/pincode/pincode'
import { PincodeInputRow } from 'src/features/pincode/PincodeInput'
import { setWalletUnlocked } from 'src/features/wallet/walletSlice'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'

export function SetPincodeForm() {
  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [pinError, setPinError] = useState(0)
  const dispatch = useDispatch()

  const onPinChange = (setter: (value: string) => void) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { target } = event
      setter(target.value.substring(0, 6))
      setPinError(0)
    }
  }

  const onClickSetPin = (event?: FormEvent) => {
    if (event) event.preventDefault()

    if (!isPinValid(pin1)) {
      setPinError(1)
      return
    }
    if (pin1 !== pin2) {
      setPinError(2)
      return
    }
    dispatch(pincodeActions.trigger({ action: PincodeAction.Set, value: pin1 }))
  }

  const navigate = useNavigate()
  const onSuccess = () => {
    pincodeActions.reset() //need to clear this out since it's used by other screens
    dispatch(setWalletUnlocked(true))
    navigate('/')
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
        <form onSubmit={onClickSetPin}>
          <PincodeInputRow
            label="Enter Pin"
            name="pin1"
            value={pin1}
            onChange={onPinChange(setPin1)}
            error={pinError === 1}
          />
          <PincodeInputRow
            label="Re-Enter Pin"
            name="pin2"
            value={pin2}
            onChange={onPinChange(setPin2)}
            error={pinError === 2}
          />
        </form>
      </div>
      <Button
        size={'m'}
        onClick={onClickSetPin}
        margin={'3em 0 0 0'}
        disabled={status === SagaStatus.Started}
      >
        Set Pin
      </Button>
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
