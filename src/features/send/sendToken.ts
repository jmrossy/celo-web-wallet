
import { BigNumber, providers, utils } from 'ethers'
import { getContract } from 'src/blockchain/contracts'
import { sendTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import { Currency, MAX_COMMENT_CHAR_LENGTH, MAX_SEND_TOKEN_SIZE } from 'src/consts'
import { confirmTransaction, notify, setErrors, transactionSent } from 'src/features/send/sendSlice'
import { SendTokenParams } from 'src/features/send/types'
import { fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/walletSlice'
import { isAmountValid } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { sleep } from 'src/utils/sleep'
import { call, put, take } from 'typed-redux-saga'

function* sendToken(params: SendTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)

  //Validate the transaction
  const validateResult = yield call(_validate, params, balances);
  if (validateResult !== null) {
    yield put(setErrors(validateResult));
    // throw new Error("send validation failed");
    return;
  }

  //Wait for confirmation
  yield put(confirmTransaction(params));

  //Wait for either a send or a cancel
  const nextAction = yield take(['send/cancelTransaction', 'send/sendTransaction']);
  if (nextAction.type === 'send/sendTransaction') {
    yield* call(_sendToken, params)

    const sendResult = yield take(['sendToken/progress', 'sendToken/error']);
    if (sendResult.type === "sendToken/error") {
      //TODO: didn't work...
      return;
    }
    else {
      yield* call(_finalizeTransaction)
      return;
    }
  }
  else {
    return; //transaction was canceled
  }
}

async function _validate(params: SendTokenParams, balances: Balances) {
  const { recipient, amount, currency, comment } = params
  let hasErrors = false;
  let errors = {};

  if (!amount) {
    errors = { ...errors, amount: { error: true, helpText: "Invalid Amount" } };
    hasErrors = true;
  }
  else {
    const amountInWei = utils.parseEther('' + amount)
    if (!isAmountValid(amountInWei, currency, balances, MAX_SEND_TOKEN_SIZE)) {
      errors = { ...errors, amount: { error: true, helpText: "Invalid Amount" } };
      hasErrors = true;
    }
  }

  if (!utils.isAddress(recipient)) {
    logger.error(`Invalid recipient: ${recipient}`)
    errors = { ...errors, recipient: { error: true, helpText: "Invalid Recipient" } };
    hasErrors = true;
  }
  else if (!recipient) {
    logger.error(`Invalid recipient: ${recipient}`)
    errors = { ...errors, recipient: { error: true, helpText: "Recipient is required" } };
    hasErrors = true;
  }

  if (comment && comment.length > MAX_COMMENT_CHAR_LENGTH) {
    logger.error(`Invalid comment: ${comment}`)
    errors = { ...errors, comment: { error: true, helpText: "Comment is too long" } };
    hasErrors = true;
  }

  return hasErrors ? errors : null;
}

async function _sendToken(params: SendTokenParams) {
  const { recipient, amount, currency, comment } = params
  const amountInWei = utils.parseEther('' + amount)

  // TODO consider balance and gas

  if (currency === Currency.CELO) {
    return sendCeloToken(recipient, amountInWei)
  } else if (currency === Currency.cUSD) {
    return sendDollarToken(recipient, amountInWei, comment)
  } else {
    throw new Error(`Unsupported currency: ${currency}`)
  }
}

async function sendCeloToken(recipient: string, amountInWei: BigNumber) {
  logger.info(`Sending ${amountInWei} CELO`)
  const txReceipt = await sendTransaction({
    to: recipient,
    value: amountInWei,
  })

  logger.info(`CELO payment hash received: ${txReceipt.transactionHash}`)
}

async function sendDollarToken(recipient: string, amountInWei: BigNumber, comment?: string) {
  const stableToken = await getContract(CeloContract.StableToken)
  let txResponse: providers.TransactionResponse

  if (comment && comment.length && comment.length <= MAX_COMMENT_CHAR_LENGTH) {
    logger.info(`Sending ${amountInWei} cUSD with comment`)
    txResponse = await stableToken.transferWithComment(recipient, amountInWei, comment)
  } else {
    logger.info(`Sending ${amountInWei} cUSD without comment`)
    txResponse = await stableToken.transfer(recipient, amountInWei)
  }

  const txReceipt = await txResponse.wait()
  logger.info(`cUSD payment hash received: ${txReceipt.transactionHash}`)
}

function* _finalizeTransaction() {

  yield put(transactionSent());

  //create a 3-second notification
  yield put(notify("Your payment was sent."))
  yield sleep(3000)
  yield put(notify(null));

  return;
}

export const {
  wrappedSaga: sendTokenSaga,
  reducer: sendTokenReducer,
  actions: sendTokenActions,
} = createMonitoredSaga<SendTokenParams>(sendToken, 'sendToken')
