import { BigNumber } from 'ethers'
import { isAddress, parseEther } from 'ethers/lib/utils'
import { Currency, MAX_COMMENT_CHAR_LENGTH, MAX_SEND_TOKEN_SIZE } from 'src/consts'
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
  yield* call(doSendToken, context)
}

async function doSendToken({ recipient, amount, currency, comment }: SendTokenParams) {
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
  // TODO fix send error
  /*
        from: account,
      feeCurrency: feeCurrencyAddress,
      // Hack to prevent web3 from adding the suggested gold gas price, allowing geth to add
      // the suggested price in the selected feeCurrency.
      gasPrice: gasPrice ? gasPrice : '0',
    gatewayFeeRecipient?: string
    gatewayFee?: string

    if (txParams.chainId == null) {
      txParams.chainId = await this.getChainId()
    }

    if (txParams.nonce == null) {
      txParams.nonce = await this.getNonce(txParams.from!.toString())
    }

    if (!txParams.gas || isEmpty(txParams.gas.toString())) {
      txParams.gas = await this.getEstimateGas(txParams)
    }

    if (!txParams.gasPrice || isEmpty(txParams.gasPrice.toString())) {
      txParams.gasPrice = await this.getGasPrice(txParams.feeCurrency)
    }
    */

  const txResponse = await signer.sendTransaction({
    to: recipient,
    value: amountInWei,
    gasPrice: 0,
    gasLimit: 10000000,
    // //@ts-ignore
    // gatewayFeeRecipient: '0x8c2a2c7a71c68f30c1ec8940a1efe72c06d8f32f',
    // gasCurrency: '0x874069fa1eb16d44d622f2e0ca25eea172369bc1',
  })
  const txReceipt = await txResponse.wait()
  logger.info(`CELO transaction hash received: ${txReceipt.transactionHash}`)
}

async function sendDollarToken(recipient: string, amountInWei: BigNumber, comment?: string) {
  //TODO
}

export const {
  wrappedSaga: sendTokenSaga,
  reducer: sendTokenReducer,
  actions: sendTokenActions,
} = createMonitoredSaga<SendTokenParams>(sendToken, { name: 'send-payment' })
