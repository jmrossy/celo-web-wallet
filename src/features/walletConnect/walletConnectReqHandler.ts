import WalletConnectClient from '@walletconnect/client'
import { completeWcRequest } from 'src/features/walletConnect/walletConnectSlice'
import { logger } from 'src/utils/logger'
import { put } from 'typed-redux-saga'

export function* handleWalletConnectRequest(client: WalletConnectClient, approved: boolean) {
  logger.debug('WalletConnect action request received')

  yield* put(completeWcRequest())

  //  // WalletConnect client can track multiple sessions
  //   // assert the topic from which application requested
  //   const { topic, request } = requestEvent
  //   const session = await client.session.get(requestEvent.topic)
  //   // now you can display to the user for approval using the stored metadata
  //   const { metadata } = session.peer
  //   // after user has either approved or not the request it should be formatted
  //   // as response with either the result or the error message
  //   let result: any
  //   const response = result // todo check approval here
  //     ? {
  //         topic,
  //         response: {
  //           id: request.id,
  //           jsonrpc: '2.0',
  //           result,
  //         },
  //       }
  //     : {
  //         topic,
  //         response: {
  //           id: request.id,
  //           jsonrpc: '2.0',
  //           error: {
  //             code: -32000,
  //             message: 'User rejected JSON-RPC request',
  //           },
  //         },
  //       }
  //   await client.respond(response)
}
