import { Contract, ethers } from 'ethers'
import { ABI as EscrowAbi } from 'src/blockchain/ABIs/escrow'
import { ABI as ExchangeAbi } from 'src/blockchain/ABIs/exchange'
import { ABI as GoldTokenAbi } from 'src/blockchain/ABIs/goldToken'
import { ABI as SortedOraclesAbi } from 'src/blockchain/ABIs/sortedOracles'
import { ABI as StableTokenAbi } from 'src/blockchain/ABIs/stableToken'
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
      return StableTokenAbi
    case CeloContract.GoldToken:
      return GoldTokenAbi
    case CeloContract.Exchange:
      return ExchangeAbi
    case CeloContract.SortedOracles:
      return SortedOraclesAbi
    case CeloContract.Escrow:
      return EscrowAbi
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
