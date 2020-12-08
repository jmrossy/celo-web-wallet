import { useCallback, useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'

export function assert(predicate: any, errorMessage: string) {
  if (!predicate) {
    throw new Error(errorMessage)
  }
}

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

export function errorStateToString(error: ErrorState, summary: string) {
  if (!error) throw new Error('No error provided to errorStateToString')
  const { isValid, ...fields } = error
  if (isValid) throw new Error('ErrorState provided to errorStateToString is actually valid')
  const fieldNames = Object.keys(fields)
  if (fieldNames.length === 0) {
    return summary
  } else if (fieldNames.length === 1) {
    const name = fieldNames[0]
    const fieldError = fields[name]
    if (typeof fieldError === 'boolean') throw new Error(`No field error found for ${name}`)
    return `${summary}: ${fieldError.helpText}`
  } else {
    return `${summary}. Invalid fields: ${fieldNames.join(', ')}`
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
