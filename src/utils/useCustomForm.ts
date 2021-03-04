import { ChangeEvent, useEffect, useState } from 'react'
import { ErrorState, omitFieldError } from 'src/utils/validation'

export function useCustomForm<V>(
  initialValues: V,
  onSubmit: (values: V) => void,
  validate: (values: V) => ErrorState
) {
  const [values, setValues] = useState<V>(initialValues)
  const [errors, setErrors] = useState<ErrorState>({ isValid: true })
  const [touched, setTouched] = useState({})

  const resetValues = (resetValues: V) => {
    setValues(resetValues)
    setErrors({ isValid: true })
    setTouched({})
  }

  useEffect(() => {
    resetValues(initialValues)
  }, [])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setValues({ ...values, [name]: value })
  }

  const handleBlur = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = event.target
    setTouched({ ...touched, [name]: true })
    setErrors(omitFieldError(name, errors))
  }

  const handleSubmit = (event: any) => {
    if (event) event.preventDefault()
    setTouched({})
    const validationResult = validate(values)
    setErrors(validationResult)
    if (validationResult.isValid) {
      onSubmit(values)
    }
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetValues,
  }
}
