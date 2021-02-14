import { RootState } from 'src/app/rootReducer'
import { Currency } from 'src/currency'
import { validateFeeEstimates } from 'src/features/fees/utils'
import {
  GroupVotes,
  StakeActionType,
  StakeTokenParams,
  ValidatorGroup,
} from 'src/features/validators/types'
import { getStakingMaxAmount } from 'src/features/validators/utils'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import { validateAmount, validateAmountWithFees } from 'src/utils/amount'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export function validate(
  params: StakeTokenParams,
  balances: Balances,
  groups: ValidatorGroup[],
  votes: GroupVotes,
  validateFee = false
): ErrorState {
  const { amountInWei, groupAddress, action, feeEstimates } = params
  let errors: ErrorState = { isValid: true }

  if (!groupAddress || groups.findIndex((g) => g.address === groupAddress) < 0) {
    errors = { ...errors, ...invalidInput('groupAddress', 'Invalid Validator Group') }
  }

  if (!Object.values(StakeActionType).includes(action)) {
    errors = { ...errors, ...invalidInput('action', 'Invalid Action Type') }
  }

  if (!amountInWei) {
    errors = { ...errors, ...invalidInput('amount', 'Amount Missing') }
  } else {
    const adjustedBalances = { ...balances }
    const maxAmount = getStakingMaxAmount(params.action, balances, votes, params.groupAddress)
    adjustedBalances.celo = maxAmount.toString()
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
  const { validatorGroups, groupVotes } = yield* select((state: RootState) => state.validators)

  validateOrThrow(
    () => validate(params, balances, validatorGroups.groups, groupVotes, true),
    'Invalid transaction'
  )

  alert('Staking :)')

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
