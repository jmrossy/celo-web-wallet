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
}

export function PincodeInput(props: Props) {
  const { name, value, onChange, error, helpText } = props

  const sharedStyles = getSharedInputStyles(error)
  return (
    <Box direction="column">
      <input
        type="password"
        name={name}
        css={{ ...sharedStyles, ...style.input }}
        value={value}
        onChange={onChange}
        autoComplete="one-time-code"
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
