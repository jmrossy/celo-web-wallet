import { HelpText } from 'src/components/input/HelpText'
import { getSharedInputStyles } from 'src/components/input/styles'
import { Box } from 'src/components/layout/Box'
import { Stylesheet } from 'src/styles/types'

interface Props {
  name: string
  value?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  helpText?: string
  autoFocus?: boolean
}

export function PincodeInput(props: Props) {
  const { name, value, onChange, error, helpText, autoFocus } = props

  // Wrap the provided onChange to enforce char length limit
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value
    if (value) {
      event.target.value = value.substring(0, 6)
    }
    onChange(event)
  }

  const sharedStyles = getSharedInputStyles(error)
  return (
    <Box direction="column">
      <input
        type="password"
        name={name}
        css={{ ...sharedStyles, ...style.input }}
        value={value}
        onChange={handleChange}
        autoComplete="one-time-code"
        autoFocus={autoFocus}
      />
      {helpText && <HelpText>{helpText}</HelpText>}
    </Box>
  )
}

export function PincodeInputRow(props: Props & { label: string }) {
  const { label, ...passThroughProps } = props
  return (
    <Box align="center" styles={style.inputContainer}>
      <span css={style.inputLabel}>{label}</span>
      <PincodeInput {...passThroughProps} />
    </Box>
  )
}

const style: Stylesheet = {
  inputContainer: {
    marginTop: '1.5em',
    textAlign: 'right',
  },
  inputLabel: {
    width: '7.5em',
    paddingRight: '1em',
  },
  input: {
    width: '8.6em',
    height: '1.8em',
    textAlign: 'center',
    letterSpacing: '0.6em',
    fontSize: '1.4em',
  },
}
