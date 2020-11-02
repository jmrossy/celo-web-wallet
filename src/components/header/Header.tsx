import { shallowEqual, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import Logo from 'src/components/icons/logo.svg'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { Currency, NULL_ADDRESS } from 'src/consts'
import { Color } from 'src/styles/Color'
import { mq, useIsMobile } from 'src/styles/mediaQueries'
import { shortenAddress } from 'src/utils/addresses'

export function Header() {
  const { address, balances } = useSelector(
    (s: RootState) => ({
      address: s.wallet.address,
      balances: s.wallet.balances,
    }),
    shallowEqual
  )
  const addressOrDefault = address || NULL_ADDRESS
  const addressStub = '0x' + shortenAddress(addressOrDefault).substring(2).toUpperCase()

  const isMobile = useIsMobile()
  const identiconSize = isMobile ? 30 : 40

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
      <Box align="center" justify="between">
        <span css={style.address}>{addressStub}</span>
        <Identicon address={addressOrDefault} size={identiconSize} />
      </Box>
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
  address: {
    display: 'none',
    [mq[768]]: {
      display: 'inline',
      fontSize: '1.3em',
      letterSpacing: '0.06em',
      marginRight: '0.6em',
    },
  },
}
