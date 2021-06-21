import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { AccountDetails } from 'src/features/wallet/accounts/AccountDetails'
import { Font } from 'src/styles/fonts'

export function ViewAccountScreen() {
  return (
    <ScreenContentFrame showBackButton={true}>
      <Box direction="column" align="center">
        <h2 css={Font.h2Center}>Your Celo Account</h2>
        <AccountDetails />
      </Box>
    </ScreenContentFrame>
  )
}
