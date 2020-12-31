import { shallowEqual, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { AccountMenu } from 'src/components/header/AccountMenu'
import Logo from 'src/components/icons/logo.svg'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { Currency } from 'src/consts'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'

export function Header() {
  const balances = useSelector((s: RootState) => s.wallet.balances, shallowEqual)

  return (
    <Box align="center" justify="between" styles={style.container}>
      <Link to={'/'}>
        <img width="130em" height="46.05em" src={Logo} alt="Celo Logo" css={style.logo} />
      </Link>
      <span css={style.balances}>
        <MoneyValue
          amountInWei={balances.cUsd}
          currency={Currency.cUSD}
          baseFontSize={1.4}
          containerCss={style.balanceContainer}
        />
        <MoneyValue
          amountInWei={balances.celo}
          currency={Currency.CELO}
          containerCss={style.balanceContainer}
          baseFontSize={1.4}
        />
      </span>
      <AccountMenu />
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
    [mq[768]]: {
      paddingLeft: '1.5em',
    },
  },
  balanceContainer: {
    margin: '0 0.5em',
    [mq[768]]: {
      margin: '0 1.6em',
    },
  },
}
