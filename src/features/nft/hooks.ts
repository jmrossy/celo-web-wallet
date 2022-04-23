import { useMemo } from 'react'
import { useAppSelector } from 'src/app/hooks'
import { POPULAR_NFT_CONTRACTS } from 'src/features/nft/consts'
import { Nft, NftContract } from 'src/features/nft/types'

export function useNftContracts(): Record<Address, NftContract> {
  const customContracts = useAppSelector((s) => s.nft.customContracts)
  return useMemo(() => {
    const result: Record<Address, NftContract> = {}
    for (const contract of POPULAR_NFT_CONTRACTS) {
      result[contract.contract] = contract
    }
    for (const contract of customContracts) {
      result[contract.contract] = contract
    }
    return result
  }, [customContracts])
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
