import TransportNodeHid from '@ledgerhq/hw-transport-node-hid-noevents'
import { logger } from 'src/utils/logger'

let transport: any

export async function getLedgerTransport() {
  if (transport) return transport

  if (await TransportNodeHid.isSupported()) {
    logger.debug('NodeHid appears to be supported')
    transport = TransportNodeHid.open()
    return transport
  } else {
    throw new Error('No transport protocols are supported')
  }
}
