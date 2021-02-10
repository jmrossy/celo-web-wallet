import { Currency } from 'src/currency'
import { validateFeeEstimates } from 'src/features/fees/utils'
import { getTotalUnlockedCelo } from 'src/features/lock/utils'
import { StakeActionType, StakeTokenParams } from 'src/features/validators/types'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import { validateAmount, validateAmountWithFees } from 'src/utils/amount'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export function validate(
  params: StakeTokenParams,
  balances: Balances,
  validateFee = false
): ErrorState {
  const { amountInWei, action, feeEstimates } = params
  let errors: ErrorState = { isValid: true }

  if (!Object.values(StakeActionType).includes(action)) {
    errors = { ...errors, ...invalidInput('action', 'Invalid Action Type') }
  }

  if (!amountInWei) {
    errors = { ...errors, ...invalidInput('amount', 'Amount Missing') }
  } else {
    const adjustedBalances = { ...balances }
    if (action === StakeActionType.Vote) {
      adjustedBalances.celo = getTotalUnlockedCelo(balances).toString()
    } else if (action === StakeActionType.Revoke) {
      adjustedBalances.celo = balances.lockedCelo.locked
    }
    errors = { ...errors, ...validateAmount(amountInWei, Currency.CELO, adjustedBalances) }
  }

  if (validateFee) {
    errors = {
      ...errors,
      ...validateFeeEstimates(feeEstimates),
      ...validateAmountWithFees(amountInWei, Currency.CELO, balances, feeEstimates),
    }
  }

  return errors
}

function* stakeToken(params: StakeTokenParams) {
  const { amountInWei, action, feeEstimates } = params

  const balances = yield* call(fetchBalancesIfStale)
  // const { pendingWithdrawals, isAccountRegistered } = yield* select(
  //   (state: RootState) => state.lock
  // )

  validateOrThrow(() => validate(params, balances, true), 'Invalid transaction')

  // if (!feeEstimates || feeEstimates.length !== txPlan.length) {
  //   throw new Error('Fee estimates missing or do not match txPlan')
  // }

  // logger.info(`Executing ${action} for ${amountInWei} CELO`)
  // yield* call(executeStakeTokenTxPlan, action, txPlan, feeEstimates)

  yield* put(fetchBalancesActions.trigger())
}

export const {
  name: stakeTokenSagaName,
  wrappedSaga: stakeTokenSaga,
  reducer: stakeTokenReducer,
  actions: stakeTokenActions,
} = createMonitoredSaga<StakeTokenParams>(stakeToken, 'stakeToken')
