import { PropsWithChildren } from 'react'
import { RadioBox, RadioBoxInputProps } from 'src/components/input/RadioBox'
import { Currency } from 'src/consts'
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
    <RadioBox
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
