import { Token } from 'src/tokens'

export type TokenMap = Record<string, Token> // Address to Token

export interface AddTokenParams {
  address: string
}
