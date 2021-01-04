import { Contract, ethers } from 'ethers'
import { getSigner } from 'src/blockchain/signer'
import { CeloContract, config } from 'src/config'
import { Currency } from 'src/currency'
import { areAddressesEqual } from 'src/utils/addresses'

let contractCache: Partial<Record<CeloContract, Contract>> = {}

export async function getContract(c: CeloContract) {
  const cachedContract = contractCache[c]
  if (cachedContract) {
    return cachedContract
  }
  const signer = getSigner().signer
  const address = config.contractAddresses[c]
  const abi = await getContractAbi(c)
  const contract = new ethers.Contract(address, abi, signer)
  contractCache[c] = contract
  return contract
}

async function getContractAbi(c: CeloContract) {
  switch (c) {
    case CeloContract.StableToken:
      return (await import('src/blockchain/ABIs/stableToken')).ABI
    case CeloContract.GoldToken:
      return (await import('src/blockchain/ABIs/goldToken')).ABI
    case CeloContract.Exchange:
      return (await import('src/blockchain/ABIs/exchange')).ABI
    case CeloContract.SortedOracles:
      return (await import('src/blockchain/ABIs/sortedOracles')).ABI
    case CeloContract.Escrow:
      return (await import('src/blockchain/ABIs/escrow')).ABI
    default:
      throw new Error(`No ABI for contract ${c}`)
  }
}

export function getContractName(address: string): string | null {
  if (!address) return null

  for (const [name, cAddress] of Object.entries(config.contractAddresses)) {
    if (areAddressesEqual(address, cAddress)) {
      return name
    }
  }

  return null
}

export function getCurrencyFromContract(address: string): Currency | null {
  const name = getContractName(address)
  if (name === CeloContract.StableToken) return Currency.cUSD
  if (name === CeloContract.GoldToken) return Currency.CELO
  return null
}

// Necessary if the signer changes, as in after a logout
export function clearContractCache() {
  contractCache = {}
}
