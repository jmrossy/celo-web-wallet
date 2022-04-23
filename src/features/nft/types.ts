export interface Nft {
  tokenId: number
  tokenUri: string
  contract: Address
}

export interface NftContract {
  contract: Address
  name: string
  symbol: string
  uri?: string
}
