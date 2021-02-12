import { BigNumberish } from 'ethers'
import { Currency } from 'src/currency'
import { getTotalLockedCelo } from 'src/features/lock/utils'
import { GroupVotes, StakeTokenParams } from 'src/features/validators/types'
import { Balances } from 'src/features/wallet/types'
import { fromWeiRounded } from 'src/utils/amount'

// Just for convinience / shortness cause this file has lots of conversions
function fromWei(value: BigNumberish) {
  return parseFloat(fromWeiRounded(value, Currency.CELO, true))
}

export function getSummaryChartData(balances: Balances, votes: GroupVotes) {
  const totalLocked = getTotalLockedCelo(balances)

  //TODO
  // const unlocked = { label: 'Unlocked', value: fromWei(balances.celo), color: Color.primaryGold }
  // const locked = {
  //   label: 'Locked',
  //   value: fromWei(balances.lockedCelo.locked),
  //   color: Color.altGrey,
  //   labelColor: Color.chartGrey,
  // }

  return {
    data: [],
    total: { label: 'Total', value: fromWei(totalLocked) },
  }
}

export function getResultChartData(
  values: StakeTokenParams,
  balances: Balances,
  votes: GroupVotes
) {
  const totalLocked = getTotalLockedCelo(balances)

  return {
    data: [],
    total: { label: 'Total', value: fromWei(totalLocked) },
  }
}
