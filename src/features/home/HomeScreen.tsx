import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { HrDivider } from 'src/components/HrDivider'
import Chart from 'src/components/icons/chart.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useModal } from 'src/components/modal/useModal'
import { useNavHintModal } from 'src/components/modal/useNavHintModal'
import { config } from 'src/config'
import { HeaderSection } from 'src/features/home/HeaderSection'
import { HeaderSectionEmpty } from 'src/features/home/HeaderSectionEmpty'
import { toggleHomeHeaderDismissed } from 'src/features/settings/settingsSlice'
import { PriceChartCelo } from 'src/features/tokenPrice/PriceChartCelo'
import { StakeActionType } from 'src/features/validators/types'
import { dismissActivatableReminder } from 'src/features/validators/validatorsSlice'
import { useAreBalancesEmpty } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { NativeTokenId } from 'src/tokens'
import { logger } from 'src/utils/logger'

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

  // START PIN MIGRATION
  // TODO remove in a few months when all accounts have been migrated to passwords
  const { showModalAsync, closeModal } = useModal()
  const navigate = useNavigate()
  const { secretType, type } = useSelector((s: RootState) => s.wallet)
  useEffect(() => {
    if (secretType === 'password' || config.defaultAccount || type === 'ledger') return
    showModalAsync({
      head: 'Please Change Your Pin',
      body: 'For better security, pincodes are being replaced with passwords. Please change your pin to a new password now. Sorry for the inconvenience!',
      actions: { key: 'change', label: 'Change Pin' },
      size: 's',
      dismissable: false,
    })
      .then(() => {
        navigate('/change-pin')
        closeModal()
      })
      .catch((reason) => {
        logger.error('Failed to show modal', reason)
        closeModal()
      })
  }, [])
  // END PIN MIGRATION

  // Detect if user has unactivated staking votes
  const hasActivatable = useSelector((state: RootState) => state.validators.hasActivatable)
  const showActivateModal =
    hasActivatable.status &&
    hasActivatable.groupAddresses.length &&
    !hasActivatable.reminderDismissed
  useNavHintModal(
    showActivateModal,
    'Activate Your Votes!',
    'You have pending validator votes that are ready to be activated. They must be activated to start earning staking rewards.',
    'Activate',
    '/stake',
    { groupAddress: hasActivatable.groupAddresses[0], action: StakeActionType.Activate },
    () => {
      dispatch(dismissActivatableReminder())
    }
  )

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
