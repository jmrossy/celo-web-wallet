import { useCallback, useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { isBrowserIE } from 'src/utils/browsers'
import { logger } from 'src/utils/logger'

export type FieldError = {
  error: boolean
  helpText: string
}
export type ErrorState = {
  [field: string]: FieldError | boolean
  isValid: boolean
}

//--
// Helper method to create an invalid field for use in validation
export function invalidInput(fieldName: string, helpText: string) {
  return {
    isValid: false,
    [fieldName]: { error: true, helpText },
  }
}

//--
// Handles the validation of input components
export function useInputValidation(touched: any, validateFn: () => ErrorState) {
  const [inputErrors, setInputErrors] = useState<ErrorState>({ isValid: true })
  const clearInputErrors = useCallback(() => setInputErrors({ isValid: true }), [setInputErrors])

  // Watch the touched fields, and clear any errors that need clearing
  useEffect(() => {
    if (!inputErrors || Object.keys(inputErrors).length === 0) return
    const nextErrors = { ...inputErrors }

    //Enumerate the touched fields and create a list of fields that were touched
    Object.keys(touched).forEach((key: string) => {
      if ((touched as any)[key] === true && nextErrors[key]) {
        delete nextErrors[key]
      }
    }, [])

    if (!shallowEqual(inputErrors, nextErrors)) {
      const isValid = Object.keys(nextErrors).length === 0
      setInputErrors({ ...nextErrors, isValid: isValid })
    }
  }, [touched])

  const areInputsValid = (): boolean => {
    const validationResult = validateFn()
    setInputErrors(validationResult)
    return validationResult.isValid
  }

  return {
    inputErrors,
    areInputsValid,
    clearInputErrors,
  }
}

interface IBrowserFeature {
  key: string
  check: () => boolean
}

export const requiredFeatures: IBrowserFeature[] = [
  { key: 'crypto', check: () => Boolean(window.crypto) },
  { key: 'storage', check: () => Boolean(window.localStorage) },
  {
    key: 'filter',
    check: () => CSS && CSS.supports && CSS.supports('filter', 'brightness(0) invert(1)'),
  },
  { key: 'notIE', check: () => !isBrowserIE() },
]

//For testing purposes, to demonstrate how it works with unsupported features
export const testInvalidFeatures: IBrowserFeature[] = [
  { key: 'crypto', check: () => Boolean(window.crypto) },
  { key: 'test', check: () => false },
]

// TODO wire this into load screen
export function useFeatureValidation(features: IBrowserFeature[] | null = null) {
  const [isValid, setValid] = useState(true) //assume valid to start
  const toValidate = features ?? requiredFeatures

  useEffect(() => {
    try {
      //enumerate the required features and determine if they are available
      const result = toValidate.reduce((valid: boolean, feature: IBrowserFeature) => {
        try {
          const available = feature.check()
          if (!available)
            logger.error(`The following browser feature is not available: ${feature.key}`)
          return valid && available
        } catch {
          logger.error(`The following browser feature is not available: ${feature.key}`)
          return false
        }
      }, true)

      setValid(result)
    } catch {
      setValid(false)
    }
  }, [toValidate])

  return isValid
}
