import { BigNumber } from 'ethers'
import { appSelect } from 'src/app/appSelect'
import { getErc721Contract } from 'src/blockchain/contracts'
import { POPULAR_NFT_CONTRACTS } from 'src/features/nft/consts'
import { updateOwnedNfts } from 'src/features/nft/nftSlice'
import { Nft } from 'src/features/nft/types'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put } from 'typed-redux-saga'

function* fetchNfts() {
  const address = yield* appSelect((state) => state.wallet.address)
  if (!address) throw new Error('Cannot fetch NFTs before address is set')

  const customContracts = yield* appSelect((state) => state.nft.customContracts)
  const customContractsAddrs = customContracts.map((p) => p.contract)
  const popularContractAddrs = POPULAR_NFT_CONTRACTS.map((p) => p.contract)
  const allContracts = new Set<Address>([...customContractsAddrs, ...popularContractAddrs])

  const owned = yield* call(
    fetchNftsForContracts,
    //TODO
    '0xDE33e71fAECdEad20e6A8af8f362d2236CbA005f',
    Array.from(allContracts)
  )
  yield* put(updateOwnedNfts(owned))
}

async function fetchNftsForContracts(account: Address, contracts: Address[]) {
  const owned: Record<Address, Nft[]> = {}
  // TODO consider batching to speed this up
  for (const contractAddr of contracts) {
    try {
      const contract = getErc721Contract(contractAddr)
      const numOwned = await contract.balanceOf(account)
      if (!numOwned || numOwned <= 0) continue
      const tokens: Nft[] = []
      for (let i = 0; i < numOwned; i++) {
        const tokenId: BigNumber = await contract.tokenOfOwnerByIndex(account, i)
        if (!tokenId || tokenId.lt(0)) {
          logger.error('Invalid token id from contract:', contractAddr, tokenId)
          continue
        }
        const tokenUri: string = await contract.tokenURI(tokenId)
        if (!tokenUri) {
          logger.error('Invalid token uri from contract:', contractAddr, tokenUri)
          continue
        }
        tokens.push({
          tokenId: tokenId.toNumber(),
          tokenUri,
        })
      }
      if (tokens.length) {
        owned[contractAddr] = tokens
      }
    } catch (error) {
      logger.error('Failed to fetch NFTs for contract:', contractAddr, error)
    }
  }
  return owned
}

export const {
  name: fetchNftsSagaName,
  wrappedSaga: fetchNftsSaga,
  reducer: fetchNftsReducer,
  actions: fetchNftsActions,
} = createMonitoredSaga(fetchNfts, 'fetchNfts')
