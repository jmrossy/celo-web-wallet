import { createSelector } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { SignerType } from 'src/blockchain/signer'
import { TextButton } from 'src/components/buttons/TextButton'
import WarningIcon from 'src/components/icons/warning.svg'
import { Notification } from 'src/components/Notification'
import { config } from 'src/config'
import { HIGH_VALUE_THRESHOLD } from 'src/consts'
import { DownloadDesktopButton } from 'src/features/download/DownloadDesktopModal'
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
    const cUsd = BigNumber.from(balances.cUsd)
    const celo = BigNumber.from(balances.celo)

    if (!settings.backupReminderDismissed && (cUsd.gt(0) || celo.gt(0)))
      return {
        key: 'backup',
        message: <AccountKeyReminder />,
      }

    if (
      settings.backupReminderDismissed &&
      (cUsd.gte(HIGH_VALUE_THRESHOLD) || celo.gte(HIGH_VALUE_THRESHOLD)) &&
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
      Reminder: Copy your <TextButton onClick={() => navigate('/wallet')}>Account Key</TextButton>{' '}
      (mnemonic) to a safe place. Your key is the only way to recover your account.
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
