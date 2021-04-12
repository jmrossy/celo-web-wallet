import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { formatJsonRpcError, isJsonRpcRequest } from '@json-rpc-tools/utils'
import Client, { CLIENT_EVENTS } from '@walletconnect/client'
import { SessionTypes } from '@walletconnect/types'
import { config } from 'src/config'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { WalletConnectParams } from 'src/features/walletConnect/types'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put } from 'typed-redux-saga'

const EIP155AccountsMethod = 'eth_accounts'

const EIP155SigningMethods: string[] = [
  'eth_sign',
  'eth_signTypedData',
  'eth_signTransaction',
  'eth_sendTransaction',
  'personal_sign',
]

export const EIP155JsonRpc = {
  routes: {
    http: ['eth_*'],
    signer: [EIP155AccountsMethod, ...EIP155SigningMethods],
  },
  wallet: {
    accounts: EIP155AccountsMethod,
    auth: EIP155SigningMethods,
  },
}

// export const DEFAULT_MAIN_CHAINS = Object.keys(config.eip155)
//   .filter((x) => !config.eip155[x].testNet)
//   .map((x) => `eip155:${x}`);

export const DEFAULT_MAIN_CHAINS = [`eip155:${config.chainId}`]

export const DEFAULT_TEST_CHAINS = []

export const DEFAULT_RELAY_PROVIDER = 'wss://staging.walletconnect.org'

export const DEFAULT_METHODS = EIP155SigningMethods

export const DEFAULT_LOGGER = 'debug'

export const DEFAULT_APP_METADATA = {
  name: 'Test Wallet',
  description: 'Test Wallet for WalletConnect',
  url: 'https://walletconnect.org/',
  icons: ['https://walletconnect.org/walletconnect-logo.png'],
}

let client: Client

function* initWalletConnect() {
  yield* call(init)
}

async function init() {
  client = await Client.init({
    relayProvider: DEFAULT_RELAY_PROVIDER,
    logger: logger,
  })

  client.on(CLIENT_EVENTS.session.proposal, async (payloadEvent: SessionTypes.PayloadEvent) => {
    if (isJsonRpcRequest(payloadEvent.payload)) {
      formatJsonRpcError(payloadEvent.payload.id, 'hi')
    }
    // if (typeof this.state.wallet === "undefined") {
    //   throw new Error("Wallet is not initialized");
    // }
    // // tslint:disable-next-line
    // console.log("EVENT", "session_payload", payloadEvent.payload);
    // const chainId = payloadEvent.chainId || this.state.chains[0];
    // try {
    //   // TODO: needs improvement
    //   const requiresApproval = this.state.wallet.auth[chainId].assert(payloadEvent.payload);
    //   if (requiresApproval) {
    //     this.setState({ requests: [...this.state.requests, payloadEvent] });
    //   } else {
    //     const response = await this.state.wallet.resolve(payloadEvent.payload, chainId);
    //     await this.respondRequest(payloadEvent.topic, response);
    //   }
    // } catch (e) {
    // const response = formatJsonRpcError(payloadEvent.payload.id, e.message);
    // await this.respondRequest(payloadEvent.topic, response);
    // }
  })
}

function* sendWalletConnectTx(params: WalletConnectParams) {
  // validateOrThrow(() => validate(params, balances, txSizeLimitEnabled, true), 'Invalid transaction')

  // const { signedTx, type, token } = yield* call(createSendTx, params, balances)
  // yield* put(setNumSignatures(1))

  // const txReceipt = yield* call(sendSignedTransaction, signedTx)
  // logger.info(`Token transfer hash received: ${txReceipt.transactionHash}`)

  // const placeholderTx = getPlaceholderTx(params, token, type, txReceipt)
  // yield* put(addPlaceholderTransaction(placeholderTx))

  yield* put(fetchBalancesActions.trigger())
}

export async function createWalletConnectTxRequest(params: WalletConnectParams) {
  // TODO
  return {
    to: params.data.to,
    value: '0',
  } as CeloTransactionRequest
}

export const {
  name: sendWalletConnectTxSagaName,
  wrappedSaga: sendWalletConnectTxSaga,
  reducer: sendWalletConnectTxReducer,
  actions: sendWalletConnectTxActions,
} = createMonitoredSaga<WalletConnectParams>(sendWalletConnectTx, 'sendWalletConnectTx')
