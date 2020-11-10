import { CSSObject } from '@emotion/core'
import { PropsWithChildren } from 'react'
import { InputStyleConstants } from 'src/components/input/styles'
import { Color } from 'src/styles/Color'

export interface RadioBoxInputStyles {
  container?: CSSObject
  input?: CSSObject
  label?: CSSObject
}

export interface RadioBoxInputProps {
  name: string
  label: string
  value: string
  checked?: boolean
  classes?: RadioBoxInputStyles
  tabIndex?: number
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  // TODO add validation hook
}

const containerStyle: CSSObject = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: InputStyleConstants.padding,
  border: InputStyleConstants.border,
  borderColor: Color.primaryGrey,
  borderRadius: InputStyleConstants.borderRadius,
  cursor: 'pointer',
  userSelect: 'none',
  color: Color.primaryGrey,
  marginRight: 4,
  height: InputStyleConstants.defaultHeight, //default height (may be overridden by the classes)
}

const containerStyleSelected: CSSObject = {
  ...containerStyle,
  borderColor: Color.primaryGreen,
  color: Color.primaryGreen, //Color.primaryWhite,
  // backgroundColor: Color.primaryGreen,
}

const inputStyle: CSSObject = {
  position: 'absolute',
  opacity: 0,
  cursor: 'pointer',
}

const labelStyle: CSSObject = {
  color: 'inherit',
}

export function RadioBox(props: PropsWithChildren<RadioBoxInputProps>) {
  const { name, label, value, checked, classes, onChange, tabIndex } = props

  const containerCss = checked
    ? { ...containerStyleSelected, ...classes?.container }
    : { ...containerStyle, ...classes?.container }
  const inputCss = { ...inputStyle, ...classes?.input }
  const labelCss = { ...labelStyle, ...classes?.label }

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
