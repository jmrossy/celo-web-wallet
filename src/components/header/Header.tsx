import { shallowEqual, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { AccountChooser } from 'src/components/header/AccountChooser'
import Logo from 'src/components/icons/logo.svg'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { Currency } from 'src/consts'
import { Color } from 'src/styles/Color'

export function Header() {
  const balances = useSelector((s: RootState) => s.wallet.balances, shallowEqual)

  return (
    <Box align="center" justify="between" styles={style.container}>
      <Link to={'/'}>
        <img width={'130em'} src={Logo} alt="Celo Logo" css={style.logo} />
      </Link>
      <span css={style.balances}>
        <MoneyValue
          amountInWei={balances.cUsd}
          currency={Currency.cUSD}
          margin={'0 1.5em'}
          baseFontSize={1.4}
        />
        <MoneyValue
          amountInWei={balances.celo}
          currency={Currency.CELO}
          margin={'0 1.5em'}
          baseFontSize={1.4}
        />
      </span>
      <AccountChooser />
    </Box>
  )
}

const style = {
  container: {
    borderBottom: `1px solid ${Color.borderLight}`,
    padding: '0.4em 0.5em 0.4em 0.2em',
  },
  logo: {
    maxWidth: '20vw',
  },
  balances: {
    letterSpacing: '0.05em',
  },
}
