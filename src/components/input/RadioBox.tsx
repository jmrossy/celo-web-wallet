import { ChangeEvent, PropsWithChildren } from 'react'
import { sharedInputStyles } from 'src/components/input/styles'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

export interface RadioBoxInputProps {
  name: string
  label: string
  value: string
  checked?: boolean
  tabIndex?: number
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  containerCss?: Styles
  inputCss?: Styles
  labelCss?: Styles
  // TODO add validation hook
}

export function RadioBox(props: PropsWithChildren<RadioBoxInputProps>) {
  const { name, label, value, checked, onChange, tabIndex } = props

  const containerCss = checked
    ? { ...containerStyleSelected, ...props.containerCss }
    : { ...containerStyle, ...props.containerCss }
  const inputCss = { ...inputStyle, ...props.inputCss }
  const labelCss = { ...labelStyle, ...props.labelCss }

  return (
    <label css={containerCss} tabIndex={tabIndex}>
      <input
        name={name}
        type="radio"
        value={value}
        css={inputCss}
        checked={checked}
        onChange={onChange}
      />
      <span css={labelCss}>{label}</span>
    </label>
  )
}

const containerStyle: Styles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0.1em 0.5em',
  border: sharedInputStyles.border,
  borderColor: Color.primaryGrey,
  borderRadius: sharedInputStyles.borderRadius,
  cursor: 'pointer',
  userSelect: 'none',
  color: Color.primaryGrey,
  height: 40, //default height (may be overridden by the classes)
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
}

const containerStyleSelected: Styles = {
  ...containerStyle,
  borderColor: Color.primaryGreen,
  color: Color.primaryGreen,
}

const inputStyle: Styles = {
  position: 'absolute',
  opacity: 0,
  cursor: 'pointer',
}

const labelStyle: Styles = {
  color: 'inherit',
}
