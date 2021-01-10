import { useNavigate } from 'react-router'
import { Button } from 'src/components/buttons/Button'
import ArrowBackIcon from 'src/components/icons/arrow_back.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { WalletDetails } from 'src/features/wallet/WalletDetails'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function ViewWalletScreen() {
  const navigate = useNavigate()

  const onClickBack = () => {
    navigate(-1)
  }

  return (
    <ScreenContentFrame>
      <Box direction="column" align="center">
        <h2 css={style.header}>Your Celo Account</h2>
        <WalletDetails />
        <Button
          color={Color.altGrey}
          icon={ArrowBackIcon}
          onClick={onClickBack}
          margin="3em 0 1em 0"
        >
          Back
        </Button>
      </Box>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  header: {
    ...Font.h2Green,
    margin: '0 0 1.4em 0',
    textAlign: 'center',
  },
}
