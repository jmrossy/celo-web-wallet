import { createSelector } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import warningIcon from 'src/components/icons/warning.svg'
import { Notification } from 'src/components/Notification'
import { HIGH_VALUE_THRESHOLD } from 'src/consts'
import {
  setBackupReminderDismissed,
  setHighValueWarningDismissed,
} from 'src/features/settings/settingsSlice'
import { Color } from 'src/styles/Color'
import { fromWei } from 'src/utils/amount'

export function HomeScreenWarnings() {
  const dispatch = useDispatch()
  const warning = useSelector(selectHomeScreenWarnings)

  const onDismissWarning = (warning: string) => () => {
    const action = warning === 'backup' ? setBackupReminderDismissed : setHighValueWarningDismissed
    if (action) dispatch(action(true))
  }

  if (!warning) return null

  return (
    <Notification
      margin="0"
      justify="between"
      onDismiss={onDismissWarning(warning.key)}
      color={Color.primaryGold}
      textColor={Color.primaryBlack}
      icon={warningIcon}
      message={warning.message}
    />
  )
}

export const selectHomeScreenWarnings = createSelector(
  (state: RootState) => state.settings,
  (state: RootState) => state.wallet.balances,
  (settings, balances) => {
    if (!settings.backupReminderDismissed)
      return {
        key: 'backup',
        message:
          'Reminder: Be sure to copy your account key to a safe place. If you lose it, you may not be able to access your account.',
      }

    if (
      settings.backupReminderDismissed &&
      (fromWei(balances.cUsd) > HIGH_VALUE_THRESHOLD ||
        fromWei(balances.celo) > HIGH_VALUE_THRESHOLD) &&
      !settings.highValueWarningDismissed
    )
      return {
        key: 'highValue',
        message:
          'Warning: This wallet is not recommended for high-value accounts. Please use the Valora mobile app or a Ledger wallet instead.',
      }

    return null
  }
)
