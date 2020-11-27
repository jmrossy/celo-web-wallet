import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { isPinValid, setPinActions } from 'src/features/pincode/pincode'
import { PincodeInputRow } from 'src/features/pincode/PincodeInput'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'

export function SetPincodeForm() {
  const [pin1, setPin1] = useState<string>('')
  const [pin2, setPin2] = useState<string>('')

  const onPinChange = (setter: (value: string) => void) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { target } = event
      setter(target.value.substring(0, 6))
    }
  }

  const dispatch = useDispatch()

  const onClickSetPin = () => {
    if (!isPinValid(pin1)) {
      // TODO show error
      alert('Invalid pin')
      return
    }

    if (pin1 !== pin2) {
      // TODO show error
      alert('Pins do not match')
      return
    }

    dispatch(setPinActions.trigger(pin1))
  }

  const sagaStatus = useSelector((state: RootState) => state.saga.setPin.status)
  const navigate = useNavigate()

  useEffect(() => {
    if (sagaStatus === SagaStatus.Success) {
      navigate('/')
    } else if (sagaStatus === SagaStatus.Failure) {
      //TODO
      alert('Setting pin failed')
    }
  }, [sagaStatus])

  return (
    <Box direction="column" align="center">
      <div css={style.description}>You pincode protects your account on this device.</div>
      <div css={style.description}>Use six numbers (0-9).</div>
      <div css={style.inputRowContainer}>
        <PincodeInputRow
          label="Enter Pin"
          name="pin1"
          value={pin1}
          onChange={onPinChange(setPin1)}
        />
        <PincodeInputRow
          label="Re-Enter Pin"
          name="pin2"
          value={pin2}
          onChange={onPinChange(setPin2)}
        />
      </div>
      <Button size={'m'} onClick={onClickSetPin} margin={'3em 0 0 0'}>
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
