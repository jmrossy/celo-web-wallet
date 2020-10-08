import { useEffect, useState } from 'react'

export function useCustomForm<V, E>(
  initialValues: V,
  onSubmit: (values: V, errors: Partial<E>) => void
) {
  const [values, setValues] = useState<V>(initialValues)
  const [errors, setErrors] = useState<Partial<E>>({})
  const [touched, setTouched] = useState({})
  const [, setOnSubmitting] = useState<boolean>(false)
  const [, setOnBlur] = useState<boolean>(false)

  useEffect(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setOnSubmitting(false)
    setOnBlur(false)
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { target } = event
    const { name, value } = target
    event.persist()
    setValues({ ...values, [name]: value })
  }

  const handleBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event
    const { name } = target
    setTouched({ ...touched, [name]: true })
    setErrors({ ...errors })
  }

  const handleSubmit = (event: any) => {
    if (event) event.preventDefault()
    setErrors({ ...errors })
    onSubmit(values, errors)
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  }
}
