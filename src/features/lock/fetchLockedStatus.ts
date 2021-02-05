import { BigNumber } from 'ethers'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract } from 'src/config'
import { LockedCeloStatus, PendingWithdrawal } from 'src/features/lock/types'
import { logger } from 'src/utils/logger'

type PendingWithdrawalsRaw = [string[], string[]] // values and times

export async function fetchLockedCeloStatus(address: string): Promise<LockedCeloStatus> {
  const accounts = getContract(CeloContract.Accounts)
  const isRegisteredAccount = await accounts.isAccount(address)
  if (!isRegisteredAccount) {
    logger.debug('Account not yet registered, skipping locked balance check')
    return {
      locked: '0',
      pendingBlocked: '0',
      pendingFree: '0',
      pendingWithdrawals: [],
      isAccountRegistered: false,
    }
  }

  const lockedGold = getContract(CeloContract.LockedGold)
  const lockedAmountP = lockedGold.getAccountTotalLockedGold(address)
  const pendingWithdrawalsP = lockedGold.getPendingWithdrawals(address)
  const [lockedAmount, pendingWithdrawalsRaw]: [
    BigNumber,
    PendingWithdrawalsRaw
  ] = await Promise.all([lockedAmountP, pendingWithdrawalsP])

  let pendingBlocked = BigNumber.from(0)
  let pendingFree = BigNumber.from(0)
  const pendingWithdrawals: PendingWithdrawal[] = []

  if (pendingWithdrawalsRaw && pendingWithdrawalsRaw.length === 2) {
    const values = pendingWithdrawalsRaw[0]
    const timestamps = pendingWithdrawalsRaw[1]
    if (!values || !timestamps || values.length !== timestamps.length) {
      throw new Error('Invalid pending withdrawals data')
    }

    const now = Date.now()
    for (let i = 0; i < values.length; i++) {
      const value = BigNumber.from(values[i])
      const timestamp = BigNumber.from(timestamps[i]).mul(1000)
      if (timestamp.lte(now)) {
        pendingFree = pendingFree.add(value)
      } else {
        pendingBlocked = pendingBlocked.add(value)
      }
      pendingWithdrawals.push({
        index: i,
        value: value.toString(),
        timestamp: timestamp.toNumber(),
      })
    }
  }

  return {
    locked: lockedAmount.toString(),
    pendingBlocked: pendingBlocked.toString(),
    pendingFree: pendingFree.toString(),
    pendingWithdrawals,
    isAccountRegistered: true,
  }
}
