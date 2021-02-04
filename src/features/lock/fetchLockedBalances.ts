import { BigNumber } from 'ethers'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract } from 'src/config'
import { LockedCeloBalances } from 'src/features/lock/types'
import { logger } from 'src/utils/logger'

type PendingWithdrawals = [string[], string[]] // values and times

export async function fetchLockedCeloBalances(address: string): Promise<LockedCeloBalances> {
  const accounts = getContract(CeloContract.Accounts)
  const isRegisteredAccount = await accounts.isAccount(address)
  if (!isRegisteredAccount) {
    logger.debug('Account not yet registered, skipping locked balance check')
    return {
      locked: '0',
      pendingBlocked: '0',
      pendingFree: '0',
    }
  }

  const lockedGold = getContract(CeloContract.LockedGold)
  const lockedAmountP = lockedGold.getAccountTotalLockedGold(address)
  const pendingWithdrawalsP = lockedGold.getPendingWithdrawals(address)
  const [lockedAmount, pendingWithdrawals]: [BigNumber, PendingWithdrawals] = await Promise.all([
    lockedAmountP,
    pendingWithdrawalsP,
  ])

  let pendingBlocked = BigNumber.from(0)
  let pendingFree = BigNumber.from(0)
  if (pendingWithdrawals && pendingWithdrawals.length === 2) {
    const values = pendingWithdrawals[0]
    const timestamps = pendingWithdrawals[1]
    if (!values || !timestamps || values.length !== timestamps.length) {
      throw new Error('Invalid pending withdrawals data')
    }

    const now = Date.now()
    for (let i = 0; i < values.length; i++) {
      const value = values[i]
      const timestamp = BigNumber.from(timestamps[i])
      if (timestamp.gte(now)) {
        pendingFree = pendingFree.add(value)
      } else {
        pendingBlocked = pendingBlocked.add(value)
      }
    }
  }

  console.log('locked balances', lockedAmount.toString(), pendingBlocked, pendingFree)

  return {
    locked: lockedAmount.toString(),
    pendingBlocked: pendingBlocked.toString(),
    pendingFree: pendingBlocked.toString(),
  }
}
