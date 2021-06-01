import {
  computePasswordStrength,
  PasswordStrength,
  validatePasswordValue,
  validatePinValue,
} from 'src/features/pincode/utils'

describe('pincode validation', () => {
  it('Rejects invalid pins', () => {
    // @ts-ignore
    const nullP = validatePinValue(null)
    expect(nullP).toBeTruthy()
    // @ts-ignore
    const numberP = validatePinValue(123456)
    expect(numberP).toBeTruthy()
    const shortP = validatePinValue('123')
    expect(shortP).toBeTruthy()
  })
  it('Rejects blacklisted pins', () => {
    const p = validatePinValue('666666')
    expect(p).toBeTruthy()
  })
})

describe('password validation', () => {
  it('Rejects invalid passwords', () => {
    // @ts-ignore
    const nullP = validatePasswordValue(null)
    expect(nullP).toBeTruthy()
    // @ts-ignore
    const numberP = validatePasswordValue(123456)
    expect(numberP).toBeTruthy()
    const shortP = validatePasswordValue('123')
    expect(shortP).toBeTruthy()
  })
  it('Rejects short and long passwords', () => {
    const shortP = validatePasswordValue('AbCdEf1')
    expect(shortP).toBeTruthy()
    const longP = validatePasswordValue(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce aliquet est ex. Phasellus eu tincidunt felis, vitae tempor augue. In dictum risus eget diam porttitor interdum. Vestibulum laoreet odio bibendum ante mattis, vitae pharetra purus porttitor. Pellentesque in mollis diam, ac vehicula odio.'
    )
    expect(longP).toBeTruthy()
  })
  it('Rejects weak passwords', () => {
    const weak1 = validatePasswordValue('abcdefghi')
    expect(weak1).toBeTruthy()
    const weak2 = validatePasswordValue('ABCDEFGHI')
    expect(weak2).toBeTruthy()
    const weak3 = validatePasswordValue('1234567890')
    expect(weak3).toBeTruthy()
  })
  it('Requires upper, lower, and num or special', () => {
    const weak1 = validatePasswordValue('abcdefghiABCDEFGHI')
    expect(weak1).toBeTruthy()
    const weak2 = validatePasswordValue('ABCDEFGHI1234567890')
    expect(weak2).toBeTruthy()
    const weak3 = validatePasswordValue('1234567890abcdefghi')
    expect(weak3).toBeTruthy()
    const weak4 = validatePasswordValue('!@#$%^&*()1234567')
    expect(weak4).toBeTruthy()
  })
  it('Rejects repetitive passwords', () => {
    const weak1 = validatePasswordValue('AAAAaaaa1111')
    expect(weak1).toBeTruthy()
  })
  it('Accepts valid passwords', () => {
    const valid1 = validatePasswordValue('AbCdEf1234')
    expect(valid1).toBeNull()
    const valid2 = validatePasswordValue('The dog runs far!')
    expect(valid2).toBeNull()
    const valid3 = validatePasswordValue('2vGFJEnJaxRDeFr@S%hubT%2w#aCpLTd6Mexj#B!V3s')
    expect(valid3).toBeNull()
    const valid4 = validatePasswordValue(
      'da5@FHg5HtKJFi@VsJ2dCfFQMqgavkZEXso65y4H#hXHdV7SoXLq@@F*KmQ&WeR6nB^Rp'
    )
    expect(valid4).toBeNull()
  })
})

describe('password strength measure', () => {
  it('Invalid passwords are weak', () => {
    const invalid1 = computePasswordStrength('abcdefgh')
    expect(invalid1).toBe(PasswordStrength.Weak)
    const invalid2 = computePasswordStrength('1234567890')
    expect(invalid2).toBe(PasswordStrength.Weak)
    const invalid3 = computePasswordStrength('Hello!')
    expect(invalid3).toBe(PasswordStrength.Weak)
  })
  it('Valid passwords are okay', () => {
    const valid1 = computePasswordStrength('AbCdEf1234')
    expect(valid1).toBe(PasswordStrength.Okay)
    const valid2 = computePasswordStrength('How do Y0u do?')
    expect(valid2).toBe(PasswordStrength.Okay)
    const valid3 = computePasswordStrength('FunWithCelo123')
    expect(valid3).toBe(PasswordStrength.Okay)
  })
  it('Strong passwords are strong', () => {
    const valid1 = computePasswordStrength('DRE93a4oC@JKW#ouodN^ZTv&MT2c%pR8kQ3oUEy2ryz')
    expect(valid1).toBe(PasswordStrength.Strong)
    const valid2 = computePasswordStrength('M5bP9SSbKA@v#3UaDv')
    expect(valid2).toBe(PasswordStrength.Strong)
    const valid3 = computePasswordStrength('s9$$pn5q34ZNQCs6')
    expect(valid3).toBe(PasswordStrength.Strong)
  })
})
