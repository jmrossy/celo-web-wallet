import { Token } from 'src/tokens'

export type TokenMap = Record<Address, Token>

export interface AddTokenParams {
  address: Address
}
