import { utils } from 'ethers'
import { logger } from 'src/utils/logger'

export function normalizeAddress(address: string) {
  if (!address || !utils.isAddress(address)) {
    const errorMsg = `Invalid addresses being normalzied: ${address}`
    logger.error(errorMsg)
    throw new Error(errorMsg)
  }

  return utils.getAddress(address)
}

export function compareAddresses(a1: string, a2: string) {
  if (!a1 || !a2 || !utils.isAddress(a1) || !utils.isAddress(a2)) {
    const errorMsg = `Invalid addresses being compared: ${a1}, ${a2}`
    logger.error(errorMsg)
    throw new Error(errorMsg)
  }

  return utils.getAddress(a1) === utils.getAddress(a2)
}
