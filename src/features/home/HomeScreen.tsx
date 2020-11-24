import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import insights from 'src/components/icons/insights.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { HeaderSection } from 'src/features/home/HeaderSection'
import { HeaderSectionEmpty } from 'src/features/home/HeaderSectionEmpty'
import { PriceChartCelo } from 'src/features/tokenPrice/PriceChartCelo'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function HomeScreen() {
  const walletAddress = useSelector((state: RootState) => state.wallet.address)
  //TODO: Temp so we can toggle back and forth
  const [hasWallet, setHasWallet] = useState(Boolean(walletAddress))

  return (
    <ScreenContentFrame>
      <div css={style.container}>
        {hasWallet && <HeaderSection />}
        {!hasWallet && <HeaderSectionEmpty />}

        <hr css={style.divider} />
        <Box direction="row" align="end" styles={{ marginBottom: '2em' }}>
          <img src={insights} css={style.icon} />
          <label css={[Font.body, Font.bold]}>Celo Prices</label>
        </Box>

        <PriceChartCelo />

        <button
          css={{ marginTop: '3em', maxWidth: '8em' }}
          onClick={() => setHasWallet(!hasWallet)}
        >
          toggle wallet
        </button>
      </div>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  container: {
    maxWidth: '55rem',
  },
  icon: {
    marginRight: '0.5em',
    height: '2em',
    width: '2em',
  },
  divider: {
    width: '100%',
    height: 1,
    border: 'none',
    backgroundColor: Color.altGrey,
    color: Color.altGrey, //for IE
    margin: '3em 0',
  },
}
