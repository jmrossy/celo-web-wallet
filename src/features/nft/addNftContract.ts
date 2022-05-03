import { appSelect } from 'src/app/appSelect'
import { getErc721Contract } from 'src/blockchain/contracts'
import { POPULAR_NFT_CONTRACTS } from 'src/features/nft/consts'
import { fetchNftsActions } from 'src/features/nft/fetchNfts'
import { addCustomContract } from 'src/features/nft/nftSlice'
import { AddNftContractParams, NftContract } from 'src/features/nft/types'
import { isValidAddress, normalizeAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export function validate(params: AddNftContractParams, customContracts: NftContract[]): ErrorState {
  const { address } = params
  if (!address) {
    return invalidInput('address', 'Contract address is required')
  }
  if (!isValidAddress(address)) {
    logger.error(`Invalid nft contract address: ${address}`)
    return invalidInput('address', 'Invalid contract address')
  }
  const normalized = normalizeAddress(address)
  if (POPULAR_NFT_CONTRACTS.find((c) => c.address === normalized)) {
    logger.error(`Contract already exists in popular list: ${address}`)
    return invalidInput('address', 'This contract is already checked by default')
  }
  if (customContracts.find((c) => c.address === normalized)) {
    logger.error(`Contract already exists in custom list: ${address}`)
    return invalidInput('address', 'This contract already included')
  }
  return { isValid: true }
}

function* addNftContract(params: AddNftContractParams) {
  const customContracts = yield* appSelect((state) => state.nft.customContracts)
  validateOrThrow(() => validate(params, customContracts), 'Invalid Nft Contract')

  const newContract = yield* call(getNftInfo, params.address)
  yield* put(addCustomContract(newContract))

  yield* put(fetchNftsActions.trigger())
}

async function getNftInfo(contractAddress: Address): Promise<NftContract> {
  const normalizedAddr = normalizeAddress(contractAddress)
  const contract = getErc721Contract(normalizedAddr)
  // Note this requires the contract implement the ERC721 Metadata and
  // Enumerable extensions, otherwise rejects
  const symbolP: Promise<string> = contract.symbol()
  const nameP: Promise<string> = contract.name()
  const [symbol, name] = await Promise.all([symbolP, nameP])
  if (!symbol || typeof symbol !== 'string') throw new Error('Invalid nft symbol')
  if (!name || typeof name !== 'string') throw new Error('Invalid nft name')
  return {
    symbol: symbol.substring(0, 20),
    name,
    address: normalizedAddr,
  }
}

export const {
  name: addNftContractSagaName,
  wrappedSaga: addNftContractSaga,
  reducer: addNftContractReducer,
  actions: addNftContractActions,
} = createMonitoredSaga<AddNftContractParams>(addNftContract, 'addNftContract')
