import { ethers } from 'ethers'

export function doCreateWallet() {
  console.debug('Creating new wallet')
  return ethers.Wallet.createRandom()
}
