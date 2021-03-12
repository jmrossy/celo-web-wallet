import { BigNumber, BigNumberish } from 'ethers'
import { LockActionType, LockTokenParams } from 'src/features/lock/types'
import { getTotalCelo, getTotalPendingCelo, hasPendingCelo } from 'src/features/lock/utils'
import { Balances } from 'src/features/wallet/types'
import { Color } from 'src/styles/Color'
import { CELO } from 'src/tokens'
import { fromWeiRounded } from 'src/utils/amount'

// Just for convinience / shortness cause this file has lots of conversions
function fromWei(value: BigNumberish) {
  return parseFloat(fromWeiRounded(value, CELO, true))
}

export function getSummaryChartData(balances: Balances) {
  const hasPending = hasPendingCelo(balances)
  const total = getTotalCelo(balances)

  const unlocked = {
    label: 'Unlocked',
    value: fromWei(balances.tokens.CELO.value),
    color: Color.primaryGold,
  }
  const locked = {
    label: 'Locked',
    value: fromWei(balances.lockedCelo.locked),
    color: Color.altGrey,
    labelColor: Color.chartGrey,
  }
  const pending = hasPending
    ? [
        {
          label: 'Pending (Free)',
          value: fromWei(balances.lockedCelo.pendingFree),
          color: Color.chartBlueGreen,
        },
        {
          label: 'Pending (On Hold)',
          value: fromWei(balances.lockedCelo.pendingBlocked),
          color: Color.accentBlue,
        },
      ]
    : [
        {
          label: 'Pending',
          value: 0,
          color: Color.accentBlue,
        },
      ]

  return {
    data: [unlocked, ...pending, locked],
    total: { label: 'Total', value: fromWei(total) },
  }
}

function subtractTil0(v1: BigNumber, v2: BigNumber) {
  if (v1.gt(v2)) return v1.sub(v2)
  else return BigNumber.from('0')
}

function addUpToMax(v1: BigNumber, toAdd: BigNumber, max: BigNumber) {
  if (BigNumber.from(toAdd).gt(max)) return v1.add(max)
  else return v1.add(toAdd)
}

export function getResultChartData(balances: Balances, values: LockTokenParams) {
  let unlocked = BigNumber.from(balances.tokens.CELO.value)
  let pending = getTotalPendingCelo(balances)
  let locked = BigNumber.from(balances.lockedCelo.locked)
  const total = getTotalCelo(balances)

  const { action, amountInWei: _amountInWei } = values
  const amountInWei = BigNumber.from(_amountInWei)
  if (action === LockActionType.Lock) {
    locked = addUpToMax(locked, amountInWei, pending.add(unlocked))
    if (pending.lte(amountInWei)) {
      unlocked = subtractTil0(unlocked, amountInWei.sub(pending))
      pending = BigNumber.from(0)
    } else {
      pending = subtractTil0(pending, amountInWei)
    }
  } else if (action === LockActionType.Unlock) {
    pending = addUpToMax(pending, amountInWei, locked)
    locked = subtractTil0(locked, amountInWei)
  } else if (action === LockActionType.Withdraw) {
    unlocked = addUpToMax(unlocked, amountInWei, pending)
    pending = subtractTil0(pending, amountInWei)
  }

  return {
    data: [
      { label: 'Unlocked', value: fromWei(unlocked), color: Color.primaryGold },
      {
        label: 'Pending',
        value: fromWei(pending),
        color: Color.accentBlue,
      },
      {
        label: 'Locked',
        value: fromWei(locked),
        color: Color.altGrey,
        labelColor: Color.chartGrey,
      },
    ],
    total: { label: 'Total', value: fromWei(total) },
  }
}
