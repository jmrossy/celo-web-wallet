import { useEffect, useState } from 'react'

const defaultDelay = 2000

export const getSplash = (loadingDelay?: number): [number, () => void] => {
  const loader = document.querySelector('.loader')
  const hideSplash = () => {
    if (loader) {
      const app = document.getElementById('app')
      app?.classList.add('fade-in')
      loader.classList.remove('.animate')
      loader.classList.add('loader--hide')
      setTimeout(() => {
        loader.parentElement?.removeChild(loader)
        app?.classList.remove('fade-in')
      }, 1000) //practice 'leave no trace'...
    }
  }
  const startStr = loader?.getAttribute('data-start')
  const startTime = startStr ? parseInt(startStr) : Date.now()
  const diff = Date.now() - startTime
  loadingDelay = loadingDelay ?? defaultDelay
  const delay = diff > loadingDelay ? 0 : loadingDelay - diff

  return [delay, hideSplash]
}

export function useSplashScreen(loadingDelay?: number) {
  const [isSplash, setSplash] = useState(true)

  useEffect(() => {
    const [delay, hideSplash] = getSplash(loadingDelay)

    setTimeout(() => {
      hideSplash()
      setSplash(false)
    }, delay)
  }, [])

  return isSplash
}
