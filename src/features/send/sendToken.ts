import { BigNumber, providers } from 'ethers'
import { isAddress, parseEther } from 'ethers/lib/utils'
import { CeloContract } from 'src/config'
import { Currency, MAX_COMMENT_CHAR_LENGTH, MAX_SEND_TOKEN_SIZE } from 'src/consts'
import { getContract } from 'src/provider/contracts'
import { getSigner } from 'src/provider/signer'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call } from 'typed-redux-saga'

export interface SendTokenParams {
  recipient: string
  amount: number
  currency: Currency
  comment?: string
}

function* sendToken(context: SendTokenParams) {
  // const address = yield* select((state: RootState) => state.wallet.address)
  yield* call(_sendToken, context)
}

async function _sendToken({ recipient, amount, currency, comment }: SendTokenParams) {
  const amountInWei = parseEther('' + amount)
  if (amountInWei.lte(0) || amountInWei.gte(MAX_SEND_TOKEN_SIZE)) {
    logger.error(`Invalid amount: ${amountInWei.toString()}`)
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
