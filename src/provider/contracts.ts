import { Contract, ethers } from 'ethers'
import { CeloContract, config } from 'src/config'
import { ABI as StableTokenAbi } from 'src/provider/ABIs/stableToken'
import { getProvider } from 'src/provider/provider'

const contractCache: Partial<Record<CeloContract, Contract>> = {}

export function getContract(c: CeloContract) {
  const cachedContract = contractCache[c]
  if (cachedContract) {
    return cachedContract
  }

  const provider = getProvider()
  const address = config.contractAddresses[c]
  const abi = getContractAbi(c)
  const contract = new ethers.Contract(address, abi, provider)
  contractCache[c] = contract
  return contract
}

function getContractAbi(c: CeloContract) {
  switch (c) {
    case CeloContract.StableToken:
      return StableTokenAbi
    default:
      throw new Error(`No ABI for contract ${c}`)
  }
}
