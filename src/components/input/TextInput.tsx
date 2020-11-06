import React, { PropsWithChildren } from 'react'
import { sharedInputStylesWithError } from 'src/components/input/styles'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'

export interface TextInputProps {
  name: string
  width: string | number
  height?: number // defaults to 40
  margin?: string | number
  value: string | undefined
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  helpText?: string
  // TODO add validation hook
}

export function TextInput(props: PropsWithChildren<TextInputProps>) {
  const { name, width, height, margin, value, onBlur, onChange, error, helpText } = props

  return (
    <Box direction="column">
      <input
        type="text"
        name={name}
        css={{
          ...sharedInputStylesWithError.input(error),
          width,
          height: height ?? 40,
          margin,
          border: `2px solid ${error ? Color.borderError : Color.borderInactive}`,          
        }}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
      />
      {helpText && <span css={{
        color: Color.textError, 
        marginTop: 4, 
        fontSize: "0.9rem",
        marginBottom: -20,
        }}>{helpText}</span>
      }
    </Box>
  )
}
