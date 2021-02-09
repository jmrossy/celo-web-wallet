import { Contract, ethers } from 'ethers'
import { ABI as AccountsAbi } from 'src/blockchain/ABIs/accounts'
import { ABI as ElectionAbi } from 'src/blockchain/ABIs/election'
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
import { Currency } from 'src/currency'
import { areAddressesEqual } from 'src/utils/addresses'

let contractCache: Partial<Record<CeloContract, Contract>> = {}

export function getContract(c: CeloContract) {
  const cachedContract = contractCache[c]
  if (cachedContract) {
    return cachedContract
  }
  const signer = getSigner().signer
  const address = config.contractAddresses[c]
  const abi = getContractAbi(c)
  const contract = new ethers.Contract(address, abi, signer)
  contractCache[c] = contract
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
      return StableTokenAbi
    case CeloContract.Validators:
      return ValidatorsAbi
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
