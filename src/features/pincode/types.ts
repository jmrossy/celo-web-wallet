export enum PincodeAction {
  Set,
  Unlock,
  UnlockAndRecover,
  Change,
}

export type SecretType = 'pincode' | 'password'
