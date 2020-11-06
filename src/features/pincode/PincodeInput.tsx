import { sharedInputStyles } from 'src/components/input/styles'
import { Box } from 'src/components/layout/Box'
import { Stylesheet } from 'src/styles/types'

interface Props {
  name: string
  value?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function PincodeInput(props: Props) {
  const { name, value, onChange } = props
  return <input type="password" name={name} css={style.input} value={value} onChange={onChange} />
}

export function PincodeInputRow(props: Props & { label: string }) {
  const { label, name, value, onChange } = props
  return (
    <Box align="center" styles={style.inputContainer}>
      <span css={style.inputLabel}>{label}</span>
      <PincodeInput name={name} value={value} onChange={onChange} />
    </Box>
  )
}

const style: Stylesheet = {
  inputContainer: {
    marginTop: '1.5em',
    textAlign: 'right',
  },
  inputLabel: {
    width: '7em',
    paddingRight: '1em',
  },
  input: {
    ...sharedInputStyles.input,
    width: '6em',
    height: '1.6em',
    textAlign: 'center',
    letterSpacing: '0.4em',
    fontSize: '1.4em',
  },
}
