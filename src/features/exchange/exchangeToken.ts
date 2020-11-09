import { BigNumber, Contract, providers, utils } from 'ethers'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract } from 'src/config'
import { Currency, MAX_EXCHANGE_TOKEN_SIZE } from 'src/consts'
import { ExchangeTokenParams } from 'src/features/exchange/types'
import { fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/walletSlice'
import { isAmountValid } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call } from 'typed-redux-saga'

export function validate(params: ExchangeTokenParams, balances: Balances) {
  const { amount, fromCurrency } = params
  let hasErrors = false;
  let errors = {};

  if (!amount || amount <= 0) {  //make sure there is an amount
    errors = { ...errors, amount: { error: true, helpText: "Invalid Amount" } };
    hasErrors = true;
  }
  else {  //make sure they have enough...
    const amountInWei = utils.parseEther('' + amount);

    if (!isAmountValid(amountInWei, fromCurrency, balances, MAX_EXCHANGE_TOKEN_SIZE)) {
      errors = { ...errors, amount: { error: true, helpText: "Amount not available" } };
      hasErrors = true;
    }
  }

  return hasErrors ? errors : null;
}

function* exchangeToken(params: ExchangeTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)

  const validateResult = yield call(validate, params, balances);
  if (validateResult !== null) {
    throw new Error("Invalid transaction"); //TODO: provide details of the error
  }

  yield* call(_exchangeToken, params)
}

async function _exchangeToken(params: ExchangeTokenParams) {
  const { amount, fromCurrency } = params
  logger.info(`Exchanging ${amount} ${fromCurrency}`)

  const amountInWei = utils.parseEther('' + amount)

  await approveExchange(amountInWei, fromCurrency)
  await executeExchange(amountInWei, fromCurrency)
}

async function approveExchange(amountInWei: BigNumber, fromCurrency: Currency) {
  const exchange = await getContract(CeloContract.Exchange)

  let tokenContract: Contract
  if (fromCurrency === Currency.cUSD) {
    tokenContract = await getContract(CeloContract.StableToken)
  } else if (fromCurrency === Currency.CELO) {
    tokenContract = await getContract(CeloContract.GoldToken)
  } else {
    throw new Error(`Unsupported currency: ${fromCurrency}`)
  }

  // TODO query for expected exchange rate and set minBuyAmount properly
  const txResponse: providers.TransactionResponse = await tokenContract.approve(
    exchange.address,
    amountInWei
  )
  const txReceipt = await txResponse.wait()
  logger.info(`exchange approval hash received: ${txReceipt.transactionHash}`)
}

async function executeExchange(amountInWei: BigNumber, fromCurrency: Currency) {
  const exchange = await getContract(CeloContract.Exchange)

  // TODO query for expected exchange rate and set minBuyAmount properly
  // TODO exchange method for sell once updated contract is live
  const txResponse: providers.TransactionResponse = await exchange.exchange(
    amountInWei,
    BigNumber.from(10),
    fromCurrency === Currency.CELO
  )
  const txReceipt = await txResponse.wait()
  logger.info(`exchange hash received: ${txReceipt.transactionHash}`)
}

export const {
  wrappedSaga: exchangeTokenSaga,
  reducer: exchangeTokenReducer,
  actions: exchangeTokenActions,
} = createMonitoredSaga<ExchangeTokenParams>(exchangeToken, 'exchangeToken')
