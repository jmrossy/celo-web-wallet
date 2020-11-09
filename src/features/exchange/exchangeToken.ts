import { BigNumber, Contract, providers, utils } from 'ethers'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract } from 'src/config'
import { Currency, MAX_EXCHANGE_TOKEN_SIZE } from 'src/consts'
import { confirmExchange, exchangeFailed, exchangeSent, notify, setErrors } from 'src/features/exchange/exchangeSlice'
import { ExchangeTokenParams } from 'src/features/exchange/types'
import { fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/walletSlice'
import { isAmountValid } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { sleep } from 'src/utils/sleep'
import { call, put, take } from 'typed-redux-saga'


function* exchangeToken(params: ExchangeTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)

  //Validate the transaction
  const validateResult = yield call(_validate, params, balances);
  if (validateResult !== null) {
    yield put(setErrors(validateResult));
    // throw new Error("exchange validation failed");
    return;
  }

  //Wait for confirmation
  yield put(confirmExchange(params));

  //Wait for either a send or a cancel
  const nextAction = yield take(['exchange/cancelExchange', 'exchange/sendExchange']);
  if (nextAction.type === 'exchange/sendExchange') {
    yield* call(_exchangeToken, params)

    const exchangeResult = yield take(['exchangeToken/progress', 'exchangeToken/error']);
    yield* call(_finalizeExchange, exchangeResult)
    return;
  }
  else {
    return; //transaction was canceled
  }
}

function _validate(params: ExchangeTokenParams, balances: Balances) {
  const { amount, fromCurrency } = params
  let hasErrors = false;
  let errors = {};

  if (!amount) {  //make sure there is an amount
    errors = { ...errors, amount: { error: true, helpText: "Invalid Amount" } };
    hasErrors = true;
  }
  else {  //make sure they have enough...
    const amountInWei = utils.parseEther('' + amount)

    if (!isAmountValid(amountInWei, fromCurrency, balances, MAX_EXCHANGE_TOKEN_SIZE)) {
      errors = { ...errors, amount: { error: true, helpText: "Invalid Amount" } };
      hasErrors = true;
    }
  }

  return hasErrors ? errors : null;
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

function* _finalizeExchange(result: any) {

  if (result.type === "exchangeToken/error") {
    yield put(exchangeFailed(result.error));
    return;
  }
  else {
    yield put(exchangeSent());

    //create a 3-second notification
    yield put(notify("Your exchange has been completed."))
    yield sleep(3000)
    yield put(notify(null));
  }

  return;
}


export const {
  wrappedSaga: exchangeTokenSaga,
  reducer: exchangeTokenReducer,
  actions: exchangeTokenActions,
} = createMonitoredSaga<ExchangeTokenParams>(exchangeToken, 'exchangeToken')
