import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import warningIcon from 'src/components/icons/warning.svg'
import { Notification } from 'src/components/Notification'
import {
  toggleBackupReminderDismissed,
  toggleHighValueWarningDismissed,
} from 'src/features/settings/settingsSlice'
import { Color } from 'src/styles/Color'
import { fromWei } from 'src/utils/amount'

const HIGH_VALUE_THRESHOLD = 25

export function HomeScreenWarnings() {
  const dispatch = useDispatch()
  const balances = useSelector((s: RootState) => s.wallet.balances, shallowEqual)
  const { highValueWarningDismissed, backupReminderDismissed } = useSelector(
    (state: RootState) => state.settings
  )
  const location = useLocation()
  if (location.pathname !== '/') return null //ScreenFrameWithFeed for desktop doesn't differentiate between home and not home.

  const cUsd = fromWei(balances.cUsd)
  const celo = fromWei(balances.celo)
  const showHighValue =
    backupReminderDismissed &&
    (cUsd > HIGH_VALUE_THRESHOLD || celo > HIGH_VALUE_THRESHOLD) &&
    !highValueWarningDismissed

  const onDismissWarning = (warning: string) => () => {
    const action =
      warning === 'backup' ? toggleBackupReminderDismissed : toggleHighValueWarningDismissed
    if (action) dispatch(action())
  }

  return (
    <div>
      {!backupReminderDismissed && (
        <Notification
          margin="0"
          justify="between"
          onDismiss={onDismissWarning('backup')}
          color={Color.primaryGold}
          textColor={Color.primaryBlack}
          icon={warningIcon}
          message="Reminder: Be sure to copy your account key to a safe place. If you lose it, you may not be able to access your account."
        />
      )}

      {showHighValue && (
        <Notification
          margin="0"
          justify="between"
          onDismiss={onDismissWarning('highValue')}
          color={Color.primaryGold}
          textColor={Color.primaryBlack}
          icon={warningIcon}
          message="Warning: This wallet is not recommended for high-value accounts. Please use the Valora mobile app or a Ledger wallet instead."
        />
      )}
    </div>
  )
}
