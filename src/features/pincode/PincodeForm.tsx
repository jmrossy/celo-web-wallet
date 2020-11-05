import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { isPinValid, setPinActions } from 'src/features/pincode/pincode'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function PincodeForm() {
  const [pin1, setPin1] = useState<string>('')
  const [pin2, setPin2] = useState<string>('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onPinChange = (setter: (value: string) => void) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { target } = event
      event.preventDefault()
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
      <Box align="center" styles={style.inputContainer}>
        <span css={style.inputLabel}>Enter Pin</span>
        <PincodeInput name="pin1" value={pin1} onChange={onPinChange(setPin1)} />
      </Box>
      <Box align="center" styles={style.inputContainer}>
        <span css={style.inputLabel}>Re-Enter Pin</span>
        <PincodeInput name="pin2" value={pin2} onChange={onPinChange(setPin2)} />
      </Box>
      <Button size={'m'} onClick={onClickSetPin} margin={'3em 0 0 0'}>
        Set Pin
      </Button>
    </Box>
  )
}

interface InputProps {
  name: string
  value?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function PincodeInput(props: InputProps) {
  const { name, value, onChange } = props

  return <input type="password" name={name} css={style.input} value={value} onChange={onChange} />
}

const style: Stylesheet = {
  description: {
    ...Font.body,
    marginBottom: '0.75em',
  },
  inputContainer: {
    marginTop: '1.5em',
    textAlign: 'right',
  },
  inputLabel: {
    width: '7em',
    paddingRight: '1em',
  },
  // TODO de-dupe with TextInput styles
  input: {
    width: '6em',
    height: '1.6em',
    borderRadius: 3,
    outline: 'none',
    border: `2px solid ${Color.borderInactive}`,
    ':focus': {
      borderColor: Color.borderActive,
    },
    padding: '0.1em 0.5em',
    textAlign: 'center',
    letterSpacing: '0.4em',
    fontSize: '1.4em',
  },
}
