import { BigNumber } from 'ethers'
import { appSelect } from 'src/app/appSelect'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract } from 'src/config'
import { setPendingWithdrawals } from 'src/features/lock/lockSlice'
import { PendingWithdrawal } from 'src/features/lock/types'
import { logger } from 'src/utils/logger'
import { call, put } from 'typed-redux-saga'

type PendingWithdrawalsRaw = [string[], string[]] // values and times

export function* fetchLockedCeloStatus() {
  const { address, account } = yield* appSelect((state) => state.wallet)
  if (!address) throw new Error('Cannot fetch locked celo status before address is set')
  const { balances, pendingWithdrawals } = yield* call(
    _fetchLockedCeloStatus,
    address,
    account.isRegistered
  )
  yield* put(setPendingWithdrawals(pendingWithdrawals))
  return balances
}

async function _fetchLockedCeloStatus(address: Address, isAccountRegistered: boolean) {
  if (!isAccountRegistered) {
    logger.debug('Account not yet registered, skipping locked balance check')
    return {
      balances: {
        locked: '0',
        pendingBlocked: '0',
        pendingFree: '0',
      },
      pendingWithdrawals: [],
    }
  }

  const lockedGold = getContract(CeloContract.LockedGold)
  const lockedAmountP = lockedGold.getAccountTotalLockedGold(address)
  const pendingWithdrawalsP = lockedGold.getPendingWithdrawals(address)
  const [lockedAmount, pendingWithdrawalsRaw]: [BigNumber, PendingWithdrawalsRaw] =
    await Promise.all([lockedAmountP, pendingWithdrawalsP])

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
    balances: {
      locked: lockedAmount.toString(),
      pendingBlocked: pendingBlocked.toString(),
      pendingFree: pendingFree.toString(),
    },
    pendingWithdrawals,
  }
}

export async function fetchTotalLocked(address: Address) {
  const lockedGold = getContract(CeloContract.LockedGold)
  const lockedAmount = await lockedGold.getAccountTotalLockedGold(address)
  return BigNumber.from(lockedAmount).toString()
}
