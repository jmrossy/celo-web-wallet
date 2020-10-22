import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Color } from 'src/components/Color'
import Logo from 'src/components/icons/logo.svg'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { Currency, NULL_ADDRESS } from 'src/consts'
import { mq, useIsMobile } from 'src/styles/mediaQueries'
import { shortenAddress } from 'src/utils/addresses'

export function Header() {
  const { address, balances } = useSelector((s: RootState) => ({
    address: s.wallet.address,
    balances: s.wallet.balances,
  }))

  const addressOrDefault = address || NULL_ADDRESS

  const isMobile = useIsMobile()
  const identiconSize = isMobile ? 30 : 40

  return (
    <Box align="center" justify="between" styles={style.container}>
      <img width={'150rem'} src={Logo} alt="Celo Logo" css={{ maxWidth: '20%' }} />
      <span>
        <MoneyValue
          amountInWei={balances.cUsd}
          currency={Currency.cUSD}
          margin={'0 1em'}
          baseFontSize={1.4}
        />
        <MoneyValue
          amountInWei={balances.celo}
          currency={Currency.CELO}
          margin={'0 1em'}
          baseFontSize={1.4}
        />
      </span>
      <Box align="center" justify="between">
        <span css={style.address}>{shortenAddress(addressOrDefault)}</span>
        <Identicon address={addressOrDefault} size={identiconSize} />
      </Box>
    </Box>
  )
}

const style = {
  container: {
    borderBottom: `1px solid ${Color.borderLight}`,
    padding: '0.5em 0.5em 0.5em 0.2em',
  },
  address: {
    display: 'none',
    [mq[768]]: {
      display: 'inline',
      fontSize: '1.4em',
      marginRight: '0.3em',
    },
  },
}
