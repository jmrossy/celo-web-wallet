import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { AccountDetails } from 'src/features/wallet/accounts/AccountDetails'
import { useWalletAddress } from 'src/features/wallet/hooks'
import { getActiveAccount } from 'src/features/wallet/manager'
import { Font } from 'src/styles/fonts'

export function ViewAccountScreen() {
  const address = useWalletAddress()
  const accountDetails = getActiveAccount()

  return (
    <ScreenContentFrame showBackButton={true}>
      <Box direction="column" align="center">
        <h2 css={Font.h2Center}>Your Celo Account</h2>
        <AccountDetails
          address={address}
          mnemonic={accountDetails.mnemonic}
          type={accountDetails.type}
        />
      </Box>
    </ScreenContentFrame>
  )
}
