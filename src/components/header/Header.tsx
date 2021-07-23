import { AccountMenu } from 'src/components/header/AccountMenu'
import { BalanceSummary } from 'src/components/header/BalanceSummary'
import { HeaderLogo } from 'src/components/header/HeaderLogo'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

export function Header() {
  return (
    <header>
      <Box align="center" justify="between" styles={style.container}>
        <HeaderLogo />
        <BalanceSummary />
        <AccountMenu />
      </Box>
    </header>
  )
}

const style: Stylesheet = {
  container: {
    borderBottom: `1px solid ${Color.borderLight}`,
    padding: '0.4em 0.5em 0.4em 0.6em',
  },
}
