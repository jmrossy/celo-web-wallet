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
      pending: '0',
    }
  }

  const lockedGold = getContract(CeloContract.LockedGold)
  const lockedAmountP = lockedGold.getAccountTotalLockedGold(address)
  const pendingWithdrawalsP = lockedGold.getPendingWithdrawals(address)
  const [lockedAmount, pendingWithdrawals]: [BigNumber, PendingWithdrawals] = await Promise.all([
    lockedAmountP,
    pendingWithdrawalsP,
  ])

  // TODO differentiate from pending blocked and pending open
  let pendingAmount = '0'
  if (pendingWithdrawals && pendingWithdrawals.length && pendingWithdrawals[0].length) {
    const values = pendingWithdrawals[0]
    pendingAmount = values.reduce((sum, value) => sum.add(value), BigNumber.from(0)).toString()
  }

  console.log('locked balances', lockedAmount.toString(), pendingAmount)

  return {
    locked: lockedAmount.toString(),
    pending: pendingAmount,
  }
}
