import { Contract } from 'ethers'
import { ABI as AccountsAbi } from './ABIs/accounts'
import { ABI as ElectionAbi } from './ABIs/election'
import { ABI as Erc20Abi } from './ABIs/erc20'
import { ABI as EscrowAbi } from './ABIs/escrow'
import { ABI as ExchangeAbi } from './ABIs/exchange'
import { ABI as GoldTokenAbi } from './ABIs/goldToken'
import { ABI as GovernanceAbi } from './ABIs/governance'
import { ABI as LockedGoldAbi } from './ABIs/lockedGold'
import { ABI as SortedOraclesAbi } from './ABIs/sortedOracles'
import { ABI as StableTokenAbi } from './ABIs/stableToken'
import { ABI as ValidatorsAbi } from './ABIs/validators'
import { getSigner } from './signer'
import { CeloContract, config } from '../config'
import { areAddressesEqual } from '../utils/addresses'

let contractCache: Partial<Record<CeloContract, Contract>> = {}
let tokenContractCache: Partial<Record<string, Contract>> = {} // token address to contract

export function getContract(c: CeloContract) {
  const cachedContract = contractCache[c]
  if (cachedContract) return cachedContract
  const signer = getSigner().signer
  const address = config.contractAddresses[c]
  const abi = getContractAbi(c)
  const contract = new Contract(address, abi, signer)
  contractCache[c] = contract
  return contract
}

// Search for token contract by address
export function getTokenContract(tokenAddress: string) {
  const cachedContract = tokenContractCache[tokenAddress]
  if (cachedContract) return cachedContract
  const signer = getSigner().signer
  const contract = new Contract(tokenAddress, Erc20Abi, signer)
  tokenContractCache[tokenAddress] = contract
  return contract
}

function getContractAbi(c: CeloContract) {
  switch (c) {
    case CeloContract.Accounts:
      return AccountsAbi
    case CeloContract.Election:
      return ElectionAbi
    case CeloContract.Escrow:
      return EscrowAbi
    case CeloContract.Exchange:
    case CeloContract.ExchangeEUR:
      return ExchangeAbi
    case CeloContract.GoldToken:
      return GoldTokenAbi
    case CeloContract.Governance:
      return GovernanceAbi
    case CeloContract.LockedGold:
      return LockedGoldAbi
    case CeloContract.SortedOracles:
      return SortedOraclesAbi
    case CeloContract.StableToken:
    case CeloContract.StableTokenEUR:
      return StableTokenAbi
    case CeloContract.Validators:
      return ValidatorsAbi
    default:
      throw new Error(`No ABI for contract ${c}`)
  }
}

// Search for core contract by address
export function getContractByAddress(address: string): Contract | null {
  const name = getContractName(address)
  if (name) return getContract(name)
  else return null
}

// Search for core contract name by address
export function getContractName(address: string): CeloContract | null {
  if (!address) return null
  const contractNames = Object.keys(config.contractAddresses) as Array<CeloContract> // Object.keys loses types
  for (const name of contractNames) {
    const cAddress = config.contractAddresses[name]
    if (areAddressesEqual(address, cAddress)) {
      return name
    }
  }
  return null
}

// Necessary if the signer changes, as in after a logout
export function clearContractCache() {
  contractCache = {}
  tokenContractCache = {}
}
