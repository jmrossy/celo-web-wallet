import { BigNumber, providers } from 'ethers'
import { isAddress, parseEther } from 'ethers/lib/utils'
import { getContract } from 'src/blockchain/contracts'
import { getSigner } from 'src/blockchain/signer'
import { CeloContract } from 'src/config'
import { Currency, MAX_COMMENT_CHAR_LENGTH, MAX_SEND_TOKEN_SIZE } from 'src/consts'
import { fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/walletSlice'
import { isAmountValid } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call } from 'typed-redux-saga'

export interface SendTokenParams {
  recipient: string
  amount: number
  currency: Currency
  comment?: string
}

function* sendToken(params: SendTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)
  yield* call(_sendToken, params, balances)
}

async function _sendToken(params: SendTokenParams, balances: Balances) {
  const { recipient, amount, currency, comment } = params
  const amountInWei = parseEther('' + amount)
  if (!isAmountValid(amountInWei, currency, balances, MAX_SEND_TOKEN_SIZE)) {
    // TODO show error
    return
  }

  if (!isAddress(recipient)) {
    logger.error(`Invalid recipient: ${recipient}`)
    // TODO show error
    return
  }

  if (comment && comment.length > MAX_COMMENT_CHAR_LENGTH) {
    logger.error(`Invalid comment: ${comment}`)
    // TODO show error
    return
  }

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
  const signer = getSigner()

  logger.info(`Sending ${amountInWei} CELO`)
  const txResponse = await signer.sendTransaction({
    to: recipient,
    value: amountInWei,
    gasPrice: 500000000,
    gasLimit: 10000000,
    // //@ts-ignore
    // gatewayFeeRecipient: '0x8c2a2c7a71c68f30c1ec8940a1efe72c06d8f32f',
    // gasCurrency: '0x874069fa1eb16d44d622f2e0ca25eea172369bc1',
  })
  // const rawTx = await signer.signTransaction({
  //   to: recipient,
  //   value: amountInWei,
  //   gasPrice: 500000000,
  //   gasLimit: 10000000,
  //   // //@ts-ignore
  //   // gatewayFeeRecipient: '0x8c2a2c7a71c68f30c1ec8940a1efe72c06d8f32f',
  //   // gasCurrency: '0x874069fa1eb16d44d622f2e0ca25eea172369bc1',
  // })
  // const provider = getProvider()
  // const txResponse = await provider.sendTransaction(rawTx)
  const txReceipt = await txResponse.wait()
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

export const {
  wrappedSaga: sendTokenSaga,
  reducer: sendTokenReducer,
  actions: sendTokenActions,
} = createMonitoredSaga<SendTokenParams>(sendToken, { name: 'sendToken' })
