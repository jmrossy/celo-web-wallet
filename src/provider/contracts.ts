import { Contract, ethers } from 'ethers'
import { CeloContract, config } from 'src/config'
import { ABI as StableTokenAbi } from 'src/provider/ABIs/stableToken'
import { getProvider } from 'src/provider/provider'
import { getSigner } from 'src/provider/signer'

const contractCache: Partial<Record<CeloContract, Contract>> = {}

export function getContract(c: CeloContract, writeMode = false) {
  const cachedContract = contractCache[c]
  if (cachedContract) {
    return cachedContract
  }

  const provider = getProvider()
  const signer = getSigner()
  const address = config.contractAddresses[c]
  const abi = getContractAbi(c)
  const contract = new ethers.Contract(address, abi, writeMode ? signer : provider)
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
