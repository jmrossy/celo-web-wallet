import { Contract } from 'ethers'
import { ABI as AccountsAbi } from 'src/blockchain/ABIs/accounts'
import { ABI as ElectionAbi } from 'src/blockchain/ABIs/election'
import { ABI as Erc20Abi } from 'src/blockchain/ABIs/erc20'
import { ABI as EscrowAbi } from 'src/blockchain/ABIs/escrow'
import { ABI as ExchangeAbi } from 'src/blockchain/ABIs/exchange'
import { ABI as GoldTokenAbi } from 'src/blockchain/ABIs/goldToken'
import { ABI as GovernanceAbi } from 'src/blockchain/ABIs/governance'
import { ABI as LockedGoldAbi } from 'src/blockchain/ABIs/lockedGold'
import { ABI as SortedOraclesAbi } from 'src/blockchain/ABIs/sortedOracles'
import { ABI as StableTokenAbi } from 'src/blockchain/ABIs/stableToken'
import { ABI as ValidatorsAbi } from 'src/blockchain/ABIs/validators'
import { getSigner } from 'src/blockchain/signer'
import { CeloContract, config } from 'src/config'
import { areAddressesEqual } from 'src/utils/addresses'

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
    case CeloContract.ExchangeBRL:
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
    case CeloContract.StableTokenBRL:
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
