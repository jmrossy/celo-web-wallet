import { trimToLength } from 'src/utils/string'

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

// Helper method to create an invalid field for use in validation
export function invalidInput(fieldName: string, helpText: string) {
  return {
    isValid: false,
    [fieldName]: { error: true, helpText },
  }
}

export function omitFieldError(fieldToOmit: string, errorState: ErrorState) {
  const newErrorState: ErrorState = { isValid: true }
  for (const fieldName of Object.keys(errorState)) {
    if (fieldName === 'isValid' || fieldName === fieldToOmit) continue
    newErrorState[fieldName] = errorState[fieldName]
    newErrorState.isValid = false
  }
  return newErrorState
}

export function errorStateToString(error: ErrorState, summary: string) {
  if (!error) throw new Error('No error provided to errorStateToString')
  const { isValid, ...fields } = error
  if (isValid) throw new Error('ErrorState provided to errorStateToString is actually valid')

  summary = summary || 'Unknown Error'

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

export function errorToString(error: any, maxLength = 240) {
  if (!error) return 'Unknown Error'
  if (typeof error === 'string') return trimToLength(error, maxLength)
  if (typeof error === 'number') return `Error code: ${error}`
  if (error.message) return trimToLength(error.message, maxLength)
  return trimToLength(JSON.stringify(error), maxLength)
}

export function validateOrThrow(validate: () => ErrorState, summaryMessage: string) {
  const validateResult = validate()
  if (!validateResult.isValid) {
    throw new Error(errorStateToString(validateResult, summaryMessage))
  }
}
