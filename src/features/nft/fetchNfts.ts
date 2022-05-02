import { BigNumber, Contract } from 'ethers'
import { appSelect } from 'src/app/appSelect'
import { getErc721Contract } from 'src/blockchain/contracts'
import { NFT_SEARCH_STALE_TIME } from 'src/consts'
import { POPULAR_NFT_CONTRACTS } from 'src/features/nft/consts'
import { setImageUri, updateOwnedNfts } from 'src/features/nft/nftSlice'
import { Nft, NftContract, NftMetadata } from 'src/features/nft/types'
import { formatIpfsUrl, getUrlExtensionType, UrlExtensionType } from 'src/features/nft/utils'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { fetchWithTimeout } from 'src/utils/timeout'
import { call, put, spawn } from 'typed-redux-saga'

function* fetchNfts(force?: boolean) {
  const address = yield* appSelect((state) => state.wallet.address)
  if (!address) throw new Error('Cannot fetch NFTs before address is set')

  const { owned, customContracts, lastUpdated } = yield* appSelect((state) => state.nft)

  if (!isStale(lastUpdated, NFT_SEARCH_STALE_TIME) && !force) return

  const contractList = getContractList(customContracts)

  const ownedUpdated = yield* call(fetchNftsForContracts, address, contractList, owned)
  yield* put(updateOwnedNfts(ownedUpdated))
  yield* spawn(fetchNftImageUris, ownedUpdated)
}

export const {
  name: fetchNftsSagaName,
  wrappedSaga: fetchNftsSaga,
  reducer: fetchNftsReducer,
  actions: fetchNftsActions,
} = createMonitoredSaga<boolean | undefined>(fetchNfts, 'fetchNfts')

function getContractList(customContracts: NftContract[]) {
  const customContractsAddrs = customContracts.map((p) => p.address)
  const popularContractAddrs = POPULAR_NFT_CONTRACTS.map((p) => p.address)
  const allContracts = new Set<Address>([...customContractsAddrs, ...popularContractAddrs])
  return Array.from(allContracts).filter((c) => !!c)
}

async function fetchNftsForContracts(
  account: Address,
  contracts: Address[],
  ownedState: Record<Address, Nft[]>
) {
  const result: Record<Address, Nft[]> = {}
  // TODO consider batching to speed this up
  for (const contractAddr of contracts) {
    try {
      const contract = getErc721Contract(contractAddr)
      const numOwned = await contract.balanceOf(account)
      if (!numOwned || numOwned <= 0) continue
      const nfts: Nft[] = []
      for (let i = 0; i < numOwned; i++) {
        const nft = await fetchNftDetails(contract, i, account, ownedState[contractAddr])
        if (nft) nfts.push(nft)
      }
      if (nfts.length) result[contractAddr] = nfts
    } catch (error) {
      logger.error('Failed to fetch NFTs for contract:', contractAddr, error)
    }
  }
  return result
}

async function fetchNftDetails(
  contract: Contract,
  index: number,
  account: Address,
  ownedState: Nft[] | undefined
) {
  const _tokenId: BigNumber = await contract.tokenOfOwnerByIndex(account, index)
  if (!_tokenId || _tokenId.lt(0)) {
    logger.error('Invalid token id from contract:', contract.address, _tokenId.toString())
    return null
  }
  const tokenId = _tokenId.toNumber()

  // If the tokenURI and/or imageURI is already in the store state for this nft,
  // then skip refetching it. This assumes those never change.
  const cached = ownedState?.find((n) => n.tokenId === tokenId)

  let tokenUri: string
  if (cached?.tokenUri) {
    tokenUri = cached.tokenUri
  } else {
    const fetchedTokenUri = await contract.tokenURI(tokenId)
    if (!fetchedTokenUri) {
      logger.error('Invalid token uri from contract:', contract.address, fetchedTokenUri)
      return null
    }
    tokenUri = fetchedTokenUri
  }

  let imageUri: string | undefined
  if (cached?.imageUri) {
    imageUri = cached.imageUri
  } else {
    // We could fetch the imageUri from the tokenUri here but
    // ipfs is slow so better to not block on that. Instead it's
    // fetched later after this saga returns the owned list.
    imageUri = undefined
  }

  return {
    contract: contract.address,
    tokenId,
    tokenUri,
    imageUri,
  }
}

// Note, only IPFS-based images are allowed for now
function* fetchNftImageUris(owned: Record<Address, Nft[]>) {
  const nftList = Object.values(owned).flat()
  for (const nft of nftList) {
    if (nft.imageUri) continue

    const tokenUriExt = getUrlExtensionType(nft.tokenUri)

    if (tokenUriExt === UrlExtensionType.image) {
      const formattedUri = formatIpfsUrl(nft.tokenUri)
      if (!formattedUri) continue
      yield* put(
        setImageUri({ contract: nft.contract, tokenId: nft.tokenId, imageUri: formattedUri })
      )
    } else if (tokenUriExt === UrlExtensionType.json) {
      const imageUri = yield* call(fetchNftImageUri, nft)
      if (!imageUri) continue
      yield* put(setImageUri({ contract: nft.contract, tokenId: nft.tokenId, imageUri }))
    } else {
      logger.warn('Unsupported tokenUri extension', JSON.stringify(nft))
    }
  }
}

async function fetchNftImageUri(nft: Nft) {
  logger.debug('Attempting to fetch NFT image uri from:', nft.tokenUri)
  try {
    const tokenUri = nft.tokenUri

    const formattedTokenUri = formatIpfsUrl(tokenUri)
    if (!formattedTokenUri) return null

    const result = await fetchWithTimeout(formattedTokenUri, undefined, 12000)
    const json = (await result.json()) as NftMetadata
    if (!json?.image) {
      logger.debug('No image found for nft', tokenUri)
      return null
    }

    const imageUri = json.image

    const imageUriExt = getUrlExtensionType(imageUri)
    if (imageUriExt !== UrlExtensionType.image) {
      logger.debug('ImageUri is unsupported extension type', imageUri, tokenUri)
      return null
    }

    const formattedImageUri = formatIpfsUrl(imageUri)
    if (!formattedImageUri) return null
    else return formattedImageUri
  } catch (error) {
    logger.error('Failed to fetch NFT imageUri for:', nft.tokenId, nft.contract, error)
    return null
  }
}
