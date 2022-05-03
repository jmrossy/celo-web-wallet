import { useMemo } from 'react'
import { appSelect } from 'src/app/appSelect'
import { useAppSelector } from 'src/app/hooks'
import { POPULAR_NFT_CONTRACTS } from 'src/features/nft/consts'
import { Nft, NftContract, NftContractMap } from 'src/features/nft/types'
import { isValidAddress, normalizeAddress } from 'src/utils/addresses'

export function useNftContracts(): NftContractMap {
  const customContracts = useAppSelector((s) => s.nft.customContracts)
  return useMemo(() => mergeWithPopularContracts(customContracts), [customContracts])
}

export function* selectNftContracts() {
  const customContracts = yield* appSelect((s) => s.nft.customContracts)
  return mergeWithPopularContracts(customContracts)
}

function mergeWithPopularContracts(customContracts: NftContract[]): NftContractMap {
  return [...POPULAR_NFT_CONTRACTS, ...customContracts].reduce<NftContractMap>(
    (result, contract) => {
      result[contract.address] = contract
      return result
    },
    {}
  )
}

export function useSortedOwnedNfts(): Nft[] {
  const owned = useAppSelector((state) => state.nft.owned)
  return useMemo(() => {
    let sortedNfts: Nft[] = []
    const sortedContracts = Object.keys(owned).sort((a, b) => (a < b ? 1 : -1))
    for (const contract of sortedContracts) {
      sortedNfts = [...sortedNfts, ...owned[contract]]
    }
    return sortedNfts
  }, [owned])
}

// Resolve chosen contract and nft from inputted values
export function useResolvedNftAndContract(contractAddr?: Address, tokenId?: string) {
  const contracts = useNftContracts()
  const owned = useAppSelector((state) => state.nft.owned)

  return useMemo(() => {
    if (!contractAddr || !tokenId || !isValidAddress(contractAddr)) {
      return {
        contract: null,
        nft: null,
      }
    }
    const normalizedAddr = normalizeAddress(contractAddr)
    const contract = contracts[normalizedAddr] || null
    const nft = owned[normalizedAddr]?.find((n) => n.tokenId.toString() === tokenId) || null
    return {
      contract,
      nft,
    }
  }, [contractAddr, tokenId, owned, contracts])
}
