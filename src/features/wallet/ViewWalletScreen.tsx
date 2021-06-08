import { useNavigate } from 'react-router-dom'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { WalletDetails } from 'src/features/wallet/WalletDetails'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function ViewWalletScreen() {
  const navigate = useNavigate()

  const onClickBack = () => {
    navigate(-1)
  }

  return (
    <ScreenContentFrame onClose={onClickBack} showBackButton={true}>
      <Box direction="column" align="center">
        <h2 css={style.header}>Your Celo Account</h2>
        <WalletDetails />
      </Box>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  header: {
    ...Font.h2,
    margin: '0 0 1.4em 0',
    textAlign: 'center',
  },
}
