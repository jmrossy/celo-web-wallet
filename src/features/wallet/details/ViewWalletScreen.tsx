import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { WalletDetails } from 'src/features/wallet/details/WalletDetails'
import { Font } from 'src/styles/fonts'

export function ViewWalletScreen() {
  return (
    <ScreenContentFrame showBackButton={true}>
      <Box direction="column" align="center">
        <h2 css={Font.h2Center}>Your Celo Account</h2>
        <WalletDetails />
      </Box>
    </ScreenContentFrame>
  )
}
