const loadingDelay = 2000

export const getSplash = (): [number, () => void] => {
  const loader = document.querySelector('.loader')
  const hideSplash = () => {
    if (loader) {
      const app = document.getElementById('app')
      app?.classList.add('fade-in')
      loader.classList.remove('.animate')
      loader.classList.add('loader--hide')
      setTimeout(() => loader.parentElement?.removeChild(loader), 1000) //remove the node so it doesn't affect layout
    }
  }
  const startStr = loader?.getAttribute('data-start')
  const startTime = startStr ? parseInt(startStr) : Date.now()
  const diff = Date.now() - startTime
  const delay = diff > loadingDelay ? 0 : loadingDelay - diff

  return [delay, hideSplash]
}
