import { BigNumber, Contract } from 'ethers'
import { appSelect } from 'src/app/appSelect'
import { getErc721Contract } from 'src/blockchain/contracts'
import { NFT_SEARCH_STALE_TIME } from 'src/consts'
import { POPULAR_NFT_CONTRACTS } from 'src/features/nft/consts'
import { setImageUri, updateOwnedNfts } from 'src/features/nft/nftSlice'
import { Nft, NftContract, NftMetadata } from 'src/features/nft/types'
import { formatIpfsUrl, getUrlExtensionType, UrlExtensionType } from 'src/features/nft/utils'
import { logger } from 'src/utils/logger'
import { retryAsync } from 'src/utils/retry'
import { createMonitoredSaga, createSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { fetchWithTimeout } from 'src/utils/timeout'
import { call, put, spawn } from 'typed-redux-saga'

// Skip fetching NFTs for a contract when balance is > this
const NFT_FETCH_LIMIT = 300
const NFT_FETCH_LIMIT_ERROR = new Error('NFT_FETCH_LIMIT_ERROR')
// Skip image fetching for nft sets > this
const IMAGE_FETCH_LIMIT = 30

function* fetchNfts(force?: boolean) {
  const address = yield* appSelect((state) => state.wallet.address)
  if (!address) throw new Error('Cannot fetch NFTs before address is set')

  const { owned, customContracts, lastUpdated } = yield* appSelect((state) => state.nft)

  if (!isStale(lastUpdated, NFT_SEARCH_STALE_TIME) && !force) return

  const contractList = getContractList(customContracts)

  const ownedUpdated = yield* call(fetchNftsForContracts, address, contractList, owned)
  yield* put(updateOwnedNfts(ownedUpdated))
  yield* spawn(fetchNftImageUris, Object.values(ownedUpdated).flat())
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
      const _numOwned = await contract.balanceOf(account)
      const numOwned = BigNumber.from(_numOwned).toNumber()
      if (!numOwned || numOwned <= 0) continue
      if (numOwned > NFT_FETCH_LIMIT) throw NFT_FETCH_LIMIT_ERROR
      const nfts: Nft[] = []
      for (let i = 0; i < numOwned; i++) {
        const nft = await fetchNftDetails(contract, i, account, ownedState[contractAddr])
        if (nft) nfts.push(nft)
      }
      if (nfts.length) result[contractAddr] = nfts
    } catch (error) {
      logger.error('Failed to fetch NFTs for contract:', contractAddr, error)
      if (error === NFT_FETCH_LIMIT_ERROR)
        throw new Error(`Nft count exceeds limit of ${NFT_FETCH_LIMIT}`)
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
    tokenUri = fetchedTokenUri.toString()
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
function* fetchNftImageUris(nftList: Nft[]) {
  // IPFS, even via cloudflare, is unreliable
  // So skipping image fetching for large lists
  if (nftList.length > IMAGE_FETCH_LIMIT) {
    logger.debug('NFT length exceeds image fetch limit, skipping', nftList.length)
    return
  }

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

export const { wrappedSaga: fetchNftImagesSaga, trigger: fetchNftImagesTrigger } = createSaga<
  Nft[]
>(fetchNftImageUris, 'fetchNftImages')

async function fetchNftImageUri(nft: Nft) {
  logger.debug('Attempting to fetch NFT image uri from:', nft.tokenUri)
  try {
    const tokenUri = nft.tokenUri

    const formattedTokenUri = formatIpfsUrl(tokenUri)
    if (!formattedTokenUri) return null

    const imageUri = await fetchImageFromTokenUri(formattedTokenUri)
    if (!imageUri) return null

    const imageUriExt = getUrlExtensionType(imageUri)
    if (imageUriExt !== UrlExtensionType.image) {
      logger.debug('ImageUri is unsupported extension type', imageUri, tokenUri)
      return null
    }

    const formattedImageUri = formatIpfsUrl(imageUri)
    if (!formattedImageUri) return null

    logger.debug('Found NFT image uri:', formattedImageUri, nft.tokenId)
    return formattedImageUri
  } catch (error) {
    logger.error('Failed to fetch NFT imageUri for:', nft.tokenId, nft.contract, error)
    return null
  }
}

async function fetchImageFromTokenUri(tokenUri: string) {
  // IPFS is unreliable so timeouts + errors are frequent
  // This still doesn't work very well
  const result = await retryAsync(async () => {
    const response = await fetchWithTimeout(tokenUri)
    if (!response.ok) throw new Error('Response not ok')
    const json = (await response.json()) as NftMetadata
    if (!json?.image) {
      logger.debug('No image found for nft', tokenUri)
      return null
    } else {
      return json.image
    }
  })
  return result
}
