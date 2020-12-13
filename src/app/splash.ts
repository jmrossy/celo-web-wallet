import { useEffect, useState } from 'react'

const DEFAULT_DELAY = 1750

//---
//The work of managing and cleaning up the splash screen
export const getSplash = (loadingDelay?: number): [number, () => NodeJS.Timeout | null] => {
  const loader = document.getElementById('loader')

  const hideSplash = (): NodeJS.Timeout | null => {
    if (!loader) return null

    const app = document.getElementById('app')
    app?.classList.add('fade-in')
    loader.classList.remove('.animate')
    loader.classList.add('loader--hide')
    const fadeTimeout = setTimeout(() => {
      loader.parentElement?.removeChild(loader)
      app?.classList.remove('fade-in')
    }, 500) //practice 'leave no trace'...
    return fadeTimeout
  }

  const startStr = loader?.getAttribute('data-start')
  const startTime = startStr ? parseInt(startStr) : Date.now()
  const diff = Date.now() - startTime
  loadingDelay = loadingDelay ?? DEFAULT_DELAY
  const delay = diff > loadingDelay ? 0 : loadingDelay - diff

  return [delay, hideSplash]
}

//---
//Hook to encapsulate and simplify the splash screen management
export function useSplashScreen(loadingDelay?: number) {
  const [isSplash, setSplash] = useState(true)

  useEffect(() => {
    const [delay, hideSplash] = getSplash(loadingDelay)
    let hideTimeout: NodeJS.Timeout | null = null

    const splashTimeout = setTimeout(() => {
      hideTimeout = hideSplash()
      setSplash(false)
    }, delay)

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout)
      clearTimeout(splashTimeout)
    }
  }, [])

  return isSplash
}
