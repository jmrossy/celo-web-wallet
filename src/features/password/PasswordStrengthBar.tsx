import { useMemo } from 'react'
import { computePasswordStrength, PasswordStrength } from 'src/features/password/utils'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

interface Props {
  value: string
}

export function PasswordStrengthBar({ value }: Props) {
  const strength = useMemo(() => computePasswordStrength(value), [value])

  let width, color
  if (!value) {
    width = '0%'
    color = Color.altGrey
  } else if (strength === PasswordStrength.Weak) {
    width = '33%'
    color = Color.primaryRed
  } else if (strength === PasswordStrength.Okay) {
    width = '66%'
    color = Color.textWarning
  } else {
    width = '100%'
    color = Color.primaryGreen
  }

  // Using <meter> tag here would make sense
  // but styles vary too much across browsers
  return (
    <div css={container}>
      <div
        css={{
          width,
          height: '100%',
          backgroundColor: color,
          borderRadius: 1,
        }}
      ></div>
    </div>
  )
}

const container: Styles = {
  marginTop: '1.5em',
  width: '8.6em', // should match input field
  fontSize: '1.4em',
  height: 4,
  backgroundColor: Color.altGrey,
  borderRadius: 1,
}
