import { PropsWithChildren } from 'react'
import { RadioBoxAsButton, RadioBoxInputProps } from 'src/components/input/RadioBoxAsButton'
import { Currency } from 'src/currency'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

export interface CurrencyRadioBoxInputProps extends RadioBoxInputProps {
  value: Currency
}

export function CurrencyRadioBox(props: PropsWithChildren<CurrencyRadioBoxInputProps>) {
  const { value, checked, containerCss, ...passThroughProps } = props

  const containerCssWithColor = {
    minWidth: '3em',
    ...(checked && containerStyleSelected[value]),
    ...containerCss,
  }

  return (
    <RadioBoxAsButton
      value={value}
      checked={checked}
      {...passThroughProps}
      containerCss={containerCssWithColor}
    />
  )
}

const containerStyleSelected: Record<Currency, Styles> = {
  [Currency.CELO]: {
    borderColor: Color.primaryGold,
    color: Color.primaryGold,
  },
  [Currency.cUSD]: {
    borderColor: Color.primaryGreen,
    color: Color.primaryGreen,
  },
}
