export interface Nft {
  tokenId: number
  tokenUri: string
}

export interface NftContract {
  contract: Address
  name: string
  symbol: string
  uri?: string
}
