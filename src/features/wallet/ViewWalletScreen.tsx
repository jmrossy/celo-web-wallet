import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import ArrowBackIcon from 'src/components/icons/arrow_back_white.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenFrame } from 'src/components/layout/ScreenFrame'
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
    <ScreenFrame>
      <Box direction="column" align="center" justify="center" styles={style.contentContainer}>
        <h1 css={style.header}>Your Celo Account</h1>
        <WalletDetails />
        <Button color={Color.altGrey} icon={ArrowBackIcon} onClick={onClickBack} margin="3em">
          Back
        </Button>
      </Box>
    </ScreenFrame>
  )
}

const style: Stylesheet = {
  contentContainer: {
    minHeight: '100%',
  },
  header: {
    ...Font.h1Green,
    margin: '2em',
  },
}
