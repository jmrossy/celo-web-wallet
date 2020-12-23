import { createSelector } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { SignerType } from 'src/blockchain/signer'
import warningIcon from 'src/components/icons/warning.svg'
import { Notification } from 'src/components/Notification'
import { HIGH_VALUE_THRESHOLD } from 'src/consts'
import {
  setBackupReminderDismissed,
  setHighValueWarningDismissed,
} from 'src/features/settings/settingsSlice'
import { Color } from 'src/styles/Color'

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
  (state: RootState) => state.wallet.type,
  (settings, balances, type) => {
    const cUsd = BigNumber.from(balances.cUsd)
    const celo = BigNumber.from(balances.celo)

    if (!settings.backupReminderDismissed && (cUsd.gt(0) || celo.gt(0)))
      // TODO have Account Key link to wallet screen
      return {
        key: 'backup',
        message:
          'Reminder: Be sure to copy your Account Key to a safe place. If you lose it, you may not be able to access your account.',
      }

    if (
      settings.backupReminderDismissed &&
      (cUsd.gte(HIGH_VALUE_THRESHOLD) || celo.gte(HIGH_VALUE_THRESHOLD)) &&
      !settings.highValueWarningDismissed &&
      type == SignerType.Local
    )
      // TODO link to Valora and Ledger docs
      return {
        key: 'highValue',
        message:
          'Warning: This wallet is not yet recommended for high-value accounts. Please use the Valora mobile app or a Ledger wallet instead.',
      }

    return null
  }
)
