import { createSelector } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '../../app/rootReducer'
import { SignerType } from '../../blockchain/types'
import { TextButton } from '../../components/buttons/TextButton'
import WarningIcon from '../../components/icons/warning.svg'
import { Notification } from '../../components/Notification'
import { config } from '../../config'
import { HIGH_VALUE_THRESHOLD } from '../../consts'
import { DownloadDesktopButton } from '../download/DownloadDesktopModal'
import { setBackupReminderDismissed, setHighValueWarningDismissed } from '../settings/settingsSlice'
import { areBalancesEmpty, hasMinTokenBalance } from '../wallet/utils'
import { Color } from '../../styles/Color'

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
      justify="between"
      onDismiss={onDismissWarning(warning.key)}
      color={Color.primaryGold}
      textColor={Color.primaryBlack}
      icon={WarningIcon}
    >
      {warning.message}
    </Notification>
  )
}

export const selectHomeScreenWarnings = createSelector(
  (state: RootState) => state.settings,
  (state: RootState) => state.wallet.balances,
  (state: RootState) => state.wallet.type,
  (settings, balances, type) => {
    if (!settings.backupReminderDismissed && !areBalancesEmpty(balances))
      return {
        key: 'backup',
        message: <AccountKeyReminder />,
      }

    if (
      settings.backupReminderDismissed &&
      hasMinTokenBalance(HIGH_VALUE_THRESHOLD, balances) &&
      !settings.highValueWarningDismissed &&
      !config.isElectron &&
      type == SignerType.Local
    )
      return {
        key: 'highValue',
        message: <DownloadDesktopReminder />,
      }

    return null
  }
)

function AccountKeyReminder() {
  const navigate = useNavigate()
  return (
    <div>
      Reminder: Copy your{' '}
      <TextButton onClick={() => navigate('/wallet')}>Recovery Phrase</TextButton> (seed phrase) to
      a safe place. Your key is the only way to recover your account.
    </div>
  )
}

function DownloadDesktopReminder() {
  return (
    <div>
      Warning: Using this wallet in a browser is not recommended for large accounts. Please download
      the <DownloadDesktopButton>Desktop App</DownloadDesktopButton> or use Ledger hardware.
    </div>
  )
}
