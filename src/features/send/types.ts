import { Currency } from 'src/consts';

export interface SendTokenParams {
  recipient: string
  amount: number
  currency: Currency
  comment?: string
  isRequest?: boolean
}