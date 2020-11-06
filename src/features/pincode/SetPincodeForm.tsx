import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { isPinValid, setPinActions } from 'src/features/pincode/pincode'
import { PincodeInputRow } from 'src/features/pincode/PincodeInput'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function SetPincodeForm() {
  const [pin1, setPin1] = useState<string>('')
  const [pin2, setPin2] = useState<string>('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onPinChange = (setter: (value: string) => void) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { target } = event
      setter(target.value.substring(0, 6))
    }
  }

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

    // navigate('/')
  }

  return (
    <Box direction="column" align="center">
      <div css={style.description}>You pincode protects your account on this device.</div>
      <div css={style.description}>Use six numbers (0-9).</div>
      <PincodeInputRow label="Enter Pin" name="pin1" value={pin1} onChange={onPinChange(setPin1)} />
      <PincodeInputRow
        label="Re-Enter Pin"
        name="pin2"
        value={pin2}
        onChange={onPinChange(setPin2)}
      />
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
}
