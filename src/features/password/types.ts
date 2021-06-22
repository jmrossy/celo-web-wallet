export enum PasswordAction {
  Set,
  Unlock,
  UnlockAndRecover,
  Change,
}

export type SecretType = 'pincode' | 'password'
