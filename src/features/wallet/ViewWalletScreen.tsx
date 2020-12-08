import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import ArrowBackIcon from 'src/components/icons/arrow_back.svg'
import { Box } from 'src/components/layout/Box'
import { WalletDetails } from 'src/features/wallet/WalletDetails'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function ViewWalletScreen() {
  const navigate = useNavigate()

  const onClickBack = () => {
    navigate(-1)
  }

  // TODO the routes and HomeFrame need to be refactored a bit
  // to have this render without the feed on the left
  //TODO: consider wrapping in the ScreenContentFrame for consistent spacing.
  // Not sure if there's anything that needs to be different here (minHeight 100%?)
  return (
    <Box
      direction="column"
      align="start"
      justify="start"
      styles={style.contentContainer}
      margin="1.2em 1.4em"
    >
      <h1 css={style.header}>Your Celo Account</h1>
      <WalletDetails />
      <Button color={Color.altGrey} icon={ArrowBackIcon} onClick={onClickBack} margin="3em 0 0 0">
        Back
      </Button>
    </Box>
  )
}

const style: Stylesheet = {
  contentContainer: {
    minHeight: '100%',
  },
  header: {
    ...Font.h1Green,
    margin: '0 0 1.2em 0',
  },
}
