import TransportU2F from '@ledgerhq/hw-transport-u2f'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import { logger } from 'ethers'

export async function getLedgerTransport() {
  if (await TransportWebUSB.isSupported()) {
    logger.debug('WebUSB appears to be supported')
    return TransportWebUSB.create()
  } else if (await TransportU2F.isSupported()) {
    logger.debug('U2F appears to be supported')
    // Note: Won't work when running from localhost
    return TransportU2F.create()
  } else {
    throw new Error('No transport protocols are supported')
  }
}
