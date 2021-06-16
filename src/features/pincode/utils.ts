import { useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { SecretType } from 'src/features/pincode/types'
import { ErrorState, invalidInput } from 'src/utils/validation'

const PIN_LENGTH = 6
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 120
const PASSWORD_MIN_DIFF_CHARS = 6

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

export function validatePinValue(value: string, name = 'value'): ErrorState | null {
  if (!value || typeof value !== 'string') return invalidInput(name, 'Invalid pincode')
  if (value.length !== PIN_LENGTH) return invalidInput(name, 'Pincode must be 6 digits')
  if (PIN_BLACKLIST.includes(value)) return invalidInput(name, 'Pincode too simple')
  return null
}

export function validatePasswordValue(value: string, name = 'value'): ErrorState | null {
  if (!value || typeof value !== 'string') return invalidInput(name, 'Invalid password')
  if (value.length < PASSWORD_MIN_LENGTH) return invalidInput(name, 'Must be at least 8 characters')
  if (value.length > PASSWORD_MAX_LENGTH)
    return invalidInput(name, 'Must be less than 120 characters')
  if (!value.match(/(?=.*[a-z])/)) return invalidInput(name, 'Needs a lowercase character')
  if (!value.match(/(?=.*[A-Z])/)) return invalidInput(name, 'Needs an uppercase character')
  if (!value.match(/(?=.*[!,@,#,$,%,^,&,*,?,_,~\d])/))
    return invalidInput(name, 'Needs a number or special')
  if (countCharacters(value) < PASSWORD_MIN_DIFF_CHARS)
    return invalidInput(name, 'Password too repetitive')
  return null
}

export enum PasswordStrength {
  Weak,
  Okay,
  Strong,
}

export function computePasswordStrength(value: string) {
  if (validatePasswordValue(value) !== null) return PasswordStrength.Weak
  const uniqueCharCount = countCharacters(value)
  if (value.length >= 20 && uniqueCharCount >= 10) return PasswordStrength.Strong
  if (value.length >= 16 && uniqueCharCount >= 10 && value.match(/(?=.*[!,@,#,$,%,^,&,*,?,_,~])/))
    return PasswordStrength.Strong
  return PasswordStrength.Okay
}

function countCharacters(value: string) {
  const charMap = new Map<string, boolean>()
  for (const c of value) {
    charMap.set(c, true)
  }
  return charMap.size
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

export function useSecretType() {
  const currentSecretType = useSelector((s: RootState) => s.wallet.secretType)
  return currentSecretType ?? 'password'
}
