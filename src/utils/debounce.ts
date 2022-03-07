import { useEffect, useState } from 'react'

export const DEFAULT_DELAY = 500

export function useDebounce<T>(value: T, delay: number = DEFAULT_DELAY) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const [isDebouncing, setIsDebouncing] = useState(false)

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
      setIsDebouncing(false)
    }, delay)

    setIsDebouncing(true)

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      if (handler) clearTimeout(handler)
    }
  }, [value, delay])

  return { debouncedValue, isDebouncing }
}
