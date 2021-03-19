import { ChangeEvent, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { TokenIcon } from 'src/components/icons/tokens/TokenIcon'
import { NumberInput } from 'src/components/input/NumberInput'
import { SelectInput, SelectOption } from 'src/components/input/SelectInput'
import { Box } from 'src/components/layout/Box'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { ErrorState } from 'src/utils/validation'

interface Props {
  tokenValue: string
  onTokenSelect: (event: ChangeEvent<HTMLInputElement>) => void
  onTokenBlur: (event: ChangeEvent<HTMLInputElement>) => void
  amountValue: string
  onAmountChange: (event: ChangeEvent<HTMLInputElement>) => void
  onAmountBlur: (event: ChangeEvent<HTMLInputElement>) => void
  errors: ErrorState
}

export const AmountAndCurrencyInput = (props: Props) => {
  const {
    tokenValue,
    onTokenSelect,
    onTokenBlur,
    amountValue,
    onAmountChange,
    onAmountBlur,
    errors,
  } = props

  const tokens = useSelector((state: RootState) => state.wallet.balances.tokens)

  const selectOptions = useMemo(
    () =>
      Object.values(tokens).map((t) => ({
        display: t.label,
        value: t.id,
      })),
    [tokens]
  )

  const renderDropdownOption = (option: SelectOption) => (
    <Box align="center">
      <TokenIcon token={tokens[option.value]} size="1.1em" />
      <div css={style.tokenDropdownLabel}>{option.display}</div>
    </Box>
  )

  const renderDropdownValue = (value: string) => {
    const option = selectOptions.find((o) => o.display === value)
    if (!option) return null
    return (
      <Box align="center">
        <TokenIcon token={tokens[option.value]} size="1.4em" />
        <div css={{ ...Font.bold, ...style.tokenDropdownLabel }}>{value}</div>
      </Box>
    )
  }

  return (
    <Box justify="start" align="center">
      <SelectInput
        name="tokenId"
        autoComplete={false}
        width="7em"
        onChange={onTokenSelect}
        onBlur={onTokenBlur}
        value={tokenValue}
        options={selectOptions}
        placeholder="Currency"
        inputStyles={style.token}
        renderDropdownOption={renderDropdownOption}
        renderDropdownValue={renderDropdownValue}
        {...errors['tokenId']}
      />
      <NumberInput
        step="0.01"
        fillWidth={true}
        name="amount"
        onChange={onAmountChange}
        onBlur={onAmountBlur}
        value={amountValue}
        placeholder="1.00"
        inputStyles={style.amount}
        {...errors['amount']}
      />
    </Box>
  )
}

const style: Stylesheet = {
  token: {
    borderRadius: '4px 0 0 4px',
  },
  tokenDropdownLabel: {
    paddingLeft: '0.5em',
  },
  amount: {
    borderRadius: '0 4px 4px 0',
    paddingLeft: 15,
  },
}
