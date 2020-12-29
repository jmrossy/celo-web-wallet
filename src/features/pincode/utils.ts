import { SecretType } from 'src/features/pincode/types'

const PIN_BLACKLIST = [
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '123456',
  '654321',
]

export function isSecretTooSimple(value: string, type: SecretType | undefined) {
  if (type === 'pincode') {
    return PIN_BLACKLIST.includes(value)
  }
  if (type === 'password') {
    // 6-30 characters with a number, lower case, and upper case
    return !value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,30}$/)
  }
  throw new Error(`Invalid secret type: ${type}`)
}

export function secretTypeToLabel(type: SecretType | undefined) {
  if (type === 'pincode') {
    return ['pincode', 'Pincode']
  }
  if (type === 'password') {
    return ['password', 'Password']
  }
  throw new Error(`Invalid secret type: ${type}`)
}
