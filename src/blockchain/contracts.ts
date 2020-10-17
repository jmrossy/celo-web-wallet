import { Contract, ethers, utils } from 'ethers'
import { getSigner } from 'src/blockchain/signer'
import { CeloContract, config } from 'src/config'

const contractCache: Partial<Record<CeloContract, Contract>> = {}
const abiInterfaceCache: Partial<Record<CeloContract, utils.Interface>> = {}

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

export async function getContractAbiInterface(c: CeloContract) {
  const cachedInterface = abiInterfaceCache[c]
  if (cachedInterface) {
    return cachedInterface
  }
  const abi = await getContractAbi(c)
  const abiInterface = new utils.Interface(abi)
  abiInterfaceCache[c] = abiInterface
  return abiInterface
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
