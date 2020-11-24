import { Contract, ethers } from 'ethers'
import { getSigner } from 'src/blockchain/signer'
import { CeloContract, config } from 'src/config'
import { areAddressesEqual } from 'src/utils/addresses'

const contractCache: Partial<Record<CeloContract, Contract>> = {}

export async function getContract(c: CeloContract) {
  const cachedContract = contractCache[c]
  if (cachedContract) {
    return cachedContract
  }
  const signer = getSigner()
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
