import { useEffect, useState } from 'react'
import { logger } from 'src/utils/logger'

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
  { key: 'resizeObserver', check: () => Boolean(window.ResizeObserver) },
  { key: 'notIE', check: () => !isBrowserIE() },
]

//For testing purposes, to demonstrate how it works with unsupported features
export const testInvalidFeatures: IBrowserFeature[] = [
  { key: 'crypto', check: () => Boolean(window.crypto) },
  { key: 'test', check: () => false },
]

export function useBrowserFeatureChecks(features: IBrowserFeature[] | null = null) {
  const [isValid, setValid] = useState(true)
  const toValidate = features ?? requiredFeatures

  useEffect(() => {
    try {
      //enumerate the required features and determine if they are available
      const result = toValidate.reduce((valid: boolean, feature: IBrowserFeature) => {
        try {
          const available = feature.check()
          if (!available) logger.error(`Browser feature ${feature.key} is not available`)
          return valid && available
        } catch {
          logger.error(`Browser feature ${feature.key} is not available`)
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

export function isBrowserIE() {
  const ua = window.navigator.userAgent
  const msie = ua.indexOf('MSIE ')
  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./)) {
    return true
  }
  return false
}
