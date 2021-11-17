import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../app/rootReducer'
import { HrDivider } from '../../components/HrDivider'
import Chart from '../../components/icons/chart.svg'
import { Box } from '../../components/layout/Box'
import { ScreenContentFrame } from '../../components/layout/ScreenContentFrame'
import { HeaderSection } from '../home/HeaderSection'
import { HeaderSectionEmpty } from '../home/HeaderSectionEmpty'
import { toggleHomeHeaderDismissed } from '../settings/settingsSlice'
import { PriceChartCelo } from '../tokenPrice/PriceChartCelo'
import { useVoteActivationCheck } from '../validators/hooks'
import { useAreBalancesEmpty } from '../wallet/hooks'
import { Color } from '../../styles/Color'
import { Font } from '../../styles/fonts'
import { useIsMobile } from '../../styles/mediaQueries'
import { Stylesheet } from '../../styles/types'
import { NativeTokenId } from '../../tokens'

export function HomeScreen() {
  const isMobile = useIsMobile()
  const isWalletEmpty = useAreBalancesEmpty()
  const showGraph = !isMobile || isWalletEmpty

  const isDismissed = useSelector((state: RootState) => state.settings.homeHeaderDismissed)
  const dispatch = useDispatch()
  const onClickDismiss = () => {
    dispatch(toggleHomeHeaderDismissed())
  }
  const onClose = isMobile && !isWalletEmpty ? onClickDismiss : undefined

  // Detect if user has unactivated staking votes
  useVoteActivationCheck()

  if (isDismissed) return null

  return (
    <ScreenContentFrame onClose={onClose} hideCloseButton={!onClose}>
      <div css={style.container}>
        {!isWalletEmpty && <HeaderSection />}
        {isWalletEmpty && <HeaderSectionEmpty />}

        {showGraph && (
          <>
            <HrDivider styles={style.divider} />
            <Box direction="row" align="end" margin="0 0 1.5em 0">
              <img src={Chart} css={style.icon} alt="Price chart" />
              <label css={style.celoPriceLabel}>Celo Price</label>
            </Box>

            <PriceChartCelo stableTokenId={NativeTokenId.cUSD} showHeaderPrice={true} />
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
    margin: '2.2em 0',
    backgroundColor: Color.altGrey,
    color: Color.altGrey, //for IE
  },
  celoPriceLabel: {
    ...Font.body,
    ...Font.bold,
    paddingBottom: '0.2em',
  },
}
