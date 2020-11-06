import { Currency } from 'src/consts';

export interface SendTokenParams {
  recipient: string
  amount: number
  currency: Currency
  comment?: string
}

export type FieldError = {
  error: boolean;
  helpText: string;
}
export type ErrorState = {
  [field: string]: FieldError;
}