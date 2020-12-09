import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import ArrowBackIcon from 'src/components/icons/arrow_back.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { WalletDetails } from 'src/features/wallet/WalletDetails'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function ViewWalletScreen() {
  const navigate = useNavigate()

  const onClickBack = () => {
    navigate(-1)
  }

  // TODO the routes and HomeFrame need to be refactored a bit
  // to have this render without the feed on the left
  return (
    <ScreenContentFrame>
      <Box direction="column" align="center" styles={style.contentContainer}>
        <h1 css={style.header}>Your Celo Account</h1>
        <div css={style.detailsContainer}>
          <WalletDetails />
        </div>
        <Button color={Color.altGrey} icon={ArrowBackIcon} onClick={onClickBack} margin="3em 0">
          Back
        </Button>
      </Box>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  contentContainer: {
    [mq[768]]: {
      alignItems: 'flex-start',
    },
  },
  header: {
    ...Font.h1Green,
    margin: '0 0 1.2em 0',
    textAlign: 'center',
    [mq[768]]: {
      textAlign: 'left',
    },
  },
  detailsContainer: {
    [mq[768]]: {
      paddingRight: '1em',
    },
  },
}
