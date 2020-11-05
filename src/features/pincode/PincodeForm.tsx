import { useState } from 'react'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

// TODO handle submit
export function PincodeForm() {
  const [pin1, setPin1] = useState<string>('')
  const [pin2, setPin2] = useState<string>('')

  const handlePinChange = (setter: (value: string) => void) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { target } = event
      event.preventDefault()
      setter(target.value.substring(0, 6))
    }
  }

  return (
    <Box direction="column" align="center">
      <div css={style.description}>You Pincode protects your account on this device.</div>
      <div css={style.description}>Use six numbers (0-9).</div>
      <Box align="center" styles={style.inputContainer}>
        <span css={style.inputLabel}>Enter Pin</span>
        <PincodeInput name="pin1" value={pin1} onChange={handlePinChange(setPin1)} />
      </Box>
      <Box align="center" styles={style.inputContainer}>
        <span css={style.inputLabel}>Re-Enter Pin</span>
        <PincodeInput name="pin2" value={pin2} onChange={handlePinChange(setPin2)} />
      </Box>
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
  },
  inputLabel: {
    width: '8em',
  },
  input: {
    width: '7em',
    height: '2em',
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
