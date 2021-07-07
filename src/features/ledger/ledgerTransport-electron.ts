import TransportNodeHid from '@ledgerhq/hw-transport-node-hid-noevents'
import { logger } from 'src/utils/logger'

export async function getLedgerTransport() {
  if (await TransportNodeHid.isSupported()) {
    logger.debug('NodeHid appears to be supported')
    return TransportNodeHid.open()
  } else {
    throw new Error('No transport protocols are supported')
  }
}
