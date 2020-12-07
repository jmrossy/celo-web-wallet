import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import Chart from 'src/components/icons/chart.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { HeaderSection } from 'src/features/home/HeaderSection'
import { HeaderSectionEmpty } from 'src/features/home/HeaderSectionEmpty'
import { toggleHomeHeaderDismissed } from 'src/features/settings/settingsSlice'
import { PriceChartCelo } from 'src/features/tokenPrice/PriceChartCelo'
import { useAreBalancesEmpty } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function HomeScreen() {
  const isMobile = useIsMobile()
  const isWalletEmpty = useAreBalancesEmpty()
  const showGraph = !isMobile || isWalletEmpty

  const isDismissed = useSelector((state: RootState) => state.settings.homeHeaderDismissed)
  const dispatch = useDispatch()
  const onClickDismiss = () => {
    dispatch(toggleHomeHeaderDismissed())
  }
  if (isDismissed) return null

  return (
    <ScreenContentFrame onClose={isMobile ? onClickDismiss : undefined}>
      <div css={style.container}>
        {!isWalletEmpty && <HeaderSection />}
        {isWalletEmpty && <HeaderSectionEmpty />}

        {showGraph && (
          <>
            <hr css={style.divider} />
            <Box direction="row" align="end" margin="0 0 2em 0">
              <img src={Chart} css={style.icon} alt="Price chart" />
              <label css={[Font.body, Font.bold]}>Celo Prices</label>
            </Box>

            <PriceChartCelo showHeaderPrice={true} />
          </>
        )}
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
    margin: '2.2em 0',
  },
}
